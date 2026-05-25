'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, CheckCircle2, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/common/FormField';
import { useToast } from '@/context/ToastContext';
import { api, ApiError } from '@/services/api';
import type { Course } from '@/types';
import { cn } from '@/utils';

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name'),
  email: z.string().trim().email('Enter a valid email'),
  phone: z.string().trim().min(6, 'Enter a valid phone number'),
  whatsapp: z.string().trim().min(6, 'Enter a valid WhatsApp number').optional().or(z.literal('')),
  country: z.string().trim().optional(),
  interestedCourse: z.string().optional(),
  message: z.string().max(1024).optional(),
});

type LeadFormValues = z.infer<typeof schema>;

interface LeadFormProps {
  source?: string;
  courses?: Array<Pick<Course, 'id' | 'title'>>;
  /** Optional pre-selected course ID (e.g. on a course detail page). */
  defaultCourseId?: string;
  heading?: string;
  subheading?: string;
  /** `card` = self-contained card; `bare` = no padding/border (for modals). */
  variant?: 'card' | 'bare';
  /** Hides the message textarea for a quicker, higher-converting capture. */
  compact?: boolean;
  className?: string;
  onSuccess?: () => void;
}

const collectUtm = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return ['source', 'medium', 'campaign', 'term', 'content'].reduce<Record<string, string>>(
    (acc, key) => {
      const value = params.get(`utm_${key}`);
      if (value) acc[key] = value;
      return acc;
    },
    {},
  );
};

export const LeadForm = ({
  source = 'landing-form',
  courses = [],
  defaultCourseId,
  heading = 'Get a free career consultation',
  subheading = 'Tell us about you and we will be in touch within 24 hours.',
  variant = 'card',
  compact = false,
  className,
  onSuccess,
}: LeadFormProps) => {
  const { push } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [utm, setUtm] = useState<Record<string, string>>({});

  useEffect(() => setUtm(collectUtm()), []);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      interestedCourse: defaultCourseId,
    },
  });

  // Convenience: "WhatsApp same as phone" toggle. When checked we mirror the
  // phone input into the WhatsApp field so the user doesn't retype.
  const [whatsappSameAsPhone, setWhatsappSameAsPhone] = useState(true);
  const phone = watch('phone');
  useEffect(() => {
    if (whatsappSameAsPhone) setValue('whatsapp', phone ?? '');
  }, [phone, whatsappSameAsPhone, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await api.post('/leads', {
        ...values,
        whatsapp: values.whatsapp || values.phone,
        source,
        utm: Object.keys(utm).length > 0 ? utm : undefined,
      });
      setSubmitted(true);
      reset();
      push({
        variant: 'success',
        title: 'Thanks! We received your details.',
        description: 'A member of our team will reach out shortly.',
      });
      onSuccess?.();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      push({ variant: 'error', title: 'Submission failed', description: message });
    }
  });

  const wrapperClass =
    variant === 'card'
      ? cn(
          'rounded-3xl border border-ink-100 bg-white p-6 shadow-card sm:p-8 dark:border-ink-700 dark:bg-ink-900',
          className,
        )
      : cn('w-full', className);

  if (submitted) {
    return (
      <div className={wrapperClass}>
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-brand-600" />
          <h3 className="mt-3 text-xl font-semibold text-ink-900 dark:text-ink-100">
            You&apos;re on the list
          </h3>
          <p className="mt-2 text-sm text-ink-500">
            Our team will contact you within one business day to plan your learning journey.
          </p>
          <Button className="mt-6" variant="outline" onClick={() => setSubmitted(false)}>
            Submit another response
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={wrapperClass}>
      {variant === 'card' && (
        <div className="mb-5">
          <h3 className="text-xl font-semibold text-ink-900 dark:text-ink-100">{heading}</h3>
          <p className="mt-1 text-sm text-ink-500">{subheading}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Full name" htmlFor="name" required error={errors.name?.message}>
          <Input id="name" placeholder="Jane Doe" hasError={Boolean(errors.name)} {...register('name')} />
        </FormField>

        <FormField label="Email" htmlFor="email" required error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            placeholder="jane@company.com"
            hasError={Boolean(errors.email)}
            {...register('email')}
          />
        </FormField>

        <FormField label="Phone" htmlFor="phone" required error={errors.phone?.message}>
          <Input
            id="phone"
            placeholder="+880 1700 000 000"
            hasError={Boolean(errors.phone)}
            {...register('phone')}
          />
        </FormField>

        <FormField label="WhatsApp" htmlFor="whatsapp" error={errors.whatsapp?.message}>
          <div className="space-y-1.5">
            <div className="relative">
              <MessageCircle className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-600" />
              <Input
                id="whatsapp"
                className="pl-9"
                placeholder="Same as phone"
                hasError={Boolean(errors.whatsapp)}
                disabled={whatsappSameAsPhone}
                {...register('whatsapp')}
              />
            </div>
            <label className="inline-flex select-none items-center gap-1.5 text-xs text-ink-500">
              <input
                type="checkbox"
                checked={whatsappSameAsPhone}
                onChange={(event) => setWhatsappSameAsPhone(event.target.checked)}
                className="h-3.5 w-3.5 rounded border-ink-100 text-brand-600 focus:ring-brand-500"
              />
              Same as phone number
            </label>
          </div>
        </FormField>

        {!compact && (
          <FormField label="Country" htmlFor="country" error={errors.country?.message}>
            <Input
              id="country"
              placeholder="United States"
              hasError={Boolean(errors.country)}
              {...register('country')}
            />
          </FormField>
        )}

        {courses.length > 0 && (
          <FormField
            label="Preferred course"
            htmlFor="interestedCourse"
            className={compact ? 'sm:col-span-2' : ''}
            error={errors.interestedCourse?.message}
          >
            <select
              id="interestedCourse"
              className="h-11 w-full rounded-2xl border border-ink-100 bg-white px-3 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100"
              defaultValue={defaultCourseId ?? ''}
              {...register('interestedCourse')}
            >
              <option value="">Select a course (optional)</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </FormField>
        )}

        {!compact && (
          <FormField
            label="Tell us about your goals"
            htmlFor="message"
            className="sm:col-span-2"
            error={errors.message?.message}
          >
            <Textarea
              id="message"
              placeholder="What are you hoping to achieve in the next 6 months?"
              hasError={Boolean(errors.message)}
              {...register('message')}
            />
          </FormField>
        )}
      </div>

      <Button
        type="submit"
        className="mt-6 w-full sm:w-auto"
        isLoading={isSubmitting}
        rightIcon={<Send className="h-4 w-4" />}
      >
        Send my details
      </Button>
      <p className="mt-3 text-xs text-ink-500">
        By submitting you agree to receive communications from Smart Earning Pro. You can unsubscribe at any time.
      </p>
    </form>
  );
};
