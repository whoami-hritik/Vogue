import React, { useState, useEffect } from 'react';
import {
  Sparkles, Shield, Lock, Copy, CheckCircle, Cpu, HelpCircle, 
  Sliders, Clock, Percent, Bot, ExternalLink, AlertTriangle, 
  Flame, CheckCircle2, RefreshCw, Zap, MoveRight, ArrowRight
} from 'lucide-react';
import { parseNaturalLanguageStrategy, StrategyParams } from '../utils/contract';
import { parseStrategyNode, runStrategyRiskAssessment, StrategyRiskAssessment } from '../utils/agent';
import { motion, AnimatePresence } from 'framer-motion';

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
      <div className="flex flex-col items-center text-center space-y-4 mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full light-glass border border-white/60 text-gray-800 text-xs font-semibold shadow-sm">
          <Shield className="w-4 h-4 text-orange-500" />
          <span>Asset-Agnostic ZK Risk Engine</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight drop-shadow-sm">
          Define Your Risk Bounds
        </h1>
        <p className="text-gray-600 font-medium max-w-xl text-sm md:text-base">
          Cryptographically lock your trading constraints before execution. 
          Your strategy remains entirely private.
        </p>
      </div>

      {/* Main Builder Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Natural Language Input (Span 4) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          <div className="light-glass border border-white/60 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex-1 flex flex-col">
            <div className="absolute top-0 left-0 w-40 h-40 bg-orange-400/10 blur-3xl rounded-full -ml-10 -mt-10 pointer-events-none" />
            
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-5 relative z-10">
              <Bot className="w-5 h-5 text-orange-500" />
              AI Strategy Synthesis
            </h3>
            
            <div className="flex-1 flex flex-col space-y-4 relative z-10">
              <textarea
                value={promptText}
                onChange={(e) => handlePromptChange(e.target.value)}
                rows={5}
                placeholder="Describe your strategy limits..."
                className="w-full bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl p-5 text-gray-900 placeholder-gray-500 text-[15px] font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none font-sans shadow-inner transition-all"
              />
              
              <button
                onClick={handleGeminiParse}
                disabled={isParsingGemini}
                className="w-full text-sm font-bold text-white bg-gray-900 hover:bg-black py-3.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all active:scale-[0.98]"
              >
                {isParsingGemini ? <RefreshCw className="w-4 h-4 animate-spin text-orange-400" /> : <Sparkles className="w-4 h-4 text-orange-400" />}
                <span>{isParsingGemini ? 'Synthesizing bounds...' : 'Synthesize with Gemini'}</span>
              </button>
            </div>

            <div className="mt-8 pt-5 border-t border-white/40 relative z-10">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Quick Presets</p>
              <div className="flex flex-col gap-2">
                {PRESET_PROMPTS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(preset)}
                    className="text-left text-xs font-medium text-gray-700 bg-white/40 hover:bg-white/80 border border-white/50 px-4 py-2.5 rounded-xl transition-all cursor-pointer truncate shadow-sm hover:shadow"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Dashboard (Span 8) */}
        <div className="lg:col-span-7 space-y-6 flex flex-col">
          
          {/* Top Panel: Big Numbers */}
          <div className="light-glass border border-white/60 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-400/10 blur-3xl rounded-full -mr-20 -mb-20 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-gray-800" />
                Strategy Parameters
              </h3>
              <div className="px-3 py-1 bg-white/50 rounded-full border border-white/60 text-[10px] font-bold tracking-widest text-gray-500 uppercase flex items-center gap-1.5 shadow-sm">
                <Lock className="w-3 h-3 text-emerald-600" /> Uncommitted
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 relative z-10">
              {/* Max Pos */}
              <div className="bg-white/40 border border-white/60 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow group">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Percent className="w-3 h-3 text-indigo-500" /> Max Position
                </span>
                <div className="flex items-end gap-1">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={parsedParams.maxPositionPct}
                    onChange={(e) => handleChipChange('maxPositionPct', parseInt(e.target.value) || 1)}
                    className="w-20 bg-transparent text-gray-900 font-extrabold text-5xl tracking-tight text-center focus:outline-none appearance-none"
                  />
                  <span className="text-2xl font-bold text-gray-400 mb-1.5">%</span>
                </div>
              </div>

              {/* Stop Loss */}
              <div className="bg-white/40 border border-white/60 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow group">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-red-500" /> Stop Loss
                </span>
                <div className="flex items-end gap-1">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={parsedParams.stopLossPct}
                    onChange={(e) => handleChipChange('stopLossPct', parseInt(e.target.value) || 0)}
                    className="w-20 bg-transparent text-gray-900 font-extrabold text-5xl tracking-tight text-center focus:outline-none appearance-none"
                  />
                  <span className="text-2xl font-bold text-gray-400 mb-1.5">%</span>
                </div>
              </div>

              {/* Duration */}
              <div className="bg-white/40 border border-white/60 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow group">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-emerald-600" /> Duration
                </span>
                <div className="flex items-end gap-1">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={parsedParams.timelineDays}
                    onChange={(e) => handleChipChange('timelineDays', parseInt(e.target.value) || 1)}
                    className="w-20 bg-transparent text-gray-900 font-extrabold text-5xl tracking-tight text-center focus:outline-none appearance-none"
                  />
                  <span className="text-2xl font-bold text-gray-400 mb-1.5">d</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Risk Read */}
          <div className="relative light-glass rounded-[2rem] p-6 sm:p-8 border border-white/60 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
             {/* Gradient glow for risk read */}
             <div className={`absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay ${
                riskAssessment?.riskLevel === 'CONSERVATIVE' ? 'bg-gradient-to-br from-emerald-400 to-transparent' :
                riskAssessment?.riskLevel === 'MODERATE' ? 'bg-gradient-to-br from-blue-400 to-transparent' :
                riskAssessment?.riskLevel === 'AGGRESSIVE' ? 'bg-gradient-to-br from-orange-400 to-transparent' :
                'bg-gradient-to-br from-red-500 to-transparent'
             }`} />

             <div className="flex items-center justify-between mb-5 relative z-10">
               <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                 <Cpu className="w-5 h-5 text-gray-800" /> AI Risk Diagnostic
               </h3>
               {isLoadingRisk ? (
                 <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
               ) : riskAssessment && (
                 <span className={`text-[11px] px-3.5 py-1.5 rounded-full font-extrabold uppercase tracking-widest shadow-sm ${
                   riskAssessment.riskLevel === 'CONSERVATIVE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                   riskAssessment.riskLevel === 'MODERATE' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                   riskAssessment.riskLevel === 'AGGRESSIVE' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                   'bg-red-100 text-red-800 border border-red-200'
                 }`}>
                   {riskAssessment.riskLevel.replace('_', ' ')}
                 </span>
               )}
             </div>

             <div className="relative z-10 space-y-4">
                {riskAssessment ? (
                  <>
                    <p className="text-[15px] text-gray-800 font-medium leading-relaxed">
                      "{riskAssessment.assessmentSummary}"
                    </p>
                    {riskAssessment.guidanceNotes && riskAssessment.guidanceNotes.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {riskAssessment.guidanceNotes.map((note, idx) => (
                          <div key={idx} className="bg-white/60 border border-white/80 rounded-xl px-4 py-2 text-xs text-gray-700 font-medium shadow-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            {note}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-[15px] text-gray-500">Waiting for parameters...</p>
                )}
             </div>
          </div>

          {/* Confirmation & Action */}
          <div className="light-glass border border-white/60 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col space-y-5 flex-1 justify-end">
            {!committedHash && (
              <label className="flex items-center gap-4 p-4 bg-white/40 border border-white/60 rounded-2xl cursor-pointer hover:bg-white/70 transition-colors shadow-sm">
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[#F26522] focus:ring-[#F26522] cursor-pointer"
                />
                <span className="text-sm text-gray-800 font-semibold select-none leading-relaxed">
                  I confirm these risk bounds are ready to be cryptographically locked on-chain.
                </span>
              </label>
            )}

            {isProofGenerating ? (
              <div className="bg-white/60 border border-orange-200/50 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 shadow-inner">
                <Cpu className="w-8 h-8 text-orange-500 animate-spin" />
                <span className="font-extrabold text-gray-900 text-sm uppercase tracking-wide">Synthesizing ZK Circuit...</span>
                <span className="text-[11px] font-mono text-gray-500 bg-white/80 px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">{proofStep}</span>
              </div>
            ) : !committedHash ? (
              <button
                onClick={handleCommitSubmit}
                disabled={!isConfirmed}
                className={`w-full py-4.5 rounded-2xl font-extrabold text-[13px] uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 ${
                  isConfirmed
                    ? 'bg-gradient-to-r from-[#F26522] to-[#f97316] hover:shadow-orange-500/20 hover:scale-[1.01] text-white cursor-pointer border border-[#F26522]'
                    : 'bg-white/50 text-gray-400 cursor-not-allowed border border-white/60'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span>{walletConnected ? 'Lock Strategy On-Chain' : 'Connect Wallet to Lock'}</span>
              </button>
            ) : null}

            {/* Success State */}
            <AnimatePresence>
              {committedHash && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden backdrop-blur-xl shadow-lg"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full -mr-10 -mt-10" />
                  
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-extrabold text-emerald-950 tracking-tight">Strategy Secured</h4>
                      <p className="text-[10px] font-extrabold text-emerald-700/70 uppercase tracking-widest mt-0.5">Zero-Knowledge Ledger</p>
                    </div>
                  </div>

                  <div className="bg-white/70 border border-white/90 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 shadow-sm relative z-10">
                    <div className="flex-1 w-full overflow-hidden">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Commitment Hash</span>
                      <span className="text-gray-900 font-mono text-sm font-bold truncate block w-full bg-white/50 px-3 py-1.5 rounded-lg border border-gray-100">{committedHash}</span>
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="shrink-0 w-full sm:w-auto px-5 py-2.5 bg-white rounded-xl border border-gray-200 text-gray-800 font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied' : 'Copy Hash'}
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                    {onNavigateTab && (
                      <button
                        onClick={() => onNavigateTab('overview')}
                        className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[13px] tracking-wide shadow-md transition-all flex items-center justify-center gap-2 group"
                      >
                        Deploy to Market <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                    <a
                      href={networkId === 'preprod' ? 'https://explorer.1am.xyz?network=preprod' : 'https://explorer.1am.xyz?network=preview'}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-3.5 bg-white/60 hover:bg-white/90 border border-white/80 text-gray-800 rounded-xl font-bold text-[13px] tracking-wide shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      View on Explorer <ExternalLink className="w-4 h-4" />
                    </a>
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
