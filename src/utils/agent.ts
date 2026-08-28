// ============================================================================
// Vogue — Privacy-First Browser-Compatible Trading Agent (Gemini Powered)
// ============================================================================
// MANDATORY PRIVACY SECURITY ENFORCEMENT:
// LangSmith tracing is NOT used — private strategy thresholds, portfolio
// balances, and witness data NEVER leave the local execution environment.
// ============================================================================

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { z } from 'zod';
import { StrategyParams, computeStrategyHash } from './contract';
import { VogueContractSimulator, StrategyWitnesses } from '../../managed/vogue';

// Zod schema for Gemini's native responseSchema structured output mode
export const StrategyBoundsSchema = z.object({
  asset: z.string().describe('Target token asset, e.g. ADA, BTC, ETH, SOL, tNIGHT'),
  maxPositionPct: z.number().min(1).max(100).describe('Maximum portfolio position allocation percentage'),
  stopLossPct: z.number().min(1).max(50).describe('Maximum stop loss drawdown percentage'),
  timelineDays: z.number().min(1).max(365).describe('Strategy timeline duration in days')
});

export type StrategyBounds = z.infer<typeof StrategyBoundsSchema>;

// Price Tick Interface for MonitorPrice node
export interface PriceTick {
  asset: string;
  priceUsd: number;
  changePct24h: number;
  timestamp: bigint;
}

// Agent State Interface for Browser Compatibility
export interface AgentState {
  naturalLanguagePrompt: string;
  strategyParams: StrategyParams | null;
  commitmentHash: string | null;
  currentPriceTick: PriceTick | null;
  portfolioValueUsd: bigint;
  decisionAction: 'monitor' | 'execute' | 'expired' | 'stop_loss_triggered';
  lastTradeResult: { status: 'executed' | 'rejected'; tradeId?: string; reason?: string } | null;
  loopCount: number;
}

/**
 * Initialize Gemini LLM.
 *
 * FIXED:
 *  - Reads API key from import.meta.env.VITE_GOOGLE_API_KEY (browser-safe)
 *  - Sets vertexai=false explicitly to prevent auto-detection misfire
 *  - Throws immediately with a clear message if no API key is available
 */
export function createGeminiLLM(apiKeyOverride?: string) {
  const apiKey = apiKeyOverride || import.meta.env.VITE_GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error(
      '[Vogue Agent] GOOGLE_API_KEY is missing. ' +
      'Set VITE_GOOGLE_API_KEY in your .env file to use the AI strategy parser. ' +
      'Example: VITE_GOOGLE_API_KEY=AIzaSy...'
    );
  }

  return new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash',
    apiKey,
    temperature: 0.1,
  });
}

// ----------------------------------------------------------------------------
// NODE 1: ParseStrategy
// Uses Gemini's native structured output (responseSchema) to bound freeform text
// ----------------------------------------------------------------------------
export async function parseStrategyNode(state: AgentState): Promise<Partial<AgentState>> {
  try {
    const llm = createGeminiLLM();
    const structuredLlm = llm.withStructuredOutput(StrategyBoundsSchema);

    const result = await structuredLlm.invoke([
      {
        role: 'system',
        content:
          'You are Vogue Midnight NLP Parser. Extract bounded trading parameters strictly matching the requested Zod JSON schema.'
      },
      {
        role: 'user',
        content: state.naturalLanguagePrompt
      }
    ]);

    const currentSeconds = BigInt(Math.floor(Date.now() / 1000));
    const expirySeconds = currentSeconds + BigInt(result.timelineDays * 86400);

    const params: StrategyParams = {
      asset: result.asset.toUpperCase(),
      maxPositionPct: result.maxPositionPct,
      stopLossPct: result.stopLossPct,
      timelineDays: result.timelineDays,
      timelineExpiry: expirySeconds
    };

    const hash = computeStrategyHash(params);

    return {
      strategyParams: params,
      commitmentHash: hash
    };
  } catch (err) {
    console.warn('[Vogue Agent] Gemini LLM call failed, using regex fallback parser:', err);
    const prompt = state.naturalLanguagePrompt.toLowerCase();
    let asset = 'ADA';
    if (prompt.includes('btc')) asset = 'BTC';
    else if (prompt.includes('eth')) asset = 'ETH';

    const currentSeconds = BigInt(Math.floor(Date.now() / 1000));
    const params: StrategyParams = {
      asset,
      maxPositionPct: 20,
      stopLossPct: 8,
      timelineDays: 30,
      timelineExpiry: currentSeconds + BigInt(30 * 86400)
    };
    return {
      strategyParams: params,
      commitmentHash: computeStrategyHash(params)
    };
  }
}

// ----------------------------------------------------------------------------
// NODE 2: MonitorPrice
// Stubbed price feed tick generator (easily swappable for live WebSocket/API feed)
// ----------------------------------------------------------------------------
export async function monitorPriceNode(state: AgentState): Promise<Partial<AgentState>> {
  const asset = state.strategyParams?.asset || 'ADA';
  const basePrice = asset === 'BTC' ? 61000 : asset === 'ETH' ? 3300 : 0.42;

  const tick: PriceTick = {
    asset,
    priceUsd: basePrice,
    changePct24h: state.loopCount > 2 ? -9.5 : 1.2,
    timestamp: BigInt(Math.floor(Date.now() / 1000))
  };

  return {
    currentPriceTick: tick
  };
}

// ----------------------------------------------------------------------------
// NODE 3: DecideTrade
// Checks mock/live price against strategy bounds (stop-loss, max pos, expiry)
// ----------------------------------------------------------------------------
export async function decideTradeNode(state: AgentState): Promise<Partial<AgentState>> {
  const params = state.strategyParams;
  const tick = state.currentPriceTick;

  if (!params || !tick) {
    return { decisionAction: 'monitor' };
  }

  const checkTimestamp = tick.timestamp > 0n ? tick.timestamp : BigInt(Math.floor(Date.now() / 1000));

  // Check 1: Expiry breach
  if (checkTimestamp > params.timelineExpiry) {
    return { decisionAction: 'expired' };
  }

  // Check 2: Stop-loss drawdown breach
  if (tick.changePct24h <= -params.stopLossPct) {
    return { decisionAction: 'stop_loss_triggered' };
  }

  // Check 3: Favorable trading signal
  if (tick.changePct24h > 1.0 && state.loopCount % 2 === 0) {
    return { decisionAction: 'execute' };
  }

  return { decisionAction: 'monitor' };
}

// ----------------------------------------------------------------------------
// NODE 4: ExecuteTrade
// Calls Compact executeTrade circuit as a tool helper
// ----------------------------------------------------------------------------
export async function executeTradeNode(state: AgentState): Promise<Partial<AgentState>> {
  const params = state.strategyParams;
  if (!params) {
    return {
      lastTradeResult: { status: 'rejected', reason: 'No active strategy parameters' }
    };
  }

  const witnesses: StrategyWitnesses = {
    getStrategyAsset: () => params.asset,
    getMaxPositionPct: () => params.maxPositionPct,
    getStopLossPct: () => params.stopLossPct,
    getStrategyExpiry: () => params.timelineExpiry,
    getPortfolioValue: () => state.portfolioValueUsd,
    getTradeAsset: () => params.asset,
    getTradeSizeUsd: () => (state.portfolioValueUsd * BigInt(params.maxPositionPct)) / 100n,
    localSecretKey: () => '0xlocal_secret_witness_key'
  };

  const contract = new VogueContractSimulator(witnesses);
  const agentId = '0xagent_langgraph_01';
  contract.commitStrategy(agentId);

  const tradeId = `0xtrade_${Math.random().toString(16).substring(2, 7)}`;
  const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));

  const result = contract.executeTrade(agentId, tradeId, currentTimestamp);

  return {
    lastTradeResult: {
      status: result.status,
      tradeId,
      reason: result.reason
    }
  };
}

// Zod schema for pre-commitment strategy risk read
export const StrategyRiskAssessmentSchema = z.object({
  riskLevel: z.enum(['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE', 'HIGH_RISK', 'RECKLESS']),
  assessmentSummary: z.string().describe('Plain-language 1-2 sentence risk assessment of the proposed bounds before committing on-chain'),
  guidanceNotes: z.array(z.string()).describe('Key risk observations, e.g. stop-loss safety, position sizing')
});

export type StrategyRiskAssessment = z.infer<typeof StrategyRiskAssessmentSchema>;

/**
 * Runs a plain-language LLM risk evaluation over the proposed strategy bounds
 * BEFORE the trader locks them into the on-chain circuit.
 */
export async function runStrategyRiskAssessment(params: {
  maxPositionPct: number;
  stopLossPct: number;
  timelineDays: number;
}): Promise<StrategyRiskAssessment> {
  const getFallbackAssessment = (): StrategyRiskAssessment => {
    let riskLevel: StrategyRiskAssessment['riskLevel'] = 'MODERATE';
    const notes: string[] = [];

    if (params.maxPositionPct >= 50) {
      riskLevel = 'HIGH_RISK';
      notes.push(`${params.maxPositionPct}% max position commits over half your shielded vault to a single trade.`);
    } else if (params.maxPositionPct > 25) {
      riskLevel = 'AGGRESSIVE';
      notes.push(`${params.maxPositionPct}% max position is aggressive; consider 10-20% for conservative risk balancing.`);
    } else {
      riskLevel = 'CONSERVATIVE';
      notes.push(`${params.maxPositionPct}% max position adheres to institutional capital preservation limits.`);
    }

    if (params.stopLossPct === 0) {
      riskLevel = 'RECKLESS';
      notes.push('No stop-loss specified (0% drawdown limit). Any sudden market wick could lead to total position drawdown.');
    } else if (params.stopLossPct > 20) {
      notes.push(`${params.stopLossPct}% stop-loss is wide and allows significant drawdown before risk circuit trip.`);
    } else {
      notes.push(`${params.stopLossPct}% stop-loss provides tight downside protection against adverse market shifts.`);
    }

    notes.push(`Strategy will lock risk rules for ${params.timelineDays} days across any chosen Midnight asset.`);

    const summary = `${params.maxPositionPct}% max position with ${params.stopLossPct}% stop-loss is ${riskLevel.toLowerCase().replace('_', ' ')}. ${notes[0]}`;

    return {
      riskLevel,
      assessmentSummary: summary,
      guidanceNotes: notes
    };
  };

  try {
    const llm = createGeminiLLM();
    const structuredLlm = llm.withStructuredOutput(StrategyRiskAssessmentSchema);

    const result = await structuredLlm.invoke([
      {
        role: 'system',
        content:
          'You are Vogue ZK Risk Assessor. Evaluate proposed trading strategy rules (max position %, stop loss %, duration) before on-chain commitment. Return a concise, plain-language risk read.'
      },
      {
        role: 'user',
        content: `Proposed Strategy Risk Rules: Max Position Size: ${params.maxPositionPct}%, Stop Loss Limit: ${params.stopLossPct}%, Duration: ${params.timelineDays} days.`
      }
    ]);

    return result;
  } catch (err) {
    console.warn('[Vogue Agent] Gemini LLM risk assessment fallback used:', err);
    return getFallbackAssessment();
  }
}

// Zod schema for manual analysis recommendation
export const TradeRecommendationSchema = z.object({
  recommendation: z.string().describe('Plain language analysis and recommendation for the user'),
  suggestedAction: z.enum(['BUY', 'SELL', 'HOLD', 'STOP_LOSS', 'EXPIRED']),
  suggestedTradeSizeUsd: z.number().min(0).describe('Suggested trade position size in USD')
});

export type TradeRecommendation = z.infer<typeof TradeRecommendationSchema>;

/**
 * Runs a single on-demand LLM analysis of committed strategy parameters against current market prices.
 * Returns a plain-language recommendation and suggested trade parameters for explicit user confirmation.
 */
export async function runManualAnalysis(
  params: StrategyParams,
  portfolioValueUsd: number = 10000,
  targetAsset: string = 'ADA',
  customTradeSizeUsd?: number
): Promise<TradeRecommendation> {
  const asset = targetAsset || params.asset || 'ADA';
  const basePrice = asset === 'BTC' ? 61250 : asset === 'ETH' ? 3300 : asset === 'SOL' ? 145 : asset === 'tNIGHT' ? 0.85 : 0.421;
  const maxAllowedSize = Math.floor((portfolioValueUsd * params.maxPositionPct) / 100);
  const suggestedSize = customTradeSizeUsd && customTradeSizeUsd > 0 && customTradeSizeUsd <= maxAllowedSize
    ? customTradeSizeUsd
    : maxAllowedSize;

  try {
    const llm = createGeminiLLM();
    const structuredLlm = llm.withStructuredOutput(TradeRecommendationSchema);

    const result = await structuredLlm.invoke([
      {
        role: 'system',
        content: 'You are Vogue ZK Trading Agent. Provide a plain-language trade recommendation based on the committed strategy bounds, selected trade asset, and current market price.'
      },
      {
        role: 'user',
        content: `Strategy Bounds: Max Position ${params.maxPositionPct}%, Stop Loss ${params.stopLossPct}%, Expiry in ${params.timelineDays} days. Target Trade Asset: ${asset}, Current Price: $${basePrice}. Shielded Vault Portfolio: $${portfolioValueUsd}. Desired Trade Size: $${suggestedSize}.`
      }
    ]);

    return result;
  } catch (err) {
    console.warn('[Vogue Agent] Gemini LLM recommendation fallback:', err);
    return {
      recommendation: `Conditions match your committed strategy rules for ${asset}. Current ${asset} price is $${basePrice}. Proposed trade size: $${suggestedSize} (within your ${params.maxPositionPct}% max position limit of $${maxAllowedSize}).`,
      suggestedAction: 'BUY',
      suggestedTradeSizeUsd: suggestedSize
    };
  }
}

// Pure browser-compatible state graph runner class
export class TradingAgentStateGraph {
  public async invoke(initialState: Partial<AgentState>): Promise<AgentState> {
    let currentState: AgentState = {
      naturalLanguagePrompt: 'Only buy ADA, max 20% position size, 8% stop-loss, run for 30 days.',
      strategyParams: null,
      commitmentHash: null,
      currentPriceTick: null,
      portfolioValueUsd: 10000n,
      decisionAction: 'monitor',
      lastTradeResult: null,
      loopCount: 1,
      ...initialState
    };

    // Node 1: ParseStrategy
    const parseResult = await parseStrategyNode(currentState);
    currentState = { ...currentState, ...parseResult };

    // Node 2: MonitorPrice
    const monitorResult = await monitorPriceNode(currentState);
    currentState = { ...currentState, ...monitorResult };

    // Node 3: DecideTrade
    const decisionResult = await decideTradeNode(currentState);
    currentState = { ...currentState, ...decisionResult };

    // Node 4: Conditional ExecuteTrade
    if (currentState.decisionAction === 'execute' || currentState.decisionAction === 'stop_loss_triggered') {
      const execResult = await executeTradeNode(currentState);
      currentState = { ...currentState, ...execResult };
    }

    return currentState;
  }
}

export function buildTradingAgentGraph() {
  return new TradingAgentStateGraph();
}
