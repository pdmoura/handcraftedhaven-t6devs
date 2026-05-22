# Issue 10 — Shop Filter Components

**Labels:** `feature`, `frontend` | **Priority:** 🟡 High | **Depends on:** Issue 07

## Checklist
- [ ] Create `src/components/ui/SearchBar.jsx`
- [ ] Create `src/components/ui/SortDropdown.jsx`
- [ ] Create `src/components/ui/RatingSlider.jsx`
- [ ] Create `src/components/ui/Pagination.jsx`

## Files to Create

### File 1 — `src/components/ui/SearchBar.jsx`

```jsx
'use client';

import { Search, X } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from 'use-debounce';

export default function SearchBar({ placeholder = 'Search handcrafted products...', className = '' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') || '');
  const [debouncedQuery] = useDebounce(query, 500);

  // Update local query state when URL changes externally
  useEffect(() => {
    setQuery(searchParams.get('search') || '');
  }, [searchParams]);

  // Trigger search when debounced query changes
  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    if (debouncedQuery !== currentSearch) {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedQuery.trim()) {
        params.set('search', debouncedQuery.trim());
        params.delete('page');
      } else {
        params.delete('search');
      }
      router.push(`/shop?${params.toString()}`);
    }
  }, [debouncedQuery, searchParams, router]);

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div className={`relative ${className}`}>
      <label htmlFor="product-search" className="sr-only">
        Search products
      </label>
      <Search
        size={18}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
      />
      <input
        id="product-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 bg-white border border-border-light rounded-lg font-body text-sm text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-surface transition-colors text-text-muted"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
```

---

### File 2 — `src/components/ui/SortDropdown.jsx`

```jsx
'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SortDropdownContent({ initialSort }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <select
      defaultValue={initialSort}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', e.target.value);
        params.delete('page');
        router.push(`/shop?${params.toString()}`);
      }}
      className="px-3 py-2 border border-border-light rounded-lg font-ui text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
      aria-label="Sort products"
    >
      <option value="newest">Newest</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="rating">Top Rated</option>
    </select>
  );
}

export default function SortDropdown({ initialSort }) {
  return (
    <Suspense fallback={<div className="w-32 h-10 animate-shimmer rounded-lg" />}>
      <SortDropdownContent initialSort={initialSort} />
    </Suspense>
  );
}
```

---

### File 3 — `src/components/ui/RatingSlider.jsx`

```jsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

export default function RatingSlider({ initialRating = 0 }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rating, setRating] = useState(initialRating);
  const [debouncedRating] = useDebounce(rating, 400);

  // Sync state with URL params
  useEffect(() => {
    const minRating = searchParams.get('minRating');
    if (minRating) {
      setRating(Number(minRating));
    } else {
      setRating(0);
    }
  }, [searchParams]);

  // Push to router when debounced rating changes
  useEffect(() => {
    const currentRating = searchParams.get('minRating');
    const expectedRating = currentRating ? Number(currentRating) : 0;

    if (debouncedRating !== expectedRating) {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedRating > 0) {
        params.set('minRating', debouncedRating.toString());
        params.delete('page');
      } else {
        params.delete('minRating');
      }
      router.push(`/shop?${params.toString()}`);
    }
  }, [debouncedRating, searchParams, router]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm font-ui text-text font-medium mb-1">
        <span>Any</span>
        <span>5 Stars</span>
      </div>
      <input
        type="range"
        min="0"
        max="5"
        step="1"
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        className="w-full h-2 bg-border-light rounded-lg appearance-none cursor-pointer accent-cta"
        aria-label="Filter by minimum rating"
      />
      <div className="text-center font-ui text-sm font-medium text-cta mt-2 min-h-[24px]">
        {rating > 0 ? (
          <span className="flex items-center justify-center gap-1">
            <span className="tracking-widest">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
            <span className="text-text-muted text-xs">& up</span>
          </span>
        ) : (
          <span className="text-text-muted">All Ratings</span>
        )}
      </div>
    </div>
  );
}
```

---

### File 4 — `src/components/ui/Pagination.jsx`

```jsx
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Pagination({ currentPage, totalPages, baseUrl, searchParams = {} }) {
  if (totalPages <= 1) return null;

  const buildUrl = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }

    return pages;
  };

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-8" aria-label="Pagination">
      {/* Previous */}
      {currentPage > 1 ? (
        <Link
          href={buildUrl(currentPage - 1)}
          className="p-2 rounded-lg hover:bg-surface text-text-muted hover:text-text transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={20} />
        </Link>
      ) : (
        <span className="p-2 text-border-light cursor-not-allowed" aria-disabled="true">
          <ChevronLeft size={20} />
        </span>
      )}

      {/* Page Numbers */}
      {getPageNumbers().map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 py-1 font-ui text-sm text-text-muted">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={buildUrl(page)}
            className={cn(
              'min-w-[36px] h-9 flex items-center justify-center rounded-lg font-ui text-sm font-medium transition-all',
              page === currentPage
                ? 'bg-primary text-white shadow-xs'
                : 'text-text hover:bg-surface'
            )}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </Link>
        )
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={buildUrl(currentPage + 1)}
          className="p-2 rounded-lg hover:bg-surface text-text-muted hover:text-text transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={20} />
        </Link>
      ) : (
        <span className="p-2 text-border-light cursor-not-allowed" aria-disabled="true">
          <ChevronRight size={20} />
        </span>
      )}
    </nav>
  );
}
```
