import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  ArrowUpRight,
  Maximize2,
  Sparkles,
  Layers
} from 'lucide-react';
import {
  fetchLiveMarketData,
  getAssetPriceHistory,
  type LiveMarketAsset,
  type PricePoint
} from '../utils/marketData';
import { formatISTDateTime, formatISTTime } from '../utils/time';

interface MarketChartProps {
  onNavigateTab?: (tab: string) => void;
  vaultBalance?: number;
}

export const MarketChart: React.FC<MarketChartProps> = ({
  onNavigateTab,
  vaultBalance = 0,
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
    <div className="light-glass border border-white/60 rounded-[2rem] p-6 sm:p-8 space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden font-sans group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />

      {/* Header and Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-orange-500" />
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Live Market Oracles
          </h2>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white/40 p-1.5 rounded-2xl border border-white/60 shadow-sm">
          {(['1D', '1W', '1M', '1Y'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeframe === tf
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Selector Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 relative z-10 scrollbar-hide">
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
              className={`px-5 py-2.5 rounded-[1rem] border text-xs font-extrabold tracking-widest transition-all cursor-pointer shrink-0 flex items-center gap-3 ${
                isSelected
                  ? 'bg-gray-900 text-white border-gray-900 shadow-md scale-105'
                  : 'bg-white/40 hover:bg-white/70 text-gray-700 border-white/60 hover:scale-[1.02]'
              }`}
            >
              <span>{sym}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-md ${
                  isSelected
                    ? chg >= 0
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-red-500/20 text-red-300'
                    : chg >= 0
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-600'
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 bg-white/40 p-6 rounded-[2rem] border border-white/60 relative z-10 shadow-sm">
        <div className="space-y-1">
          <div className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">
            {currentAsset.name} ({selectedAsset}/USD)
          </div>
          <div className="flex items-baseline gap-4 pt-1">
            <span className="text-5xl font-extrabold text-gray-900 tracking-tight font-mono">
              ${displayPrice.toLocaleString(undefined, { minimumFractionDigits: displayPrice < 1 ? 4 : 2 })}
            </span>
            <span
              className={`text-sm font-extrabold flex items-center gap-1 px-3 py-1 rounded-full ${
                isPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
              }`}
            >
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isPositive ? '+' : ''}
              {currentAsset.change24h}% (24h)
            </span>
          </div>
          <div className="text-[11px] text-gray-500 font-mono flex items-center gap-2 pt-2">
            <span>Timestamp (IST):</span>
            <span className="font-bold text-gray-700 bg-white/60 px-2 py-0.5 rounded-md">{displayTime}</span>
          </div>
        </div>

        {/* 24h Mini Stats */}
        <div className="grid grid-cols-3 gap-4 text-left text-xs bg-white/60 p-4 rounded-2xl border border-white/60 shrink-0 shadow-sm">
          <div>
            <span className="text-[10px] text-gray-500 block font-bold uppercase tracking-widest mb-1">24h High</span>
            <span className="font-extrabold text-gray-900 font-mono text-sm">${currentAsset.high24h}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 block font-bold uppercase tracking-widest mb-1">24h Low</span>
            <span className="font-extrabold text-gray-900 font-mono text-sm">${currentAsset.low24h}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 block font-bold uppercase tracking-widest mb-1">24h Vol</span>
            <span className="font-extrabold text-gray-900 font-mono text-sm">{currentAsset.volume24h}</span>
          </div>
        </div>
      </div>

      {/* SVG Interactive Area Chart */}
      <div className="relative bg-white/40 rounded-[2rem] border border-white/60 p-4 overflow-hidden relative z-10 shadow-sm">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 sm:h-64 cursor-crosshair select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isPositive ? '#10B981' : '#F97316'} stopOpacity="0.35" />
              <stop offset="100%" stopColor={isPositive ? '#10B981' : '#F97316'} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#ffffff" strokeWidth="2" strokeDasharray="4 4" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#ffffff" strokeWidth="2" strokeDasharray="4 4" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#ffffff" strokeWidth="2" />

          {/* Area fill */}
          {areaString && <polygon points={areaString} fill="url(#chartGradient)" />}

          {/* Line stroke */}
          {pointsString && (
            <polyline
              points={pointsString}
              fill="none"
              stroke={isPositive ? '#059669' : '#EA580C'}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-md"
            />
          )}

          {/* Min and Max Labels */}
          <text x={paddingX} y={paddingY - 12} fontSize="10" fill="#6b7280" fontFamily="monospace" fontWeight="bold">
            MAX: ${maxPrice.toLocaleString()}
          </text>
          <text x={paddingX} y={height - 6} fontSize="10" fill="#6b7280" fontFamily="monospace" fontWeight="bold">
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
                    <line x1={x} y1={paddingY} x2={x} y2={height - paddingY} stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4 4" />
                    <circle cx={x} cy={y} r="6" fill={isPositive ? '#059669' : '#EA580C'} stroke="#ffffff" strokeWidth="3" className="drop-shadow-sm" />
                  </>
                );
              })()}
            </g>
          )}
        </svg>
      </div>

      {/* Chart Footer with Trade CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 relative z-10 border-t border-white/40">
        <div className="flex items-center gap-3 text-sm text-gray-700 bg-white/40 px-4 py-2 rounded-xl border border-white/60 font-semibold shadow-sm">
          <Sparkles className="w-5 h-5 text-orange-500 shrink-0" />
          <span>
            {currentAsset.reasoning}
          </span>
        </div>

        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('market-insights')}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-gray-900 to-gray-800 hover:scale-[1.02] text-white text-[13px] font-extrabold tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-gray-900/20 shrink-0"
          >
            <span>Trade {selectedAsset} in Market Insights</span>
            <ArrowUpRight className="w-4 h-4 text-orange-400" />
          </button>
        )}
      </div>
    </div>
  );
};
