-- ============================================================================
-- Vogue — Midnight ZK Trade History & Strategy Commitments Database Schema
-- Project URL: https://zzrkbimybbuzrrzdheac.supabase.co
-- Execute this SQL in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================================

-- 1. Table: strategy_commitments
CREATE TABLE IF NOT EXISTS public.strategy_commitments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id TEXT NOT NULL,
  commitment_hash TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);

-- 2. Table: trade_executions
CREATE TABLE IF NOT EXISTS public.trade_executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trade_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  commitment_hash TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  asset TEXT NOT NULL,
  status TEXT DEFAULT 'executed',
  proof_time_ms INT4 DEFAULT 390,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) and grant public read/insert permissions
ALTER TABLE public.strategy_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_executions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read strategy_commitments" ON public.strategy_commitments;
CREATE POLICY "Allow public read strategy_commitments" ON public.strategy_commitments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert strategy_commitments" ON public.strategy_commitments;
CREATE POLICY "Allow public insert strategy_commitments" ON public.strategy_commitments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read trade_executions" ON public.trade_executions;
CREATE POLICY "Allow public read trade_executions" ON public.trade_executions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert trade_executions" ON public.trade_executions;
CREATE POLICY "Allow public insert trade_executions" ON public.trade_executions FOR INSERT WITH CHECK (true);
