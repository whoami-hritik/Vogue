import { useState, useEffect } from 'react';
import { getMetrics, type PublicMetrics } from '../lib/analytics';

export interface MetricsState {
  preprodUsers: number;
  totalOps: number;
  successRate: number;
  loading: boolean;
  unavailable: boolean;
}

export function useMetrics(): MetricsState {
  const [state, setState] = useState<MetricsState>({
    preprodUsers: 0,
    totalOps: 0,
    successRate: 0,
    loading: true,
    unavailable: false,
  });

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      const metrics: PublicMetrics | null = await getMetrics();
      if (!mounted) return;
      if (metrics === null) {
        setState((prev) => ({ ...prev, loading: false, unavailable: true }));
      } else {
        setState({
          preprodUsers: metrics.preprod_users,
          totalOps: metrics.total_ops,
          successRate: metrics.success_rate,
          loading: false,
          unavailable: false,
        });
      }
    };
    fetch();
    const interval = setInterval(fetch, 30_000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  return state;
}