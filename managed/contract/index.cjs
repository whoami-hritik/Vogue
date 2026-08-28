'use strict';
const __compactRuntime = require('@midnight-ntwrk/compact-runtime');
const expectedRuntimeVersionString = '0.16.0';
const expectedRuntimeVersion = expectedRuntimeVersionString.split('-')[0].split('.').map(Number);
const actualRuntimeVersion = __compactRuntime.versionString.split('-')[0].split('.').map(Number);
if (expectedRuntimeVersion[0] != actualRuntimeVersion[0]
     || (actualRuntimeVersion[0] == 0 && expectedRuntimeVersion[1] != actualRuntimeVersion[1])
     || expectedRuntimeVersion[1] > actualRuntimeVersion[1]
     || (expectedRuntimeVersion[1] == actualRuntimeVersion[1] && expectedRuntimeVersion[2] > actualRuntimeVersion[2]))
   throw new __compactRuntime.CompactError(`Version mismatch: compiled code expects ${expectedRuntimeVersionString}, runtime is ${__compactRuntime.versionString}`);
{ const MAX_FIELD = 52435875175126190479447740508185965837690552500527637822603658699938581184512n;
  if (__compactRuntime.MAX_FIELD !== MAX_FIELD)
     throw new __compactRuntime.CompactError(`compiler thinks maximum field value is ${MAX_FIELD}; run time thinks it is ${__compactRuntime.MAX_FIELD}`)
}

const _descriptor_0 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_1 = new __compactRuntime.CompactTypeUnsignedInteger(4294967295n, 4);

const _descriptor_2 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_3 = __compactRuntime.CompactTypeBoolean;

class _ContractAddress_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.bytes);
  }
}

const _descriptor_4 = new _ContractAddress_0();

const _descriptor_5 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

const _descriptor_6 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      commitStrategy: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`commitStrategy: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const agentId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('commitStrategy',
                                      'argument 1 (as invoked from Typescript)',
                                      'vogue.compact line 13 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(agentId_0.buffer instanceof ArrayBuffer && agentId_0.BYTES_PER_ELEMENT === 1 && agentId_0.length === 32)) {
          __compactRuntime.type_error('commitStrategy',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'vogue.compact line 13 char 1',
                                      'Bytes<32>',
                                      agentId_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(agentId_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._commitStrategy_0(context,
                                                partialProofData,
                                                agentId_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      executeTrade: (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`executeTrade: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const agentId_0 = args_1[1];
        const tradeId_0 = args_1[2];
        const currentTime_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('executeTrade',
                                      'argument 1 (as invoked from Typescript)',
                                      'vogue.compact line 17 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(agentId_0.buffer instanceof ArrayBuffer && agentId_0.BYTES_PER_ELEMENT === 1 && agentId_0.length === 32)) {
          __compactRuntime.type_error('executeTrade',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'vogue.compact line 17 char 1',
                                      'Bytes<32>',
                                      agentId_0)
        }
        if (!(tradeId_0.buffer instanceof ArrayBuffer && tradeId_0.BYTES_PER_ELEMENT === 1 && tradeId_0.length === 32)) {
          __compactRuntime.type_error('executeTrade',
                                      'argument 2 (argument 3 as invoked from Typescript)',
                                      'vogue.compact line 17 char 1',
                                      'Bytes<32>',
                                      tradeId_0)
        }
        if (!(typeof(currentTime_0) === 'bigint' && currentTime_0 >= 0n && currentTime_0 <= 4294967295n)) {
          __compactRuntime.type_error('executeTrade',
                                      'argument 3 (argument 4 as invoked from Typescript)',
                                      'vogue.compact line 17 char 1',
                                      'Uint<0..4294967295>',
                                      currentTime_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(agentId_0).concat(_descriptor_0.toValue(tradeId_0).concat(_descriptor_1.toValue(currentTime_0))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._executeTrade_0(context,
                                              partialProofData,
                                              agentId_0,
                                              tradeId_0,
                                              currentTime_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      mintVaultBalance(context, ...args_1) {
        return { result: pureCircuits.mintVaultBalance(...args_1), context };
      },
      burnVaultBalance(context, ...args_1) {
        return { result: pureCircuits.burnVaultBalance(...args_1), context };
      },
      unshieldWithdraw(context, ...args_1) {
        return { result: pureCircuits.unshieldWithdraw(...args_1), context };
      }
    };
    this.impureCircuits = {
      commitStrategy: this.circuits.commitStrategy,
      executeTrade: this.circuits.executeTrade
    };
  }
  initialState(...args_0) {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    const initialAgent_0 = args_0[1];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!(initialAgent_0.buffer instanceof ArrayBuffer && initialAgent_0.BYTES_PER_ELEMENT === 1 && initialAgent_0.length === 32)) {
      __compactRuntime.type_error('Contract state constructor',
                                  'argument 1 (argument 2 as invoked from Typescript)',
                                  'vogue.compact line 8 char 1',
                                  'Bytes<32>',
                                  initialAgent_0)
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('commitStrategy', new __compactRuntime.ContractOperation());
    state_0.setOperation('executeTrade', new __compactRuntime.ContractOperation());
    const context = __compactRuntime.createCircuitContext(__compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(0n),
                                                                            alignment: _descriptor_5.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array(32)),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(1n),
                                                                            alignment: _descriptor_5.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                            alignment: _descriptor_1.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(0n),
                                                                            alignment: _descriptor_5.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(initialAgent_0),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    const tmp_0 = 0n;
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(1n),
                                                                            alignment: _descriptor_5.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(tmp_0),
                                                                            alignment: _descriptor_1.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    state_0.data = new __compactRuntime.ChargedState(context.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _commitStrategy_0(context, partialProofData, agentId_0) {
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(0n),
                                                                            alignment: _descriptor_5.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(agentId_0),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    return [];
  }
  _executeTrade_0(context, partialProofData, agentId_0, tradeId_0, currentTime_0)
  {
    const tmp_0 = ((t1) => {
                    if (t1 > 4294967295n) {
                      throw new __compactRuntime.CompactError('vogue.compact line 18 char 17: cast from unsigned value to smaller unsigned value failed: ' + t1 + ' is greater than 4294967295');
                    }
                    return t1;
                  })(_descriptor_1.fromValue(Contract._query(context,
                                                             partialProofData,
                                                             [
                                                              { dup: { n: 0 } },
                                                              { idx: { cached: false,
                                                                       pushPath: false,
                                                                       path: [
                                                                              { tag: 'value',
                                                                                value: { value: _descriptor_5.toValue(1n),
                                                                                         alignment: _descriptor_5.alignment() } }] } },
                                                              { popeq: { cached: false,
                                                                         result: undefined } }]).value)
                     +
                     1n);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(1n),
                                                                            alignment: _descriptor_5.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(tmp_0),
                                                                            alignment: _descriptor_1.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    return [];
  }
  _mintVaultBalance_0(agentId_0, depositId_0) { return []; }
  _burnVaultBalance_0(agentId_0, burnId_0, withdrawUsdcAmount_0) { return []; }
  _unshieldWithdraw_0(agentId_0, amountUsd_0) { return []; }
  static _query(context, partialProofData, prog) {
    var res;
    try {
      res = context.currentQueryContext.query(prog, __compactRuntime.CostModel.dummyCostModel());
    } catch (err) {
      throw new __compactRuntime.CompactError(err.toString());
    }
    context.currentQueryContext = res.context;
    var reads = res.events.filter((e) => e.tag === 'read');
    var i = 0;
    partialProofData.publicTranscript = partialProofData.publicTranscript.concat(prog.map((op) => {
      if(typeof(op) === 'object' && 'popeq' in op) {
        return { popeq: {
          ...op.popeq,
          result: reads[i++].content,
        } };
      } else {
        return op;
      }
    }));
    if(res.events.length == 1 && res.events[0].tag === 'read') {
      return res.events[0].content;
    } else {
      return res.events;
    }
  }
}
function ledger(state) {
  const context = {
    originalState: state,
    transactionContext: new __compactRuntime.QueryContext(state, __compactRuntime.dummyContractAddress())
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    get agentCommitment() {
      return _descriptor_0.fromValue(Contract._query(context,
                                                     partialProofData,
                                                     [
                                                      { dup: { n: 0 } },
                                                      { idx: { cached: false,
                                                               pushPath: false,
                                                               path: [
                                                                      { tag: 'value',
                                                                        value: { value: _descriptor_5.toValue(0n),
                                                                                 alignment: _descriptor_5.alignment() } }] } },
                                                      { popeq: { cached: false,
                                                                 result: undefined } }]).value);
    },
    get tradeCount() {
      return _descriptor_1.fromValue(Contract._query(context,
                                                     partialProofData,
                                                     [
                                                      { dup: { n: 0 } },
                                                      { idx: { cached: false,
                                                               pushPath: false,
                                                               path: [
                                                                      { tag: 'value',
                                                                        value: { value: _descriptor_5.toValue(1n),
                                                                                 alignment: _descriptor_5.alignment() } }] } },
                                                      { popeq: { cached: false,
                                                                 result: undefined } }]).value);
    }
  };
}
const _emptyContext = {
  originalState: new __compactRuntime.ContractState(),
  transactionContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({ });
const pureCircuits = {
  mintVaultBalance: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`mintVaultBalance: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const agentId_0 = args_0[0];
    const depositId_0 = args_0[1];
    if (!(agentId_0.buffer instanceof ArrayBuffer && agentId_0.BYTES_PER_ELEMENT === 1 && agentId_0.length === 32)) {
      __compactRuntime.type_error('mintVaultBalance',
                                  'argument 1',
                                  'vogue.compact line 21 char 1',
                                  'Bytes<32>',
                                  agentId_0)
    }
    if (!(depositId_0.buffer instanceof ArrayBuffer && depositId_0.BYTES_PER_ELEMENT === 1 && depositId_0.length === 32)) {
      __compactRuntime.type_error('mintVaultBalance',
                                  'argument 2',
                                  'vogue.compact line 21 char 1',
                                  'Bytes<32>',
                                  depositId_0)
    }
    return _dummyContract._mintVaultBalance_0(agentId_0, depositId_0);
  },
  burnVaultBalance: (...args_0) => {
    if (args_0.length !== 3) {
      throw new __compactRuntime.CompactError(`burnVaultBalance: expected 3 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const agentId_0 = args_0[0];
    const burnId_0 = args_0[1];
    const withdrawUsdcAmount_0 = args_0[2];
    if (!(agentId_0.buffer instanceof ArrayBuffer && agentId_0.BYTES_PER_ELEMENT === 1 && agentId_0.length === 32)) {
      __compactRuntime.type_error('burnVaultBalance',
                                  'argument 1',
                                  'vogue.compact line 24 char 1',
                                  'Bytes<32>',
                                  agentId_0)
    }
    if (!(burnId_0.buffer instanceof ArrayBuffer && burnId_0.BYTES_PER_ELEMENT === 1 && burnId_0.length === 32)) {
      __compactRuntime.type_error('burnVaultBalance',
                                  'argument 2',
                                  'vogue.compact line 24 char 1',
                                  'Bytes<32>',
                                  burnId_0)
    }
    if (!(typeof(withdrawUsdcAmount_0) === 'bigint' && withdrawUsdcAmount_0 >= 0n && withdrawUsdcAmount_0 <= 4294967295n)) {
      __compactRuntime.type_error('burnVaultBalance',
                                  'argument 3',
                                  'vogue.compact line 24 char 1',
                                  'Uint<0..4294967295>',
                                  withdrawUsdcAmount_0)
    }
    return _dummyContract._burnVaultBalance_0(agentId_0,
                                              burnId_0,
                                              withdrawUsdcAmount_0);
  },
  unshieldWithdraw: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`unshieldWithdraw: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const agentId_0 = args_0[0];
    const amountUsd_0 = args_0[1];
    if (!(agentId_0.buffer instanceof ArrayBuffer && agentId_0.BYTES_PER_ELEMENT === 1 && agentId_0.length === 32)) {
      __compactRuntime.type_error('unshieldWithdraw',
                                  'argument 1',
                                  'vogue.compact line 27 char 1',
                                  'Bytes<32>',
                                  agentId_0)
    }
    if (!(typeof(amountUsd_0) === 'bigint' && amountUsd_0 >= 0n && amountUsd_0 <= 4294967295n)) {
      __compactRuntime.type_error('unshieldWithdraw',
                                  'argument 2',
                                  'vogue.compact line 27 char 1',
                                  'Uint<0..4294967295>',
                                  amountUsd_0)
    }
    return _dummyContract._unshieldWithdraw_0(agentId_0, amountUsd_0);
  }
};
const contractReferenceLocations = { tag: 'publicLedgerArray', indices: { } };
exports.Contract = Contract;
exports.ledger = ledger;
exports.pureCircuits = pureCircuits;
exports.contractReferenceLocations = contractReferenceLocations;
//# sourceMappingURL=index.cjs.map
