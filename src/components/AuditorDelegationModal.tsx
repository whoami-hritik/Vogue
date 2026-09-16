import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Calendar,
  Key,
  Copy,
  Check,
  FileText,
  Clock
} from 'lucide-react';
import {
  ACCREDITED_AUDITORS,
  AUDIT_SCOPE,
  delegateAuditorAccessWorkflow,
  AuditorDelegation,
  AccreditedAuditor
} from '../lib/compliance-engine';

interface AuditorDelegationModalProps {
  isOpen: boolean;
  onClose: () => void;
  fundId?: string;
  walletConnected: boolean;
  onConnectWallet: () => void;
  onDelegationCreated: (delegation: AuditorDelegation) => void;
}

export const AuditorDelegationModal: React.FC<AuditorDelegationModalProps> = ({
  isOpen,
  onClose,
  fundId = '0xfund_vogue_institutional',
  walletConnected,
  onConnectWallet,
  onDelegationCreated,
}) => {
  const [selectedAuditorId, setSelectedAuditorId] = useState<string>(ACCREDITED_AUDITORS[0].id);
  const [scopeNav, setScopeNav] = useState(true);
  const [scopeTrades, setScopeTrades] = useState(false);
  const [scopeRisk, setScopeRisk] = useState(true);
  const [scopeTax, setScopeTax] = useState(true);
  const [durationDays, setDurationDays] = useState<number>(90);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdDelegation, setCreatedDelegation] = useState<AuditorDelegation | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  if (!isOpen) return null;

  const computeBitmask = (): number => {
    let mask = 0;
    if (scopeNav) mask |= AUDIT_SCOPE.NAV_BALANCE;
    if (scopeTrades) mask |= AUDIT_SCOPE.TRADE_LOG;
    if (scopeRisk) mask |= AUDIT_SCOPE.RISK_LIMITS;
    if (scopeTax) mask |= AUDIT_SCOPE.TAX_PNL;
    return mask;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!walletConnected) {
      onConnectWallet();
      return;
    }

    const bitmask = computeBitmask();
    if (bitmask <= 0) {
      setError('Please select at least one audit scope permission.');
      return;
    }

    setIsSubmitting(true);

    try {
      const delegation = await delegateAuditorAccessWorkflow({
        fundId,
        auditorId: selectedAuditorId,
        scopeBitmask: bitmask,
        durationDays,
      });

      setCreatedDelegation(delegation);
      onDelegationCreated(delegation);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delegation failed';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyKey = () => {
    if (createdDelegation) {
      navigator.clipboard.writeText(createdDelegation.viewingKeyCiphertext);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleReset = () => {
    setCreatedDelegation(null);
    setError(null);
    onClose();
  };

  const selectedAuditor = ACCREDITED_AUDITORS.find((a) => a.id === selectedAuditorId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden my-8 space-y-6">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none -mr-16 -mt-16" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                Delegate Scoped Auditor Viewing Key
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Time-locked, permission-scoped read-only access for certified auditors on Midnight
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

        {createdDelegation ? (
          <div className="py-2 space-y-6 relative z-10">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-emerald-900">
                Auditor Viewing Key Delegated on Midnight!
              </h4>
              <p className="text-xs text-emerald-700 max-w-md mx-auto">
                Authorized for <strong>{createdDelegation.auditorName}</strong> until{' '}
                <strong>{new Date(createdDelegation.expiresAt).toLocaleDateString()}</strong>.
              </p>
            </div>

            {/* Viewing Key Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block">
                Scoped Auditor Viewing Key Token
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 flex items-center justify-between gap-2 font-mono text-xs text-gray-800">
                <span className="truncate">{createdDelegation.viewingKeyCiphertext}</span>
                <button
                  onClick={handleCopyKey}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-sans font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[11px] text-gray-400">
                Provide this key to the auditor. It grants strictly read-only access to authorized fields without withdrawal or trading authority.
              </p>
            </div>

            {/* Details Table */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2 text-xs font-mono text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Delegation ID:</span>
                <span className="font-bold text-gray-900">{createdDelegation.delegationId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Granted Permissions:</span>
                <span className="font-bold text-indigo-700 font-sans">
                  {createdDelegation.scopeLabels.join(', ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Midnight Circuit TX:</span>
                <span className="font-bold text-teal-700 truncate max-w-[220px]">
                  {createdDelegation.midnightTxHash}
                </span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-3 px-6 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-2xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Auditor Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">
                Select Accredited Auditor / Regulatory Entity
              </label>
              <select
                value={selectedAuditorId}
                onChange={(e) => setSelectedAuditorId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-indigo-500 bg-white font-medium"
              >
                {ACCREDITED_AUDITORS.map((auditor) => (
                  <option key={auditor.id} value={auditor.id}>
                    {auditor.name} ({auditor.jurisdiction})
                  </option>
                ))}
              </select>
              {selectedAuditor && (
                <p className="text-[11px] text-gray-500 italic pt-0.5">
                  {selectedAuditor.description} • {selectedAuditor.verifiedCredentials}
                </p>
              )}
            </div>

            {/* Scope Permissions Multi-Check */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-700">
                  Audit Scope Permissions (Selective Disclosure)
                </label>
                <span className="text-[10px] text-indigo-600 font-bold uppercase">
                  Zero Prompt / Model Leakage
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. NAV */}
                <label className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 cursor-pointer transition-all ${
                  scopeNav ? 'bg-indigo-50/60 border-indigo-300 text-indigo-950' : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={scopeNav}
                    onChange={(e) => setScopeNav(e.target.checked)}
                    className="mt-0.5 accent-indigo-600 rounded"
                  />
                  <div>
                    <span className="font-bold block">NAV & Balances (0x01)</span>
                    <span className="text-[11px] text-gray-500 block leading-tight">
                      Net Asset Value, collateral reserves, and vault deposits.
                    </span>
                  </div>
                </label>

                {/* 2. Trade Log */}
                <label className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 cursor-pointer transition-all ${
                  scopeTrades ? 'bg-indigo-50/60 border-indigo-300 text-indigo-950' : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={scopeTrades}
                    onChange={(e) => setScopeTrades(e.target.checked)}
                    className="mt-0.5 accent-indigo-600 rounded"
                  />
                  <div>
                    <span className="font-bold block">Historical Trade Log (0x02)</span>
                    <span className="text-[11px] text-gray-500 block leading-tight">
                      Order history, fill prices, and DIN execution venues.
                    </span>
                  </div>
                </label>

                {/* 3. Risk Limits */}
                <label className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 cursor-pointer transition-all ${
                  scopeRisk ? 'bg-indigo-50/60 border-indigo-300 text-indigo-950' : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={scopeRisk}
                    onChange={(e) => setScopeRisk(e.target.checked)}
                    className="mt-0.5 accent-indigo-600 rounded"
                  />
                  <div>
                    <span className="font-bold block">Risk Limits & VaR (0x04)</span>
                    <span className="text-[11px] text-gray-500 block leading-tight">
                      Max leverage ceiling, stop-loss adherence, and drawdowns.
                    </span>
                  </div>
                </label>

                {/* 4. Tax PnL */}
                <label className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 cursor-pointer transition-all ${
                  scopeTax ? 'bg-indigo-50/60 border-indigo-300 text-indigo-950' : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={scopeTax}
                    onChange={(e) => setScopeTax(e.target.checked)}
                    className="mt-0.5 accent-indigo-600 rounded"
                  />
                  <div>
                    <span className="font-bold block">Tax & Realized PnL (0x08)</span>
                    <span className="text-[11px] text-gray-500 block leading-tight">
                      Capital gains, tax lot harvesting, and estimated liabilities.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Time-Lock Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>Time-Lock Duration (Automatic Expiry)</span>
                <span className="text-indigo-600 font-extrabold">{durationDays} Days</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[7, 30, 90, 180, 365].map((d) => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => setDurationDays(d)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      durationDays === d
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
                    }`}
                  >
                    {d}D
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-gray-400 block pt-0.5">
                Viewing key automatically expires on-chain after this period. Access can also be revoked anytime.
              </span>
            </div>

            {/* Confidentiality Alert */}
            <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-2xl p-3.5 text-xs text-indigo-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-indigo-800">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Zero-Knowledge Non-Disclosure Guarantee</span>
              </div>
              <p className="text-[11px] text-indigo-700 leading-relaxed">
                The auditor receives ONLY the fields you explicitly check above. Your AI prompts, strategy weights, and live pending intent parameters remain mathematically impossible to decrypt.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing Delegation Circuit on Midnight...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-indigo-200" />
                  <span>Sign & Delegate Scoped Viewing Key</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
