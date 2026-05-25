'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User as UserIcon, Mail, Phone, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { FormField } from '@/components/common/FormField';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { signUp } from '@/services/authClient';
import { useToast } from '@/context/ToastContext';

const schema = z
  .object({
    firstName: z.string().trim().min(2, 'Enter your first name'),
    lastName: z.string().trim().min(1, 'Enter your last name'),
    email: z.string().trim().email('Enter a valid email'),
    phone: z.string().trim().min(6, 'Enter a valid phone number').max(20),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm: z.string().min(6, 'Confirm your password'),
    terms: z.literal(true, { errorMap: () => ({ message: 'Please accept the terms to continue' }) }),
  })
  .refine((data) => data.password === data.confirm, {
    path: ['confirm'],
    message: 'Passwords do not match',
  });

type RegisterValues = z.infer<typeof schema>;

const RegisterPage = () => {
  const router = useRouter();
  const { push } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    const fullName = `${values.firstName} ${values.lastName}`.trim();
    // `phone` is a Better Auth `additionalFields` entry on the user record,
    // so it can be passed through the sign-up body and is persisted with
    // the account.
    const result = await signUp.email({
      name: fullName,
      email: values.email,
      password: values.password,
      phone: values.phone,
    } as Parameters<typeof signUp.email>[0] & { phone: string });

    if (result.error) {
      push({ variant: 'error', title: 'Sign-up failed', description: result.error.message });
      return;
    }

    push({
      variant: 'success',
      title: 'Account created',
      description: 'Welcome to Smart Earning Pro!',
    });
    router.push('/student');
    router.refresh();
  });

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join Smart Earning Pro for a better learning experience"
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign In
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        {/* Name row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="First Name" htmlFor="firstName" error={errors.firstName?.message}>
            <Input
              id="firstName"
              autoComplete="given-name"
              placeholder="John"
              variant="filled"
              leftIcon={<UserIcon className="h-4 w-4" />}
              hasError={Boolean(errors.firstName)}
              {...register('firstName')}
            />
          </FormField>
          <FormField label="Last Name" htmlFor="lastName" error={errors.lastName?.message}>
            <Input
              id="lastName"
              autoComplete="family-name"
              placeholder="Doe"
              variant="filled"
              hasError={Boolean(errors.lastName)}
              {...register('lastName')}
            />
          </FormField>
        </div>

        <FormField label="Email Address" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            variant="filled"
            leftIcon={<Mail className="h-4 w-4" />}
            hasError={Boolean(errors.email)}
            {...register('email')}
          />
        </FormField>

        <FormField label="Phone Number" htmlFor="phone" error={errors.phone?.message}>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+880 1XXX-XXXXXX"
            variant="filled"
            leftIcon={<Phone className="h-4 w-4" />}
            hasError={Boolean(errors.phone)}
            {...register('phone')}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            variant="filled"
            leftIcon={<Lock className="h-4 w-4" />}
            rightSlot={
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-500 transition hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-ink-700 dark:hover:text-ink-100"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            hasError={Boolean(errors.password)}
            {...register('password')}
          />
        </FormField>

        <FormField label="Confirm Password" htmlFor="confirm" error={errors.confirm?.message}>
          <Input
            id="confirm"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            variant="filled"
            leftIcon={<Lock className="h-4 w-4" />}
            rightSlot={
              <button
                type="button"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                onClick={() => setShowConfirm((v) => !v)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-500 transition hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-ink-700 dark:hover:text-ink-100"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            hasError={Boolean(errors.confirm)}
            {...register('confirm')}
          />
        </FormField>

        <div>
          <label className="flex items-start gap-2 text-sm text-ink-700 dark:text-ink-100">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
              {...register('terms')}
            />
            <span>
              I agree to the{' '}
              <Link href="/contact" className="font-semibold text-brand-600 hover:text-brand-700">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/contact" className="font-semibold text-brand-600 hover:text-brand-700">
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.terms?.message && (
            <p className="mt-1 text-xs font-medium text-red-600">{errors.terms.message}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="secondary"
          size="lg"
          className="w-full"
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Create Account
        </Button>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
