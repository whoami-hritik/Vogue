export interface StrategyCard {
  id: string;
  label: string;
  hash: string;
  asset: string;
  status: "active" | "expiring" | "expired";
  trades: number;
  daysLeft: number;
  pnl: number;
}

export const strategies: StrategyCard[] = [
  {
    id: "s1",
    label: "Strategy A",
    hash: "0x9f3c1ba47e08d2c65f1de0a7b4c93e18a2d5f60c7be914aa3c02d8471f6be5d3",
    asset: "ADA",
    status: "active",
    trades: 42,
    daysLeft: 18,
    pnl: 12.4,
  },
  {
    id: "s2",
    label: "Strategy B",
    hash: "0x41a8c7e2d09b5f36c81e4a70db2f95c63ae08172d4bf5309ec7a16b2f480d9ac",
    asset: "BTC",
    status: "active",
    trades: 17,
    daysLeft: 6,
    pnl: -3.1,
  },
  {
    id: "s3",
    label: "Strategy C",
    hash: "0x7d20e5f19c34ab806e5721df9b4a3c68051fed72ba9c4310d86f2e0754ac9b11",
    asset: "SOL",
    status: "expiring",
    trades: 9,
    daysLeft: 1,
    pnl: 4.8,
  },
];

export interface TradeRow {
  id: string;
  timestamp: string;
  status: "executed" | "rejected";
  proof: string;
}

export const trades: TradeRow[] = [
  { id: "t1", timestamp: "2026-08-08 17:42:11", status: "executed", proof: "0x8be1…4a02" },
  { id: "t2", timestamp: "2026-08-08 16:03:54", status: "executed", proof: "0x1c7d…9f31" },
  { id: "t3", timestamp: "2026-08-08 14:21:07", status: "rejected", proof: "0xa042…70bc" },
  { id: "t4", timestamp: "2026-08-08 11:58:39", status: "executed", proof: "0x55fe…31d8" },
  { id: "t5", timestamp: "2026-08-07 22:14:02", status: "executed", proof: "0x0b93…c47a" },
  { id: "t6", timestamp: "2026-08-07 19:47:30", status: "rejected", proof: "0xe61a…2205" },
  { id: "t7", timestamp: "2026-08-07 15:12:48", status: "executed", proof: "0x3d80…ba69" },
  { id: "t8", timestamp: "2026-08-06 20:35:16", status: "executed", proof: "0x9a4c…08e2" },
  { id: "t9", timestamp: "2026-08-06 13:09:55", status: "executed", proof: "0x77b2…5d10" },
  { id: "t10", timestamp: "2026-08-05 18:26:41", status: "rejected", proof: "0x2f19…ae74" },
];

export interface Ticker {
  symbol: string;
  price: number;
  change: number;
}

export const tickers: Ticker[] = [
  { symbol: "ADA", price: 0.7412, change: 2.31 },
  { symbol: "BTC", price: 91_284.2, change: -0.87 },
  { symbol: "ETH", price: 4_128.66, change: 1.42 },
  { symbol: "SOL", price: 214.03, change: 3.95 },
  { symbol: "DUST", price: 1.286, change: -1.14 },
  { symbol: "MID", price: 0.4419, change: 0.62 },
];

export const priceSeries = [
  { t: "09:00", ADA: 0.712, BTC: 90.1, ETH: 40.6 },
  { t: "10:00", ADA: 0.718, BTC: 90.6, ETH: 40.9 },
  { t: "11:00", ADA: 0.709, BTC: 90.2, ETH: 40.4 },
  { t: "12:00", ADA: 0.724, BTC: 91.0, ETH: 41.1 },
  { t: "13:00", ADA: 0.731, BTC: 90.8, ETH: 41.4 },
  { t: "14:00", ADA: 0.727, BTC: 91.4, ETH: 41.0 },
  { t: "15:00", ADA: 0.736, BTC: 91.1, ETH: 41.6 },
  { t: "16:00", ADA: 0.741, BTC: 91.3, ETH: 41.3 },
];

export interface Insight {
  asset: string;
  tone: "bullish" | "neutral" | "bearish";
  confidence: number;
  reasoning: string;
}

export const insights: Insight[] = [
  {
    asset: "ADA",
    tone: "bullish",
    confidence: 0.78,
    reasoning:
      "Volume expansion on the last three sessions with higher lows; funding stays neutral, so the move isn't leverage-driven.",
  },
  {
    asset: "BTC",
    tone: "neutral",
    confidence: 0.54,
    reasoning:
      "Range compression between 89.8k and 92.4k. Volatility is coiling — direction unresolved until one edge breaks on volume.",
  },
  {
    asset: "SOL",
    tone: "bullish",
    confidence: 0.71,
    reasoning: "Relative strength versus majors held through the last drawdown; net inflows positive four days running.",
  },
  {
    asset: "ETH",
    tone: "bearish",
    confidence: 0.63,
    reasoning: "Lower highs against BTC and thinning spot bids under 4.05k leave a gap toward the prior consolidation.",
  },
];

export const portfolioSeries = [
  { d: "Jul 22", v: 41_200 },
  { d: "Jul 25", v: 41_850 },
  { d: "Jul 28", v: 40_910 },
  { d: "Jul 31", v: 42_640 },
  { d: "Aug 02", v: 43_180 },
  { d: "Aug 04", v: 42_720 },
  { d: "Aug 06", v: 44_310 },
  { d: "Aug 08", v: 46_128 },
];

export interface Position {
  asset: string;
  size: number;
  entry: number;
  current: number;
}

export const positions: Position[] = [
  { asset: "ADA", size: 18_400, entry: 0.6612, current: 0.7412 },
  { asset: "BTC", size: 0.184, entry: 93_120.0, current: 91_284.2 },
  { asset: "SOL", size: 62.5, entry: 188.4, current: 214.03 },
  { asset: "DUST", size: 4_800, entry: 1.352, current: 1.286 },
];
