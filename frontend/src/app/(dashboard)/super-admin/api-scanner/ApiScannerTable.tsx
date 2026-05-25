'use client';

/**
 * Client-side API endpoint scanner.
 *
 * Pings each registered route from the browser (with cookies so the
 * Better Auth session is sent along) and reports HTTP status + latency.
 * Helpful for a super-admin verifying the backend is reachable + their
 * role still has access without opening a separate tool.
 */

import { useMemo, useState, useTransition } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Play,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils';

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  /** Path joined onto NEXT_PUBLIC_API_BASE_URL. Use a placeholder when needed. */
  path: string;
  label: string;
  description: string;
  /** Who is supposed to be able to hit this endpoint. */
  requires: 'public' | 'auth' | 'staff+' | 'admin+' | 'super-admin';
}

interface ScanResult {
  status: 'idle' | 'pending' | 'ok' | 'forbidden' | 'unauthorized' | 'notFound' | 'error';
  httpStatus?: number;
  latencyMs?: number;
  error?: string;
}

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5001/api';

const requiresTone: Record<
  ApiEndpoint['requires'],
  'success' | 'brand' | 'warning' | 'danger' | 'neutral'
> = {
  public: 'success',
  auth: 'brand',
  'staff+': 'neutral',
  'admin+': 'warning',
  'super-admin': 'danger',
};

const methodTone: Record<ApiEndpoint['method'], string> = {
  GET: 'bg-emerald-100 text-emerald-700',
  POST: 'bg-blue-100 text-blue-700',
  PATCH: 'bg-amber-100 text-amber-700',
  PUT: 'bg-purple-100 text-purple-700',
  DELETE: 'bg-red-100 text-red-700',
};

const classifyResponse = (res: Response): ScanResult['status'] => {
  if (res.ok) return 'ok';
  if (res.status === 401) return 'unauthorized';
  if (res.status === 403) return 'forbidden';
  if (res.status === 404) return 'notFound';
  return 'error';
};

const StatusBadge = ({ result }: { result: ScanResult }) => {
  if (result.status === 'idle')
    return (
      <Badge tone="neutral" className="text-[10px]">
        <Clock className="mr-1 h-3 w-3" /> Not scanned
      </Badge>
    );

  if (result.status === 'pending')
    return (
      <Badge tone="brand" className="text-[10px]">
        <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Pinging…
      </Badge>
    );

  if (result.status === 'ok')
    return (
      <Badge tone="success" className="text-[10px]">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        {result.httpStatus} · {result.latencyMs}ms
      </Badge>
    );

  if (result.status === 'forbidden')
    return (
      <Badge tone="warning" className="text-[10px]">
        <ShieldAlert className="mr-1 h-3 w-3" /> 403 forbidden
      </Badge>
    );

  if (result.status === 'unauthorized')
    return (
      <Badge tone="warning" className="text-[10px]">
        <ShieldAlert className="mr-1 h-3 w-3" /> 401 needs auth
      </Badge>
    );

  return (
    <Badge tone="danger" className="text-[10px]">
      <XCircle className="mr-1 h-3 w-3" />
      {result.httpStatus ?? 'ERR'} {result.error ?? ''}
    </Badge>
  );
};

export const ApiScannerTable = ({ endpoints }: { endpoints: ApiEndpoint[] }) => {
  const [results, setResults] = useState<Record<string, ScanResult>>({});
  const [, startTransition] = useTransition();
  const [isBatchRunning, setIsBatchRunning] = useState(false);

  const keyOf = (e: ApiEndpoint) => `${e.method} ${e.path}`;

  const scan = async (endpoint: ApiEndpoint): Promise<void> => {
    const key = keyOf(endpoint);
    setResults((prev) => ({ ...prev, [key]: { status: 'pending' } }));

    const url = `${baseURL}${endpoint.path}`;
    const started = performance.now();
    try {
      const res = await fetch(url, {
        method: endpoint.method,
        credentials: 'include',
        // For non-GET we send no body — the server will reject with 400/422,
        // which still tells us the route is mounted. The scanner is about
        // reachability + auth, not domain correctness.
        headers: endpoint.method !== 'GET' ? { 'Content-Type': 'application/json' } : undefined,
        body: endpoint.method !== 'GET' ? '{}' : undefined,
      });
      const latencyMs = Math.round(performance.now() - started);
      setResults((prev) => ({
        ...prev,
        [key]: {
          status: classifyResponse(res),
          httpStatus: res.status,
          latencyMs,
        },
      }));
    } catch (err) {
      setResults((prev) => ({
        ...prev,
        [key]: {
          status: 'error',
          error: err instanceof Error ? err.message : 'network',
        },
      }));
    }
  };

  const scanAll = async () => {
    setIsBatchRunning(true);
    // Sequential so latency numbers stay representative — parallel pings can
    // jam the dev server and skew results.
    for (const endpoint of endpoints) {
      await scan(endpoint);
    }
    setIsBatchRunning(false);
  };

  const summary = useMemo(() => {
    const counts = { ok: 0, warn: 0, fail: 0, idle: 0 };
    for (const e of endpoints) {
      const r = results[keyOf(e)];
      if (!r || r.status === 'idle' || r.status === 'pending') counts.idle += 1;
      else if (r.status === 'ok') counts.ok += 1;
      else if (r.status === 'forbidden' || r.status === 'unauthorized') counts.warn += 1;
      else counts.fail += 1;
    }
    return counts;
  }, [endpoints, results]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white p-4 dark:border-ink-700 dark:bg-ink-900">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge tone="success">OK {summary.ok}</Badge>
          <Badge tone="warning">Auth-gated {summary.warn}</Badge>
          <Badge tone="danger">Failed {summary.fail}</Badge>
          <Badge tone="neutral">Idle {summary.idle}</Badge>
        </div>
        <Button
          type="button"
          onClick={() => startTransition(() => void scanAll())}
          isLoading={isBatchRunning}
          leftIcon={<Play className="h-4 w-4" />}
        >
          Scan all endpoints
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-surface-muted/60 text-[10px] font-bold uppercase tracking-wider text-ink-500 dark:border-ink-700 dark:bg-ink-700/30">
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Endpoint</th>
                <th className="px-4 py-3">Requires</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-700">
              {endpoints.map((endpoint) => {
                const key = keyOf(endpoint);
                const result: ScanResult = results[key] ?? { status: 'idle' };
                return (
                  <tr key={key} className="hover:bg-surface-muted/40 dark:hover:bg-ink-700/20">
                    <td className="px-4 py-3 align-top">
                      <span
                        className={cn(
                          'inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase',
                          methodTone[endpoint.method],
                        )}
                      >
                        {endpoint.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="font-mono text-xs text-ink-900 dark:text-ink-100">
                        {endpoint.path}
                      </p>
                      <p className="mt-0.5 text-[11px] text-ink-500">
                        {endpoint.label} — {endpoint.description}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Badge tone={requiresTone[endpoint.requires]} className="text-[10px] capitalize">
                        {endpoint.requires}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <StatusBadge result={result} />
                    </td>
                    <td className="px-4 py-3 text-right align-top">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void scan(endpoint)}
                        disabled={result.status === 'pending' || isBatchRunning}
                      >
                        Ping
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
