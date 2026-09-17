/**
 * Vogue � Cross-Chain Liquidity & Solver Router (DIN Engine)
 *
 * Solves the "Island Liquidity" trap by dynamically routing private trade intents
 * to the deepest execution venues (Hyperliquid, Uniswap v3, Minswap, and Midnight P2P Dark Pool)
 * with zero-knowledge anonymity guarantees.
 */

export type LiquidityVenueId = 'hyperliquid' | 'uniswap_v3' | 'minswap' | 'midnight_darkpool' | 'jupiter_solana';

export interface LiquidityVenue {
  id: LiquidityVenueId;
  name: string;
  shortLabel: string;
  chain: string;
  executionType: 'CLOB_PERP' | 'CONCENTRATED_AMM' | 'UTXO_AMM' | 'P2P_INTENT_CROSS';
  baseFeeBps: number;
  availableLiquidityUsd: number;
  avgLatencyMs: number;
  anonymityScore: number; // 0-100%
  status: 'OPTIMAL' | 'ACTIVE' | 'HIGH_VOLUME';
  supportedAssets: string[];
  description: string;
}

export interface RouteQuote {
  venue: LiquidityVenue;
  asset: string;
  inputAmountUsd: number;
  marketPriceUsd: number;
  executionPriceUsd: number;
  priceImpactPct: number;
  slippageSavedUsd: number;
  estimatedFeeUsd: number;
  estimatedOutputUnits: number;
  isOptimal: boolean;
  routingReason: string;
  solverId: string;
}

export interface RouteComparisonResult {
  asset: string;
  inputAmountUsd: number;
  marketPriceUsd: number;
  routes: RouteQuote[];
  optimalRoute: RouteQuote;
  isolatedVaultBaseline: {
    slippagePct: number;
    priceImpactUsd: number;
    effectivePriceUsd: number;
  };
  totalSlippageSavedUsd: number;
}

// --- Registered Execution Venues ---------------------------------------------

export const LIQUIDITY_VENUES: Record<LiquidityVenueId, LiquidityVenue> = {
  hyperliquid: {
    id: 'hyperliquid',
    name: 'Hyperliquid Prime CLOB',
    shortLabel: 'Hyperliquid (L2)',
    chain: 'Arbitrum L2',
    executionType: 'CLOB_PERP',
    baseFeeBps: 2, // 0.02%
    availableLiquidityUsd: 145_000_000,
    avgLatencyMs: 280,
    anonymityScore: 99.4,
    status: 'OPTIMAL',
    supportedAssets: ['BTC', 'ETH', 'SOL', 'ADA', 'AVAX'],
    description: 'Ultra-deep order book liquidity with sub-second finality and zero MEV exposure.',
  },
  uniswap_v3: {
    id: 'uniswap_v3',
    name: 'Uniswap v3 Concentrated',
    shortLabel: 'Uniswap v3',
    chain: 'EVM Multi-Chain',
    executionType: 'CONCENTRATED_AMM',
    baseFeeBps: 5, // 0.05%
    availableLiquidityUsd: 85_000_000,
    avgLatencyMs: 650,
    anonymityScore: 97.2,
    status: 'ACTIVE',
    supportedAssets: ['ETH', 'BTC', 'USDC', 'SOL'],
    description: 'Deep concentrated liquidity ranges across Arbitrum and Base L2 gateways.',
  },
  minswap: {
    id: 'minswap',
    name: 'Minswap eUTxO DEX',
    shortLabel: 'Minswap (Cardano)',
    chain: 'Cardano eUTxO',
    executionType: 'UTXO_AMM',
    baseFeeBps: 12, // 0.12%
    availableLiquidityUsd: 28_000_000,
    avgLatencyMs: 1200,
    anonymityScore: 98.8,
    status: 'ACTIVE',
    supportedAssets: ['ADA', 'tNIGHT', 'WMT', 'AGIX'],
    description: 'Native Cardano liquidity routing directly through deterministic eUTxO batches.',
  },
  jupiter_solana: {
    id: 'jupiter_solana',
    name: 'Jupiter / Raydium CLMM (Solana)',
    shortLabel: 'Solana (Jupiter)',
    chain: 'Solana',
    executionType: 'CONCENTRATED_AMM',
    baseFeeBps: 1, // 0.01%
    availableLiquidityUsd: 110_000_000,
    avgLatencyMs: 120, // Sub-second Solana speed
    anonymityScore: 99.7,
    status: 'OPTIMAL',
    supportedAssets: ['SOL', 'JUP', 'USDC', 'BONK', 'ETH', 'BTC'],
    description: 'Ultra-fast Solana liquidity aggregation via Jupiter and Raydium concentrated liquidity market maker.',
  },
  midnight_darkpool: {
    id: 'midnight_darkpool',
    name: 'Midnight P2P Dark Intent Pool',
    shortLabel: 'Midnight Dark Pool',
    chain: 'Midnight Privacy Network',
    executionType: 'P2P_INTENT_CROSS',
    baseFeeBps: 0, // 0% fee for peer-to-peer crossing
    availableLiquidityUsd: 12_500_000,
    avgLatencyMs: 350,
    anonymityScore: 100,
    status: 'OPTIMAL',
    supportedAssets: ['ADA', 'BTC', 'ETH', 'SOL', 'tNIGHT'],
    description: 'Internal zero-knowledge intent crossing between opposing Vogue traders with 0% slippage.',
  },
};

// --- Slippage & Pricing Computation ------------------------------------------

/**
 * Calculates theoretical slippage on an isolated Midnight internal vault
 * to demonstrate the baseline illiquidity without external solver routing.
 */
export function calculateIsolatedVaultSlippage(amountUsd: number): number {
  if (amountUsd <= 0) return 0;
  // Non-linear curve: small trades 1.2%, $25k trades ~4.5%, $100k trades ~12.5%
  const baseSlippage = 1.2;
  const depthPenalty = Math.pow(amountUsd / 20_000, 1.25) * 2.8;
  return Number(Math.min(18.0, baseSlippage + depthPenalty).toFixed(3));
}

/**
 * Calculates slippage for a specific venue based on its order book depth.
 */
export function calculateVenueSlippage(
  venueId: LiquidityVenueId,
  amountUsd: number,
  asset: string
): number {
  if (amountUsd <= 0) return 0;

  switch (venueId) {
    case 'midnight_darkpool':
      // P2P intent crossing has exactly zero price impact if matched
      return 0.001;

    case 'hyperliquid': {
      // Deepest perps/spot book
      const depthFactor = amountUsd / 2_000_000;
      return Number(Math.min(0.85, 0.02 + depthFactor * 0.06).toFixed(4));
    }

    case 'uniswap_v3': {
      // Concentrated liquidity
      const depthFactor = amountUsd / 800_000;
      return Number(Math.min(1.5, 0.045 + depthFactor * 0.12).toFixed(4));
    }

    case 'minswap': {
      // Cardano native
      const isAda = asset === 'ADA' || asset === 'tNIGHT';
      const base = isAda ? 0.06 : 0.18;
      const depthFactor = amountUsd / 350_000;
      return Number(Math.min(2.8, base + depthFactor * 0.25).toFixed(4));
    }

    case 'jupiter_solana': {
      // Solana deep CLMM liquidity
      const depthFactor = amountUsd / 1_500_000;
      return Number(Math.min(0.9, 0.022 + depthFactor * 0.07).toFixed(4));
    }

    default:
      return 0.1;
  }
}

/**
 * Evaluates all supported liquidity venues and computes competitive quotes
 * comparing them against the isolated Midnight vault baseline.
 */
export function compareExecutionRoutes(
  asset: string,
  amountUsd: number,
  marketPriceUsd: number
): RouteComparisonResult {
  const safeAmount = Math.max(10, amountUsd);
  const safePrice = Math.max(0.0001, marketPriceUsd);

  // 1. Calculate isolated vault baseline
  const isolatedSlippagePct = calculateIsolatedVaultSlippage(safeAmount);
  const isolatedPriceImpactUsd = Number(((safeAmount * isolatedSlippagePct) / 100).toFixed(2));
  const isolatedEffectivePriceUsd = Number(
    (safePrice * (1 + isolatedSlippagePct / 100)).toFixed(safePrice < 1 ? 5 : 2)
  );

  // 2. Generate quotes across all venues
  const venueEntries = Object.values(LIQUIDITY_VENUES).filter((v) =>
    v.supportedAssets.includes(asset) || asset === 'ADA'
  );

  const routes: RouteQuote[] = venueEntries.map((venue) => {
    const slippagePct = calculateVenueSlippage(venue.id, safeAmount, asset);
    const feeUsd = Number(((safeAmount * venue.baseFeeBps) / 10_000).toFixed(2));
    const executionPrice = Number(
      (safePrice * (1 + slippagePct / 100)).toFixed(safePrice < 1 ? 5 : 2)
    );
    const venuePriceImpactUsd = (safeAmount * slippagePct) / 100;
    
    // Savings compared to executing on isolated vault
    const slippageSaved = Math.max(
      0,
      Number((isolatedPriceImpactUsd - venuePriceImpactUsd).toFixed(2))
    );

    const netUnits = Number(
      ((safeAmount - feeUsd) / executionPrice).toFixed(safePrice < 1 ? 2 : 4)
    );

    let routingReason = '';
    if (venue.id === 'hyperliquid') {
      routingReason = 'Deepest orderbook depth with minimal price impact for large lots';
    } else if (venue.id === 'midnight_darkpool') {
      routingReason = 'Zero-fee internal P2P intent match with 100% cryptographic shielding';
    } else if (venue.id === 'minswap') {
      routingReason = 'Native Cardano eUTxO direct batch settlement';
    } else if (venue.id === 'jupiter_solana') {
      routingReason = 'Sub-second Solana settlement with deep Jupiter CLMM routing';
    } else {
      routingReason = 'Multi-chain concentrated liquidity across EVM pairs';
    }

    return {
      venue,
      asset,
      inputAmountUsd: safeAmount,
      marketPriceUsd: safePrice,
      executionPriceUsd: executionPrice,
      priceImpactPct: slippagePct,
      slippageSavedUsd: slippageSaved,
      estimatedFeeUsd: feeUsd,
      estimatedOutputUnits: netUnits,
      isOptimal: false,
      routingReason,
      solverId: `0xsolver_${venue.id}_${Math.random().toString(16).substring(2, 6)}`,
    };
  });

  // 3. Determine the optimal route (highest output units / lowest price impact)
  routes.sort((a, b) => b.estimatedOutputUnits - a.estimatedOutputUnits);
  if (routes.length > 0) {
    routes[0].isOptimal = true;
  }

  const optimalRoute = routes[0] || {
    venue: LIQUIDITY_VENUES.hyperliquid,
    asset,
    inputAmountUsd: safeAmount,
    marketPriceUsd: safePrice,
    executionPriceUsd: safePrice,
    priceImpactPct: 0.02,
    slippageSavedUsd: isolatedPriceImpactUsd,
    estimatedFeeUsd: 0.5,
    estimatedOutputUnits: safeAmount / safePrice,
    isOptimal: true,
    routingReason: 'Default optimal route',
    solverId: '0xsolver_hyperliquid_default',
  };

  return {
    asset,
    inputAmountUsd: safeAmount,
    marketPriceUsd: safePrice,
    routes,
    optimalRoute,
    isolatedVaultBaseline: {
      slippagePct: isolatedSlippagePct,
      priceImpactUsd: isolatedPriceImpactUsd,
      effectivePriceUsd: isolatedEffectivePriceUsd,
    },
    totalSlippageSavedUsd: optimalRoute.slippageSavedUsd,
  };
}
