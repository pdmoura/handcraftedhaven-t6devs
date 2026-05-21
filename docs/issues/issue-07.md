# Issue 07 — Core UI Components

**Labels:** `feature`, `frontend` | **Priority:** 🟡 High | **Depends on:** Issues 04, 05

## Checklist
- [ ] Create `src/components/ui/Button.jsx`
- [ ] Create `src/components/ui/LoadingSpinner.jsx`
- [ ] Create `src/components/ui/Badge.jsx`
- [ ] Create `src/components/ui/Breadcrumb.jsx`
- [ ] Create `src/components/ui/EmptyState.jsx`
- [ ] Create `src/components/ui/Skeleton.jsx`
- [ ] Create `src/components/ui/QuantitySelector.jsx`
- [ ] Create `src/components/ui/CloudinaryUploadButton.jsx`

## Files to Create

### File 1 — `src/components/ui/Button.jsx`

```jsx
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const variantClasses = {
  primary: 'bg-cta hover:bg-cta-hover text-text shadow-xs hover:shadow-card',
  secondary: 'bg-primary hover:bg-primary-light text-white shadow-xs hover:shadow-card',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  ghost: 'text-text hover:bg-surface',
  danger: 'bg-error hover:bg-red-700 text-white',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-lg gap-2',
  lg: 'px-7 py-3 text-base rounded-lg gap-2.5',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className,
  disabled,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-body font-semibold transition-all duration-200 cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        'active:scale-[0.97]',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}
```

---

### File 2 — `src/components/ui/LoadingSpinner.jsx`

```jsx
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 24, className = '', label = 'Loading...' }) {
  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-label={label}>
      <Loader2 size={size} className="animate-spin text-primary" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <Loader2 size={40} className="animate-spin text-primary" />
        <p className="font-body text-sm text-text-muted">Loading...</p>
      </div>
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-shimmer rounded-md ${className}`} aria-hidden="true" />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-card" aria-hidden="true">
      <Skeleton className="aspect-square" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}
```

---

### File 3 — `src/components/ui/Badge.jsx`

```jsx
import { cn } from '@/lib/utils';

const variantClasses = {
  default: 'bg-surface text-text-muted',
  primary: 'bg-primary text-white',
  accent: 'bg-accent/10 text-accent',
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-warning',
  error: 'bg-error-light text-error',
  outline: 'border border-border text-text-muted',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-xs',
};

export default function Badge({ children, variant = 'default', size = 'sm', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-ui font-medium rounded-full whitespace-nowrap',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}
```

---

### File 4 — `src/components/ui/Breadcrumb.jsx`

```jsx
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center gap-1.5 py-4" aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 font-ui text-sm">
        <li>
          <Link href="/" className="text-text-muted hover:text-accent transition-colors flex items-center">
            <Home size={14} />
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronRight size={14} className="text-border" />
            {item.href && i < items.length - 1 ? (
              <Link href={item.href} className="text-text-muted hover:text-accent transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-text font-medium" aria-current={i === items.length - 1 ? 'page' : undefined}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

---

### File 5 — `src/components/ui/EmptyState.jsx`

```jsx
import { PackageOpen } from 'lucide-react';
import Link from 'next/link';
import Button from './Button';

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}) {
  const Icon = icon || PackageOpen;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-6">
        <Icon size={36} className="text-text-muted" />
      </div>
      <h3 className="font-display text-xl text-text uppercase mb-2">{title}</h3>
      <p className="font-body text-sm text-text-muted max-w-md mb-6">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button>{actionLabel}</Button>
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
```

---

### File 6 — `src/components/ui/Skeleton.jsx`

```jsx
import React from 'react';

/**
 * Reusable animated skeleton placeholder for layouts
 * Supports custom shapes, sizes, and pulsing effects
 */
export default function Skeleton({
  className = '',
  width = '100%',
  height = '1rem',
  variant = 'text', // 'text' | 'rect' | 'circle'
  ...props
}) {
  const baseStyles = 'bg-surface-warm animate-pulse';

  let variantStyles = '';
  if (variant === 'text') {
    variantStyles = 'rounded-md';
  } else if (variant === 'rect') {
    variantStyles = 'rounded-xl';
  } else if (variant === 'circle') {
    variantStyles = 'rounded-full';
  }

  return (
    <div
      className={`${baseStyles} ${variantStyles} ${className}`}
      style={{
        width,
        height,
        ...props.style,
      }}
      {...props}
    />
  );
}
```

---

### File 7 — `src/components/ui/QuantitySelector.jsx`

```jsx
'use client';

import { Minus, Plus } from 'lucide-react';

export default function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
}) {
  return (
    <div className="inline-flex items-center border border-border-light rounded-lg overflow-hidden">
      <button
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={disabled || quantity <= min}
        className="px-3 py-2 hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-text"
        aria-label="Decrease quantity"
      >
        <Minus size={16} />
      </button>
      <input
        type="number"
        value={quantity}
        onChange={(e) => {
          const val = parseInt(e.target.value) || min;
          onChange(Math.max(min, Math.min(max, val)));
        }}
        min={min}
        max={max}
        disabled={disabled}
        className="w-12 text-center py-2 font-ui text-sm font-medium border-x border-border-light bg-white text-text focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        aria-label="Quantity"
      />
      <button
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={disabled || quantity >= max}
        className="px-3 py-2 hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-text"
        aria-label="Increase quantity"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
```

---

### File 8 — `src/components/ui/CloudinaryUploadButton.jsx`

```jsx
'use client';

import { useEffect, useState } from 'react';

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

export default function CloudinaryUploadButton({
  children,
  onUpload,
  options,
  disabledFallback,
}) {
  const [Widget, setWidget] = useState(null);

  useEffect(() => {
    if (!cloudName) return;
    import('next-cloudinary').then((mod) => {
      setWidget(() => mod.CldUploadWidget);
    });
  }, []);

  if (!cloudName || !Widget) {
    return disabledFallback || null;
  }

  return (
    <Widget
      uploadPreset={uploadPreset}
      options={options}
      onSuccess={(result) => {
        if (result?.info?.secure_url) {
          onUpload(result.info.secure_url, result);
        }
      }}
    >
      {children}
    </Widget>
  );
}
```
