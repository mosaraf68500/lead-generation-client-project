import { api, ApiError } from '@/services/api';
import type { Lead, LeadAssignee, LeadStatus, PaginatedMeta, StaffPerformance } from '@/types';

export interface LeadsQuery {
  search?: string;
  status?: string;
  source?: string;
  interestedCourse?: string;
  /** Admin-only: filter by which staff/admin a lead is assigned to. */
  assignedTo?: string;
  page?: number;
  limit?: number;
}

interface ListResult {
  leads: Lead[];
  meta?: PaginatedMeta;
}

/**
 * Helper accepts any object — we cast to a plain record inside so
 * `Object.entries` types cleanly, but the call site stays type-safe
 * (callers pass `LeadsQuery`, `CsvExportQuery`, etc.).
 */
const toQueryString = (q: object): string => {
  const params = new URLSearchParams();
  Object.entries(q as Record<string, unknown>).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

export const fetchLeads = async (query: LeadsQuery = {}): Promise<ListResult> => {
  try {
    const { data, meta } = await api.get<Lead[]>(`/leads${toQueryString(query)}`, {
      tags: ['leads'],
    });
    return { leads: data, meta: meta as unknown as PaginatedMeta | undefined };
  } catch (err) {
    if (err instanceof ApiError) return { leads: [] };
    throw err;
  }
};

export const fetchMyLeads = async (): Promise<Lead[]> => {
  try {
    const { data } = await api.get<Lead[]>('/leads/mine');
    return data;
  } catch (err) {
    if (err instanceof ApiError) return [];
    throw err;
  }
};

export const fetchLeadById = async (id: string): Promise<Lead | null> => {
  try {
    const { data } = await api.get<Lead>(`/leads/${id}`);
    return data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
};

// --- Mutations -----------------------------------------------------------

/**
 * Lead-capture payload as accepted by `POST /leads`. Mirrors the backend Zod
 * `leadValidation.create` schema. Use this from the LeadCaptureModal.
 */
export interface CreateLeadPayload {
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  country?: string;
  preferredBatch?: string;
  occupation?: string;
  interestedCourse?: string;
  interestedCourses?: string[];
  source?: string;
  message?: string;
  utm?: Record<string, string>;
}

export interface CreateLeadResult {
  lead: Lead;
  /** One-time creds the backend returns when it just auto-provisioned the user. */
  autoSignIn: { email: string; password: string } | null;
}

export const createLead = async (payload: CreateLeadPayload): Promise<CreateLeadResult> => {
  const { data } = await api.post<CreateLeadResult>('/leads', payload);
  return data;
};

export const updateLeadStatus = async (id: string, status: LeadStatus): Promise<Lead> => {
  const { data } = await api.patch<Lead>(`/leads/${id}/status`, { status });
  return data;
};

export const addLeadNote = async (id: string, message: string): Promise<Lead> => {
  const { data } = await api.post<Lead>(`/leads/${id}/notes`, { message });
  return data;
};

/**
 * Assign (or unassign with `null`) a lead to a staff/admin user.
 * Admin / super-admin only — staff get a 403 from the backend.
 */
export const assignLead = async (
  id: string,
  assignedTo: string | null,
): Promise<Lead> => {
  const { data } = await api.patch<Lead>(`/leads/${id}/assign`, { assignedTo });
  return data;
};

export const deleteLead = async (id: string): Promise<void> => {
  await api.delete(`/leads/${id}`);
};

/** Triggers a browser download of the leads CSV. Returns the filename used. */
export const downloadLeadsCsv = async (
  query: { status?: string; source?: string; search?: string } = {},
): Promise<string> => {
  const baseURL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5001/api';
  const url = `${baseURL}/leads/export${toQueryString(query)}`;

  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) {
    throw new ApiError(`Export failed (${res.status})`, res.status);
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const filename = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
  return filename;
};

// --- Analytics -----------------------------------------------------------

export interface LeadAnalytics {
  total: number;
  newCount: number;
  contactedCount: number;
  inProgressCount: number;
  enrolledCount: number;
  junkCount: number;
  conversionRate: number;
  bySource: Array<{ source: string; count: number }>;
  byDay: Array<{ date: string; count: number }>;
}

export const fetchLeadAnalytics = async (): Promise<LeadAnalytics | null> => {
  try {
    const { data } = await api.get<LeadAnalytics>('/leads/analytics');
    return data;
  } catch (err) {
    if (err instanceof ApiError) return null;
    throw err;
  }
};

/**
 * Fetches the caller's own assigned-lead KPIs.
 * Powers the staff dashboard "performance" strip.
 */
export const fetchMyPerformance = async (): Promise<StaffPerformance | null> => {
  try {
    const { data } = await api.get<StaffPerformance>('/leads/my-performance');
    return data;
  } catch (err) {
    if (err instanceof ApiError) return null;
    throw err;
  }
};

// --- Assignee helpers ----------------------------------------------------

/**
 * Returns the list of users who CAN have leads assigned to them
 * (staff + admins + super-admins). Used by the assignment dropdown on the
 * Lead CRM detail drawer.
 */
export const fetchAssignableUsers = async (): Promise<LeadAssignee[]> => {
  try {
    const roles: Array<LeadAssignee['role']> = ['staff', 'admin', 'super_admin'];
    const lists = await Promise.all(
      roles.map(async (role) => {
        try {
          const { data } = await api.get<LeadAssignee[]>(
            `/users?role=${role}&limit=100`,
            { tags: ['users'] },
          );
          return data;
        } catch {
          return [] as LeadAssignee[];
        }
      }),
    );
    const flat = lists.flat();
    // Some users might come back from multiple role queries (shouldn't, but
    // de-dupe defensively); also normalise id casing.
    const seen = new Set<string>();
    return flat.filter((u) => {
      if (!u?.id || seen.has(u.id)) return false;
      seen.add(u.id);
      return true;
    });
  } catch {
    return [];
  }
};
