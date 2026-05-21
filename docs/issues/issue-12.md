# Issue 12 — Auth Server Actions

**Labels:** `feature`, `backend` | **Priority:** 🔴 Critical | **Depends on:** Issue 04

## Checklist
- [ ] Create `src/lib/actions/auth.js`

## File to Create

### `src/lib/actions/auth.js`

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
import { revalidatePath } from 'next/cache';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7, // 7 days
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

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Invalid email or password' };
    }

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

    if (role && role !== 'seller') {
      return { success: false, error: 'Invalid role' };
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
        ...(role === 'seller' && { role }),
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
