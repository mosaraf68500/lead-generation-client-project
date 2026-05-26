'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { FormField } from '@/components/common/FormField';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { signIn } from '@/services/authClient';
import { useToast } from '@/context/ToastContext';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
});

type LoginValues = z.infer<typeof schema>;

const dashboardPathForRole = (role: string | undefined): string => {
  switch (role) {
    case 'super_admin':
      return '/super-admin';
    case 'admin':
      return '/admin';
    case 'staff':
      return '/staff';
    default:
      return '/student';
  }
};

/**
 * Inner form — split out so the page can wrap it in a <Suspense>.
 * Next.js's static optimiser requires any component that calls
 * `useSearchParams()` to live below a Suspense boundary, otherwise the
 * `/login` page can't be prerendered and the production build fails.
 */
const LoginForm = () => {
  const router = useRouter();
  const search = useSearchParams();
  const { push } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { remember: true },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await signIn.email({
      email: values.email,
      password: values.password,
      rememberMe: values.remember,
    });

    if (result.error) {
      push({ variant: 'error', title: 'Sign-in failed', description: result.error.message });
      return;
    }

    push({ variant: 'success', title: 'Welcome back!' });
    const userRole = (result.data?.user as { role?: string } | undefined)?.role;
    const redirectTo = search.get('redirect') ?? dashboardPathForRole(userRole);
    router.push(redirectTo);
    router.refresh();
  });

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Please enter your details to sign in"
      size="sm"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Create Account
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={onSubmit}>
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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-semibold text-ink-900 dark:text-ink-100">
              Password
            </label>
            <Link href="/contact" className="text-xs font-bold text-brand-600 hover:text-brand-700">
              Forgot Password?
            </Link>
          </div>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
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
          {errors.password?.message && (
            <p className="text-xs font-medium text-red-600">{errors.password.message}</p>
          )}
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-ink-700 dark:text-ink-100">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
            {...register('remember')}
          />
          Remember me for 30 days
        </label>

        <Button
          type="submit"
          variant="secondary"
          size="lg"
          className="w-full"
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 rounded-xl border border-dashed border-ink-100 bg-surface-muted p-3 text-[11px] text-ink-500 dark:border-ink-700 dark:bg-ink-900/50">
        <p className="font-semibold uppercase tracking-wider text-ink-700 dark:text-ink-100">
          Dev seed accounts
        </p>
        <ul className="mt-1.5 space-y-0.5">
          <li><span className="font-mono">supper@gmail.com</span> · supper123 (super admin)</li>
          <li><span className="font-mono">admin@gmail.com</span> · admin123 (admin)</li>
          <li><span className="font-mono">staff@gmail.com</span> · staff123 (staff)</li>
        </ul>
      </div>
    </AuthLayout>
  );
};

/**
 * Default export — wraps `LoginForm` in a Suspense boundary so the page
 * can be statically generated even though `useSearchParams()` is used
 * inside the form.
 */
const LoginPage = () => (
  <Suspense fallback={null}>
    <LoginForm />
  </Suspense>
);

export default LoginPage;
