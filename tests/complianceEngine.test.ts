import { describe, it, expect, beforeEach } from 'vitest';
import {
  AUDIT_SCOPE,
  isScopeGranted,
  getScopeLabels,
  ACCREDITED_AUDITORS,
  getOrGenerateComplianceCertificate,
  generateAuditorViewingKey,
  delegateAuditorAccessWorkflow,
  revokeAuditorAccessWorkflow,
  getAllAuditorDelegations,
  getActiveAuditorDelegations,
  verifySolvencyWorkflow,
  decryptAuditorReport,
} from '../src/lib/compliance-engine';
import { setLocalVaultBalance } from '../src/lib/vault';

describe('Vogue Institutional Compliance & Selective Auditability Suite', () => {
  beforeEach(() => {
    setLocalVaultBalance(500_000);
  });

  describe('1. Audit Scope Bitmask System', () => {
    it('accurately evaluates granted permissions via bitwise AND', () => {
      const navAndTax = AUDIT_SCOPE.NAV_BALANCE | AUDIT_SCOPE.TAX_PNL; // 1 | 8 = 9

      expect(isScopeGranted(navAndTax, AUDIT_SCOPE.NAV_BALANCE)).toBe(true);
      expect(isScopeGranted(navAndTax, AUDIT_SCOPE.TAX_PNL)).toBe(true);
      expect(isScopeGranted(navAndTax, AUDIT_SCOPE.TRADE_LOG)).toBe(false);
      expect(isScopeGranted(navAndTax, AUDIT_SCOPE.RISK_LIMITS)).toBe(false);
    });

    it('generates human-readable permission labels for scope bitmasks', () => {
      const allScopes =
        AUDIT_SCOPE.NAV_BALANCE |
        AUDIT_SCOPE.TRADE_LOG |
        AUDIT_SCOPE.RISK_LIMITS |
        AUDIT_SCOPE.TAX_PNL; // 15

      const labels = getScopeLabels(allScopes);
      expect(labels).toContain('NAV & Balances');
      expect(labels).toContain('Historical Trade Log');
      expect(labels).toContain('Risk & Mandate Limits');
      expect(labels).toContain('Tax & Realized PnL');
      expect(labels.length).toBe(4);

      const navOnly = getScopeLabels(AUDIT_SCOPE.NAV_BALANCE);
      expect(navOnly).toEqual(['NAV & Balances']);
    });
  });

  describe('2. Institutional Compliance & Clean Capital Attestation', () => {
    it('generates institutional compliance certificate with pristine AML and OFAC non-inclusion', async () => {
      const cert = await getOrGenerateComplianceCertificate(
        '0xfund_test_institutional',
        'Bridgewater Alpha Vault',
        '0xwallet_test_fund'
      );

      expect(cert.fundId).toBe('0xfund_test_institutional');
      expect(cert.status).toBe('ACTIVE');
      expect(cert.kycTier).toBe(2);
      expect(cert.riskScore).toBeLessThanOrEqual(15);
      expect(cert.ofacSanctionsStatus).toBe('CLEAN_VERIFIED');

      // Verifiable cryptographic commitments
      expect(cert.chainalysisProofHash.startsWith('0xchainalysis_aml_zk_')).toBe(true);
      expect(cert.merkleNonInclusionProof.startsWith('0xofac_non_inclusion_')).toBe(true);
      expect(cert.midnightAttestationCommitment.startsWith('0xmidnight_compliance_commit_')).toBe(true);
      expect(cert.solvencyRatioBps).toBeGreaterThanOrEqual(10000); // >= 100% solvency
    });
  });

  describe('3. Accredited Institutional Auditor Directory', () => {
    it('seeds accredited Big 4 auditors and internal risk committee', () => {
      expect(ACCREDITED_AUDITORS.length).toBeGreaterThanOrEqual(4);

      const names = ACCREDITED_AUDITORS.map((a) => a.name);
      expect(names.some((n) => n.includes('Deloitte'))).toBe(true);
      expect(names.some((n) => n.includes('EY'))).toBe(true);
      expect(names.some((n) => n.includes('KPMG'))).toBe(true);
      expect(names.some((n) => n.includes('Internal Fund Risk'))).toBe(true);

      for (const auditor of ACCREDITED_AUDITORS) {
        expect(auditor.auditorPubKey.startsWith('0x')).toBe(true);
        expect(auditor.verifiedCredentials).toBeDefined();
      }
    });
  });

  describe('4. Auditor Viewing Key Delegation Workflow', () => {
    it('rejects delegation with invalid auditor or empty scope', async () => {
      await expect(
        delegateAuditorAccessWorkflow({
          fundId: '0xfund_test',
          auditorId: 'non_existent_auditor',
          scopeBitmask: AUDIT_SCOPE.NAV_BALANCE,
          durationDays: 30,
        })
      ).rejects.toThrow(/not found in directory/);

      await expect(
        delegateAuditorAccessWorkflow({
          fundId: '0xfund_test',
          auditorId: 'auditor_deloitte',
          scopeBitmask: 0, // No permissions
          durationDays: 30,
        })
      ).rejects.toThrow(/At least one audit scope permission/);

      await expect(
        delegateAuditorAccessWorkflow({
          fundId: '0xfund_test',
          auditorId: 'auditor_deloitte',
          scopeBitmask: AUDIT_SCOPE.NAV_BALANCE,
          durationDays: 0, // Invalid duration
        })
      ).rejects.toThrow(/duration must be greater than 0/);
    });

    it('successfully delegates time-locked scoped viewing access to Deloitte', async () => {
      const delegation = await delegateAuditorAccessWorkflow({
        fundId: '0xfund_test',
        auditorId: 'auditor_deloitte',
        scopeBitmask: AUDIT_SCOPE.NAV_BALANCE | AUDIT_SCOPE.RISK_LIMITS,
        durationDays: 90,
      });

      expect(delegation.active).toBe(true);
      expect(delegation.auditorId).toBe('auditor_deloitte');
      expect(delegation.scopeLabels).toContain('NAV & Balances');
      expect(delegation.scopeLabels).toContain('Risk & Mandate Limits');
      expect(delegation.viewingKeyCiphertext.startsWith('vk_midnight_vogue_')).toBe(true);
      expect(delegation.midnightTxHash).toBeDefined();

      const active = getActiveAuditorDelegations();
      expect(active.some((d) => d.delegationId === delegation.delegationId)).toBe(true);
    });
  });

  describe('5. Scoped Decryption & Zero-Knowledge Audit Reports', () => {
    it('selectively decrypts ONLY authorized fields and shields non-granted data', async () => {
      // Delegate EY for Tax PnL and NAV only (Bitmask 1 | 8 = 9)
      const eyDelegation = await delegateAuditorAccessWorkflow({
        fundId: '0xfund_test',
        auditorId: 'auditor_ey',
        scopeBitmask: AUDIT_SCOPE.NAV_BALANCE | AUDIT_SCOPE.TAX_PNL,
        durationDays: 60,
      });

      const report = decryptAuditorReport(
        eyDelegation.viewingKeyCiphertext,
        eyDelegation.delegationId
      );

      expect(report.solvencyAttestation.verified).toBe(true);
      expect(report.sanctionsAttestation.cleanOriginVerified).toBe(true);

      // SCOPE_NAV_BALANCE is granted -> Financials decrypted
      expect(report.financials).toBeDefined();
      expect(report.financials?.netAssetValueUsd).toBe(500_000);

      // SCOPE_TAX_PNL is granted -> Tax summary decrypted
      expect(report.taxSummary).toBeDefined();
      expect(report.taxSummary?.fiscalYear).toBe(2026);
      expect(report.taxSummary?.realizedPnlUsd).toBeGreaterThan(0);

      // SCOPE_TRADE_LOG was NOT granted -> Trade history completely concealed!
      expect(report.tradeActivity).toBeUndefined();

      // SCOPE_RISK_LIMITS was NOT granted -> Risk details concealed!
      expect(report.riskAdherence).toBeUndefined();
    });

    it('decrypts full audit report when all scopes are granted', async () => {
      const fullDelegation = await delegateAuditorAccessWorkflow({
        fundId: '0xfund_test',
        auditorId: 'auditor_kpmg',
        scopeBitmask: 15, // All 4 scopes
        durationDays: 30,
      });

      const report = decryptAuditorReport(
        fullDelegation.viewingKeyCiphertext,
        fullDelegation.delegationId
      );

      expect(report.financials).toBeDefined();
      expect(report.tradeActivity).toBeDefined();
      expect(report.riskAdherence).toBeDefined();
      expect(report.taxSummary).toBeDefined();
      expect(report.tradeActivity?.totalExecutedTrades).toBe(42);
    });
  });

  describe('6. Cryptographic Revocation of Auditor Privileges', () => {
    it('revokes auditor access and terminates viewing key decryption privileges', async () => {
      const delegation = await delegateAuditorAccessWorkflow({
        fundId: '0xfund_test',
        auditorId: 'auditor_internal',
        scopeBitmask: AUDIT_SCOPE.NAV_BALANCE,
        durationDays: 14,
      });

      // Valid initially
      const validReport = decryptAuditorReport(
        delegation.viewingKeyCiphertext,
        delegation.delegationId
      );
      expect(validReport).toBeDefined();

      // Revoke access
      const revoked = await revokeAuditorAccessWorkflow(delegation.delegationId);
      expect(revoked).toBe(true);

      // Subsequent decryption attempt throws Revocation Error
      expect(() =>
        decryptAuditorReport(delegation.viewingKeyCiphertext, delegation.delegationId)
      ).toThrow(/REVOKED/);
    });
  });

  describe('7. Zero-Knowledge Proof of Solvency Workflow', () => {
    it('verifies over-collateralization and rejects under-collateralized requirements', async () => {
      // 100% solvency requirement (10000 bps) -> Passes
      const pass = await verifySolvencyWorkflow('0xfund_test', 10000);
      expect(pass.verified).toBe(true);
      expect(pass.solvencyRatioBps).toBe(14850);
      expect(pass.ratioPct).toBe(148.5);

      // 200% solvency requirement (20000 bps) -> Rejects (fund has 148.5%)
      const fail = await verifySolvencyWorkflow('0xfund_test', 20000);
      expect(fail.verified).toBe(false);
    });
  });
});
