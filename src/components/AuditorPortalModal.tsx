import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Lock,
  Eye,
  TrendingUp,
  DollarSign,
  PieChart,
  Percent,
  Check,
  Clock,
  Building2
} from 'lucide-react';
import {
  AuditorDelegation,
  DecryptedAuditReport,
  decryptAuditorReport
} from '../lib/compliance-engine';

interface AuditorPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  delegation: AuditorDelegation | null;
}

export const AuditorPortalModal: React.FC<AuditorPortalModalProps> = ({
  isOpen,
  onClose,
  delegation,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen || !delegation) return null;

  let report: DecryptedAuditReport | null = null;
  let decryptError: string | null = null;

  try {
    report = decryptAuditorReport(delegation.viewingKeyCiphertext, delegation.delegationId);
  } catch (err: unknown) {
    decryptError = err instanceof Error ? err.message : 'Failed to decrypt audit package';
  }

  const handleExportJson = () => {
    if (!report) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Vogue_Audit_Report_${delegation.auditorId}_2026.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden my-8 space-y-6">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 blur-3xl rounded-full pointer-events-none -mr-20 -mt-20" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  Certified Institutional Audit Portal
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                  READ-ONLY
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Inspecting decrypted scoped state for <strong>{delegation.auditorName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {decryptError ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
            <h4 className="text-base font-extrabold text-red-900">Decryption Failed</h4>
            <p className="text-xs text-red-700 max-w-md mx-auto">{decryptError}</p>
          </div>
        ) : report ? (
          <div className="space-y-6 relative z-10">
            {/* Top Verification Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">
                    SANCTIONS SCREENING
                  </span>
                  <span className="text-xs font-extrabold text-emerald-950 block">
                    {report.sanctionsAttestation.ofacStatus}
                  </span>
                </div>
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3.5 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-teal-600 shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-[10px] text-teal-800 font-bold uppercase tracking-wider block">
                    PROOF OF SOLVENCY (ZK)
                  </span>
                  <span className="text-xs font-extrabold text-teal-950 block">
                    {report.solvencyAttestation.solvencyRatioPct}% Over-Collateralized
                  </span>
                </div>
              </div>
            </div>

            {/* Scope Permitted Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-gray-500 text-[11px] uppercase tracking-wider">
                Authorized Scopes:
              </span>
              {report.permissionsGranted.map((p) => (
                <span
                  key={p}
                  className="px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold text-[11px]"
                >
                  ✓ {p}
                </span>
              ))}
            </div>

            {/* 1. FINANCIALS (IF SCOPE_NAV_BALANCE GRANTED) */}
            {report.financials ? (
              <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wider">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Decrypted Balance & Net Asset Value (NAV)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">NET ASSET VALUE</span>
                    <span className="text-base font-extrabold text-gray-900">
                      ${report.financials.netAssetValueUsd.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">TOTAL COLLATERAL</span>
                    <span className="text-base font-extrabold text-teal-700">
                      ${report.financials.totalCollateralUsd.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">VAULT BALANCE</span>
                    <span className="text-base font-extrabold text-gray-900">
                      ${report.financials.vaultBalanceUsd.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">UNREALIZED GAINS</span>
                    <span className="text-base font-extrabold text-emerald-700">
                      +${report.financials.unrealizedPnlUsd.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-3 text-center text-xs text-gray-400 font-medium">
                🔒 NAV & Balances: Not authorized in this auditor's viewing key (Shielded)
              </div>
            )}

            {/* 2. HISTORICAL TRADE ACTIVITY (IF SCOPE_TRADE_LOG GRANTED) */}
            {report.tradeActivity ? (
              <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                    <span>Decrypted Execution & Order Book Log</span>
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium">
                    Avg Slippage: <strong>{report.tradeActivity.averageExecutionSlippagePct}%</strong>
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-400 font-bold text-[10px] uppercase">
                        <th className="pb-2">Asset</th>
                        <th className="pb-2">Side</th>
                        <th className="pb-2">Size</th>
                        <th className="pb-2">Fill Price</th>
                        <th className="pb-2">Timestamp</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {report.tradeActivity.recentTradesSummary.map((t, idx) => (
                        <tr key={idx} className="hover:bg-white/60">
                          <td className="py-2 font-bold text-gray-900">{t.asset}</td>
                          <td className="py-2 font-bold text-emerald-700">{t.direction}</td>
                          <td className="py-2">${t.sizeUsd.toLocaleString()}</td>
                          <td className="py-2 font-mono">${t.priceUsd.toLocaleString()}</td>
                          <td className="py-2 text-[11px] text-gray-400">{t.timestamp}</td>
                          <td className="py-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-3 text-center text-xs text-gray-400 font-medium">
                🔒 Historical Order Log: Not authorized in this auditor's viewing key (Shielded)
              </div>
            )}

            {/* 3. RISK LIMITS & MANDATE (IF SCOPE_RISK_LIMITS GRANTED) */}
            {report.riskAdherence ? (
              <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Decrypted Risk Limits & Mandate Compliance</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">LEVERAGE MANDATE</span>
                    <span className="text-xs font-extrabold text-gray-900 block pt-1">
                      {report.riskAdherence.maxLeverageEnforced}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">STOP-LOSS ADHERENCE</span>
                    <span className="text-xs font-extrabold text-emerald-700 block pt-1">
                      {report.riskAdherence.stopLossBreached ? 'Breached' : '0 Breaches'}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">RISK MODEL PASS RATE</span>
                    <span className="text-xs font-extrabold text-teal-700 block pt-1">
                      {report.riskAdherence.riskModelPassRatePct}%
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">MAX DRAWDOWN</span>
                    <span className="text-xs font-extrabold text-orange-600 block pt-1">
                      {report.riskAdherence.maxDrawdownObservedPct}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-3 text-center text-xs text-gray-400 font-medium">
                🔒 Risk Mandates & Leverage: Not authorized in this auditor's viewing key (Shielded)
              </div>
            )}

            {/* 4. TAX & REALIZED PNL (IF SCOPE_TAX_PNL GRANTED) */}
            {report.taxSummary ? (
              <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span>Decrypted Tax Lots & Realized Capital Gains (FY{report.taxSummary.fiscalYear})</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">TOTAL REALIZED PNL</span>
                    <span className="text-base font-extrabold text-emerald-700">
                      +${report.taxSummary.realizedPnlUsd.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">SHORT-TERM GAINS</span>
                    <span className="text-base font-extrabold text-gray-900">
                      ${report.taxSummary.shortTermGainsUsd.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">LONG-TERM GAINS</span>
                    <span className="text-base font-extrabold text-gray-900">
                      ${report.taxSummary.longTermGainsUsd.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">EST. TAX LIABILITY</span>
                    <span className="text-base font-extrabold text-purple-700">
                      ${report.taxSummary.estimatedTaxLiabilityUsd.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-3 text-center text-xs text-gray-400 font-medium">
                🔒 Tax & Realized PnL: Not authorized in this auditor's viewing key (Shielded)
              </div>
            )}

            {/* Audit Metadata & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-gray-100">
              <div className="text-[11px] text-gray-400 font-mono">
                Midnight Verified Block Height: #{report.verifiedBlockHeight} • Report ID: {report.reportId}
              </div>

              <button
                onClick={handleExportJson}
                className="py-2.5 px-5 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Audit Package Exported!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Export Certified Audit Package (JSON)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
