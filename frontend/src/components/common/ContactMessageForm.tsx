'use client';

/**
 * ContactMessageForm
 * ------------------
 * Minimal "Send message" form used on the public Contact page.
 *
 * Visually matches the ShopBangla-style contact layout: filled gray inputs
 * with uppercase micro-labels and a dark-navy CTA. Submissions still flow
 * through `/leads` (with `source: 'contact-page'`) so that messages from the
 * Contact page are captured in the leads pipeline for marketing follow-up.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { api, ApiError } from '@/services/api';

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name'),
  email: z.string().trim().email('Enter a valid email'),
  subject: z.string().trim().min(2, 'Please add a short subject'),
  message: z.string().trim().min(10, 'Tell us a little more (10+ chars)').max(1024),
});

type ContactFormValues = z.infer<typeof schema>;

// Small helper for the uppercase micro-labels in the reference design.
const MicroLabel = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
  <label
    htmlFor={htmlFor}
    className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500"
  >
    {children}
  </label>
);

export const ContactMessageForm = () => {
  const { push } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      // Re-use the leads pipeline. We prepend the subject inside the message
      // body so admins still see the subject when the lead lands in the CRM.
      await api.post('/leads', {
        name: values.name,
        email: values.email,
        phone: 'N/A',
        message: `[${values.subject}] ${values.message}`,
        source: 'contact-page',
      });
      setSubmitted(true);
      reset();
      push({
        variant: 'success',
        title: 'Message sent',
        description: 'Thanks for reaching out — we will reply within one business day.',
      });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      push({ variant: 'error', title: 'Could not send message', description: message });
    }
  });

  if (submitted) {
    return (
      <div className="rounded-2xl border border-ink-100 bg-white p-8 text-center dark:border-ink-700 dark:bg-ink-900">
        <CheckCircle2 className="mx-auto h-12 w-12 text-brand-600" />
        <h3 className="mt-3 text-xl font-bold text-ink-900 dark:text-ink-100">Message sent</h3>
        <p className="mt-2 text-sm text-ink-500">
          We received your message and will reply to your email shortly.
        </p>
        <Button className="mt-6" variant="outline" onClick={() => setSubmitted(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-ink-100 bg-white p-6 sm:p-8 dark:border-ink-700 dark:bg-ink-900"
      noValidate
    >
      <h2 className="text-2xl font-bold text-ink-900 dark:text-ink-100">Send message</h2>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <MicroLabel htmlFor="contact-name">Full name</MicroLabel>
          <Input
            id="contact-name"
            variant="filled"
            placeholder="Your name"
            hasError={Boolean(errors.name)}
            {...register('name')}
          />
          {errors.name && <p className="text-xs font-medium text-red-600">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <MicroLabel htmlFor="contact-email">Email address</MicroLabel>
          <Input
            id="contact-email"
            type="email"
            variant="filled"
            placeholder="your@email.com"
            hasError={Boolean(errors.email)}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs font-medium text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <MicroLabel htmlFor="contact-subject">Subject</MicroLabel>
          <Input
            id="contact-subject"
            variant="filled"
            placeholder="Message subject"
            hasError={Boolean(errors.subject)}
            {...register('subject')}
          />
          {errors.subject && (
            <p className="text-xs font-medium text-red-600">{errors.subject.message}</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <MicroLabel htmlFor="contact-message">Your message</MicroLabel>
          <Textarea
            id="contact-message"
            rows={5}
            className="rounded-xl bg-surface-muted dark:bg-ink-900"
            placeholder="How can we assist you?"
            hasError={Boolean(errors.message)}
            {...register('message')}
          />
          {errors.message && (
            <p className="text-xs font-medium text-red-600">{errors.message.message}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        variant="secondary"
        size="lg"
        className="mt-6 uppercase tracking-wide"
        isLoading={isSubmitting}
        leftIcon={<Send className="h-4 w-4" />}
      >
        Send message
      </Button>
    </form>
  );
};
