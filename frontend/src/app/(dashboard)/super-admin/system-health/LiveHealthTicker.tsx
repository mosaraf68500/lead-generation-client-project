'use client';

/**
 * Polls `/api/health` every 10s from the browser to surface live API status
 * + uptime + round-trip latency. Renders a single coloured banner with a
 * tiny sparkline of the last few samples.
 */

import { useEffect, useState } from 'react';
import { Activity, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/utils';

interface HealthSample {
  ok: boolean;
  latencyMs: number;
  uptime?: number;
  takenAt: number;
}

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5001/api';
const POLL_INTERVAL_MS = 10_000;
const MAX_SAMPLES = 24;

const formatUptime = (uptimeSeconds: number): string => {
  const days = Math.floor(uptimeSeconds / 86_400);
  const hours = Math.floor((uptimeSeconds % 86_400) / 3_600);
  const minutes = Math.floor((uptimeSeconds % 3_600) / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const ping = async (): Promise<HealthSample> => {
  const started = performance.now();
  try {
    const res = await fetch(`${baseURL}/health`, {
      credentials: 'include',
      cache: 'no-store',
    });
    const latencyMs = Math.round(performance.now() - started);
    if (!res.ok) return { ok: false, latencyMs, takenAt: Date.now() };
    const body = (await res.json().catch(() => null)) as
      | { data?: { uptime?: number } }
      | null;
    return {
      ok: true,
      latencyMs,
      uptime: body?.data?.uptime,
      takenAt: Date.now(),
    };
  } catch {
    return {
      ok: false,
      latencyMs: Math.round(performance.now() - started),
      takenAt: Date.now(),
    };
  }
};

export const LiveHealthTicker = () => {
  const [samples, setSamples] = useState<HealthSample[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const sample = await ping();
      if (cancelled) return;
      setIsLoading(false);
      setSamples((prev) => [...prev, sample].slice(-MAX_SAMPLES));
    };
    void run();
    const id = setInterval(() => void run(), POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const latest = samples[samples.length - 1];
  const ok = latest?.ok ?? false;
  const maxLatency = Math.max(80, ...samples.map((s) => s.latencyMs));

  return (
    <div
      className={cn(
        'rounded-2xl border p-5',
        ok
          ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-900/10'
          : isLoading
            ? 'border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-900'
            : 'border-red-200 bg-red-50/40 dark:border-red-900/40 dark:bg-red-900/10',
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'inline-flex h-12 w-12 items-center justify-center rounded-xl',
              ok
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40'
                : isLoading
                  ? 'bg-ink-100 text-ink-500'
                  : 'bg-red-100 text-red-700',
            )}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : ok ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              Backend API
            </p>
            <p className="text-lg font-extrabold text-ink-900 dark:text-ink-100">
              {isLoading
                ? 'Pinging…'
                : ok
                  ? 'Live'
                  : 'Unreachable'}
            </p>
            <p className="text-xs text-ink-500">
              Polls every {POLL_INTERVAL_MS / 1000}s · last {samples.length} sample
              {samples.length === 1 ? '' : 's'} kept
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-right text-xs text-ink-500">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider">Uptime</p>
            <p className="text-sm font-bold text-ink-900 dark:text-ink-100">
              {latest?.uptime ? formatUptime(latest.uptime) : '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider">Latency</p>
            <p className="text-sm font-bold text-ink-900 dark:text-ink-100">
              {latest ? `${latest.latencyMs}ms` : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Sparkline of latency samples */}
      <div className="mt-4 flex h-12 items-end gap-1">
        {samples.length === 0 ? (
          <p className="text-xs text-ink-500">
            Waiting for first sample…
          </p>
        ) : (
          samples.map((sample, idx) => {
            const heightPct = Math.min(100, (sample.latencyMs / maxLatency) * 100);
            return (
              <span
                key={`${sample.takenAt}-${idx}`}
                title={`${sample.latencyMs}ms · ${sample.ok ? 'OK' : 'DOWN'}`}
                className={cn(
                  'flex-1 rounded-t',
                  sample.ok
                    ? 'bg-emerald-500/70'
                    : 'bg-red-500/70',
                )}
                style={{ height: `${Math.max(6, heightPct)}%` }}
              />
            );
          })
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] text-ink-500">
        <span>
          <Activity className="mr-1 inline h-3 w-3" />
          Latency over the last {Math.min(samples.length, MAX_SAMPLES)} samples
        </span>
        <span>
          {samples.filter((s) => s.ok).length}/{samples.length} OK
        </span>
      </div>
    </div>
  );
};
