# Issue 13 — Login & Register Pages

**Labels:** `feature`, `frontend` | **Priority:** 🟡 High | **Depends on:** Issues 06, 07, 12

## Checklist
- [ ] Create `src/app/auth/login/page.jsx`
- [ ] Create `src/app/auth/register/page.jsx`

## Files to Create

### File 1 — `src/app/auth/login/page.jsx`

```jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import Button from '@/components/ui/Button';
import { Mail, Lock, Eye, EyeOff, Leaf } from 'lucide-react';

import { Suspense } from 'react';

function LoginContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      router.push(redirect);
      router.refresh();
    } else {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-background">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 md:gap-16 items-center animate-fade-in-up">
        {/* Left Side - Text */}
        <div className="hidden md:block">
          <p className="font-ui text-sm font-bold tracking-[0.2em] text-cta uppercase mb-4">Welcome Back</p>
          <h2 className="font-display text-4xl lg:text-5xl text-primary leading-tight mb-6 uppercase">
            Where Makers and Buyers Meet.
          </h2>
          <p className="font-body text-text-muted leading-relaxed text-base">
            Sign in to follow your favorite makers, leave reviews, and manage orders. Sellers get a dashboard to list and grow their craft.
          </p>
        </div>

        {/* Right Side - Form */}
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="text-center mb-8 md:hidden">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Leaf size={28} className="text-cta" />
            </div>
            <h1 className="font-display text-3xl text-primary uppercase mb-2">Welcome Back</h1>
            <p className="font-body text-text-muted">
              Sign in to your Handcrafted Haven account
            </p>
          </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-card p-6 sm:p-8">
          {error && (
            <div className="bg-error-light text-error font-ui text-sm px-4 py-3 rounded-lg mb-6 animate-fade-in" role="alert">
              {error}
            </div>
          )}

          <div className="mb-5">
            <label htmlFor="email" className="font-ui text-sm font-medium text-text block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full pl-10 pr-4 py-3 border border-border-light rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="font-ui text-sm font-medium text-text block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full pl-10 pr-12 py-3 border border-border-light rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
            Sign In
          </Button>

          <p className="text-center font-body text-sm text-text-muted mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-accent font-semibold hover:text-accent-hover transition-colors">
              Create one
            </Link>
          </p>
        </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>}>
      <LoginContent />
    </Suspense>
  );
}
```

---

### File 2 — `src/app/auth/register/page.jsx`

> This is a 249-line client component. Copy the full file from the reference repo: `src/app/auth/register/page.jsx`

Key implementation (see reference repo for exact code):
- `'use client'` at top, wrapped in `<Suspense>` → inner `RegisterContent` component
- Role selector: Buy (ShoppingBag icon) / Sell (Store icon) buttons with `border-2` active state
- Default role from `searchParams.get('role') || 'buyer'`
- Form fields: name (User icon), email (Mail icon), password (Lock icon + Eye toggle), confirm password (Lock icon)
- Password strength indicator via `isStrongPassword()` — shows valid/invalid message
- Validates passwords match before submit
- Calls `useAuth().register(name, email, password, role)`
- On success: redirects sellers to `/dashboard`, buyers to `/`
- Same two-column layout as login page
- "Already have an account? Sign in" link
