'use client';

/**
 * SupportTicketForm
 * -----------------
 * Lightweight support request form used on /dashboard/support. Authenticated
 * users fill in subject + category + message; we pre-fill name/email/phone
 * from their session so they never have to retype.
 *
 * Submissions flow through the standard `/leads` endpoint with
 * `source: 'support-ticket'` so support requests land in the same CRM as
 * marketing leads, but staff can filter by source to triage them separately.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, CheckCircle2, LifeBuoy } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/common/FormField';
import { api, ApiError } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import type { User } from '@/types';

const CATEGORIES = [
  { value: 'billing', label: 'Billing & payments' },
  { value: 'access', label: 'Account & access' },
  { value: 'course', label: 'Course content' },
  { value: 'technical', label: 'Technical issue' },
  { value: 'other', label: 'Something else' },
] as const;

const schema = z.object({
  subject: z.string().trim().min(3, 'Please add a short subject').max(160),
  category: z.string(),
  message: z.string().trim().min(10, 'Tell us a little more (10+ chars)').max(2048),
});

type SupportValues = z.infer<typeof schema>;

interface SupportTicketFormProps {
  user: User;
}

export const SupportTicketForm = ({ user }: SupportTicketFormProps) => {
  const { push } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupportValues>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'access' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await api.post('/leads', {
        name: user.name,
        email: user.email,
        phone: user.phone || 'N/A',
        message: `[${values.category.toUpperCase()}] ${values.subject}\n\n${values.message}`,
        source: 'support-ticket',
      });
      setSubmitted(true);
      reset({ category: values.category });
      push({
        variant: 'success',
        title: 'Support ticket sent',
        description: 'A member of our team will reply within one business day.',
      });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Could not send your request. Please try again.';
      push({ variant: 'error', title: 'Submission failed', description: message });
    }
  });

  if (submitted) {
    return (
      <div className="rounded-3xl border border-ink-100 bg-white p-8 text-center dark:border-ink-700 dark:bg-ink-900">
        <CheckCircle2 className="mx-auto h-12 w-12 text-brand-600" />
        <h3 className="mt-3 text-xl font-bold text-ink-900 dark:text-ink-100">
          We received your request
        </h3>
        <p className="mt-2 text-sm text-ink-500">
          Our team will reply to <span className="font-medium text-ink-700">{user.email}</span>{' '}
          within one business day.
        </p>
        <Button className="mt-6" variant="outline" onClick={() => setSubmitted(false)}>
          Open another ticket
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-ink-100 bg-white p-5 sm:p-6 dark:border-ink-700 dark:bg-ink-900"
      noValidate
    >
      <header className="mb-5 flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-200">
          <LifeBuoy className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-ink-900 dark:text-ink-100">
            Open a support ticket
          </h2>
          <p className="text-xs text-ink-500">
            Logged in as <span className="font-medium text-ink-700">{user.email}</span>
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Subject" htmlFor="subject" required error={errors.subject?.message} className="sm:col-span-2">
          <Input
            id="subject"
            placeholder="Short summary of the issue"
            hasError={Boolean(errors.subject)}
            {...register('subject')}
          />
        </FormField>

        <FormField label="Category" htmlFor="category" className="sm:col-span-2">
          <select
            id="category"
            className="h-11 w-full rounded-2xl border border-ink-100 bg-white px-3 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100"
            {...register('category')}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Describe the issue"
          htmlFor="message"
          required
          error={errors.message?.message}
          className="sm:col-span-2"
        >
          <Textarea
            id="message"
            rows={5}
            placeholder="Steps to reproduce, what you expected, what actually happened, screenshots links..."
            hasError={Boolean(errors.message)}
            {...register('message')}
          />
        </FormField>
      </div>

      <Button
        type="submit"
        className="mt-5"
        isLoading={isSubmitting}
        leftIcon={<Send className="h-4 w-4" />}
      >
        Send ticket
      </Button>
    </form>
  );
};
