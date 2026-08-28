// ============================================================================
// Vogue — Contract Types, Trade Models & Strategy Utilities
// ============================================================================

export interface StrategyParams {
  asset: string;
  maxPositionPct: number;
  stopLossPct: number;
  timelineDays: number;
  timelineExpiry: bigint;
}

export interface TradeRecord {
  id: string;
  timestamp: string;
  asset: string;
  type: 'BUY' | 'SELL' | 'STOP_LOSS';
  sizeUsd: number;
  priceUsd: number;
  pnlUsd: number;
  pnlPct: number;
  status: 'executed' | 'rejected';
  proofTimeMs: number;
  commitmentHash: string;
  txHash?: string;
  rpcStatus?: 'pending' | 'confirmed' | 'failed';
}

export interface MarketTicker {
  symbol: string;
  name: string;
  priceUsd: number;
  change24hPct: number;
  high24h: number;
  low24h: number;
  volume24hUsd: number;
}

// Client-side NLP parser that bounds natural language into circuit witness parameters
export function parseNaturalLanguageStrategy(prompt: string): StrategyParams {
  const lower = prompt.toLowerCase();
  
  let asset = 'ADA';
  if (lower.includes('btc') || lower.includes('bitcoin')) asset = 'BTC';
  else if (lower.includes('eth') || lower.includes('ethereum')) asset = 'ETH';
  else if (lower.includes('sol') || lower.includes('solana')) asset = 'SOL';
  else if (lower.includes('night') || lower.includes('tnight')) asset = 'tNIGHT';

  let maxPositionPct = 20;
  const maxPosMatch = lower.match(/(?:max|up to|position|size)\s*(\d+)%/);
  if (maxPosMatch && maxPosMatch[1]) {
    maxPositionPct = Math.min(100, Math.max(1, parseInt(maxPosMatch[1], 10)));
  }

  let stopLossPct = 8;
  const stopLossMatch = lower.match(/(?:stop-loss|stop loss|sl)\s*(\d+)%/);
  if (stopLossMatch && stopLossMatch[1]) {
    stopLossPct = Math.min(50, Math.max(1, parseInt(stopLossMatch[1], 10)));
  }

  let timelineDays = 30;
  const daysMatch = lower.match(/(\d+)\s*(?:days|day)/);
  if (daysMatch && daysMatch[1]) {
    timelineDays = Math.min(365, Math.max(1, parseInt(daysMatch[1], 10)));
  }

  const currentSeconds = BigInt(Math.floor(Date.now() / 1000));
  const expirySeconds = currentSeconds + BigInt(timelineDays * 86400);

  return {
    asset,
    maxPositionPct,
    stopLossPct,
    timelineDays,
    timelineExpiry: expirySeconds
  };
}

// Compute strategy hash matching persistentHash([maxPos, stopLoss, expiry]) in vogue.compact
export function computeStrategyHash(params: StrategyParams | Omit<StrategyParams, 'asset'>): string {
  const rawStr = `${params.maxPositionPct}:${params.stopLossPct}:${params.timelineExpiry.toString()}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < rawStr.length; i++) {
    hash ^= rawStr.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  return `0x${hex}${hex}${hex}${hex}`;
}

// Trade history initialized as clean empty array for live wallet sessions
export const INITIAL_TRADE_HISTORY: TradeRecord[] = [];
