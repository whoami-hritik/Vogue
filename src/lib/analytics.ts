/**
 * Vogue — Analytics Layer (Level 5)
 *
 * Records ONLY public, non-sensitive data for real Preprod users:
 *   wallet_address  — public, same as what Midnight Explorer shows
 *   operation       — what circuit action happened
 *   status          — success | failure
 *   tx_hash         — optional, verifiable on Midnight Explorer
 *   duration_ms     — optional
 *   network         — only 'preprod' rows count towards 50-user target
 *   client_event_id — caller-generated UUID for idempotency
 *
 * PRIVACY GUARANTEE (mirrors ProofGate analytics model):
 *   validateEvent() strips every field not in ALLOWED_FIELDS before the
 *   row reaches Supabase. maxPositionPct, stopLossPct, tradeSizeUsd, and
 *   portfolioValue can never appear in an analytics event.
 *
 * FIRE-AND-FORGET: postEvent() never throws.
 */

import { getSupabaseClient } from './supabase-sync';

export const OPERATION_TYPES = [
  'wallet_connected',
  'vault_minted',
  'strategy_committed',
  'trade_executed',
  'vault_withdrawn',
  'operation_failed',
] as const;

export type OperationType = (typeof OPERATION_TYPES)[number];

const ALLOWED_FIELDS = new Set([
  'client_event_id',
  'wallet_address',
  'operation',
  'status',
  'tx_hash',
  'duration_ms',
  'network',
]);

export interface AnalyticsEvent {
  client_event_id: string;
  wallet_address: string;
  operation: OperationType;
  status: 'success' | 'failure';
  tx_hash?: string;
  duration_ms?: number;
  network: string;
}

export interface PublicMetrics {
  preprod_users: number;
  total_ops: number;
  success_rate: number;
}

const _lastFired: Record<string, number> = {};

function isRateLimited(operation: string): boolean {
  const now = Date.now();
  const last = _lastFired[operation] ?? 0;
  if (now - last < 1000) return true;
  _lastFired[operation] = now;
  return false;
}

export function validateEvent(raw: Record<string, unknown>): AnalyticsEvent | null {
  const clean: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in raw) {
      clean[key] = raw[key];
    }
  }

  if (
    typeof clean.client_event_id !== 'string' ||
    typeof clean.wallet_address !== 'string' ||
    typeof clean.operation !== 'string' ||
    typeof clean.status !== 'string' ||
    typeof clean.network !== 'string'
  ) {
    return null;
  }

  if (!(OPERATION_TYPES as readonly string[]).includes(clean.operation)) {
    return null;
  }

  if (clean.status !== 'success' && clean.status !== 'failure') {
    return null;
  }

  return clean as unknown as AnalyticsEvent;
}

export async function postEvent(raw: AnalyticsEvent): Promise<void> {
  try {
    if (isRateLimited(raw.operation)) return;

    const event = validateEvent(raw as unknown as Record<string, unknown>);
    if (!event) return;

    const client = getSupabaseClient();
    if (!client) return;

    await client.from('vogue_events').upsert(
      [
        {
          client_event_id: event.client_event_id,
          wallet_address: event.wallet_address,
          operation: event.operation,
          status: event.status,
          tx_hash: event.tx_hash ?? null,
          duration_ms: event.duration_ms ?? null,
          network: event.network,
        },
      ],
      { onConflict: 'client_event_id' }
    );
  } catch {
    // Swallow all errors
  }
}

export async function getMetrics(): Promise<PublicMetrics | null> {
  try {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data: wallets, error: walletsErr } = await client
      .from('vogue_events')
      .select('wallet_address')
      .eq('network', 'preprod')
      .eq('status', 'success');

    if (walletsErr) return null;

    const distinctWallets = new Set(
      (wallets ?? []).map((r: { wallet_address: string }) => r.wallet_address)
    ).size;

    const { data: allOps, error: opsErr } = await client
      .from('vogue_events')
      .select('status')
      .eq('network', 'preprod');

    if (opsErr) return null;

    const total = (allOps ?? []).length;
    const successes = (allOps ?? []).filter(
      (r: { status: string }) => r.status === 'success'
    ).length;

    return {
      preprod_users: distinctWallets,
      total_ops: total,
      success_rate: total > 0 ? successes / total : 0,
    };
  } catch {
    return null;
  }
}

export function newEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}