import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import {
  fetchLiveMarketData,
  getAssetPriceHistory,
  type LiveMarketAsset,
  type PricePoint
} from '../utils/marketData';
import { formatISTDateTime } from '../utils/time';

interface MarketChartProps {
  onNavigateTab?: (tab: string) => void;
  vaultBalance?: number;
}

export const MarketChart: React.FC<MarketChartProps> = ({
  onNavigateTab,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<string>('ADA');
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');
  const [marketData, setMarketData] = useState<LiveMarketAsset[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<PricePoint | null>(null);

  useEffect(() => {
    fetchLiveMarketData().then(setMarketData);
    const interval = setInterval(() => {
      fetchLiveMarketData().then(setMarketData);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const currentAsset = marketData.find((a) => a.symbol === selectedAsset) || {
    symbol: selectedAsset,
    name: selectedAsset === 'ADA' ? 'Cardano' : selectedAsset === 'BTC' ? 'Bitcoin' : selectedAsset === 'ETH' ? 'Ethereum' : selectedAsset === 'SOL' ? 'Solana' : 'Midnight',
    price: selectedAsset === 'ADA' ? 0.421 : selectedAsset === 'BTC' ? 61250 : selectedAsset === 'ETH' ? 3300 : selectedAsset === 'SOL' ? 145 : 1.0,
    change24h: 2.45,
    high24h: 0.435,
    low24h: 0.408,
    volume24h: '$184.2M',
    sentiment: 'Bullish' as const,
    confidence: 85,
    reasoning: 'Live Cardano price feed active.',
  };

  const isPositive = currentAsset.change24h >= 0;

  // Chart data points
  const historyData = useMemo(() => {
    return getAssetPriceHistory(selectedAsset, timeframe);
  }, [selectedAsset, timeframe, currentAsset.price]);

  const prices = historyData.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  // SVG Chart Geometry
  const width = 640;
  const height = 220;
  const paddingX = 20;
  const paddingY = 25;

  const pointsString = useMemo(() => {
    if (historyData.length < 2) return '';
    return historyData
      .map((d, idx) => {
        const x = paddingX + (idx / (historyData.length - 1)) * (width - 2 * paddingX);
        const y = height - paddingY - ((d.price - minPrice) / priceRange) * (height - 2 * paddingY);
        return `${x},${y}`;
      })
      .join(' ');
  }, [historyData, minPrice, priceRange]);

  const areaString = useMemo(() => {
    if (!pointsString) return '';
    const firstX = paddingX;
    const lastX = width - paddingX;
    const bottomY = height - paddingY;
    return `${firstX},${bottomY} ${pointsString} ${lastX},${bottomY}`;
  }, [pointsString]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const relativeX = Math.max(0, Math.min(width, (clientX / rect.width) * width));
    const ratio = Math.max(0, Math.min(1, (relativeX - paddingX) / (width - 2 * paddingX)));
    const index = Math.round(ratio * (historyData.length - 1));
    if (historyData[index]) {
      setHoveredPoint(historyData[index]);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  const displayPrice = hoveredPoint ? hoveredPoint.price : currentAsset.price;
  const displayTime = hoveredPoint ? formatISTDateTime(hoveredPoint.timestamp) : formatISTDateTime(Date.now());

  return (
    <div className="liquid-glass p-6 sm:p-7 space-y-6 font-sans">
      {/* Header and Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/15 flex items-center justify-center text-white">
            <Activity className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Live Market Oracles
          </h2>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto liquid-glass-pill p-1.5">
          {(['1D', '1W', '1M', '1Y'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3.5 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                timeframe === tf
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Selector Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
        {['ADA', 'BTC', 'ETH', 'SOL', 'tNIGHT'].map((sym) => {
          const isSelected = selectedAsset === sym;
          const aData = marketData.find((m) => m.symbol === sym);
          const chg = aData ? aData.change24h : 0;
          return (
            <button
              key={sym}
              onClick={() => {
                setSelectedAsset(sym);
                setHoveredPoint(null);
              }}
              className={`px-4 py-2 rounded-full border text-xs font-mono font-bold tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                isSelected
                  ? 'liquid-glass-btn text-white scale-102'
                  : 'liquid-glass-pill text-zinc-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <span>{sym}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                  chg >= 0
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-rose-500/15 text-rose-400'
                }`}
              >
                {chg >= 0 ? '+' : ''}
                {chg}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Live Metric Display & Price Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 rounded-2xl bg-white/[0.03] border border-white/10 p-6">
        <div className="space-y-1">
          <div className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest font-mono">
            {currentAsset.name} ({selectedAsset}/USD)
          </div>
          <div className="flex items-baseline gap-4 pt-1">
            <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-mono">
              ${displayPrice.toLocaleString(undefined, { minimumFractionDigits: displayPrice < 1 ? 4 : 2 })}
            </span>
            <span
              className={`text-xs font-bold font-mono flex items-center gap-1 px-3 py-1 rounded-full ${
                isPositive ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {isPositive ? '+' : ''}
              {currentAsset.change24h}% (24h)
            </span>
          </div>
          <div className="text-[11px] text-zinc-400 font-mono flex items-center gap-2 pt-1">
            <span>Timestamp (IST):</span>
            <span className="font-bold text-zinc-200">{displayTime}</span>
          </div>
        </div>

        {/* 24h Mini Stats */}
        <div className="grid grid-cols-3 gap-3 text-left text-xs bg-white/[0.03] border border-white/10 p-3.5 rounded-xl shrink-0">
          <div>
            <span className="text-[10px] text-zinc-400 block font-mono uppercase tracking-wider mb-0.5">24h High</span>
            <span className="font-extrabold text-white font-mono text-sm">${currentAsset.high24h}</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 block font-mono uppercase tracking-wider mb-0.5">24h Low</span>
            <span className="font-extrabold text-white font-mono text-sm">${currentAsset.low24h}</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 block font-mono uppercase tracking-wider mb-0.5">24h Vol</span>
            <span className="font-extrabold text-white font-mono text-sm">{currentAsset.volume24h}</span>
          </div>
        </div>
      </div>

      {/* SVG Interactive Area Chart */}
      <div className="relative rounded-2xl bg-white/[0.02] border border-white/10 p-4 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 sm:h-60 cursor-crosshair select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isPositive ? '#10B981' : '#F43F5E'} stopOpacity="0.25" />
              <stop offset="100%" stopColor={isPositive ? '#10B981' : '#F43F5E'} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

          {/* Area fill */}
          {areaString && <polygon points={areaString} fill="url(#chartGradient)" />}

          {/* Line stroke */}
          {pointsString && (
            <polyline
              points={pointsString}
              fill="none"
              stroke={isPositive ? '#10B981' : '#F43F5E'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Min and Max Labels */}
          <text x={paddingX} y={paddingY - 10} fontSize="10" fill="#94A3B8" fontFamily="monospace" fontWeight="bold">
            MAX: ${maxPrice.toLocaleString()}
          </text>
          <text x={paddingX} y={height - 6} fontSize="10" fill="#94A3B8" fontFamily="monospace" fontWeight="bold">
            MIN: ${minPrice.toLocaleString()}
          </text>

          {/* Hover Crosshair */}
          {hoveredPoint && (
            <g>
              {(() => {
                const idx = historyData.findIndex((d) => d.timestamp === hoveredPoint.timestamp);
                const x = paddingX + (idx / (historyData.length - 1)) * (width - 2 * paddingX);
                const y = height - paddingY - ((hoveredPoint.price - minPrice) / priceRange) * (height - 2 * paddingY);
                return (
                  <>
                    <line x1={x} y1={paddingY} x2={x} y2={height - paddingY} stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="4 4" />
                    <circle cx={x} cy={y} r="5" fill={isPositive ? '#10B981' : '#F43F5E'} stroke="#ffffff" strokeWidth="2" />
                  </>
                );
              })()}
            </g>
          )}
        </svg>
      </div>

      {/* Chart Footer with Trade CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2.5 text-xs text-zinc-300 liquid-glass-pill px-4 py-2">
          <Sparkles className="w-4 h-4 text-white shrink-0" />
          <span>{currentAsset.reasoning}</span>
        </div>

        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('market-insights')}
            className="liquid-glass-btn px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
          >
            <span>Trade {selectedAsset} in Market Insights</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
