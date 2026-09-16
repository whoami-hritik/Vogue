import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Key,
  Eye,
  FileText,
  RotateCcw,
  PlusCircle,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
  Lock,
  Download
} from 'lucide-react';
import {
  InstitutionalComplianceCertificate,
  AuditorDelegation,
  ACCREDITED_AUDITORS,
  AUDIT_SCOPE,
  getOrGenerateComplianceCertificate,
  getAllAuditorDelegations,
  revokeAuditorAccessWorkflow,
  verifySolvencyWorkflow
} from '../lib/compliance-engine';
import { AuditorDelegationModal } from './AuditorDelegationModal';
import { AuditorPortalModal } from './AuditorPortalModal';

interface InstitutionalComplianceProps {
  walletConnected: boolean;
  walletAddress: string | null;
  vaultBalance: number;
  onConnectWallet: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const InstitutionalCompliance: React.FC<InstitutionalComplianceProps> = ({
  walletConnected,
  walletAddress,
  vaultBalance,
  onConnectWallet,
  onNavigateTab,
}) => {
  const [cert, setCert] = useState<InstitutionalComplianceCertificate | null>(null);
  const [delegations, setDelegations] = useState<AuditorDelegation[]>([]);
  const [isDelegationModalOpen, setIsDelegationModalOpen] = useState(false);
  const [selectedInspectDelegation, setSelectedInspectDelegation] = useState<AuditorDelegation | null>(null);
  const [isVerifyingSolvency, setIsVerifyingSolvency] = useState(false);
  const [solvencyNotice, setSolvencyNotice] = useState<string | null>(null);
  const [showProofDetails, setShowProofDetails] = useState(false);

  const loadData = async () => {
    try {
      const activeCert = await getOrGenerateComplianceCertificate(
        '0xfund_vogue_institutional',
        'Axiom Quantitative Capital Ltd.',
        walletAddress || '0xmidnight_fund_master_01'
      );
      setCert(activeCert);
      setDelegations(getAllAuditorDelegations());
    } catch (err) {
      console.warn('Error loading compliance data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [walletAddress]);

  const handleRevoke = async (delegationId: string) => {
    try {
      await revokeAuditorAccessWorkflow(delegationId);
      loadData();
    } catch (err) {
      console.warn('Revoke error:', err);
    }
  };

  const handleVerifySolvency = async () => {
    setIsVerifyingSolvency(true);
    setSolvencyNotice(null);
    try {
      const res = await verifySolvencyWorkflow('0xfund_vogue_institutional', 10000);
      if (res.verified) {
        setSolvencyNotice(
          `Solvency Verified: Vault reserves over-collateralized at ${res.ratioPct}% of total LP obligations (Proven in ZK).`
        );
      } else {
        setSolvencyNotice('Solvency check failed: Required ratio not met.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Solvency check error';
      setSolvencyNotice(msg);
    } finally {
      setIsVerifyingSolvency(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans pb-16">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-200/80">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-900 text-xs font-bold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
            <span>Verifiable Selective Auditability Layer (Midnight ZK)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Institutional Compliance & Audit Portal
          </h1>
          <p className="text-sm text-gray-600 font-medium max-w-2xl leading-relaxed">
            Eliminating the Institutional Compliance Catch-22: Enable certified Big 4 auditing,
            OFAC sanctions compliance, and proof of solvency without leaking quantitative trading strategies.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleVerifySolvency}
            disabled={isVerifyingSolvency}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-teal-600 ${isVerifyingSolvency ? 'animate-spin' : ''}`} />
            <span>{isVerifyingSolvency ? 'Proving Solvency...' : 'Re-Verify Solvency'}</span>
          </button>

          <button
            onClick={() => setIsDelegationModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-indigo-200" />
            <span>Delegate Auditor Access</span>
          </button>
        </div>
      </div>

      {/* Solvency Notice Alert */}
      {solvencyNotice && (
        <div className="bg-teal-50 border border-teal-200 text-teal-900 text-xs p-4 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 font-semibold">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
            <span>{solvencyNotice}</span>
          </div>
          <button
            onClick={() => setSolvencyNotice(null)}
            className="text-teal-700 hover:text-teal-900 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Status Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. KYC / Qualification Tier */}
        <div className="light-glass border border-white/80 rounded-3xl p-5 space-y-2 shadow-xs">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
            QUALIFICATION TIER
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-gray-900">Tier 2 Institutional</span>
          </div>
          <span className="text-[10px] text-indigo-700 font-bold block">
            ↑ Qualified Purchaser Certified
          </span>
        </div>

        {/* 2. Sanctions Screening */}
        <div className="light-glass border border-white/80 rounded-3xl p-5 space-y-2 shadow-xs">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
            SANCTIONS (OFAC / FATF)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-emerald-700">Clean Verified</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold block">
            ↑ 0% Sanctions Exposure (ZK-AML)
          </span>
        </div>

        {/* 3. Proof of Solvency */}
        <div className="light-glass border border-white/80 rounded-3xl p-5 space-y-2 shadow-xs">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
            PROOF OF SOLVENCY (ZK)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-teal-700">148.5% Solvency</span>
          </div>
          <span className="text-[10px] text-teal-700 font-bold block">
            ↑ Over-Collateralized Reserves
          </span>
        </div>

        {/* 4. Active Delegations */}
        <div className="light-glass border border-white/80 rounded-3xl p-5 space-y-2 shadow-xs">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
            AUDITOR DELEGATIONS
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-gray-900">{delegations.filter(d => d.active).length} Active</span>
          </div>
          <span className="text-[10px] text-gray-500 font-bold block">
            ↑ Scoped Viewing Keys Active
          </span>
        </div>
      </div>

      {/* Proof Details Accordion */}
      {cert && (
        <div className="bg-white/70 border border-gray-200/80 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Active Institutional Compliance Certificate (#{cert.verifiedBlockHeight})
                </h3>
                <span className="text-[11px] text-gray-500 font-mono">
                  Certificate ID: {cert.certificateId}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowProofDetails(!showProofDetails)}
              className="px-3 py-1 rounded-xl text-xs font-bold text-indigo-700 hover:bg-indigo-50 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>{showProofDetails ? 'Hide ZK Proofs' : 'Inspect ZK Proofs'}</span>
              {showProofDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showProofDetails && (
            <div className="pt-3 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs text-gray-700">
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200/80 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold block uppercase">
                  CHAINALYSIS AML PROOF HASH
                </span>
                <span className="font-bold text-indigo-700 truncate block">
                  {cert.chainalysisProofHash}
                </span>
              </div>

              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200/80 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold block uppercase">
                  OFAC NON-INCLUSION PROOF
                </span>
                <span className="font-bold text-teal-700 truncate block">
                  {cert.merkleNonInclusionProof}
                </span>
              </div>

              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200/80 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold block uppercase">
                  MIDNIGHT ATTESTATION COMMITMENT
                </span>
                <span className="font-bold text-orange-600 truncate block">
                  {cert.midnightAttestationCommitment}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delegated Auditor Viewing Keys Management Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-gray-900 tracking-tight">
              Delegated Auditor Viewing Keys
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Time-locked viewing key authorizations registered in the Midnight contract
            </p>
          </div>
          <button
            onClick={() => setIsDelegationModalOpen(true)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            + Grant New Access
          </button>
        </div>

        {delegations.length === 0 ? (
          <div className="light-glass border border-white/80 rounded-3xl p-10 text-center space-y-3 max-w-md mx-auto">
            <Building2 className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="text-base font-bold text-gray-900">No Auditor Delegations Active</h3>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              You have not delegated any viewing keys. Certified auditors cannot inspect your books until you grant scoped, time-locked viewing privileges.
            </p>
            <button
              onClick={() => setIsDelegationModalOpen(true)}
              className="py-2.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              Delegate Auditor Access
            </button>
          </div>
        ) : (
          <div className="light-glass border border-white/80 rounded-3xl p-4 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-gray-200/80 text-gray-400 font-bold text-[10px] uppercase">
                    <th className="pb-3 pl-2">Auditor / Entity</th>
                    <th className="pb-3">Granted Scopes</th>
                    <th className="pb-3">Expires On</th>
                    <th className="pb-3">Audit Reads</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {delegations.map((d) => (
                    <tr key={d.delegationId} className="hover:bg-white/60 transition-colors">
                      <td className="py-3.5 pl-2">
                        <div className="font-bold text-gray-900">{d.auditorName}</div>
                        <span className="font-mono text-[10px] text-gray-400">
                          {d.delegationId.substring(0, 18)}...
                        </span>
                      </td>

                      <td className="py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {d.scopeLabels.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 border border-indigo-200 text-indigo-800"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 font-medium text-gray-600">
                        {new Date(d.expiresAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 font-mono text-gray-800 font-bold">
                        {d.accessCount} reads
                      </td>

                      <td className="py-3.5">
                        {d.active ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-200">
                            REVOKED
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 text-right pr-2 space-x-2">
                        {d.active && (
                          <>
                            <button
                              onClick={() => setSelectedInspectDelegation(d)}
                              className="px-3 py-1 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs shadow-xs transition-colors cursor-pointer"
                            >
                              Inspect Report
                            </button>
                            <button
                              onClick={() => handleRevoke(d.delegationId)}
                              className="px-3 py-1 rounded-xl bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-700 hover:text-red-700 font-bold text-xs transition-colors cursor-pointer"
                            >
                              Revoke
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Accredited Institutional Auditor Directory Grid */}
      <div className="space-y-4 pt-4">
        <div>
          <h2 className="text-base font-extrabold text-gray-900 tracking-tight">
            Accredited Auditor Directory
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Pre-cleared accounting and regulatory assurance firms equipped with Midnight ZK verification tooling
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ACCREDITED_AUDITORS.map((auditor) => (
            <div
              key={auditor.id}
              className="light-glass border border-white/80 hover:border-indigo-300 rounded-3xl p-5 space-y-3 shadow-xs transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900">{auditor.name}</h3>
                    <span className="text-[11px] text-gray-500 font-medium">{auditor.jurisdiction}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gray-100 text-gray-700 border border-gray-200">
                    {auditor.category.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  {auditor.description}
                </p>
                <div className="text-[11px] font-mono text-gray-400 truncate">
                  Key: {auditor.auditorPubKey}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-700">
                  {auditor.verifiedCredentials}
                </span>
                <button
                  onClick={() => setIsDelegationModalOpen(true)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Delegate Access →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AuditorDelegationModal
        isOpen={isDelegationModalOpen}
        onClose={() => setIsDelegationModalOpen(false)}
        fundId={cert?.fundId}
        walletConnected={walletConnected}
        onConnectWallet={onConnectWallet}
        onDelegationCreated={() => loadData()}
      />

      <AuditorPortalModal
        isOpen={!!selectedInspectDelegation}
        onClose={() => setSelectedInspectDelegation(null)}
        delegation={selectedInspectDelegation}
      />
    </div>
  );
};
