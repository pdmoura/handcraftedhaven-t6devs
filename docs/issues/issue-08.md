# Issue 08 — ProductCard, StarRating & Carousel Components

**Labels:** `feature`, `frontend` | **Priority:** 🟡 High | **Depends on:** Issue 07

## Checklist
- [ ] Create `src/components/ui/ProductCard.jsx`
- [ ] Create `src/components/ui/StarRating.jsx`
- [ ] Create `src/components/ui/InfiniteCarousel.jsx`
- [ ] Create `src/components/ui/LovedThisWeekCarousel.jsx`

## Files to Create

### File 1 — `src/components/ui/ProductCard.jsx`

```jsx
import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function ProductCard({ product }) {
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const imageUrl = primaryImage?.url || '/images/placeholder-product.jpg';

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-surface">
        <Image
          src={imageUrl}
          alt={product.title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.status === 'sold_out' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-text font-ui font-bold text-sm px-4 py-1.5 rounded-full">
              Sold Out
            </span>
          </div>
        )}
        {product.inventoryQty > 0 && product.inventoryQty <= 5 && product.status !== 'sold_out' && (
          <span className="absolute top-3 left-3 bg-warning text-white font-ui text-xs font-bold px-2.5 py-1 rounded-full">
            Only {product.inventoryQty} left
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <span className="font-ui text-xs text-accent uppercase tracking-wider">
            {product.category.name}
          </span>
        )}

        {/* Title */}
        <h3 className="font-body font-semibold text-text text-base mt-1 line-clamp-1 group-hover:text-primary transition-colors">
          {product.title}
        </h3>

        {/* Seller */}
        {product.seller && (
          <p className="font-ui text-xs text-text-muted mt-0.5">
            by {product.seller.name}
          </p>
        )}

        {/* Rating & Price */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-star text-star" />
            <span className="font-ui text-xs text-text-muted">
              {Number(product.avgRating).toFixed(1)} ({product.reviewCount})
            </span>
          </div>
          <span className="font-body font-bold text-lg text-primary">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
```

---

### File 2 — `src/components/ui/StarRating.jsx`

```jsx
'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function StarRating({
  rating,
  maxRating = 5,
  size = 18,
  interactive = false,
  onChange,
  showValue = false,
  className,
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className={cn('flex items-center gap-1', className)} role={interactive ? 'radiogroup' : 'img'} aria-label={`Rating: ${rating} out of ${maxRating} stars`}>
      {Array.from({ length: maxRating }).map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= displayRating;
        const isHalfFilled = !isFilled && starValue - 0.5 <= displayRating;

        if (interactive) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange?.(starValue)}
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 cursor-pointer hover:scale-110 transition-transform"
              role="radio"
              aria-checked={starValue === rating}
              aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
            >
              <Star
                size={size}
                className={cn(
                  'transition-colors',
                  isFilled ? 'fill-star text-star' : 'text-border fill-transparent'
                )}
              />
            </button>
          );
        }

        return (
          <Star
            key={i}
            size={size}
            className={cn(
              isFilled
                ? 'fill-star text-star'
                : isHalfFilled
                ? 'fill-star/50 text-star'
                : 'text-border fill-transparent'
            )}
          />
        );
      })}
      {showValue && (
        <span className="ml-1 font-ui text-sm text-text-muted">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
```

---

### File 3 — `src/components/ui/InfiniteCarousel.jsx`

```jsx
'use client';

import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Infinite auto-scrolling carousel with pause-on-hover,
 * draggable scroll, and optional nav arrows.
 *
 * @param direction  1 = scrolls left (default), -1 = scrolls right
 * @param edgeFadeBg CSS class for gradient edge color (e.g. 'from-surface-warm')
 */
export default function InfiniteCarousel({
  children,
  speed = 0.5,
  pauseOnHover = true,
  direction = 1,
  edgeFadeBg = 'from-background',
}) {
  const trackRef = useRef(null);
  const animationRef = useRef(null);
  const scrollPos = useRef(0);
  const isPaused = useRef(false);
  const isDragging = useRef(false);
  const dragStart = useRef(0);
  const dragScrollStart = useRef(0);
  const [showControls, setShowControls] = useState(false);

  // Duplicate children into track for seamless looping
  const items = Array.isArray(children) ? children : [children];

  // Use a ref for the animation function to avoid self-reference lint issues
  const animateFn = useRef(null);

  useEffect(() => {
    animateFn.current = () => {
      const track = trackRef.current;
      if (!track) return;

      if (!isPaused.current && !isDragging.current) {
        scrollPos.current += speed * direction;

        const halfWidth = track.scrollWidth / 2;

        // Wrap in both directions
        if (scrollPos.current >= halfWidth) {
          scrollPos.current -= halfWidth;
        } else if (scrollPos.current < 0) {
          scrollPos.current += halfWidth;
        }

        track.style.transform = `translateX(-${scrollPos.current}px)`;
      }

      animationRef.current = requestAnimationFrame(animateFn.current);
    };

    animationRef.current = requestAnimationFrame(animateFn.current);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [speed, direction]);

  const handleMouseEnter = () => {
    if (pauseOnHover) isPaused.current = true;
    setShowControls(true);
  };

  const handleMouseLeave = () => {
    isPaused.current = false;
    isDragging.current = false;
    setShowControls(false);
  };

  // Drag support
  const handlePointerDown = (e) => {
    isDragging.current = true;
    dragStart.current = e.clientX;
    dragScrollStart.current = scrollPos.current;
    e.currentTarget.style.cursor = 'grabbing';
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const delta = dragStart.current - e.clientX;
    const track = trackRef.current;
    if (!track) return;

    let newPos = dragScrollStart.current + delta;
    const halfWidth = track.scrollWidth / 2;

    // Wrap
    if (newPos < 0) newPos += halfWidth;
    if (newPos >= halfWidth) newPos -= halfWidth;

    scrollPos.current = newPos;
    track.style.transform = `translateX(-${scrollPos.current}px)`;
  };

  const handlePointerUp = (e) => {
    isDragging.current = false;
    e.currentTarget.style.cursor = 'grab';
  };

  // Arrow nav: jump by one card width dynamically
  const nudge = (dir) => {
    const track = trackRef.current;
    if (!track || !track.firstElementChild) return;

    // Calculate exact jump distance based on card width + gap (24px for gap-6)
    const jumpPx = track.firstElementChild.offsetWidth + 24;
    const halfWidth = track.scrollWidth / 2;

    let target = scrollPos.current + dir * jumpPx;
    if (target < 0) target += halfWidth;
    if (target >= halfWidth) target -= halfWidth;

    // Smooth jump
    const start = scrollPos.current;
    const diff = target - start;
    const duration = 400;
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      scrollPos.current = start + diff * eased;
      track.style.transform = `translateX(-${scrollPos.current}px)`;
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  return (
    <div
      className="relative overflow-hidden select-none px-4 md:px-8 lg:px-16"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { isDragging.current = false; }}
      style={{ cursor: 'grab' }}
    >
      {/* Gradient fade edges */}
      <div className={`pointer-events-none absolute inset-y-0 left-0 w-16 md:w-24 z-10 bg-gradient-to-r ${edgeFadeBg} to-transparent`} />
      <div className={`pointer-events-none absolute inset-y-0 right-0 w-16 md:w-24 z-10 bg-gradient-to-l ${edgeFadeBg} to-transparent`} />

      {/* Track: two copies of children for seamless loop */}
      <div
        ref={trackRef}
        className="flex gap-6 will-change-transform"
        style={{ width: 'max-content' }}
      >
        {items.map((child, i) => (
          <div key={`a-${i}`} className="shrink-0 w-[220px] sm:w-[300px]">
            {child}
          </div>
        ))}
        {items.map((child, i) => (
          <div key={`b-${i}`} className="shrink-0 w-[220px] sm:w-[300px]" aria-hidden="true">
            {child}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => nudge(-1)}
        className={`absolute left-4 md:left-8 lg:left-16 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 shadow-card flex items-center justify-center text-primary hover:bg-cta hover:text-white transition-all ${showControls ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
        aria-label="Previous"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => nudge(1)}
        className={`absolute right-4 md:right-8 lg:right-16 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 shadow-card flex items-center justify-center text-primary hover:bg-cta hover:text-white transition-all ${showControls ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
        aria-label="Next"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
```

---

### File 4 — `src/components/ui/LovedThisWeekCarousel.jsx`

```jsx
'use client';

import InfiniteCarousel from '@/components/ui/InfiniteCarousel';
import ProductCard from '@/components/ui/ProductCard';

/**
 * Client wrapper that renders an infinite carousel of product cards.
 * Receives serialized product data from the server component.
 *
 * @param direction  1 = scrolls left (default), -1 = scrolls right
 * @param edgeFadeBg gradient edge color class (e.g. 'from-background')
 */
export default function LovedThisWeekCarousel({
  products,
  direction = 1,
  edgeFadeBg = 'from-background',
}) {
  if (!products || products.length === 0) return null;

  return (
    <InfiniteCarousel speed={0.4} pauseOnHover direction={direction} edgeFadeBg={edgeFadeBg}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </InfiniteCarousel>
  );
}
```
