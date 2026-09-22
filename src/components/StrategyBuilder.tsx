import React, { useState, useEffect } from 'react';
import {
  Shield, Lock, Copy, CheckCircle, Cpu,
  Sliders, Clock, Percent, Bot, ExternalLink, AlertTriangle, 
  CheckCircle2, RefreshCw, Zap, ArrowRight, Sparkles
} from 'lucide-react';
import { parseNaturalLanguageStrategy, StrategyParams } from '../utils/contract';
import { parseStrategyNode, runStrategyRiskAssessment, StrategyRiskAssessment } from '../utils/agent';
import { motion, AnimatePresence } from 'framer-motion';
import { LiquidGlassButton } from './ui/LiquidGlassButton';

interface StrategyBuilderProps {
  onCommit: (params: StrategyParams) => Promise<string>;
  isProofGenerating: boolean;
  proofStep: string;
  walletConnected: boolean;
  onConnectWallet: () => void;
  networkId?: string;
  onNavigateTab?: (tab: string) => void;
}

const PRESET_PROMPTS = [
  'Max 20% position size, 8% stop-loss, run across all markets for 30 days.',
  'Momentum rules: max 15% position, 5% tight stop-loss for 14 days.',
  'Swing accumulation: 10% max allocation, 12% trailing stop, 60 days duration.',
  'High-volatility bounds: 25% max position size, 6% stop-loss for 7 days.'
];

export const StrategyBuilder: React.FC<StrategyBuilderProps> = ({
  onCommit,
  isProofGenerating,
  proofStep,
  walletConnected,
  onConnectWallet,
  networkId = 'preview',
  onNavigateTab
}) => {
  const defaultPrompt = PRESET_PROMPTS[0];
  const [promptText, setPromptText] = useState<string>(defaultPrompt);
  const [parsedParams, setParsedParams] = useState<StrategyParams>(() =>
    parseNaturalLanguageStrategy(defaultPrompt)
  );

  const [isParsingGemini, setIsParsingGemini] = useState<boolean>(false);
  const [committedHash, setCommittedHash] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  const [riskAssessment, setRiskAssessment] = useState<StrategyRiskAssessment | null>(null);
  const [isLoadingRisk, setIsLoadingRisk] = useState<boolean>(false);

  const evaluateRisk = async (params: StrategyParams) => {
    setIsLoadingRisk(true);
    try {
      const assessment = await runStrategyRiskAssessment({
        maxPositionPct: params.maxPositionPct,
        stopLossPct: params.stopLossPct,
        timelineDays: params.timelineDays
      });
      setRiskAssessment(assessment);
    } finally {
      setIsLoadingRisk(false);
    }
  };

  useEffect(() => {
    evaluateRisk(parsedParams);
  }, [parsedParams.maxPositionPct, parsedParams.stopLossPct, parsedParams.timelineDays]);

  const handlePromptChange = (text: string) => {
    setPromptText(text);
    const parsed = parseNaturalLanguageStrategy(text);
    setParsedParams(parsed);
    setIsConfirmed(false);
    setCommittedHash(null);
  };

  const handleSelectPreset = (preset: string) => {
    handlePromptChange(preset);
  };

  const handleGeminiParse = async () => {
    setIsParsingGemini(true);
    try {
      const res = await parseStrategyNode({ naturalLanguagePrompt: promptText } as any);
      if (res.strategyParams) {
        setParsedParams(res.strategyParams);
      }
    } finally {
      setIsParsingGemini(false);
    }
  };

  const handleChipChange = (field: keyof StrategyParams, value: any) => {
    setParsedParams((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCommitSubmit = async () => {
    if (!walletConnected) {
      onConnectWallet();
      return;
    }
    const hash = await onCommit(parsedParams);
    setCommittedHash(hash);
  };

  const copyToClipboard = () => {
    if (committedHash) {
      navigator.clipboard.writeText(committedHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans pb-12 pt-4 px-2">
      {/* Visual Header */}
      <div className="flex flex-col items-center text-center space-y-4 mb-8">
        <div className="liquid-glass-pill px-4 py-1.5 inline-flex items-center gap-2 text-xs font-mono text-zinc-300">
          <Shield className="w-4 h-4 text-white" />
          <span>Zero-Knowledge Strategy Synthesis</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Define Cryptographic Risk Bounds
        </h1>
        <p className="text-zinc-300 font-normal max-w-xl text-xs sm:text-sm leading-relaxed">
          Mathematically enforce your algorithmic trade limits on Midnight. Your strategy logic stays local in device memory.
        </p>
      </div>

      {/* Main Builder Dual-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Natural Language Input (Span 5) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          <div className="liquid-glass p-6 sm:p-7 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-zinc-300" />
                  Strategy Intent Synthesis
                </h3>
                <span className="liquid-glass-pill px-2.5 py-0.5 text-[10px] font-mono text-zinc-400">
                  Gemini 2.5 Flash
                </span>
              </div>
              
              <div className="space-y-4">
                <textarea
                  value={promptText}
                  onChange={(e) => handlePromptChange(e.target.value)}
                  rows={5}
                  placeholder="Describe your strategy constraints..."
                  className="w-full bg-white/[0.03] border border-white/15 rounded-xl p-4 text-white placeholder-zinc-500 text-sm font-mono leading-relaxed focus:outline-none focus:border-white/40 resize-none transition-all"
                />
                
                <button
                  onClick={handleGeminiParse}
                  disabled={isParsingGemini}
                  className="liquid-glass-btn w-full py-3.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isParsingGemini ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{isParsingGemini ? 'Synthesizing bounds...' : 'Synthesize Constraints'}</span>
                </button>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-white/10">
              <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-3">Institutional Presets</p>
              <div className="flex flex-col gap-2">
                {PRESET_PROMPTS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(preset)}
                    className="text-left text-xs font-mono text-zinc-300 liquid-glass-pill px-4 py-2.5 hover:text-white transition-all cursor-pointer truncate"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quant Risk Matrix (Span 7) */}
        <div className="lg:col-span-7 space-y-6 flex flex-col">
          {/* Top Panel: Big Tabular Numbers */}
          <div className="liquid-glass p-6 sm:p-7">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-zinc-300" />
                Strategy Parameters
              </h3>
              <span className="liquid-glass-pill px-3 py-1 text-[10px] font-mono font-bold text-zinc-400 uppercase flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-zinc-400" /> Local Witness
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Max Pos */}
              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-5 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Percent className="w-3 h-3 text-zinc-400" /> Max Position
                </span>
                <div className="flex items-end gap-1">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={parsedParams.maxPositionPct}
                    onChange={(e) => handleChipChange('maxPositionPct', parseInt(e.target.value) || 1)}
                    className="w-20 bg-transparent text-white font-extrabold text-5xl tracking-tight text-center focus:outline-none appearance-none font-mono"
                  />
                  <span className="text-2xl font-mono text-zinc-500 mb-1.5">%</span>
                </div>
              </div>

              {/* Stop Loss */}
              <div className="rounded-xl bg-rose-500/5 border border-rose-500/20 p-5 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-mono font-bold text-rose-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-rose-400" /> Stop Loss
                </span>
                <div className="flex items-end gap-1">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={parsedParams.stopLossPct}
                    onChange={(e) => handleChipChange('stopLossPct', parseInt(e.target.value) || 0)}
                    className="w-20 bg-transparent text-rose-400 font-extrabold text-5xl tracking-tight text-center focus:outline-none appearance-none font-mono"
                  />
                  <span className="text-2xl font-mono text-rose-400/60 mb-1.5">%</span>
                </div>
              </div>

              {/* Duration */}
              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-5 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-zinc-400" /> Duration
                </span>
                <div className="flex items-end gap-1">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={parsedParams.timelineDays}
                    onChange={(e) => handleChipChange('timelineDays', parseInt(e.target.value) || 1)}
                    className="w-20 bg-transparent text-white font-extrabold text-5xl tracking-tight text-center focus:outline-none appearance-none font-mono"
                  />
                  <span className="text-2xl font-mono text-zinc-500 mb-1.5">d</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Risk Diagnostic */}
          <div className="liquid-glass p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-zinc-300" /> Quantitative Risk Diagnostic
              </h3>
              {isLoadingRisk ? (
                <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" />
              ) : riskAssessment && (
                <span className="liquid-glass-pill px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-white">
                  {riskAssessment.riskLevel.replace('_', ' ')}
                </span>
              )}
            </div>

            <div className="space-y-3">
              {riskAssessment ? (
                <>
                  <p className="text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed">
                    "{riskAssessment.assessmentSummary}"
                  </p>
                  {riskAssessment.guidanceNotes && riskAssessment.guidanceNotes.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {riskAssessment.guidanceNotes.map((note, idx) => (
                        <div key={idx} className="liquid-glass-pill px-3 py-1.5 text-xs text-zinc-300 font-mono flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                          {note}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-zinc-500 font-mono">Evaluating parameters...</p>
              )}
            </div>
          </div>

          {/* Commitment & Action */}
          <div className="liquid-glass p-6 sm:p-7 flex flex-col space-y-5 justify-end">
            {!committedHash && (
              <label className="flex items-center gap-3.5 p-3.5 liquid-glass-pill cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 text-white focus:ring-white/40 cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed">
                  I confirm these risk bounds are ready to be cryptographically committed to Midnight.
                </span>
              </label>
            )}

            {isProofGenerating ? (
              <div className="liquid-glass p-6 flex flex-col items-center justify-center space-y-4">
                <Cpu className="w-7 h-7 text-white animate-spin" />
                <span className="font-mono font-bold text-white text-xs uppercase tracking-widest">Compiling ZK Circuit Proof...</span>
                <span className="liquid-glass-pill px-4 py-1.5 text-xs font-mono text-zinc-300">{proofStep}</span>
                <p className="text-xs text-zinc-400 text-center max-w-sm">
                  Please approve the 1AM wallet signature prompt if displayed, or await local witness synthesis.
                </p>
              </div>
            ) : !committedHash ? (
              <button
                onClick={handleCommitSubmit}
                disabled={!isConfirmed}
                className={`w-full py-4 rounded-full font-mono font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${
                  isConfirmed
                    ? 'liquid-glass-btn cursor-pointer'
                    : 'liquid-glass-btn-secondary opacity-40 cursor-not-allowed'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>{walletConnected ? 'Commit Strategy to Midnight' : 'Connect Wallet to Commit'}</span>
              </button>
            ) : null}

            {/* Success State */}
            <AnimatePresence>
              {committedHash && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="liquid-glass p-6 sm:p-7 space-y-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">Strategy Committed On-Chain</h4>
                      <p className="text-[11px] font-mono text-zinc-400">Zero-Knowledge State Proof Recorded</p>
                    </div>
                  </div>

                  <div className="liquid-glass-pill p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex-1 w-full overflow-hidden">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Commitment Hash</span>
                      <span className="text-white font-mono text-xs truncate block">{committedHash}</span>
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="liquid-glass-pill px-4 py-2 text-xs font-mono font-bold text-zinc-200 hover:text-white flex items-center gap-2 shrink-0 cursor-pointer"
                    >
                      {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy Hash'}
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {onNavigateTab && (
                      <LiquidGlassButton
                        onClick={() => onNavigateTab('overview')}
                        variant="primary"
                        icon={<ArrowRight className="w-4 h-4" />}
                      >
                        Deploy to Market
                      </LiquidGlassButton>
                    )}
                    <LiquidGlassButton
                      href={networkId === 'preprod' ? 'https://explorer.1am.xyz?network=preprod' : 'https://explorer.1am.xyz?network=preview'}
                      target="_blank"
                      rel="noreferrer"
                      variant="secondary"
                      icon={<ExternalLink className="w-4 h-4" />}
                    >
                      View on Explorer
                    </LiquidGlassButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
