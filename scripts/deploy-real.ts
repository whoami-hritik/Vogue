import { Contract } from '../Prisma/contracts/managed/payroll/contract/index.js';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import * as testkit from '@midnight-ntwrk/testkit-js';

async function main() {
  setNetworkId('preprod');
  console.log("Setting up providers for Preprod...");
  
  const seed = "kidney open cycle jar wrist oppose noble resource fox gown name message garlic bronze lizard miss wool token absent jealous quantum fit hurt pond";
  const { wallet, walletProvider, privateStateProvider } = await testkit.buildWalletAndProviders({
    seed,
    networkId: 'preprod',
    indexerUri: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWsUri: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    proverServerUri: 'http://host.docker.internal:6300',
    nodeUri: 'https://rpc.preprod.midnight.network'
  });

  const state = await wallet.state();
  console.log("Unshielded Address:", state.address);
  console.log("Deploying contract (using compatible ZK bindings)...");
  
  const compiled = CompiledContract.make('ghost', Contract as any).pipe(CompiledContract.withWitnesses({} as never));
  
  try {
    const deployedContract = await deployContract(walletProvider as any, {
      privateStateId: 'vogue-deploy',
      compiledContract: compiled as any,
      args: [1000n], 
      initialPrivateState: {} as any
    } as any);

    console.log("Contract Deployed!");
    console.log("Address:", deployedContract.deployTxData.public.contractAddress);
    process.exit(0);
  } catch (err) {
    console.error("Deployment failed:", err);
    process.exit(1);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
