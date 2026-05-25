'use client';

/**
 * Shared profile form used on every role's dashboard at /dashboard/profile.
 *
 * ShopBangla-style layout:
 *   - Header band with a square avatar (initial fallback), name, email,
 *     role pill and a camera-hint nudge to update the photo.
 *   - First Name / Last Name on a two-column row.
 *   - Email read-only (Better Auth owns the email field).
 *   - Phone full-width.
 *   - "Save Changes" pill — dark navy with a save icon.
 *
 * Calls `PATCH /api/users/me`, which is scoped to the current session, so
 * the same component safely powers every authenticated role's profile page.
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Camera, Lock } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/common/FormField';
import { Button } from '@/components/ui/Button';
import { api, ApiError } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import type { User } from '@/types';

const schema = z.object({
  firstName: z.string().trim().min(1, 'Enter your first name').max(60),
  lastName: z.string().trim().max(60).optional().or(z.literal('')),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  country: z.string().trim().max(80).optional().or(z.literal('')),
  avatar: z.string().url('Use a valid image URL').max(2048).optional().or(z.literal('')),
});

type ProfileValues = z.infer<typeof schema>;

interface ProfileFormProps {
  user: User;
}

/** Cheap "split full name into first / last" helper. */
const splitName = (name: string): { firstName: string; lastName: string } => {
  const trimmed = name.trim();
  if (!trimmed) return { firstName: '', lastName: '' };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
};

const roleLabel = (role: string): string => role.replace('_', ' ').toUpperCase();

export const ProfileForm = ({ user }: ProfileFormProps) => {
  const { push } = useToast();

  const initial = splitName(user.name ?? '');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<ProfileValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: initial.firstName,
      lastName: initial.lastName,
      phone: user.phone ?? '',
      country: user.country ?? '',
      avatar: user.avatar ?? '',
    },
  });

  const liveFirst = watch('firstName') || initial.firstName;
  const liveLast = watch('lastName') || initial.lastName;
  const displayName = [liveFirst, liveLast].filter(Boolean).join(' ') || 'Your profile';
  const avatarInitial = (liveFirst || user.email || '?').charAt(0).toUpperCase();

  const onSubmit = handleSubmit(async (values) => {
    try {
      const fullName = [values.firstName, values.lastName].filter(Boolean).join(' ').trim();
      const payload = {
        name: fullName,
        ...(values.phone ? { phone: values.phone } : {}),
        ...(values.country ? { country: values.country } : {}),
        ...(values.avatar ? { avatar: values.avatar } : {}),
      };
      const { data } = await api.patch<User>('/users/me', payload);
      const next = splitName(data.name ?? '');
      reset({
        firstName: next.firstName,
        lastName: next.lastName,
        phone: data.phone ?? '',
        country: data.country ?? '',
        avatar: data.avatar ?? '',
      });
      push({ variant: 'success', title: 'Profile updated' });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not save profile';
      push({ variant: 'error', title: 'Save failed', description: message });
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="overflow-hidden rounded-2xl border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-900"
    >
      {/* ── Avatar header band ───────────────────────────────────────── */}
      <header className="flex items-center gap-4 border-b border-ink-100 p-5 dark:border-ink-700">
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-brand-100 text-2xl font-extrabold text-brand-700 dark:bg-brand-700/30 dark:text-brand-200">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={displayName}
                className="h-16 w-16 rounded-2xl object-cover"
              />
            ) : (
              avatarInitial
            )}
          </div>
          <button
            type="button"
            aria-label="Change photo"
            className="absolute -bottom-1 -right-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700"
            tabIndex={-1}
            title="Paste an image URL in the Avatar field below to change your photo"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-extrabold text-ink-900 dark:text-ink-100">
            {displayName}
          </p>
          <p className="truncate text-sm text-ink-500">{user.email}</p>
          <span className="mt-1 inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:bg-brand-700/30 dark:text-brand-200">
            {roleLabel(user.role)}
          </span>
        </div>
        <p className="ml-auto hidden max-w-[200px] text-right text-[11px] text-ink-500 sm:block">
          Paste an image URL in <span className="font-semibold">Avatar URL</span> below to change your photo.
        </p>
      </header>

      {/* ── Form fields ──────────────────────────────────────────────── */}
      <div className="space-y-4 p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="First name" htmlFor="firstName" required error={errors.firstName?.message}>
            <Input
              id="firstName"
              variant="filled"
              hasError={Boolean(errors.firstName)}
              {...register('firstName')}
            />
          </FormField>
          <FormField label="Last name" htmlFor="lastName" error={errors.lastName?.message}>
            <Input
              id="lastName"
              variant="filled"
              hasError={Boolean(errors.lastName)}
              {...register('lastName')}
            />
          </FormField>
        </div>

        <FormField label="Email (read-only)" htmlFor="profile-email" hint="Email is managed by your account provider and cannot be edited here.">
          <Input
            id="profile-email"
            variant="filled"
            readOnly
            value={user.email}
            leftIcon={<Lock className="h-4 w-4" />}
            className="cursor-not-allowed"
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
            <Input
              id="phone"
              variant="filled"
              placeholder="01XXXXXXXXX"
              hasError={Boolean(errors.phone)}
              {...register('phone')}
            />
          </FormField>
          <FormField label="Country" htmlFor="country" error={errors.country?.message}>
            <Input
              id="country"
              variant="filled"
              placeholder="Bangladesh"
              hasError={Boolean(errors.country)}
              {...register('country')}
            />
          </FormField>
        </div>

        <FormField
          label="Avatar URL"
          htmlFor="avatar"
          hint="Direct link to an image (e.g. https://...)"
          error={errors.avatar?.message}
        >
          <Input
            id="avatar"
            variant="filled"
            placeholder="https://..."
            hasError={Boolean(errors.avatar)}
            {...register('avatar')}
          />
        </FormField>

        {/* ── Save Changes (dark navy button to match ShopBangla style) ── */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="secondary"
            isLoading={isSubmitting}
            leftIcon={<Save className="h-4 w-4" />}
            disabled={!isDirty}
            className="rounded-md uppercase tracking-wider"
          >
            Save changes
          </Button>
          <p className="mt-2 text-xs text-ink-500">
            {isDirty ? 'You have unsaved changes.' : 'Profile up to date.'}
          </p>
        </div>
      </div>
    </form>
  );
};
