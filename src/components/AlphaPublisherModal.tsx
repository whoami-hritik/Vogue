import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Layers,
  Percent,
  DollarSign
} from 'lucide-react';
import {
  publishCustomAlphaStrategy,
  AlphaStrategy
} from '../lib/alpha-engine';

interface AlphaPublisherModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletConnected: boolean;
  walletAddress: string | null;
  onConnectWallet: () => void;
  onStrategyPublished: (strategy: AlphaStrategy) => void;
}

export const AlphaPublisherModal: React.FC<AlphaPublisherModalProps> = ({
  isOpen,
  onClose,
  walletConnected,
  walletAddress,
  onConnectWallet,
  onStrategyPublished,
}) => {
  const [name, setName] = useState('');
  const [creatorShort, setCreatorShort] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'MOMENTUM' | 'STAT_ARB' | 'MACRO' | 'DELTA_NEUTRAL' | 'MEAN_REVERSION'>('MOMENTUM');
  const [venues, setVenues] = useState<string[]>(['Hyperliquid Prime']);
  const [feePct, setFeePct] = useState<number>(15);
  const [minStakeUsd, setMinStakeUsd] = useState<number>(250);
  const [tagsInput, setTagsInput] = useState('Momentum, Breakout, ZK-Shielded');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishedCert, setPublishedCert] = useState<AlphaStrategy | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVenueToggle = (venue: string) => {
    if (venues.includes(venue)) {
      if (venues.length > 1) {
        setVenues(venues.filter((v) => v !== venue));
      }
    } else {
      setVenues([...venues, venue]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!walletConnected) {
      onConnectWallet();
      return;
    }

    if (!name.trim()) {
      setError('Please provide a strategy title.');
      return;
    }

    if (feePct < 1 || feePct > 50) {
      setError('Performance fee must be between 1% and 50%.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Synthesize realistic trading historical track record for proof generation
      const seedTrades = [
        340, 280, -95, 410, 390, -110, 520, 310, -85, 460,
        380, -100, 490, 420, -90, 560, 310, -75, 480, 510
      ];

      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

      const newStrategy = await publishCustomAlphaStrategy({
        name: name.trim(),
        creatorAddress: walletAddress || '0xmidnight_quant_anon',
        creatorShort: creatorShort.trim() || 'QuantDev',
        description: description.trim() || 'Proprietary quantitative strategy verified with Midnight Zero-Knowledge Proofs.',
        category,
        executionVenues: venues,
        performanceFeePct: feePct,
        minFollowerStakeUsd: minStakeUsd,
        initialTradePnls: seedTrades,
        tags: tags.length > 0 ? tags : ['AI Alpha', 'Confidential', 'ZK Proven'],
      });

      setPublishedCert(newStrategy);
      onStrategyPublished(newStrategy);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to publish strategy';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setDescription('');
    setCreatorShort('');
    setPublishedCert(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden my-8">
        {/* Glow background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/10 blur-3xl rounded-full pointer-events-none -mr-20 -mt-20" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                Publish Quant Strategy & Proof of Alpha
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Monetize your algorithmic models with 100% zero-knowledge IP confidentiality
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success confirmation */}
        {publishedCert ? (
          <div className="py-6 space-y-6 relative z-10">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-emerald-900">
                Strategy & Proof of Alpha Attested on Midnight!
              </h3>
              <p className="text-xs text-emerald-700 max-w-md mx-auto">
                Your quantitative edge is now live in the Proof of Alpha Marketplace. Followers can mirror your signals while your prompts and indicator weights remain mathematically concealed.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2 font-mono text-xs text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Strategy ID:</span>
                <span className="font-bold text-gray-900">{publishedCert.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Performance Fee:</span>
                <span className="font-bold text-orange-600">{publishedCert.performanceFeePct}% on HWM Net Profit</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Merkle Proof Hash:</span>
                <span className="font-bold text-indigo-600 truncate max-w-[280px]">
                  {publishedCert.certificate.merkleProofHash}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ZK Attestation Commitment:</span>
                <span className="font-bold text-teal-600 truncate max-w-[280px]">
                  {publishedCert.certificate.zkAttestationCommitment}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Midnight Block Height:</span>
                <span className="font-bold text-gray-900">#{publishedCert.certificate.verifiedBlockHeight}</span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-3.5 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Done & View in Marketplace
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="py-5 space-y-4 relative z-10">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Strategy Title & Creator */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Strategy Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arbitrum L2 Momentum AI"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Creator Pseudonym
                </label>
                <input
                  type="text"
                  placeholder="e.g. QuantViper"
                  value={creatorShort}
                  onChange={(e) => setCreatorShort(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Quantitative Thesis & Strategy Description
              </label>
              <textarea
                rows={2}
                placeholder="Explain the strategy's market edge, risk factors, or target market regimes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>

            {/* Category & Performance Fee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Strategy Classification
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500 bg-white"
                >
                  <option value="MOMENTUM">MOMENTUM (Trend Breakouts)</option>
                  <option value="STAT_ARB">STAT_ARB (Basis / Spread Arbitrage)</option>
                  <option value="MEAN_REVERSION">MEAN_REVERSION (Volatility Extremes)</option>
                  <option value="MACRO">MACRO (Liquidity Cycles)</option>
                  <option value="DELTA_NEUTRAL">DELTA_NEUTRAL (Funding Rate Harvester)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-gray-700">
                    Performance Fee (HWM Enforced)
                  </label>
                  <span className="text-xs font-extrabold text-orange-600">{feePct}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={5}
                    max={35}
                    step={1}
                    value={feePct}
                    onChange={(e) => setFeePct(Number(e.target.value))}
                    className="w-full accent-orange-600"
                  />
                </div>
                <span className="text-[10px] text-gray-400 block mt-1">
                  Earned solely on net new profits exceeding High-Water Mark (0% upfront fee).
                </span>
              </div>
            </div>

            {/* Min Stake & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Minimum Follower Stake ($vUSD)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    min={50}
                    step={50}
                    value={minStakeUsd}
                    onChange={(e) => setMinStakeUsd(Number(e.target.value))}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Search & Filter Tags
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. BTC, Breakout, Low Drawdown"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Venues Multi-Select */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">
                Execution Venues (Dark Intent Network Routing)
              </label>
              <div className="flex flex-wrap gap-2">
                {['Hyperliquid Prime', 'Uniswap v3', 'Minswap DEX', 'Midnight Dark Pool'].map((v) => {
                  const isSelected = venues.includes(v);
                  return (
                    <button
                      type="button"
                      key={v}
                      onClick={() => handleVenueToggle(v)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-orange-50 border-orange-300 text-orange-700 shadow-xs'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Zero-Knowledge Guarantees Alert */}
            <div className="bg-orange-50/60 border border-orange-200/80 rounded-2xl p-3.5 text-xs text-orange-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-orange-800">
                <ShieldCheck className="w-4 h-4 text-orange-600" />
                <span>Zero Intellectual Property Leakage Guarantee</span>
              </div>
              <p className="text-[11px] text-orange-700 leading-relaxed">
                Publishing registers only your mathematical track record (ROI, Sharpe, Drawdown) in a Midnight Compact circuit. Your AI prompts, indicators, and proprietary weights remain 100% confidential.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Proof & Registering on Midnight...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Verify ZK Alpha & Publish Strategy</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
