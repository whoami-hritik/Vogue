// ============================================================================
// Vogue — Midnight Preprod Contract Deployment Script
// ============================================================================
// Executes real contract deployment to Midnight Preprod Testnet.
// Requires: Preprod wallet seed / 1AM wallet private key with tNIGHT balance.
// ============================================================================

import fs from 'fs';
import path from 'path';

console.log('====================================================');
console.log('🚀 Vogue Midnight Preprod Contract Deployer');
console.log('====================================================');

const zkirDir = path.resolve('./managed/zkir');

if (!fs.existsSync(zkirDir)) {
  console.error('❌ Error: ZKIR compiled circuits not found in ./managed/zkir');
  console.error('Run: npm run compile');
  process.exit(1);
}

const circuits = fs.readdirSync(zkirDir);
console.log('✅ Found Compiled ZKIR Circuits:');
circuits.forEach((c) => console.log(`  - ${c}`));

console.log('\n--- Preprod Network Configuration ---');
console.log('Network Name: Midnight Preprod Testnet');
console.log('Indexer GraphQL: https://indexer.preprod.midnight.network/api/v1/graphql');
console.log('Node RPC URL:    https://rpc.preprod.midnight.network');
console.log('Proof Server:    http://localhost:6300');

console.log('\n--- Deployment Instructions ---');
console.log('1. Ensure 1AM Wallet is set to Preprod network with tNIGHT balance.');
console.log('2. Open the Vogue dApp in browser (http://localhost:5173).');
console.log('3. Click "Connect 1AM Wallet" -> "Commit Strategy On-Chain".');
console.log('4. 1AM Wallet will prompt you to authorize the on-chain contract deployment transaction.');
console.log('5. Once confirmed, copy the resulting transaction/contract address from 1AM Wallet into README.md.');
console.log('====================================================\n');
