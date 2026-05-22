# Issue 12 — Auth Server Actions

**Labels:** `feature`, `backend`, `security` | **Priority:** 🔴 Critical | **Depends on:** Issue 04

## Checklist
- [ ] Create `src/lib/rateLimit.js`
- [ ] Create `src/lib/actions/auth.js`

## Files to Create

### File 1 — `src/lib/rateLimit.js`

> In-memory sliding-window rate limiter. Prevents brute-force attacks on login.
> Keyed by identifier (e.g. email). No external dependencies.

```js
// ==============================
// In-Memory Rate Limiter (Sliding Window)
// ==============================
// Prevents brute-force attacks on login/register.
// Keyed by identifier (e.g. email). No external dependencies.
// NOTE: This resets on server restart and is per-process only.
// For multi-instance deployments, use Redis-backed rate limiting.

const attempts = new Map();

const DEFAULT_OPTIONS = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 5,            // max 5 failed attempts per window
};

/**
 * Check if an identifier has exceeded the rate limit.
 * @param {string} identifier - The key to rate limit (e.g. email address)
 * @param {object} [options] - Override defaults
 * @returns {{ limited: boolean, remaining: number, retryAfterMs: number }}
 */
export function checkRateLimit(identifier, options = {}) {
  const { windowMs, maxAttempts } = { ...DEFAULT_OPTIONS, ...options };
  const now = Date.now();
  const key = identifier.toLowerCase().trim();

  // Get or create entry
  let entry = attempts.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    attempts.set(key, entry);
  }

  // Remove timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((ts) => now - ts < windowMs);

  const remaining = Math.max(0, maxAttempts - entry.timestamps.length);
  const limited = entry.timestamps.length >= maxAttempts;
  const oldestInWindow = entry.timestamps[0] || now;
  const retryAfterMs = limited ? windowMs - (now - oldestInWindow) : 0;

  return { limited, remaining, retryAfterMs };
}

/**
 * Record a failed attempt for an identifier.
 * Call this AFTER a failed login, not on success.
 * @param {string} identifier
 */
export function recordFailedAttempt(identifier) {
  const key = identifier.toLowerCase().trim();
  let entry = attempts.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    attempts.set(key, entry);
  }
  entry.timestamps.push(Date.now());
}

/**
 * Clear all attempts for an identifier (call on successful login).
 * @param {string} identifier
 */
export function clearAttempts(identifier) {
  attempts.delete(identifier.toLowerCase().trim());
}

// Periodic cleanup to prevent memory leaks (every 10 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of attempts) {
      entry.timestamps = entry.timestamps.filter(
        (ts) => now - ts < DEFAULT_OPTIONS.windowMs
      );
      if (entry.timestamps.length === 0) {
        attempts.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}
```

---

### File 2 — `src/lib/actions/auth.js`

```js
'use server';

import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import {
  hashPassword,
  comparePassword,
  signToken,
  getSession,
  COOKIE_NAME,
} from '@/lib/auth';
import { isValidEmail, isStrongPassword } from '@/lib/utils';
import { checkRateLimit, recordFailedAttempt, clearAttempts } from '@/lib/rateLimit';
import { revalidatePath } from 'next/cache';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24, // 1 day
  path: '/',
};

export async function getCurrentUserAction() {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Not authenticated' };

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        bio: true,
        location: true,
        socialLinks: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return { success: false, error: 'User not found' };

    return { success: true, data: user };
  } catch (error) {
    console.error('getCurrentUserAction error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function loginAction(email, password) {
  try {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    // Rate limiting: max 5 failed attempts per email per 15 minutes
    const rateCheck = checkRateLimit(email);
    if (rateCheck.limited) {
      const retryMinutes = Math.ceil(rateCheck.retryAfterMs / 60000);
      return {
        success: false,
        error: `Too many login attempts. Please try again in ${retryMinutes} minute${retryMinutes === 1 ? '' : 's'}.`,
      };
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      recordFailedAttempt(email);
      return { success: false, error: 'Invalid email or password' };
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      recordFailedAttempt(email);
      return { success: false, error: 'Invalid email or password' };
    }

    // Successful login — clear rate limit for this email
    clearAttempts(email);

    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, COOKIE_OPTIONS);

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      location: user.location,
      socialLinks: user.socialLinks,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return { success: true, data: userData };
  } catch (error) {
    console.error('loginAction error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function registerAction(name, email, password, role) {
  try {
    if (!name || !email || !password) {
      return { success: false, error: 'Name, email, and password are required' };
    }

    if (!isValidEmail(email)) {
      return { success: false, error: 'Invalid email address' };
    }

    const passwordCheck = isStrongPassword(password);
    if (!passwordCheck.valid) {
      return { success: false, error: passwordCheck.message };
    }

    if (role && !['buyer', 'seller'].includes(role)) {
      return { success: false, error: 'Role must be buyer or seller' };
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: 'An account with this email already exists' };
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || 'buyer',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        bio: true,
        location: true,
        socialLinks: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, COOKIE_OPTIONS);

    return { success: true, data: user };
  } catch (error) {
    console.error('registerAction error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, '', { ...COOKIE_OPTIONS, maxAge: 0 });
    return { success: true, message: 'Logged out' };
  } catch (error) {
    console.error('logoutAction error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function updateProfileAction(data) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    const { name, email, bio, location, avatarUrl, socialLinks, role } = data;

    // Role escalation guard: only allow buyer → seller promotion.
    // Sellers cannot downgrade, and arbitrary roles are rejected.
    // This is intentional: in this marketplace, any buyer can become a seller
    // by opting in through the profile/sell page. No admin approval required.
    if (role) {
      if (role !== 'seller') {
        return { success: false, error: 'Invalid role' };
      }
      if (session.role === 'seller') {
        return { success: false, error: 'You are already a seller' };
      }
    }

    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== session.id) {
        return { success: false, error: 'Email already in use' };
      }
    }

    const updated = await prisma.user.update({
      where: { id: session.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(socialLinks !== undefined && { socialLinks }),
        ...(role === 'seller' && session.role !== 'seller' && { role }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        bio: true,
        location: true,
        socialLinks: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // If role changed or name changed, re-sign token
    if (role === 'seller' || updated.name !== session.name || updated.email !== session.email) {
      const token = await signToken({
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
      });
      const cookieStore = await cookies();
      cookieStore.set(COOKIE_NAME, token, COOKIE_OPTIONS);
    }

    revalidatePath('/dashboard/profile');
    revalidatePath('/account');
    return { success: true, data: updated };
  } catch (error) {
    console.error('updateProfileAction error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function deleteAccountAction() {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    await prisma.user.delete({
      where: { id: session.id },
    });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, '', { ...COOKIE_OPTIONS, maxAge: 0 });

    return { success: true, message: 'Account deleted' };
  } catch (error) {
    console.error('deleteAccountAction error:', error);
    return { success: false, error: 'Internal server error' };
  }
}
```
