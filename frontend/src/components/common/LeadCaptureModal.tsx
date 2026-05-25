'use client';

/**
 * LeadCaptureModal — the single high-converting entry point for every course
 * CTA, special-offer claim, and cart "Proceed" action.
 *
 * Visible fields (matching the project's lead-generation spec):
 *   1. Full name
 *   2. Email
 *   3. Phone (active mobile)
 *   4. WhatsApp number (auto-mirrored from phone)
 *   5. Preferred batch / time
 *   6. Current occupation
 *
 * The trigger lives in `LeadCaptureContext` so any component can call
 * `useLeadCapture().open({ course, source })` without prop-drilling.
 *
 * On submit:
 *   - POST /leads through `createLead()`
 *   - If the backend returns `autoSignIn` credentials we transparently sign
 *     the user in via Better Auth and redirect them to /student.
 *   - Otherwise (returning user) we just close the modal and show a toast.
 */

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  X,
  Send,
  CheckCircle2,
  User as UserIcon,
  Mail,
  Phone,
  MessageCircle,
  Briefcase,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/common/FormField';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { useLeadCapture } from '@/context/LeadCaptureContext';
import { useCart } from '@/context/CartContext';
import { signIn } from '@/services/authClient';
import { createLead, type CreateLeadPayload } from '@/services/leads';
import { ApiError } from '@/services/api';
import { cn } from '@/utils';

const PREFERRED_BATCHES = [
  'Morning (6 AM – 9 AM)',
  'Daytime (10 AM – 4 PM)',
  'Evening (5 PM – 8 PM)',
  'Night (8 PM – 11 PM)',
  'Weekends only',
  'Flexible',
];

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name'),
  email: z.string().trim().email('Enter a valid email'),
  phone: z.string().trim().min(6, 'Enter a valid mobile number'),
  whatsapp: z.string().trim().min(6, 'Enter a valid WhatsApp number').optional().or(z.literal('')),
  preferredBatch: z.string().trim().min(1, 'Pick a preferred batch'),
  occupation: z.string().trim().min(2, 'Please tell us your current occupation').max(120),
});

type LeadValues = z.infer<typeof schema>;

const collectUtm = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return ['source', 'medium', 'campaign', 'term', 'content'].reduce<Record<string, string>>(
    (acc, key) => {
      const v = params.get(`utm_${key}`);
      if (v) acc[key] = v;
      return acc;
    },
    {},
  );
};

export const LeadCaptureModal = () => {
  const router = useRouter();
  const { push } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { isOpen, intent, close } = useLeadCapture();
  const { clear: clearCart } = useCart();

  const [whatsappSameAsPhone, setWhatsappSameAsPhone] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const heading = useMemo(() => {
    if (intent?.heading) return intent.heading;
    if (intent?.course?.onSale) return `Claim your offer — ${intent.course.title}`;
    if (intent?.course) return `Enroll in ${intent.course.title}`;
    if (intent?.courses && intent.courses.length > 0) {
      return `Reserve seats for ${intent.courses.length} course${intent.courses.length === 1 ? '' : 's'}`;
    }
    return 'Reserve your seat';
  }, [intent]);

  const subheading = useMemo(() => {
    if (intent?.subheading) return intent.subheading;
    return 'Drop your details below — our team will reach out on WhatsApp within one business day with a personalised plan.';
  }, [intent]);

  const ctaLabel = intent?.cta ?? 'Submit & enroll';

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LeadValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      whatsapp: user?.phone ?? '',
      preferredBatch: PREFERRED_BATCHES[2],
      occupation: '',
    },
  });

  // When the modal re-opens, refill defaults from the current session.
  useEffect(() => {
    if (!isOpen) return;
    reset({
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      whatsapp: user?.phone ?? '',
      preferredBatch: PREFERRED_BATCHES[2],
      occupation: '',
    });
    setWhatsappSameAsPhone(true);
    setSubmitted(false);
  }, [isOpen, user, reset]);

  // Mirror phone -> whatsapp while the checkbox is on.
  const phone = watch('phone');
  useEffect(() => {
    if (whatsappSameAsPhone) setValue('whatsapp', phone ?? '');
  }, [phone, whatsappSameAsPhone, setValue]);

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  // Lock body scroll while open.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  if (!isOpen || !intent) return null;

  const onSubmit = handleSubmit(async (values) => {
    const payload: CreateLeadPayload = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      whatsapp: values.whatsapp || values.phone,
      preferredBatch: values.preferredBatch,
      occupation: values.occupation,
      source: intent.source,
      interestedCourse: intent.course?.id,
      interestedCourses: intent.courses?.map((c) => c.id),
      utm: (() => {
        const utm = collectUtm();
        return Object.keys(utm).length > 0 ? utm : undefined;
      })(),
    };

    try {
      const result = await createLead(payload);
      setSubmitted(true);

      // Multi-course bucket flow: clear the cart now that the interest has
      // been recorded server-side.
      if (intent.courses && intent.courses.length > 0) {
        clearCart();
      }

      push({
        variant: 'success',
        title: 'Thanks! Your request was received.',
        description: 'A member of our team will reach out on WhatsApp soon.',
      });

      // If the backend created a fresh student account for this submission,
      // transparently sign them in and redirect to the dashboard.
      if (result.autoSignIn) {
        try {
          await signIn.email({
            email: result.autoSignIn.email,
            password: result.autoSignIn.password,
          });
        } catch {
          // Sign-in failed (rare). We still continue — the user can log in
          // later. We show a fallback toast so they know.
          push({
            variant: 'info',
            title: 'Account created',
            description: 'Please log in to view your dashboard.',
          });
        }

        // Give the auth context a beat to pick up the new session before we
        // navigate. `router.refresh()` re-runs server components.
        setTimeout(() => {
          close();
          router.push('/student');
          router.refresh();
        }, 1200);
      } else {
        // Returning user: keep their session, just route them to the
        // dashboard if logged in, otherwise to their history.
        setTimeout(() => {
          close();
          if (isAuthenticated) router.push('/dashboard/history');
        }, 1200);
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Something went wrong. Please try again in a moment.';
      push({ variant: 'error', title: 'Submission failed', description: message });
    }
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/60 p-0 sm:items-center sm:p-6"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute inset-0 h-full w-full cursor-default"
        tabIndex={-1}
      />

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-t-3xl border border-ink-100 bg-white sm:rounded-3xl dark:border-ink-700 dark:bg-ink-900">
        {/* Header band */}
        <div className="relative bg-gradient-to-br from-brand-600 to-brand-700 px-5 py-6 text-white sm:px-7">
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em]">
            <Sparkles className="h-3 w-3" /> Limited cohort
          </p>
          <h2 id="lead-modal-title" className="mt-3 text-xl font-bold leading-tight sm:text-2xl">
            {heading}
          </h2>
          <p className="mt-1 max-w-md text-sm text-white/85">{subheading}</p>

          {intent.courses && intent.courses.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {intent.courses.slice(0, 5).map((c) => (
                <li
                  key={c.id}
                  className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium"
                >
                  {c.title}
                </li>
              ))}
              {intent.courses.length > 5 && (
                <li className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium">
                  +{intent.courses.length - 5} more
                </li>
              )}
            </ul>
          )}
        </div>

        {submitted ? (
          <div className="px-5 py-10 text-center sm:px-7">
            <CheckCircle2 className="mx-auto h-14 w-14 text-brand-600" />
            <h3 className="mt-3 text-xl font-bold text-ink-900 dark:text-ink-100">
              You&apos;re on the list!
            </h3>
            <p className="mt-2 text-sm text-ink-500">
              Taking you to your student dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5 px-5 py-6 sm:px-7" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Full name"
                htmlFor="lc-name"
                required
                error={errors.name?.message}
                className="sm:col-span-2"
              >
                <Input
                  id="lc-name"
                  variant="filled"
                  leftIcon={<UserIcon className="h-4 w-4" />}
                  placeholder="Your full name"
                  hasError={Boolean(errors.name)}
                  autoComplete="name"
                  {...register('name')}
                />
              </FormField>

              <FormField label="Email" htmlFor="lc-email" required error={errors.email?.message}>
                <Input
                  id="lc-email"
                  type="email"
                  variant="filled"
                  leftIcon={<Mail className="h-4 w-4" />}
                  placeholder="you@email.com"
                  hasError={Boolean(errors.email)}
                  autoComplete="email"
                  {...register('email')}
                />
              </FormField>

              <FormField label="Mobile" htmlFor="lc-phone" required error={errors.phone?.message}>
                <Input
                  id="lc-phone"
                  variant="filled"
                  leftIcon={<Phone className="h-4 w-4" />}
                  placeholder="+880 1700 000 000"
                  hasError={Boolean(errors.phone)}
                  autoComplete="tel"
                  {...register('phone')}
                />
              </FormField>

              <FormField label="WhatsApp" htmlFor="lc-whatsapp" error={errors.whatsapp?.message} className="sm:col-span-2">
                <div className="space-y-1.5">
                  <Input
                    id="lc-whatsapp"
                    variant="filled"
                    leftIcon={<MessageCircle className="h-4 w-4 text-brand-600" />}
                    placeholder="Same as mobile"
                    hasError={Boolean(errors.whatsapp)}
                    disabled={whatsappSameAsPhone}
                    {...register('whatsapp')}
                  />
                  <label className="inline-flex select-none items-center gap-1.5 text-xs text-ink-500">
                    <input
                      type="checkbox"
                      checked={whatsappSameAsPhone}
                      onChange={(e) => setWhatsappSameAsPhone(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-ink-100 text-brand-600 focus:ring-brand-500"
                    />
                    Same as mobile number
                  </label>
                </div>
              </FormField>

              <FormField
                label="Preferred batch / time"
                htmlFor="lc-batch"
                required
                error={errors.preferredBatch?.message}
              >
                <div className="relative">
                  <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                  <select
                    id="lc-batch"
                    className={cn(
                      'h-12 w-full rounded-xl border bg-surface-muted pl-10 pr-3 text-sm text-ink-900 focus:outline-none focus:ring-2',
                      errors.preferredBatch
                        ? 'border-red-400 focus:ring-red-200'
                        : 'border-ink-100 focus:border-brand-500 focus:ring-brand-100',
                      'dark:bg-ink-900 dark:text-ink-100 dark:border-ink-700',
                    )}
                    {...register('preferredBatch')}
                  >
                    {PREFERRED_BATCHES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </FormField>

              <FormField
                label="Current occupation"
                htmlFor="lc-occupation"
                required
                error={errors.occupation?.message}
              >
                <Input
                  id="lc-occupation"
                  variant="filled"
                  leftIcon={<Briefcase className="h-4 w-4" />}
                  placeholder="e.g. University student, SE, Freelancer"
                  hasError={Boolean(errors.occupation)}
                  {...register('occupation')}
                />
              </FormField>
            </div>

            <div className="flex flex-col gap-2 border-t border-ink-100 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-ink-700">
              <p className="text-xs text-ink-500">
                We&apos;ll never share your details. By submitting you agree to our terms.
              </p>
              <Button
                type="submit"
                size="lg"
                isLoading={isSubmitting}
                rightIcon={<Send className="h-4 w-4" />}
              >
                {ctaLabel}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
