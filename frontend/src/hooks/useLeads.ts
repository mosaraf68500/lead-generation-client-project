'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/services/api';
import type { Lead, PaginatedMeta } from '@/types';

export interface UseLeadsOptions {
  search?: string;
  status?: string;
  source?: string;
  page?: number;
  limit?: number;
}

interface UseLeadsResult {
  leads: Lead[];
  meta?: PaginatedMeta;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const buildQs = (opts: UseLeadsOptions): string => {
  const params = new URLSearchParams();
  Object.entries(opts).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

export const useLeads = (options: UseLeadsOptions = {}): UseLeadsResult => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, meta: nextMeta } = await api.get<Lead[]>(`/leads${buildQs(options)}`);
      setLeads(data);
      setMeta(nextMeta as unknown as PaginatedMeta | undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { leads, meta, isLoading, error, refetch };
};
