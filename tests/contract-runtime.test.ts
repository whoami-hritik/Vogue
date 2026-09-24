import { describe, it, expect } from 'vitest';
import {
  createConstructorContext,
  createCircuitContext,
  dummyContractAddress,
  type WitnessContext,
} from '@midnight-ntwrk/compact-runtime';
import {
  Contract,
  ledger,
  type Witnesses,
  type Ledger,
} from '../contracts/managed/vogue/contract/index.js';

type TestPrivateState = {
  ownerSecret: Uint8Array;
  maxPositionPct: bigint;
  stopLossPct: bigint;
  strategyExpiry: bigint;
  portfolioValue: bigint;
  tradeSizeUsd: bigint;
  riskCheckPassed: boolean;
  depositTNightAmount: bigint;
  tnightPriceUsd: bigint;
  intentAsset: Uint8Array;
  minFillAmount: bigint;
  maxPriceLimit: bigint;
  intentExpiry: bigint;
  escrowVusdAmount: bigint;
};

function createTestWitnesses(): Witnesses<TestPrivateState> {
  return {
    localSecretKey: (ctx: WitnessContext<Ledger, TestPrivateState>) => [
      ctx.privateState,
      ctx.privateState.ownerSecret,
    ],
    getMaxPositionPct: (ctx: WitnessContext<Ledger, TestPrivateState>) => [
      ctx.privateState,
      ctx.privateState.maxPositionPct,
    ],
    getStopLossPct: (ctx: WitnessContext<Ledger, TestPrivateState>) => [
      ctx.privateState,
      ctx.privateState.stopLossPct,
    ],
    getStrategyExpiry: (ctx: WitnessContext<Ledger, TestPrivateState>) => [
      ctx.privateState,
      ctx.privateState.strategyExpiry,
    ],
    getPortfolioValue: (ctx: WitnessContext<Ledger, TestPrivateState>) => [
      ctx.privateState,
      ctx.privateState.portfolioValue,
    ],
    getTradeSizeUsd: (ctx: WitnessContext<Ledger, TestPrivateState>) => [
      ctx.privateState,
      ctx.privateState.tradeSizeUsd,
    ],
    getRiskCheckPassed: (ctx: WitnessContext<Ledger, TestPrivateState>) => [
      ctx.privateState,
      ctx.privateState.riskCheckPassed,
    ],
    getDepositTNightAmount: (ctx: WitnessContext<Ledger, TestPrivateState>) => [
      ctx.privateState,
      ctx.privateState.depositTNightAmount,
    ],
    getTNightPriceUsd: (ctx: WitnessContext<Ledger, TestPrivateState>) => [
      ctx.privateState,
      ctx.privateState.tnightPriceUsd,
    ],
    getIntentAsset: (ctx: WitnessContext<Ledger, TestPrivateState>) => [
      ctx.privateState,
      ctx.privateState.intentAsset,
    ],
    getMinFillAmount: (ctx: WitnessContext<Ledger, TestPrivateState>) => [
      ctx.privateState,
      ctx.privateState.minFillAmount,
    ],
    getMaxPriceLimit: (ctx: WitnessContext<Ledger, TestPrivateState>) => [
      ctx.privateState,
      ctx.privateState.maxPriceLimit,
    ],
    getIntentExpiry: (ctx: WitnessContext<Ledger, TestPrivateState>) => [
      ctx.privateState,
      ctx.privateState.intentExpiry,
    ],
    getEscrowVusdAmount: (ctx: WitnessContext<Ledger, TestPrivateState>) => [
      ctx.privateState,
      ctx.privateState.escrowVusdAmount,
    ],
  };
}

describe('Vogue Authoritative Compact-Runtime & Ledger Verification Suite', () => {
  const initialPrivateState: TestPrivateState = {
    ownerSecret: new Uint8Array(32).fill(0xaa),
    maxPositionPct: 20n,
    stopLossPct: 8n,
    strategyExpiry: 1800000000n,
    portfolioValue: 10000n,
    tradeSizeUsd: 1500n, // 15% <= 20%
    riskCheckPassed: true,
    depositTNightAmount: 1000n,
    tnightPriceUsd: 1n,
    intentAsset: new Uint8Array(32).fill(0x01),
    minFillAmount: 100n,
    maxPriceLimit: 50000n,
    intentExpiry: 1800000000n,
    escrowVusdAmount: 2000n,
  };

  const contract = new Contract(createTestWitnesses());
  const contractAddress = dummyContractAddress();

  function initContract() {
    const coinPublicKey = { bytes: new Uint8Array(32) };
    const initCtx = (createConstructorContext as any)(initialPrivateState, coinPublicKey);
    const initRes = contract.initialState(initCtx);
    return {
      contractState: initRes.currentContractState.data,
      privateState: { ...initialPrivateState },
      zswapState: initRes.currentZswapLocalState,
    };
  }

  it('1. initialState: correctly initializes empty ledger maps and counters', () => {
    const { contractState } = initContract();
    const l = ledger(contractState);
    expect(l.tradeCount).toBe(0n);
    expect(l.darkIntentCount).toBe(0n);
    expect(l.agentCommitment.isEmpty()).toBe(true);
    expect(l.strategyOwner.isEmpty()).toBe(true);
    expect(l.tradeStatus.isEmpty()).toBe(true);
    expect(l.tradeNullifiers.isEmpty()).toBe(true);
  });

  it('2. commitStrategy: cryptographically commits strategy and binds strategyOwner', () => {
    const state = initContract();
    const agentId = new Uint8Array(32).fill(1);

    const ctx = createCircuitContext(
      contractAddress,
      state.zswapState,
      state.contractState,
      state.privateState
    );

    const res = contract.impureCircuits.commitStrategy(ctx, agentId);
    const l = ledger(res.context.currentQueryContext.state);

    expect(l.agentCommitment.member(agentId)).toBe(true);
    expect(l.strategyOwner.member(agentId)).toBe(true);
    expect(l.agentCommitment.lookup(agentId)).toHaveLength(32);
    expect(l.strategyOwner.lookup(agentId)).toHaveLength(32);
  });

  it('3. executeTrade: successfully executes valid trade within committed strategy bounds', () => {
    const state = initContract();
    const agentId = new Uint8Array(32).fill(1);
    const tradeId = new Uint8Array(32).fill(2);
    const currentTime = 1750000000n;

    // Commit strategy first
    const commitCtx = createCircuitContext(
      contractAddress,
      state.zswapState,
      state.contractState,
      state.privateState
    );
    const commitRes = contract.impureCircuits.commitStrategy(commitCtx, agentId);

    // Execute trade
    const tradeCtx = createCircuitContext(
      contractAddress,
      commitRes.context.currentZswapLocalState,
      commitRes.context.currentQueryContext.state,
      commitRes.context.currentPrivateState
    );
    const tradeRes = contract.impureCircuits.executeTrade(tradeCtx, agentId, tradeId, currentTime);
    const l = ledger(tradeRes.context.currentQueryContext.state);

    expect(l.tradeStatus.member(tradeId)).toBe(true);
    expect(l.tradeStatus.lookup(tradeId)).toBe(1n); // 1 = executed
    expect(l.tradeCount).toBe(1n);
  });

  it('4. executeTrade: enforces cryptographic caller authorization (rejects unauthorized secret key)', () => {
    const state = initContract();
    const agentId = new Uint8Array(32).fill(1);
    const tradeId = new Uint8Array(32).fill(2);

    const commitCtx = createCircuitContext(
      contractAddress,
      state.zswapState,
      state.contractState,
      state.privateState
    );
    const commitRes = contract.impureCircuits.commitStrategy(commitCtx, agentId);

    // Tamper with ownerSecret in privateState (unauthorized caller)
    const unauthorizedPrivateState: TestPrivateState = {
      ...commitRes.context.currentPrivateState,
      ownerSecret: new Uint8Array(32).fill(0xbb), // Wrong key
    };

    const tradeCtx = createCircuitContext(
      contractAddress,
      commitRes.context.currentZswapLocalState,
      commitRes.context.currentQueryContext.state,
      unauthorizedPrivateState
    );

    expect(() => {
      contract.impureCircuits.executeTrade(tradeCtx, agentId, tradeId, 1750000000n);
    }).toThrow(/unauthorized caller for strategy/);
  });

  it('5. executeTrade: enforces replay protection and consumes trade nullifier', () => {
    const state = initContract();
    const agentId = new Uint8Array(32).fill(1);
    const tradeId = new Uint8Array(32).fill(2);

    const commitCtx = createCircuitContext(
      contractAddress,
      state.zswapState,
      state.contractState,
      state.privateState
    );
    const commitRes = contract.impureCircuits.commitStrategy(commitCtx, agentId);

    const tradeCtx1 = createCircuitContext(
      contractAddress,
      commitRes.context.currentZswapLocalState,
      commitRes.context.currentQueryContext.state,
      commitRes.context.currentPrivateState
    );
    const tradeRes1 = contract.impureCircuits.executeTrade(tradeCtx1, agentId, tradeId, 1750000000n);

    // Attempt to execute duplicate trade with same tradeId
    const tradeCtx2 = createCircuitContext(
      contractAddress,
      tradeRes1.context.currentZswapLocalState,
      tradeRes1.context.currentQueryContext.state,
      tradeRes1.context.currentPrivateState
    );

    expect(() => {
      contract.impureCircuits.executeTrade(tradeCtx2, agentId, tradeId, 1750000000n);
    }).toThrow(/trade already executed/);
  });

  it('6. executeTrade: rejects trade exceeding committed maxPositionPct (20%)', () => {
    const state = initContract();
    const agentId = new Uint8Array(32).fill(1);
    const tradeId = new Uint8Array(32).fill(3);

    const commitCtx = createCircuitContext(
      contractAddress,
      state.zswapState,
      state.contractState,
      state.privateState
    );
    const commitRes = contract.impureCircuits.commitStrategy(commitCtx, agentId);

    // Trade size 2500n out of 10000n = 25% > 20%
    const oversizedPrivateState: TestPrivateState = {
      ...commitRes.context.currentPrivateState,
      tradeSizeUsd: 2500n,
    };

    const tradeCtx = createCircuitContext(
      contractAddress,
      commitRes.context.currentZswapLocalState,
      commitRes.context.currentQueryContext.state,
      oversizedPrivateState
    );

    expect(() => {
      contract.impureCircuits.executeTrade(tradeCtx, agentId, tradeId, 1750000000n);
    }).toThrow(/exceeds max position size/);
  });

  it('7. executeTrade: rejects trade when strategy timeline is expired', () => {
    const state = initContract();
    const agentId = new Uint8Array(32).fill(1);
    const tradeId = new Uint8Array(32).fill(4);

    const commitCtx = createCircuitContext(
      contractAddress,
      state.zswapState,
      state.contractState,
      state.privateState
    );
    const commitRes = contract.impureCircuits.commitStrategy(commitCtx, agentId);

    const expiredTime = 1850000000n; // > strategyExpiry (1800000000n)
    const tradeCtx = createCircuitContext(
      contractAddress,
      commitRes.context.currentZswapLocalState,
      commitRes.context.currentQueryContext.state,
      commitRes.context.currentPrivateState
    );

    expect(() => {
      contract.impureCircuits.executeTrade(tradeCtx, agentId, tradeId, expiredTime);
    }).toThrow(/strategy timeline expired/);
  });

  it('8. mintVaultBalance: deposits tNIGHT and records note with replay check', () => {
    const state = initContract();
    const agentId = new Uint8Array(32).fill(1);
    const depositId = new Uint8Array(32).fill(5);

    const ctx1 = createCircuitContext(
      contractAddress,
      state.zswapState,
      state.contractState,
      state.privateState
    );
    const res1 = contract.impureCircuits.mintVaultBalance(ctx1, agentId, depositId);
    const l = ledger(res1.context.currentQueryContext.state);
    expect(l.tradeStatus.lookup(depositId)).toBe(1n);

    // Duplicate deposit must be rejected
    const ctx2 = createCircuitContext(
      contractAddress,
      res1.context.currentZswapLocalState,
      res1.context.currentQueryContext.state,
      res1.context.currentPrivateState
    );
    expect(() => {
      contract.impureCircuits.mintVaultBalance(ctx2, agentId, depositId);
    }).toThrow(/deposit already processed/);
  });

  it('9. burnVaultBalance: burns balance note and enforces available balance check', () => {
    const state = initContract();
    const agentId = new Uint8Array(32).fill(1);
    const burnId = new Uint8Array(32).fill(6);

    const ctx = createCircuitContext(
      contractAddress,
      state.zswapState,
      state.contractState,
      state.privateState
    );

    // Valid burn: 5000 <= 10000 portfolioValue
    const res = contract.impureCircuits.burnVaultBalance(ctx, agentId, burnId, 5000n);
    const l = ledger(res.context.currentQueryContext.state);
    expect(l.tradeStatus.lookup(burnId)).toBe(3n); // 3 = withdrawn

    // Excess burn: 20000 > 10000 -> throws
    const excessBurnId = new Uint8Array(32).fill(7);
    const ctxExcess = createCircuitContext(
      contractAddress,
      res.context.currentZswapLocalState,
      res.context.currentQueryContext.state,
      res.context.currentPrivateState
    );
    expect(() => {
      contract.impureCircuits.burnVaultBalance(ctxExcess, agentId, excessBurnId, 20000n);
    }).toThrow(/insufficient vault balance/);
  });

  it('10. Dark Intent Lifecycle: commit, authorized solver fulfill, and price protection', () => {
    const state = initContract();
    const agentId = new Uint8Array(32).fill(1);
    const intentId = new Uint8Array(32).fill(8);
    const solverId = new Uint8Array(32).fill(9);

    // 10a. Register authorized solver
    const regCtx = createCircuitContext(
      contractAddress,
      state.zswapState,
      state.contractState,
      state.privateState
    );
    const regRes = contract.impureCircuits.registerAuthorizedSolver(regCtx, solverId);
    let l = ledger(regRes.context.currentQueryContext.state);
    expect(l.authorizedSolvers.lookup(solverId)).toBe(true);

    // 10b. Commit dark intent
    const commitCtx = createCircuitContext(
      contractAddress,
      regRes.context.currentZswapLocalState,
      regRes.context.currentQueryContext.state,
      regRes.context.currentPrivateState
    );
    const commitRes = contract.impureCircuits.commitDarkIntent(commitCtx, agentId, intentId);
    l = ledger(commitRes.context.currentQueryContext.state);
    expect(l.darkIntentStatus.lookup(intentId)).toBe(1n); // 1 = committed
    expect(l.darkIntentCount).toBe(1n);

    // 10c. Reject fulfill with unauthorized solver
    const unauthorizedSolver = new Uint8Array(32).fill(0xee);
    const fulfillUnauthorizedCtx = createCircuitContext(
      contractAddress,
      commitRes.context.currentZswapLocalState,
      commitRes.context.currentQueryContext.state,
      commitRes.context.currentPrivateState
    );
    expect(() => {
      contract.impureCircuits.fulfillDarkIntent(
        fulfillUnauthorizedCtx,
        intentId,
        unauthorizedSolver,
        48000n,
        1750000000n
      );
    }).toThrow(/unauthorized solver/);

    // 10d. Reject fulfill exceeding maxPriceLimit (50000n)
    const fulfillExcessCtx = createCircuitContext(
      contractAddress,
      commitRes.context.currentZswapLocalState,
      commitRes.context.currentQueryContext.state,
      commitRes.context.currentPrivateState
    );
    expect(() => {
      contract.impureCircuits.fulfillDarkIntent(
        fulfillExcessCtx,
        intentId,
        solverId,
        55000n, // > 50000n
        1750000000n
      );
    }).toThrow(/fill price exceeds max price limit/);

    // 10e. Valid fulfill within limit (48000n <= 50000n)
    const validFulfillCtx = createCircuitContext(
      contractAddress,
      commitRes.context.currentZswapLocalState,
      commitRes.context.currentQueryContext.state,
      commitRes.context.currentPrivateState
    );
    const fulfillRes = contract.impureCircuits.fulfillDarkIntent(
      validFulfillCtx,
      intentId,
      solverId,
      48000n,
      1750000000n
    );
    l = ledger(fulfillRes.context.currentQueryContext.state);
    expect(l.darkIntentStatus.lookup(intentId)).toBe(2n); // 2 = filled
  });

  it('11. Dark Intent Refund: rejects premature refund and succeeds after expiry', () => {
    const state = initContract();
    const agentId = new Uint8Array(32).fill(1);
    const intentId = new Uint8Array(32).fill(10);

    const commitCtx = createCircuitContext(
      contractAddress,
      state.zswapState,
      state.contractState,
      state.privateState
    );
    const commitRes = contract.impureCircuits.commitDarkIntent(commitCtx, agentId, intentId);

    // 11a. Premature refund before intentExpiry (1800000000n) -> throws
    const prematureCtx = createCircuitContext(
      contractAddress,
      commitRes.context.currentZswapLocalState,
      commitRes.context.currentQueryContext.state,
      commitRes.context.currentPrivateState
    );
    expect(() => {
      contract.impureCircuits.refundDarkIntent(prematureCtx, intentId, 1750000000n);
    }).toThrow(/intent not yet expired/);

    // 11b. Valid refund after expiry -> succeeds
    const expiredCtx = createCircuitContext(
      contractAddress,
      commitRes.context.currentZswapLocalState,
      commitRes.context.currentQueryContext.state,
      commitRes.context.currentPrivateState
    );
    const refundRes = contract.impureCircuits.refundDarkIntent(expiredCtx, intentId, 1850000000n);
    const l = ledger(refundRes.context.currentQueryContext.state);
    expect(l.darkIntentStatus.lookup(intentId)).toBe(3n); // 3 = refunded
  });
});
