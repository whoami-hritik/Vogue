const fs = require('fs');
let c = fs.readFileSync('managed/contract/index.cjs', 'utf8');

c = c.replace(/0\.8\.1/g, '0.16.0');
c = c.replace(/new __compactRuntime\.CompactTypeBoolean\(\)/g, '__compactRuntime.CompactTypeBoolean');

// Find initialState
const initIdx = c.indexOf('initialState(...args_0)');
if (initIdx !== -1) {
    let sub = c.substring(initIdx);
    
    // Replace state_0.data = stateValue_0;
    sub = sub.replace('state_0.data = stateValue_0;', 'state_0.data = new __compactRuntime.ChargedState(stateValue_0);');
    
    // Replace the context object creation
    const ctxRegex = /const context = \{\s+originalState: state_0,\s+currentPrivateState: constructorContext_0\.initialPrivateState,\s+currentZswapLocalState: constructorContext_0\.initialZswapLocalState,\s+transactionContext: new __compactRuntime\.QueryContext\(state_0\.data, __compactRuntime\.dummyContractAddress\(\)\)\s+\};/m;
    sub = sub.replace(ctxRegex, 'const context = __compactRuntime.createCircuitContext(__compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);');
    
    sub = sub.replace('state_0.data = context.transactionContext.state;', 'state_0.data = new __compactRuntime.ChargedState(context.currentQueryContext.state.state);');
    
    c = c.substring(0, initIdx) + sub;
}

c = c.replace(/context\.transactionContext/g, 'context.currentQueryContext');

fs.writeFileSync('managed/contract/index.cjs', c);
