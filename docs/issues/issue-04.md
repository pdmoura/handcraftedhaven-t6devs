# Issue 04 — Core Libraries (prisma.js, auth.js, utils.js, proxy.js)

**Labels:** `setup`, `backend`, `security` | **Priority:** 🔴 Critical | **Depends on:** Issue 03

## Checklist
- [ ] Create `src/lib/prisma.js`
- [ ] Create `src/lib/auth.js`
- [ ] Create `src/lib/utils.js`
- [ ] Create `src/proxy.js` (Next.js 16 route guard — replaces `middleware.js`)

## Files to Create

### File 1 — `src/lib/prisma.js`

```js
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis;

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

---

### File 2 — `src/lib/auth.js`

```js
import { SignJWT, jwtVerify } from 'jose';
import { hash, compare } from 'bcryptjs';
import { cookies } from 'next/headers';

if (!process.env.JWT_SECRET) {
  throw new Error(
    'JWT_SECRET environment variable is required. Generate one with: openssl rand -base64 32 or https://generate-secret.vercel.app/32'
  );
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

const COOKIE_NAME = 'haven_auth_token';
const TOKEN_EXPIRY = '1d';
const SALT_ROUNDS = 12;

export async function hashPassword(password) {
  return hash(password, SALT_ROUNDS);
}

export async function comparePassword(password, hashedPassword) {
  return compare(password, hashedPassword);
}

export async function signToken(payload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getSessionFromRequest(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function setAuthCookie(response, token) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });
}

export function clearAuthCookie(response) {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

export { COOKIE_NAME };
```

---

### File 3 — `src/proxy.js`

> Next.js 16 renamed `middleware.js` to `proxy.js`. This file guards routes:
> - `/cart`, `/checkout`, `/account` — require authentication
> - `/dashboard` — requires seller role
> - `/auth/login`, `/auth/register` — redirects authenticated users away

```js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

if (!process.env.JWT_SECRET) {
  throw new Error(
    'JWT_SECRET environment variable is required. Generate one with: openssl rand -base64 32'
  );
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

const COOKIE_NAME = 'haven_auth_token';

// Routes that require authentication
const AUTH_ROUTES = ['/cart', '/checkout', '/account'];

// Routes that require seller role
const SELLER_ROUTES = ['/dashboard'];

// Routes that should redirect authenticated users away
const GUEST_ROUTES = ['/auth/login', '/auth/register'];

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  let user = null;

  // Try to verify token if present
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      user = payload;
    } catch {
      // Token is invalid — clear it
      const response = NextResponse.next();
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  // Redirect authenticated users away from login/register
  if (user && GUEST_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Check auth-required routes
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!user) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check seller-only routes
  if (SELLER_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!user) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== 'seller') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/cart/:path*',
    '/checkout/:path*',
    '/account/:path*',
    '/dashboard/:path*',
    '/auth/:path*',
  ],
};
```

---

### File 4 — `src/lib/utils.js`

```js
// ==============================
// Handcrafted Haven — Utility Functions
// ==============================

/**
 * Format a number as USD currency
 */
export function formatPrice(price) {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

/**
 * Format a date string to a human-readable format
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Format a date as relative time
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return formatDate(date);
}

/**
 * Generate a URL-friendly slug from a string
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncate text to a max length with ellipsis
 */
export function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Get initials from a name (e.g., "John Doe" -> "JD")
 */
export function getInitials(name) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Debounce a function
 */
export function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Class name helper — joins truthy values
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Generate a random string for unique IDs
 */
export function generateId(length= 8) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Check minimum password strength
 */
export function isStrongPassword(password) {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain an uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain a lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain a number' };
  }
  return { valid: true, message: 'Password is strong' };
}

/**
 * Parse search params into ProductFilters
 */
export function parseProductFilters(searchParams) {
  const get = (key) => {
    const val = searchParams[key];
    return typeof val === 'string' ? val : undefined;
  };

  return {
    category: get('category'),
    minPrice: get('minPrice') ? parseFloat(get('minPrice')) : undefined,
    maxPrice: get('maxPrice') ? parseFloat(get('maxPrice')) : undefined,
    minRating: get('minRating') ? parseInt(get('minRating')) : undefined,
    search: get('search'),
    sort: get('sort'),
    page: get('page') ? parseInt(get('page')) : 1,
    pageSize: get('pageSize') ? parseInt(get('pageSize')) : 12,
  };
}
```
