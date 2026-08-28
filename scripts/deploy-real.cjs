const { Contract } = require('../managed/contract/index.cjs');
const testkit = require('@midnight-ntwrk/testkit-js');
const { deployContract } = require('@midnight-ntwrk/midnight-js-contracts');
const { CompiledContract } = require('@midnight-ntwrk/midnight-js-protocol/compact-js');

async function main() {
  console.log("Setting up providers for Preprod...");
  const seed = "kidney open cycle jar wrist oppose noble resource fox gown name message garlic bronze lizard miss wool token absent jealous quantum fit hurt pond";
  
  const { wallet, walletProvider, privateStateProvider } = await testkit.buildWalletAndProviders({
    seed,
    networkId: 'preprod',
    indexerUri: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWsUri: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    proverServerUri: 'http://127.0.0.1:6300',
    nodeUri: 'https://rpc.preprod.midnight.network'
  });

  const state = await wallet.state();
  console.log("Unshielded Address:", state.address);
  console.log("Deploying contract...");
  const compiled = CompiledContract.make('vogue', Contract).pipe(CompiledContract.withWitnesses({}));
  
  try {
    const deployedContract = await deployContract(walletProvider, {
      privateStateId: 'vogue-deploy',
      compiledContract: compiled,
      args: [],
      initialPrivateState: {}
    });
    console.log("Contract Address:", deployedContract.deployTxData.public.contractAddress);
    process.exit(0);
  } catch (err) {
    console.error("Deployment failed:", err);
    process.exit(1);
  }
}
main().catch((err) => { console.error(err); process.exit(1); });
