import { createClient } from '@supabase/supabase-js';

const url = 'https://brqikkcoalrntxnfolnr.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJycWlra2NvYWxybnR4bmZvbG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzkxMDYyMSwiZXhwIjoyMTAzNDg2NjIxfQ.dWOPsSwVrdhThVkYtvuPhSxUUxAL5r8-_uCKPNbJRsg';

const supabase = createClient(url, serviceRoleKey);

async function setupSampleData() {
  console.log('[Supabase Setup] Initializing sample data on project:', url);

  const sampleStrategy = {
    agent_id: '0xagent_1am_demo',
    commitment_hash: '0x811c9dc5811c9dc5811c9dc5811c9dc5',
    wallet_address: 'mn_shield-cpk_preview1xypgstqfj73qanw5d0jqcy93yd2fhp2kc8nudzd64pqgm7qznxqpya16k',
    tx_hash: '0x62a27ceda5eb600263e208768d5d285c659d47f2cd6b14a20c62b160f4da46f3',
    status: 'active'
  };

  const sampleTrade = {
    trade_id: '0xtrade_init_01',
    agent_id: '0xagent_1am_demo',
    commitment_hash: '0x811c9dc5811c9dc5811c9dc5811c9dc5',
    tx_hash: '0x8891a9b2c01d4a92e1094f87198a24e98129f10a887b4194',
    asset: 'ADA',
    status: 'executed',
    proof_time_ms: 385
  };

  const { error: err1 } = await supabase.from('strategy_commitments').insert([sampleStrategy]);
  if (err1) console.log('Notice strategy_commitments:', err1.message);
  else console.log('✅ strategy_commitments record created!');

  const { error: err2 } = await supabase.from('trade_executions').insert([sampleTrade]);
  if (err2) console.log('Notice trade_executions:', err2.message);
  else console.log('✅ trade_executions record created!');
}

setupSampleData();
