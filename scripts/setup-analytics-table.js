import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zzrkbimybbuzrrzdheac.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6cmtiaW15YmJ1enJyemRoZWFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjUxOTk5MiwiZXhwIjoyMTAyMDk1OTkyfQ.56pehMxeXAmP_liRDla3Brawish9C-ZiybMgMCKYBLg';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function setup() {
  console.log('[Vogue Setup] Checking vogue_events table...');
  const { data, error } = await supabase.from('vogue_events').select('id').limit(1);

  if (!error) {
    console.log('✅ vogue_events table already exists and is accessible.');
    return;
  }

  console.log('Table does not exist (error code:', error.code, ')');
  console.log('');
  console.log('=== RUN THIS SQL IN SUPABASE SQL EDITOR ===');
  console.log('URL: https://supabase.com/dashboard/project/zzrkbimybbuzrrzdheac/sql/new');
  console.log('');
  console.log(`CREATE TABLE IF NOT EXISTS vogue_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_event_id text UNIQUE NOT NULL,
  wallet_address text NOT NULL,
  operation text NOT NULL,
  status text NOT NULL CHECK (status IN ('success', 'failure')),
  tx_hash text,
  duration_ms integer,
  network text NOT NULL DEFAULT 'preprod',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS vogue_events_wallet_network_idx
  ON vogue_events (wallet_address, network);
CREATE INDEX IF NOT EXISTS vogue_events_network_status_idx
  ON vogue_events (network, status);`);
  console.log('');
  console.log('After running that SQL, run this script again to verify.');
}

setup().catch(console.error);