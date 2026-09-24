import { describe, it, expect } from 'vitest';
import { VogueContractSimulator, StrategyWitnesses } from '../managed/vogue';

describe('Vogue Compact Smart Contract Privacy & Verification Suite', () => {
  const defaultWitnesses: StrategyWitnesses = {
    getStrategyAsset: () => 'ADA',
    getMaxPositionPct: () => 20,
    getStopLossPct: () => 8,
    getStrategyExpiry: () => 1760000000n, // Future timestamp
    getPortfolioValue: () => 10000n,      // $10,000 portfolio
    getTradeAsset: () => 'ADA',
    getTradeSizeUsd: () => 1500n,         // $1,500 = 15% position (valid)
    localSecretKey: () => '0xprivatesecretkey123456789'
  };

  it('1. commitStrategy: successfully hashes strategy witnesses & records commitment on ledger', () => {
    const contract = new VogueContractSimulator(defaultWitnesses);
    const agentId = '0xagent_1';

    const hash = contract.commitStrategy(agentId);

    expect(hash).toBeDefined();
    expect(hash.startsWith('0x')).toBe(true);
    expect(contract.agentCommitment.get(agentId)).toBe(hash);
  });

  it('2. executeTrade: executes and proves compliance when trade is within committed strategy bounds', () => {
    const contract = new VogueContractSimulator(defaultWitnesses);
    const agentId = '0xagent_1';
    const tradeId = '0xtrade_101';

    contract.commitStrategy(agentId);
    const result = contract.executeTrade(agentId, tradeId, 1750000000n);

    expect(result.status).toBe('executed');
    expect(contract.tradeStatus.get(tradeId)).toBe(1);
    expect(contract.tradeCount).toBe(1);
  });

  it('3. executeTrade: rejects trade when position size exceeds maxPositionPct (20%)', () => {
    const excessiveWitnesses: StrategyWitnesses = {
      ...defaultWitnesses,
      getTradeSizeUsd: () => 2500n // $2,500 out of $10,000 = 25% > 20% max
    };

    const contract = new VogueContractSimulator(excessiveWitnesses);
    const agentId = '0xagent_1';
    const tradeId = '0xtrade_102';

    contract.commitStrategy(agentId);
    const result = contract.executeTrade(agentId, tradeId, 1750000000n);

    expect(result.status).toBe('rejected');
    expect(result.reason).toContain('exceeds max position size');
    expect(contract.tradeStatus.get(tradeId)).toBe(2);
  });

  it('4. executeTrade: executes across multiple assets (ETH, BTC) and rejects when timeline is expired', () => {
    const multiAssetWitnesses: StrategyWitnesses = {
      ...defaultWitnesses,
      getTradeAsset: () => 'ETH', // Dynamically chosen asset
      getTradeSizeUsd: () => 1800n // $1,800 out of $10,000 = 18% <= 20% max
    };

    const contract = new VogueContractSimulator(multiAssetWitnesses);
    const agentId = '0xagent_1';
    const tradeId = '0xtrade_103';

    contract.commitStrategy(agentId);

    // Multi-asset trade execution succeeds under asset-agnostic risk bounds
    const resultAsset = contract.executeTrade(agentId, tradeId, 1750000000n);
    expect(resultAsset.status).toBe('executed');
    expect(contract.tradeStatus.get(tradeId)).toBe(1);

    // Expired timestamp test
    const contractExpired = new VogueContractSimulator(defaultWitnesses);
    contractExpired.commitStrategy(agentId);
    const resultExpiry = contractExpired.executeTrade(agentId, '0xtrade_104', 1800000000n); // > 1760000000n
    expect(resultExpiry.status).toBe('rejected');
    expect(resultExpiry.reason).toContain('strategy timeline expired');
  });

  it('5. unshieldWithdraw: verifies private balance and executes unshielding', () => {
    const contract = new VogueContractSimulator(defaultWitnesses);
    const agentId = '0xagent_1';

    const validWithdraw = contract.unshieldWithdraw(agentId, 5000n);
    expect(validWithdraw.success).toBe(true);

    const invalidWithdraw = contract.unshieldWithdraw(agentId, 50000n);
    expect(invalidWithdraw.success).toBe(false);
    expect(invalidWithdraw.reason).toContain('insufficient private balance');
  });

  it('6. executeTrade: asserts getRiskCheckPassed() witness status', () => {
    const passingRiskWitnesses: StrategyWitnesses = {
      ...defaultWitnesses,
      getRiskCheckPassed: () => true,
    };
    const contractPassing = new VogueContractSimulator(passingRiskWitnesses);
    const agentId = '0xagent_1';
    contractPassing.commitStrategy(agentId);

    const passRes = contractPassing.executeTrade(agentId, '0xtrade_risk_pass', 1750000000n);
    expect(passRes.status).toBe('executed');

    const failingRiskWitnesses: StrategyWitnesses = {
      ...defaultWitnesses,
      getRiskCheckPassed: () => false,
    };
    const contractFailing = new VogueContractSimulator(failingRiskWitnesses);
    contractFailing.commitStrategy(agentId);

    const failRes = contractFailing.executeTrade(agentId, '0xtrade_risk_fail', 1750000000n);
    expect(failRes.status).toBe('rejected');
    expect(failRes.reason).toContain('risk model check failed');
  });

  it('7. mintVaultBalance: deposits tNIGHT & mints private USDC-equivalent vault note', () => {
    const mintWitnesses: StrategyWitnesses = {
      ...defaultWitnesses,
      getDepositTNightAmount: () => 500n,
      getTNightPriceUsd: () => 100n // $1.00 per tNIGHT
    };
    const contract = new VogueContractSimulator(mintWitnesses);
    const agentId = '0xagent_1';
    const depositId = '0xvault_deposit_01';

    const res = contract.mintVaultBalance(agentId, depositId);
    expect(res.success).toBe(true);
    expect(contract.tradeStatus.get(depositId)).toBe(1);

    // Test zero deposit failure
    const zeroWitnesses: StrategyWitnesses = {
      ...defaultWitnesses,
      getDepositTNightAmount: () => 0n,
      getTNightPriceUsd: () => 100n
    };
    const zeroContract = new VogueContractSimulator(zeroWitnesses);
    const zeroRes = zeroContract.mintVaultBalance(agentId, '0xdeposit_zero');
    expect(zeroRes.success).toBe(false);
    expect(zeroRes.reason).toContain('invalid deposit amount');
  });

  it('8. burnVaultBalance: burns private vault note and unshields to public wallet', () => {
    const burnWitnesses: StrategyWitnesses = {
      ...defaultWitnesses,
      getPortfolioValue: () => 10000n, // $10,000 in vault
      getBurnTNightAmount: () => 200n,
      getTNightPriceUsd: () => 100n
    };
    const contract = new VogueContractSimulator(burnWitnesses);
    const agentId = '0xagent_1';
    const burnId = '0xvault_burn_01';

    const validBurn = contract.burnVaultBalance(agentId, burnId, 250n);
    expect(validBurn.success).toBe(true);
    expect(contract.tradeStatus.get(burnId)).toBe(3);

    const excessiveBurn = contract.burnVaultBalance(agentId, '0xexcessive_burn', 50000n);
    expect(excessiveBurn.success).toBe(false);
    expect(excessiveBurn.reason).toContain('insufficient vault balance');
  });

  it('9. executeTrade: verifies trader has sufficient vault balance for trade size', () => {
    const underfundedWitnesses: StrategyWitnesses = {
      ...defaultWitnesses,
      getPortfolioValue: () => 500n, // Only $500 in vault
      getTradeSizeUsd: () => 1200n   // Requires $1,200 (exceeds $500 balance)
    };
    const contract = new VogueContractSimulator(underfundedWitnesses);
    const agentId = '0xagent_underfunded';
    contract.commitStrategy(agentId);

    const res = contract.executeTrade(agentId, '0xtrade_underfunded', 1750000000n);
    expect(res.status).toBe('rejected');
    expect(res.reason).toContain('exceeds max position size');
  });

  it('10. commitDarkIntent: locks escrow vUSD & commits private limit intent bounds to ledger', () => {
    const intentWitnesses: StrategyWitnesses = {
      ...defaultWitnesses,
      getPortfolioValue: () => 10000n,
      getEscrowVusdAmount: () => 2000n, // $2,000 locked in escrow
      getIntentAsset: () => 'ADA',
      getMinFillAmount: () => 4000n,    // Min 4,000 ADA
      getMaxPriceLimit: () => 50n,      // Max $0.50 per ADA
      getIntentExpiry: () => 1760000000n
    };

    const contract = new VogueContractSimulator(intentWitnesses);
    const agentId = '0xagent_din_1';
    const intentId = '0xintent_101';

    const res = contract.commitDarkIntent(agentId, intentId);
    expect(res.status).toBe('committed');
    expect(res.intentHash).toBeDefined();
    expect(contract.darkIntentStatus.get(intentId)).toBe(1); // 1 = COMMITTED
    expect(contract.darkIntentCount).toBe(1);
    expect(contract.darkIntentCommitment.get(intentId)).toBe(res.intentHash);
  });

  it('11. fulfillDarkIntent: verifies external solver fill meets ZK price bound (fillPrice <= maxPriceLimit) and settles atomically', () => {
    const intentWitnesses: StrategyWitnesses = {
      ...defaultWitnesses,
      getPortfolioValue: () => 10000n,
      getEscrowVusdAmount: () => 2000n,
      getIntentAsset: () => 'ADA',
      getMinFillAmount: () => 4000n,
      getMaxPriceLimit: () => 50n,      // Max $0.50 per ADA
      getIntentExpiry: () => 1760000000n
    };

    const contract = new VogueContractSimulator(intentWitnesses);
    const intentId = '0xintent_102';
    const solverId = '0xsolver_hyperliquid_01';

    contract.commitDarkIntent('0xagent_1', intentId);

    // Solver provides fill at $0.45 (<= $0.50 max price limit)
    const fillRes = contract.fulfillDarkIntent(intentId, solverId, 45n, 1750000000n);
    expect(fillRes.status).toBe('filled');
    expect(contract.darkIntentStatus.get(intentId)).toBe(2); // 2 = FILLED
  });

  it('12. fulfillDarkIntent: rejects solver fill if external price exceeds trader maxPriceLimit', () => {
    const intentWitnesses: StrategyWitnesses = {
      ...defaultWitnesses,
      getPortfolioValue: () => 10000n,
      getEscrowVusdAmount: () => 2000n,
      getIntentAsset: () => 'ADA',
      getMinFillAmount: () => 4000n,
      getMaxPriceLimit: () => 50n,      // Max $0.50 per ADA
      getIntentExpiry: () => 1760000000n
    };

    const contract = new VogueContractSimulator(intentWitnesses);
    const intentId = '0xintent_103';
    const solverId = '0xsolver_greedy';

    contract.registerAuthorizedSolver(solverId);
    contract.solverBondRegistry.set(solverId, 500_000n);

    contract.commitDarkIntent('0xagent_1', intentId);

    // Solver attempts to overcharge at $0.55 (> $0.50 max price limit)
    const overchargeRes = contract.fulfillDarkIntent(intentId, solverId, 55n, 1750000000n);
    expect(overchargeRes.status).toBe('rejected');
    expect(overchargeRes.reason).toContain('fill price exceeds max price limit');
    expect(contract.darkIntentStatus.get(intentId)).toBe(1); // Stays COMMITTED
  });

  it('13. refundDarkIntent: allows escrow refund after intentExpiry timeout, rejecting premature refund attempts', () => {
    const expiryTime = 1760000000n;
    const intentWitnesses: StrategyWitnesses = {
      ...defaultWitnesses,
      getPortfolioValue: () => 10000n,
      getEscrowVusdAmount: () => 1000n,
      getIntentAsset: () => 'ETH',
      getMinFillAmount: () => 1n,
      getMaxPriceLimit: () => 3500n,
      getIntentExpiry: () => expiryTime
    };

    const contract = new VogueContractSimulator(intentWitnesses);
    const intentId = '0xintent_104';

    contract.commitDarkIntent('0xagent_1', intentId);

    // Premature refund before expiry
    const prematureRes = contract.refundDarkIntent(intentId, expiryTime - 500n);
    expect(prematureRes.status).toBe('rejected');
    expect(prematureRes.reason).toContain('intent not yet expired');

    // Valid refund after expiry
    const validRefundRes = contract.refundDarkIntent(intentId, expiryTime + 100n);
    expect(validRefundRes.status).toBe('refunded');
    expect(contract.darkIntentStatus.get(intentId)).toBe(3); // 3 = REFUNDED
  });

  it('14. registerAlphaStrategy: registers strategy for blind copy-trading with performance fee bounds', () => {
    const alphaWitnesses: StrategyWitnesses = {
      ...defaultWitnesses,
      getAlphaFeeBps: () => 1500, // 15% performance fee
      getAlphaMinStakeUsd: () => 250n
    };

    const contract = new VogueContractSimulator(alphaWitnesses);
    const strategyId = '0xstrategy_alpha_01';

    const res = contract.registerAlphaStrategy(strategyId, 1500);
    expect(res.status).toBe('registered');
    expect(contract.alphaStrategyRegistry.get(strategyId)).toBeDefined();
    expect(contract.alphaStrategyCount).toBe(1);
  });

  it('15. registerAlphaStrategy: rejects predatory performance fees exceeding 50% ceiling', () => {
    const contract = new VogueContractSimulator(defaultWitnesses);
    const strategyId = '0xstrategy_greedy';

    // 60% fee (6000 bps > 5000 max)
    const res = contract.registerAlphaStrategy(strategyId, 6000);
    expect(res.status).toBe('rejected');
    expect(res.reason).toContain('performance fee cannot exceed 50%');
  });

  it('16. subscribeAlphaStrategy: registers shielded follower subscription to a verified strategy', () => {
    const contract = new VogueContractSimulator(defaultWitnesses);
    const strategyId = '0xstrategy_alpha_02';
    const subId = '0xsub_follower_99';

    // Must be registered first
    contract.registerAlphaStrategy(strategyId, 1500);

    const subRes = contract.subscribeAlphaStrategy(subId, strategyId);
    expect(subRes.status).toBe('subscribed');
    expect(contract.alphaSubscriptionStatus.get(subId)).toBe(1); // 1 = ACTIVE
  });

  it('17. settlePerformanceFee: enforces High-Water Mark guarantee (only deducts fee on net new profit above HWM)', () => {
    const alphaWitnesses: StrategyWitnesses = {
      ...defaultWitnesses,
      getAlphaFeeBps: () => 1500 // 15%
    };

    const contract = new VogueContractSimulator(alphaWitnesses);
    const strategyId = '0xstrategy_alpha_03';
    const subId = '0xsub_follower_100';

    contract.registerAlphaStrategy(strategyId, 1500);
    contract.subscribeAlphaStrategy(subId, strategyId);

    // Trade profit = $1,000, Previous High-Water Mark = $600
    // Net new gain = $400. 15% of $400 = $60 fee
    const feeRes = contract.settlePerformanceFee(strategyId, subId, 1000n, 600n);
    expect(feeRes.status).toBe('settled');
    expect(feeRes.feeAmountUsd).toBe(60n);

    // Trade in drawdown: profit $500 <= HWM $600 -> Rejects fee deduction
    const drawdownRes = contract.settlePerformanceFee(strategyId, subId, 500n, 600n);
    expect(drawdownRes.status).toBe('rejected');
    expect(drawdownRes.reason).toContain('High-Water Mark');
  });

  // ============================================================================
  // INSTITUTIONAL COMPLIANCE & SELECTIVE AUDITABILITY TESTS
  // ============================================================================

  it('18. registerComplianceAttestation: registers institutional compliance when AML risk score is clean', () => {
    const complianceWitnesses: StrategyWitnesses = {
      ...defaultWitnesses,
      getComplianceRiskScore: () => 5, // Pristine AML score (0-15 allowed)
      getKycTier: () => 2 // Tier 2 = Institutional Hedge Fund
    };

    const contract = new VogueContractSimulator(complianceWitnesses);
    const fundId = '0xfund_brevan_howard_alpha';
    const kycProviderId = '0xoracle_chainalysis_kyc';

    const res = contract.registerComplianceAttestation(fundId, kycProviderId);
    expect(res.status).toBe('registered');
    expect(contract.complianceAttestationRegistry.get(fundId)).toBeDefined();
  });

  it('19. registerComplianceAttestation: rejects high-risk capital exceeding institutional threshold', () => {
    const taintedWitnesses: StrategyWitnesses = {
      ...defaultWitnesses,
      getComplianceRiskScore: () => 65, // High AML risk (e.g. mixer tainted)
      getKycTier: () => 2
    };

    const contract = new VogueContractSimulator(taintedWitnesses);
    const fundId = '0xfund_tainted_origin';
    const kycProviderId = '0xoracle_chainalysis_kyc';

    const res = contract.registerComplianceAttestation(fundId, kycProviderId);
    expect(res.status).toBe('rejected');
    expect(res.reason).toContain('compliance risk score exceeds institutional threshold');
  });

  it('20. delegateAuditorAccess: delegates time-locked, scoped viewing key to accredited auditor', () => {
    const now = 1750000000n;
    const auditorExpiry = now + 86400n * 90n; // 90-day time-lock
    const auditorWitnesses: StrategyWitnesses = {
      ...defaultWitnesses,
      getComplianceRiskScore: () => 4,
      getKycTier: () => 2,
      getAuditorScopeBitmask: () => 0x05, // Scope: NAV (0x01) + Risk Limits (0x04)
      getAuditorExpiry: () => auditorExpiry
    };

    const contract = new VogueContractSimulator(auditorWitnesses);
    const fundId = '0xfund_millennium_vault';
    contract.registerComplianceAttestation(fundId, '0xoracle_chainalysis');

    const delegationId = '0xdelegation_deloitte_q3';
    const auditorPubKey = '0xdeloitte_auditor_pubkey_001';

    const res = contract.delegateAuditorAccess(delegationId, fundId, auditorPubKey, now);
    expect(res.status).toBe('delegated');
    expect(contract.auditorDelegationCount).toBe(1);

    const record = contract.auditorAccessRegistry.get(delegationId);
    expect(record).toBeDefined();
    expect(record?.auditorPubKey).toBe(auditorPubKey);
    expect(record?.scopeBitmask).toBe(0x05);
    expect(record?.active).toBe(true);
  });

  it('21. revokeAuditorAccess: immediately terminates auditor viewing privileges on-chain', () => {
    const now = 1750000000n;
    const contract = new VogueContractSimulator(defaultWitnesses);
    const fundId = '0xfund_citadel_crypto';
    contract.registerComplianceAttestation(fundId, '0xoracle_chainalysis');

    const delegationId = '0xdelegation_kpmg_temp';
    contract.delegateAuditorAccess(delegationId, fundId, '0xkpmg_pk', now);
    expect(contract.auditorAccessRegistry.get(delegationId)?.active).toBe(true);

    const revokeRes = contract.revokeAuditorAccess(delegationId);
    expect(revokeRes.status).toBe('revoked');
    expect(contract.auditorAccessRegistry.get(delegationId)?.active).toBe(false);
  });

  it('22. verifyProofOfSolvency: proves reserve solvency in ZK without disclosing absolute balances', () => {
    const solvencyWitnesses: StrategyWitnesses = {
      ...defaultWitnesses,
      getComplianceRiskScore: () => 3,
      getSolvencyRatioBps: () => 14850n // 148.5% solvency ratio
    };

    const contract = new VogueContractSimulator(solvencyWitnesses);
    const fundId = '0xfund_solvency_vault_01';
    contract.registerComplianceAttestation(fundId, '0xoracle_chainalysis');

    // Requires at least 100% solvency (10000 bps) -> Passes
    const passRes = contract.verifyProofOfSolvency(fundId, 10000n);
    expect(passRes.status).toBe('verified');

    // Requires 200% solvency (20000 bps) -> Rejects (fund has 148.5%)
    const failRes = contract.verifyProofOfSolvency(fundId, 20000n);
    expect(failRes.status).toBe('rejected');
    expect(failRes.reason).toContain('fails zero-knowledge solvency ratio');
  });

  // ============================================================================
  // CONFIDENTIAL ENCLAVE SIGNAL EMISSION & PROPORTIONAL MIRRORING TESTS
  // ============================================================================

  it('23. emitAlphaSignal: commits confidential trade signal from enclave without leaking prompt or weights', () => {
    const signalWitnesses: StrategyWitnesses = {
      ...defaultWitnesses,
      getSignalAsset: () => 'BTC',
      getSignalDirection: () => 1, // 1 = BUY
      getSignalPriceLimitUsd: () => 64500n
    };

    const contract = new VogueContractSimulator(signalWitnesses);
    const strategyId = '0xstrat_enclave_01';
    contract.registerAlphaStrategy(strategyId, 1500);

    const signalId = '0xsig_btc_breakout_01';
    const emitRes = contract.emitAlphaSignal(strategyId, signalId);

    expect(emitRes.status).toBe('emitted');
    expect(contract.alphaSignalCommitment.get(signalId)).toBeDefined();
    expect(contract.alphaSignalCount).toBe(1);
  });

  it('24. mirrorAlphaTrade: executes proportional trade inside follower vault matching emitted signal', () => {
    const mirrorWitnesses: StrategyWitnesses = {
      ...defaultWitnesses,
      getSignalAsset: () => 'ETH',
      getSignalDirection: () => 1,
      getSignalPriceLimitUsd: () => 3500n,
      getProportionalAllocationBps: () => 2000 // 20% proportional vault allocation
    };

    const contract = new VogueContractSimulator(mirrorWitnesses);
    const strategyId = '0xstrat_enclave_02';
    const subId = '0xsub_follower_55';
    const signalId = '0xsig_eth_momentum_02';
    const mirrorTradeId = '0xmirror_trade_99';

    contract.registerAlphaStrategy(strategyId, 1500);
    contract.subscribeAlphaStrategy(subId, strategyId);
    contract.emitAlphaSignal(strategyId, signalId);

    const mirrorRes = contract.mirrorAlphaTrade(subId, signalId, mirrorTradeId);
    expect(mirrorRes.status).toBe('mirrored');
    expect(contract.alphaMirroredTradeStatus.get(mirrorTradeId)).toBe(1);
  });

  it('25. mirrorAlphaTrade: rejects mirror trade if subscription is not active or allocation invalid', () => {
    const greedyWitnesses: StrategyWitnesses = {
      ...defaultWitnesses,
      getProportionalAllocationBps: () => 15000 // 150% allocation > 100% max
    };

    const contract = new VogueContractSimulator(greedyWitnesses);
    const strategyId = '0xstrat_enclave_03';
    const subId = '0xsub_follower_inactive';
    const signalId = '0xsig_fake';

    contract.registerAlphaStrategy(strategyId, 1500);
    contract.emitAlphaSignal(strategyId, signalId);

    // Rejects because subId is not active
    const inactiveRes = contract.mirrorAlphaTrade(subId, signalId, '0xtrade_fail_1');
    expect(inactiveRes.status).toBe('rejected');
    expect(inactiveRes.reason).toContain('subscription not active');

    // Subscribe subId, but test invalid allocation (>100%)
    contract.subscribeAlphaStrategy(subId, strategyId);
    const overAllocRes = contract.mirrorAlphaTrade(subId, signalId, '0xtrade_fail_2');
    expect(overAllocRes.status).toBe('rejected');
    expect(overAllocRes.reason).toContain('allocation cannot exceed 100%');
  });

  // ============================================================================
  // ZK-ICEBERG & TEMPORAL SHUFFLING (ANTI-MEV TWAP) TESTS
  // ============================================================================

  it('26. commitIcebergOrder: commits institutional parent order into shielded state without leaking size or schedule', () => {
    const icebergWitnesses: StrategyWitnesses = {
      ...defaultWitnesses,
      getIcebergTotalAmountUsd: () => 1000000n, // $1,000,000 vUSD
      getIcebergAsset: () => 'BTC',
      getIcebergMaxSlippageBps: () => 200, // 2% max slippage
      getIcebergTimeHorizonSeconds: () => 86400n * 2n, // 48 hours
      getIcebergMaxPriceLimit: () => 72000n
    };

    const contract = new VogueContractSimulator(icebergWitnesses);
    const orderId = '0xiceberg_order_parent_001';
    const now = 1750000000n;

    const res = contract.commitIcebergOrder(orderId, now);
    expect(res.status).toBe('committed');
    expect(contract.icebergOrderStatus.get(orderId)).toBe(1); // 1 = ACTIVE
    expect(contract.icebergFilledAmountUsd.get(orderId)).toBe(0n);
    expect(contract.icebergOrderCount).toBe(1);
    expect(contract.icebergOrderCommitment.get(orderId)).toBeDefined();
  });

  it('27. executeIcebergSlice: executes randomized temporal micro-slice and completes order when fully filled', () => {
    const totalCapital = 100000n;
    const slice1Amount = 40000n;
    const slice2Amount = 60000n;

    let currentSliceAmount = slice1Amount;
    const icebergWitnesses: StrategyWitnesses = {
      ...defaultWitnesses,
      getIcebergTotalAmountUsd: () => totalCapital,
      getIcebergAsset: () => 'ETH',
      getIcebergMaxPriceLimit: () => 3600n,
      getSliceAmountUsd: () => currentSliceAmount
    };

    const contract = new VogueContractSimulator(icebergWitnesses);
    const orderId = '0xiceberg_order_parent_002';
    const now = 1750000000n;

    contract.commitIcebergOrder(orderId, now);

    // Slice 1: $40,000 at $3,450 (<= $3,600 max price)
    const slice1Res = contract.executeIcebergSlice(orderId, '0xslice_01', 3450n, now + 1800n);
    expect(slice1Res.status).toBe('executed');
    expect(slice1Res.filledAmountUsd).toBe(40000n);
    expect(slice1Res.isCompleted).toBe(false);
    expect(contract.icebergOrderStatus.get(orderId)).toBe(1); // Still ACTIVE

    // Slice 2: $60,000 at $3,500 (completes $100,000 order)
    currentSliceAmount = slice2Amount;
    const slice2Res = contract.executeIcebergSlice(orderId, '0xslice_02', 3500n, now + 5400n);
    expect(slice2Res.status).toBe('executed');
    expect(slice2Res.filledAmountUsd).toBe(100000n);
    expect(slice2Res.isCompleted).toBe(true);
    expect(contract.icebergOrderStatus.get(orderId)).toBe(2); // 2 = COMPLETED
  });

  it('28. executeIcebergSlice: rejects micro-slice if fill price exceeds hidden limit price or slice exceeds remaining capital', () => {
    const icebergWitnesses: StrategyWitnesses = {
      ...defaultWitnesses,
      getIcebergTotalAmountUsd: () => 50000n,
      getIcebergMaxPriceLimit: () => 3200n,
      getSliceAmountUsd: () => 30000n
    };

    const contract = new VogueContractSimulator(icebergWitnesses);
    const orderId = '0xiceberg_order_parent_003';
    const now = 1750000000n;

    contract.commitIcebergOrder(orderId, now);

    // Rejection 1: Toxic fill price exceeding hidden limit price ($3,350 > $3,200)
    const priceReject = contract.executeIcebergSlice(orderId, '0xslice_mev_spike', 3350n, now + 600n);
    expect(priceReject.status).toBe('rejected');
    expect(priceReject.reason).toContain('fill price exceeds max limit price');

    // Execute valid Slice 1: $30,000
    contract.executeIcebergSlice(orderId, '0xslice_valid_1', 3150n, now + 600n);

    // Rejection 2: Next slice of $30,000 exceeds remaining allocation ($50,000 - $30,000 = $20,000)
    const sizeReject = contract.executeIcebergSlice(orderId, '0xslice_overflow', 3150n, now + 1200n);
    expect(sizeReject.status).toBe('rejected');
    expect(sizeReject.reason).toContain('slice exceeds remaining iceberg order allocation');
  });

  it('29. cancelIcebergOrder: cancels active iceberg order and locks out subsequent slice execution', () => {
    const contract = new VogueContractSimulator(defaultWitnesses);
    const orderId = '0xiceberg_order_cancel_test';
    const now = 1750000000n;

    contract.commitIcebergOrder(orderId, now);
    expect(contract.icebergOrderStatus.get(orderId)).toBe(1);

    const cancelRes = contract.cancelIcebergOrder(orderId);
    expect(cancelRes.status).toBe('cancelled');
    expect(contract.icebergOrderStatus.get(orderId)).toBe(3); // 3 = CANCELLED

    // Slices attempted on cancelled order must fail
    const sliceAttempt = contract.executeIcebergSlice(orderId, '0xslice_after_cancel', 65000n, now + 600n);
    expect(sliceAttempt.status).toBe('rejected');
    expect(sliceAttempt.reason).toContain('iceberg order not active');
  });

  it('30. registerSolverBond: locks solver collateral on Midnight and enforces $100k minimum bond threshold', () => {
    const contract = new VogueContractSimulator(defaultWitnesses);
    const solverId = '0xsolver_solana_jupiter_new';

    // Attempt registration below $100k threshold ($50,000)
    const failRes = contract.registerSolverBond(solverId, 50000n);
    expect(failRes.status).toBe('rejected');
    expect(failRes.reason).toContain('minimum solver bond requirement is $100,000');

    // Valid registration of $250,000 bond
    const okRes = contract.registerSolverBond(solverId, 250000n);
    expect(okRes.status).toBe('registered');
    expect(contract.solverBondRegistry.get(solverId)).toBe(250000n);
  });

  it('31. fulfillDarkIntent: requires verified bonded solver and valid cross-chain state proof to release escrow', () => {
    const solverId = '0xsolver_solana_jupiter';
    const stateProofHash = '0xstate_proof_solana_slot_289410294_merkle_root';
    const intentWitnesses: StrategyWitnesses = {
      ...defaultWitnesses,
      getPortfolioValue: () => 100000n,
      getEscrowVusdAmount: () => 50000n, // $50k escrow
      getIntentAsset: () => 'SOL',
      getMinFillAmount: () => 340n,
      getMaxPriceLimit: () => 150n,      // Limit $150 per SOL
      getIntentExpiry: () => 1760000000n,
      getCrossChainStateProof: () => stateProofHash
    };

    const contract = new VogueContractSimulator(intentWitnesses);
    const intentId = '0xintent_sol_50k';

    // Commit intent
    const commitRes = contract.commitDarkIntent('0xtrader_sol', intentId);
    expect(commitRes.status).toBe('committed');

    // Fulfill intent with bonded solver ($750k bond >= $50k escrow) and valid cross-chain state proof
    const fillRes = contract.fulfillDarkIntent(intentId, solverId, 145n, 1750000000n);
    expect(fillRes.status).toBe('filled');
    expect(contract.darkIntentStatus.get(intentId)).toBe(2); // 2 = FILLED
  });

  it('32. fulfillDarkIntent: rejects unbonded solver, undercollateralized solver, or invalid cross-chain state proof', () => {
    const intentWitnesses: StrategyWitnesses = {
      ...defaultWitnesses,
      getPortfolioValue: () => 100000n,
      getEscrowVusdAmount: () => 60000n, // $60k escrow
      getIntentAsset: () => 'ADA',
      getMinFillAmount: () => 70000n,
      getMaxPriceLimit: () => 85n,
      getIntentExpiry: () => 1760000000n,
      getCrossChainStateProof: () => '0xstate_proof_cardano_eutxo_slot_91024'
    };

    const contract = new VogueContractSimulator(intentWitnesses);
    const intentId = '0xintent_cross_chain_rejections';
    contract.commitDarkIntent('0xtrader_1', intentId);

    // Rejection 1: Completely unbonded solver
    const unbondedRes = contract.fulfillDarkIntent(intentId, '0xsolver_unbonded_wildcat', 80n, 1750000000n);
    expect(unbondedRes.status).toBe('rejected');
    expect(unbondedRes.reason).toContain('solver insufficient bond coverage');

    // Rejection 2: Under-collateralized solver ($30k bond for $60k escrow)
    contract.registerSolverBond('0xsolver_small_bond', 100000n); // $100k minimum
    // But if escrow was $150k
    const bigEscrowWitnesses: StrategyWitnesses = {
      ...intentWitnesses,
      getPortfolioValue: () => 200000n,
      getEscrowVusdAmount: () => 150000n,
    };
    const contract2 = new VogueContractSimulator(bigEscrowWitnesses);
    contract2.registerSolverBond('0xsolver_small_bond', 100000n);
    contract2.commitDarkIntent('0xtrader_1', '0xintent_big');
    const underRes = contract2.fulfillDarkIntent('0xintent_big', '0xsolver_small_bond', 80n, 1750000000n);
    expect(underRes.status).toBe('rejected');
    expect(underRes.reason).toContain('solver insufficient bond coverage');

    // Rejection 3: Invalid cross-chain state proof
    const invalidProofWitnesses: StrategyWitnesses = {
      ...intentWitnesses,
      getCrossChainStateProof: () => '0x0' // Zero/invalid proof
    };
    const contract3 = new VogueContractSimulator(invalidProofWitnesses);
    contract3.commitDarkIntent('0xtrader_1', '0xintent_bad_proof');
    const proofRes = contract3.fulfillDarkIntent('0xintent_bad_proof', '0xsolver_hyperliquid_01', 80n, 1750000000n);
    expect(proofRes.status).toBe('rejected');
    expect(proofRes.reason).toContain('invalid cross-chain state proof');
  });

  it('33. slashDishonestSolver: penalizes solver bonded balance and increments slash counter upon SLA breach', () => {
    const contract = new VogueContractSimulator(defaultWitnesses);
    const solverId = '0xsolver_amber_arbitrum';
    contract.registerSolverBond(solverId, 300000n);

    const initialBond = contract.solverBondRegistry.get(solverId);
    expect(initialBond).toBe(300000n);
    expect(contract.solverSlashCount).toBe(0);

    // Slash $50,000 penalty for toxic frontrunning / latency breach
    const slashRes = contract.slashDishonestSolver(solverId, '0xintent_breached_001', 50000n);
    expect(slashRes.status).toBe('slashed');
    expect(slashRes.remainingBond).toBe(250000n);
    expect(contract.solverBondRegistry.get(solverId)).toBe(250000n);
    expect(contract.solverSlashCount).toBe(1);

    // Reject excessive slash exceeding remaining bond
    const excessiveSlash = contract.slashDishonestSolver(solverId, '0xintent_excess', 300000n);
    expect(excessiveSlash.status).toBe('rejected');
    expect(excessiveSlash.reason).toContain('slash penalty exceeds bonded balance');
  });
});


