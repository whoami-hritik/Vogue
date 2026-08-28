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
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm font-sans">
      {/* Header with Asset Selector & Timeframe Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
              Market Price & Volatility Analytics
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase">
              LIVE IST FEED
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Real-time oracle price graph & zero-knowledge position metrics.
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-gray-100 p-1 rounded-xl border border-gray-200/60">
          {(['1D', '1W', '1M', '1Y'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeframe === tf
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
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
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                isSelected
                  ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
              }`}
            >
              <span>{sym}</span>
              <span
                className={`text-[10px] ${
                  isSelected
                    ? chg >= 0
                      ? 'text-emerald-300'
                      : 'text-red-300'
                    : chg >= 0
                    ? 'text-emerald-700'
                    : 'text-red-600'
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 bg-gradient-to-r from-gray-50 via-white to-gray-50 p-4 rounded-2xl border border-gray-200/80">
        <div className="space-y-1">
          <div className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
            {currentAsset.name} ({selectedAsset}/USD)
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight font-mono">
              ${displayPrice.toLocaleString(undefined, { minimumFractionDigits: displayPrice < 1 ? 4 : 2 })}
            </span>
            <span
              className={`text-xs font-bold flex items-center gap-0.5 px-2.5 py-1 rounded-full ${
                isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {isPositive ? '+' : ''}
              {currentAsset.change24h}% (24h)
            </span>
          </div>
          <div className="text-[11px] text-gray-500 font-mono flex items-center gap-1.5 pt-0.5">
            <span>Timestamp (IST):</span>
            <span className="font-semibold text-gray-700">{displayTime}</span>
          </div>
        </div>

        {/* 24h Mini Stats */}
        <div className="grid grid-cols-3 gap-2 text-left text-xs bg-white p-2.5 rounded-xl border border-gray-200 shrink-0">
          <div>
            <span className="text-[10px] text-gray-400 block font-medium">24h High</span>
            <span className="font-bold text-gray-900 font-mono">${currentAsset.high24h}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block font-medium">24h Low</span>
            <span className="font-bold text-gray-900 font-mono">${currentAsset.low24h}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block font-medium">24h Volume</span>
            <span className="font-bold text-gray-900 font-mono">{currentAsset.volume24h}</span>
          </div>
        </div>
      </div>

      {/* SVG Interactive Area Chart */}
      <div className="relative bg-white rounded-xl border border-gray-200/70 p-2 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 sm:h-56 cursor-crosshair select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isPositive ? '#10B981' : '#F97316'} stopOpacity="0.28" />
              <stop offset="100%" stopColor={isPositive ? '#10B981' : '#F97316'} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#e5e7eb" strokeWidth="1" />

          {/* Area fill */}
          {areaString && <polygon points={areaString} fill="url(#chartGradient)" />}

          {/* Line stroke */}
          {pointsString && (
            <polyline
              points={pointsString}
              fill="none"
              stroke={isPositive ? '#059669' : '#EA580C'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Min and Max Labels */}
          <text x={paddingX} y={paddingY - 8} fontSize="9" fill="#9ca3af" fontFamily="monospace">
            MAX: ${maxPrice.toLocaleString()}
          </text>
          <text x={paddingX} y={height - 6} fontSize="9" fill="#9ca3af" fontFamily="monospace">
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
                    <line x1={x} y1={paddingY} x2={x} y2={height - paddingY} stroke="#9ca3af" strokeWidth="1" strokeDasharray="2 2" />
                    <circle cx={x} cy={y} r="5" fill={isPositive ? '#059669' : '#EA580C'} stroke="#ffffff" strokeWidth="2" />
                  </>
                );
              })()}
            </g>
          )}
        </svg>
      </div>

      {/* Chart Footer with Trade CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <span>
            {currentAsset.reasoning}
          </span>
        </div>

        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('market-insights')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs shrink-0"
          >
            <span>Trade {selectedAsset} in Market Insights</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
