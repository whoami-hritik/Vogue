import { createClient } from '@supabase/supabase-js';

const url = 'https://brqikkcoalrntxnfolnr.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJycWlra2NvYWxybnR4bmZvbG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzkxMDYyMSwiZXhwIjoyMTAzNDg2NjIxfQ.dWOPsSwVrdhThVkYtvuPhSxUUxAL5r8-_uCKPNbJRsg';

const supabase = createClient(url, serviceRoleKey);

async function testConnection() {
  console.log('Testing Supabase Connection to:', url);
  try {
    const { data: strategies, error: stratErr } = await supabase.from('strategy_commitments').select('*').limit(5);
    if (stratErr) {
      console.log('strategy_commitments query notice:', stratErr.message);
    } else {
      console.log('✅ strategy_commitments table accessible! Count:', strategies.length);
    }

    const { data: trades, error: tradeErr } = await supabase.from('trade_executions').select('*').limit(5);
    if (tradeErr) {
      console.log('trade_executions query notice:', tradeErr.message);
    } else {
      console.log('✅ trade_executions table accessible! Count:', trades.length);
    }
  } catch (e) {
    console.error('Supabase connection error:', e);
  }
}

testConnection();
