import {
  Settings,
  KeyRound,
  Image as ImageIcon,
  Power,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { requireSessionRole } from '@/services/session';

export const dynamic = 'force-dynamic';

/**
 * Super-admin only system settings. Surfaces the cogs the platform owner
 * needs to keep running smoothly:
 *
 *   - API keys / .env values  (display-only — actual rotation happens via
 *                              the deployment platform; we never expose
 *                              secrets to the browser)
 *   - Cloudinary usage        (storage limits + asset count snapshot)
 *   - Maintenance mode toggle (UI-only stub today; backend wiring tracked
 *                              separately)
 *
 * This page is intentionally read-only / scaffolded — sensitive operations
 * always require an explicit infra change. Admins and staff get a 403 from
 * `requireSessionRole('super_admin')` before they ever see this UI.
 */
const SuperAdminSettingsPage = async () => {
  await requireSessionRole('super_admin');

  return (
    <DashboardLayout
      title="System settings"
      subtitle="Owner-only controls — API keys, storage limits, and platform health."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <SettingCard
          icon={KeyRound}
          title="API keys & environment"
          description="MongoDB, Better Auth, and Cloudinary credentials. Values are stored in environment variables on the server — they cannot be edited from the browser."
          rows={[
            { label: 'Database URL', value: 'mongodb+srv://**redacted**' },
            { label: 'Better Auth secret', value: '**redacted**' },
            { label: 'Cloudinary API key', value: '**redacted**' },
          ]}
        />

        <SettingCard
          icon={ImageIcon}
          title="Cloudinary storage"
          description="Media uploads live in a dedicated Cloudinary folder. Upgrade your plan in Cloudinary if you approach the storage cap."
          rows={[
            { label: 'Folder', value: 'smart-earning/courses' },
            { label: 'Plan', value: 'Free tier (25 GB)' },
            { label: 'Asset limit', value: '5 MB per upload' },
          ]}
        />

        <SettingCard
          icon={Power}
          title="Maintenance mode"
          description="When enabled, the public site shows a maintenance banner and writes are paused. Useful during database migrations or major deploys."
          rows={[
            { label: 'Status', value: 'Disabled (live)' },
            { label: 'Last toggled', value: '—' },
          ]}
        />

        <SettingCard
          icon={ShieldAlert}
          title="Security posture"
          description="Quick security checks. We strongly recommend you keep at least two super-admin accounts active so you never lock yourself out."
          rows={[
            { label: 'Bearer token rotation', value: 'Default (30 days)' },
            { label: 'Two-factor', value: 'Not configured' },
            { label: 'Audit log retention', value: '90 days (notes)' },
          ]}
        />
      </div>

      <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50/40 p-5 dark:border-amber-900/40 dark:bg-amber-900/10">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-700" />
          <h2 className="text-base font-semibold text-amber-900 dark:text-amber-200">
            Owner-only operations
          </h2>
        </div>
        <ul className="mt-3 space-y-1.5 text-sm text-amber-900 dark:text-amber-100">
          <li>• Rotate secrets via your hosting platform (Render / Vercel / Railway env vars).</li>
          <li>• Migrate lead statuses with <code>npm run migrate:lead-statuses</code>.</li>
          <li>• Seed demo courses with <code>npm run seed:courses</code>.</li>
          <li>• Need to demote yourself? Promote a peer to super-admin first, then ask them to demote you.</li>
        </ul>
      </div>
    </DashboardLayout>
  );
};

interface SettingCardProps {
  icon: typeof Settings;
  title: string;
  description: string;
  rows: Array<{ label: string; value: string }>;
}

const SettingCard = ({ icon: Icon, title, description, rows }: SettingCardProps) => (
  <article className="rounded-2xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
    <div className="flex items-center gap-3">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-700/20">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="text-base font-semibold text-ink-900 dark:text-ink-100">{title}</h3>
    </div>
    <p className="mt-2 text-sm text-ink-500">{description}</p>

    <dl className="mt-4 divide-y divide-ink-100 dark:divide-ink-700">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between py-2">
          <dt className="text-xs font-semibold uppercase tracking-wider text-ink-500">
            {row.label}
          </dt>
          <dd className="text-xs text-ink-700 dark:text-ink-100">{row.value}</dd>
        </div>
      ))}
    </dl>
  </article>
);

export default SuperAdminSettingsPage;
