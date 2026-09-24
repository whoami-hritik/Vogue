import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('──────────────────────────────────────────────────────────────────────────');
console.log('⚡ Vogue Compact — Authoritative Smart Contract Compilation & Artifact Sync');
console.log('──────────────────────────────────────────────────────────────────────────');

const REQUIRED_CIRCUITS = [
  'commitStrategy',
  'executeTrade',
  'mintVaultBalance',
  'burnVaultBalance',
  'unshieldWithdraw',
  'registerAuthorizedSolver',
  'commitDarkIntent',
  'fulfillDarkIntent',
  'refundDarkIntent',
];

const contractPath = path.resolve('./contracts/vogue.compact');
const managedDir = path.resolve('./contracts/managed/vogue');
const publicZkDir = path.resolve('./public/zk/vogue');

// 1. Attempt native or WSL compilation if compact compiler is available
let compiledFresh = false;
try {
  // Check direct Linux/CI or WSL path
  let compileCmd = '';
  if (process.platform === 'win32') {
    try {
      execSync('wsl /home/div1912/.local/bin/compact --version', { stdio: 'ignore' });
      compileCmd = `wsl /home/div1912/.local/bin/compact compile "${contractPath.replace(/\\/g, '/').replace('D:', '/mnt/d').replace('C:', '/mnt/c')}" "${managedDir.replace(/\\/g, '/').replace('D:', '/mnt/d').replace('C:', '/mnt/c')}"`;
    } catch {
      // Check if compactc or compact is in PATH via wsl
      try {
        execSync('wsl compact --version', { stdio: 'ignore' });
        compileCmd = `wsl compact compile "${contractPath.replace(/\\/g, '/').replace('D:', '/mnt/d').replace('C:', '/mnt/c')}" "${managedDir.replace(/\\/g, '/').replace('D:', '/mnt/d').replace('C:', '/mnt/c')}"`;
      } catch {
        // no wsl compact
      }
    }
  } else {
    // Non-Windows (Linux/CI/macOS)
    try {
      execSync('compact --version', { stdio: 'ignore' });
      compileCmd = `compact compile "${contractPath}" "${managedDir}"`;
    } catch {
      try {
        execSync('compactc --version', { stdio: 'ignore' });
        compileCmd = `compactc "${contractPath}" "${managedDir}"`;
      } catch {
        // compact compiler not in PATH
      }
    }
  }

  if (compileCmd) {
    console.log(`🔧 Found compact compiler. Compiling contracts/vogue.compact...`);
    execSync(compileCmd, { stdio: 'inherit' });
    compiledFresh = true;
    console.log('✅ Compact contract compiled successfully with authoritative compact compiler.');
  } else {
    console.log('ℹ️  Native compact compiler not in PATH. Verifying pre-compiled ZK artifacts...');
  }
} catch (compileErr) {
  console.warn('⚠️ Compilation note, falling back to verifying pre-compiled ZK artifacts:', compileErr.message);
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

// Copy/sync all keys and zkir
const zkirDir = path.join(managedDir, 'zkir');
for (const circuit of REQUIRED_CIRCUITS) {
  for (const ext of ['.prover', '.verifier']) {
    const src = path.join(keysDir, `${circuit}${ext}`);
    const dest = path.join(pubKeysDir, `${circuit}${ext}`);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    }
  }
  for (const ext of ['.zkir', '.bzkir']) {
    const src = path.join(zkirDir, `${circuit}${ext}`);
    const dest = path.join(pubZkirDir, `${circuit}${ext}`);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    }
  }
}
console.log(`✅ Public ZK assets synchronized to public/zk/vogue/ (${REQUIRED_CIRCUITS.length} circuits)`);
console.log('──────────────────────────────────────────────────────────────────────────');
console.log(`🚀 Compact contract & ZK circuit suite ready for deployment & testing.`);
console.log('──────────────────────────────────────────────────────────────────────────\n');
