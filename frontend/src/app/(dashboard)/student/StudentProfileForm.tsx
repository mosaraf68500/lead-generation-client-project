'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, UserCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/common/FormField';
import { api, ApiError } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import type { User } from '@/types';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  country: z.string().trim().max(80).optional().or(z.literal('')),
  bio: z.string().max(1024).optional().or(z.literal('')),
  avatar: z.string().url('Use a valid image URL').max(2048).optional().or(z.literal('')),
});

type ProfileValues = z.infer<typeof schema>;

interface StudentProfileFormProps {
  user: User;
}

/**
 * Profile update form for the Student dashboard. Calls
 * `PATCH /api/users/me` which is restricted to the current session.
 */
export const StudentProfileForm = ({ user }: StudentProfileFormProps) => {
  const { push } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<ProfileValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name ?? '',
      phone: user.phone ?? '',
      country: user.country ?? '',
      bio: user.bio ?? '',
      avatar: user.avatar ?? '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = Object.fromEntries(
        Object.entries(values).filter(([, v]) => v !== '' && v !== undefined),
      );
      const { data } = await api.patch<User>('/users/me', payload);
      reset({
        name: data.name ?? '',
        phone: data.phone ?? '',
        country: data.country ?? '',
        bio: data.bio ?? '',
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
      className="rounded-3xl border border-ink-100 bg-white p-5 shadow-card dark:border-ink-700 dark:bg-ink-900"
    >
      <header className="mb-5 flex items-center gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-200">
          <UserCircle className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-ink-900 dark:text-ink-100">My profile</h2>
          <p className="text-xs text-ink-500">{user.email}</p>
        </div>
      </header>

      <div className="space-y-4">
        <FormField label="Full name" htmlFor="name" required error={errors.name?.message}>
          <Input id="name" hasError={Boolean(errors.name)} {...register('name')} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
            <Input id="phone" placeholder="+880..." hasError={Boolean(errors.phone)} {...register('phone')} />
          </FormField>
          <FormField label="Country" htmlFor="country" error={errors.country?.message}>
            <Input id="country" hasError={Boolean(errors.country)} {...register('country')} />
          </FormField>
        </div>

        <FormField label="Avatar URL" htmlFor="avatar" hint="Direct link to an image" error={errors.avatar?.message}>
          <Input id="avatar" placeholder="https://..." hasError={Boolean(errors.avatar)} {...register('avatar')} />
        </FormField>

        <FormField label="Short bio" htmlFor="bio" error={errors.bio?.message}>
          <Textarea
            id="bio"
            placeholder="A line or two about you"
            rows={3}
            hasError={Boolean(errors.bio)}
            {...register('bio')}
          />
        </FormField>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs text-ink-500">
          {isDirty ? 'You have unsaved changes' : 'Profile up to date'}
        </p>
        <Button
          type="submit"
          isLoading={isSubmitting}
          leftIcon={<Save className="h-4 w-4" />}
          disabled={!isDirty}
        >
          Save changes
        </Button>
      </div>
    </form>
  );
};
