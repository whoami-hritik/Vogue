import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://brqikkcoalrntxnfolnr.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJycWlra2NvYWxybnR4bmZvbG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzkxMDYyMSwiZXhwIjoyMTAzNDg2NjIxfQ.dWOPsSwVrdhThVkYtvuPhSxUUxAL5r8-_uCKPNbJRsg';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function exportUsers() {
  console.log('Fetching real Preprod users from Supabase...');

  const { data, error } = await supabase
    .from('vogue_events')
    .select('wallet_address, created_at')
    .eq('network', 'preprod')
    .eq('status', 'success')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error:', error.message);
    console.error('Run setup first: node scripts/setup-analytics-table.js');
    process.exit(1);
  }

  const walletMap = new Map();
  for (const row of data ?? []) {
    if (!walletMap.has(row.wallet_address)) {
      walletMap.set(row.wallet_address, row.created_at);
    }
  }

  const users = Array.from(walletMap.entries()).map(([addr, ts], idx) => ({
    n: idx + 1,
    address: addr,
    date: new Date(ts).toISOString().split('T')[0],
  }));

  const count = users.length;

  console.log('');
  console.log('=== USERS.md OUTPUT ===');
  console.log('');
  console.log('# Preprod Users — Level 5');
  console.log('');
  console.log('Target: 50 verified wallet addresses on Midnight Preprod');
  console.log('');
  console.log('> Automatically captured from real Preprod transactions on https://vogue-night.vercel.app');
  console.log('> Verifiable on https://explorer.1am.xyz?network=preprod');
  console.log('');
  console.log('| #  | Wallet Address | First Transaction | 1AM Explorer |');
  console.log('|----|----------------|-------------------|--------------|');

  if (users.length === 0) {
    console.log('| —  | No Preprod transactions recorded yet | — | — |');
  } else {
    for (const u of users) {
      const link = `[View](https://explorer.1am.xyz/address/${u.address}?network=preprod)`;
      console.log(`| ${String(u.n).padEnd(2)} | \`${u.address}\` | ${u.date} | ${link} |`);
    }
  }

  console.log('');
  console.log(`Current count: **${count} / 50**`);
  console.log('');
  console.log(`✅ Done — ${count} distinct wallets with real Preprod transactions.`);
}

exportUsers().catch(console.error);