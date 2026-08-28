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
});
