import { WalletBuilder } from '@midnight-ntwrk/wallet-api';

async function main() {
  const seed = "kidney open cycle jar wrist oppose noble resource fox gown name message garlic bronze lizard miss wool token absent jealous quantum fit hurt pond";
  console.log("Initializing wallet from seed...");
  
  const wallet = await WalletBuilder.buildFromSeed(seed, 'preprod');
  const state = await wallet.state();
  console.log("Unshielded Address:", state.address);
  
  const balances = await wallet.getUnshieldedBalances();
  console.log("Balances:", balances);
}

main().catch(console.error);
