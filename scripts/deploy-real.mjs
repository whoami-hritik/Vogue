import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Contract } = require('../managed/contract/index.cjs');
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import * as testkit from '@midnight-ntwrk/testkit-js';
import crypto from 'crypto';

async function main() {
  setNetworkId('preprod');
  process.env.TEST_ENV = 'preprod';
  
  const envConfig = {
    walletNetworkId: 'preprod',
    networkId: 'preprod',
    indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    node: 'https://rpc.preprod.midnight.network',
    nodeWS: 'wss://rpc.preprod.midnight.network',
    faucet: 'https://faucet.preprod.midnight.network/api/drips',
    proofServer: 'http://127.0.0.1:6300'
  };

  console.log("Building wallet...");
  const seedWords = "kidney open cycle jar wrist oppose noble resource fox gown name message garlic bronze lizard miss wool token absent jealous quantum fit hurt pond";
  const seeds = testkit.WalletSeeds.fromMnemonic(seedWords);
  const logger = testkit.createDefaultTestLogger();
  
  const walletProvider = await testkit.MidnightWalletProvider.build(logger, envConfig, seeds.masterSeed);
  await walletProvider.start(false); 
  
  console.log("Unshielded Address:", walletProvider.unshieldedKeystore?.getPublicKey()); 
  
  console.log("Initializing providers...");
  const providers = testkit.initializeMidnightProviders(walletProvider, envConfig, {
    zkConfigPath: './managed/zkir',
    privateStateStoreName: 'deploy-state'
  });

  console.log("Deploying contract (using compatible ZK bindings)...");
  
  const compiled = CompiledContract.make('vogue', Contract).pipe(CompiledContract.withWitnesses({}));
  
  const agentId = new Uint8Array(32);
  try {
    const deployedContract = await deployContract(providers, {
      privateStateId: 'vogue-deploy',
      compiledContract: compiled,
      args: [agentId], 
      initialPrivateState: {}
    });

    console.log("Contract Deployed!");
    console.log("Address:", deployedContract.deployTxData.public.contractAddress);
    process.exit(0);
  } catch (err) {
    console.error("Deployment failed:", err);
    process.exit(1);
  }
}
main().catch(console.error);
