import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('──────────────────────────────────────────────────────────────────────────');
console.log('⚡ Vogue Compact v1.0 — Smart Contract Compilation & Artifact Verification');
console.log('──────────────────────────────────────────────────────────────────────────');

const REQUIRED_CIRCUITS = [
  'commitStrategy',
  'executeTrade',
  'mintVaultBalance',
  'burnVaultBalance',
  'unshieldWithdraw',
  'commitDarkIntent',
  'fulfillDarkIntent',
  'refundDarkIntent',
];

const contractPath = path.resolve('./contracts/vogue.compact');
const managedDir = path.resolve('./contracts/managed/vogue');
const publicZkDir = path.resolve('./public/zk/vogue');

// 1. Attempt native compilation if compact compiler is available in PATH
let compiledFresh = false;
try {
  execSync('compact --version', { stdio: 'ignore' });
  console.log('🔧 Found compact CLI compiler. Compiling contracts/vogue.compact...');
  execSync(`compact compile "${contractPath}" "${managedDir}"`, { stdio: 'inherit' });
  compiledFresh = true;
  console.log('✅ Compact contract compiled successfully with compact CLI.');
} catch {
  // Not installed natively or in non-Linux CI environment
  console.log('ℹ️  Native compact CLI not in PATH. Verifying pre-compiled ZK artifacts...');
}

// 2. Verify Contract Bindings
const bindingsFile = path.join(managedDir, 'contract', 'index.js');
if (!fs.existsSync(bindingsFile)) {
  console.error('❌ Error: Contract bindings missing at:', bindingsFile);
  process.exit(1);
}
console.log('✅ Contract bindings verified: contracts/managed/vogue/contract/index.js');

// 3. Verify Circuit Prover & Verifier Keys
const keysDir = path.join(managedDir, 'keys');
const missingKeys = [];
for (const circuit of REQUIRED_CIRCUITS) {
  const prover = path.join(keysDir, `${circuit}.prover`);
  const verifier = path.join(keysDir, `${circuit}.verifier`);
  if (!fs.existsSync(prover) || !fs.existsSync(verifier)) {
    missingKeys.push(circuit);
  }
}

if (missingKeys.length > 0) {
  console.error(`❌ Error: Missing ZK keys for circuits: ${missingKeys.join(', ')}`);
  process.exit(1);
}
console.log(`✅ All ${REQUIRED_CIRCUITS.length} ZK circuit keys verified in contracts/managed/vogue/keys`);

// 4. Verify & Sync Public Web Assets for FetchZkConfigProvider
const pubKeysDir = path.join(publicZkDir, 'keys');
const pubZkirDir = path.join(publicZkDir, 'zkir');
fs.mkdirSync(pubKeysDir, { recursive: true });
fs.mkdirSync(pubZkirDir, { recursive: true });

// Copy/sync if compiled fresh or missing
const zkirDir = path.join(managedDir, 'zkir');
for (const circuit of REQUIRED_CIRCUITS) {
  for (const ext of ['.prover', '.verifier']) {
    const src = path.join(keysDir, `${circuit}${ext}`);
    const dest = path.join(pubKeysDir, `${circuit}${ext}`);
    if (fs.existsSync(src) && (!fs.existsSync(dest) || compiledFresh)) {
      fs.copyFileSync(src, dest);
    }
  }
  for (const ext of ['.zkir', '.bzkir']) {
    const src = path.join(zkirDir, `${circuit}${ext}`);
    const dest = path.join(pubZkirDir, `${circuit}${ext}`);
    if (fs.existsSync(src) && (!fs.existsSync(dest) || compiledFresh)) {
      fs.copyFileSync(src, dest);
    }
  }
}
console.log(`✅ Public ZK assets synchronized to public/zk/vogue/`);
console.log('──────────────────────────────────────────────────────────────────────────');
console.log(`🚀 Compact contract & ZK circuit suite ready for deployment & testing.`);
console.log('──────────────────────────────────────────────────────────────────────────\n');
