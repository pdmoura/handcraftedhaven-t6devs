# Issue 17 — Homepage

**Labels:** `feature`, `frontend` | **Priority:** 🟡 High | **Depends on:** Issues 08, 11, 16

## Checklist
- [ ] Create `src/app/(home)/page.jsx`

> ⚠️ Note: This page uses a **route group** `(home)`. The parentheses create a folder that doesn't affect the URL.

## File to Create

### `src/app/(home)/page.jsx`

> Copy the full 272-line file from the reference repo: `src/app/(home)/page.jsx`

Key implementation details:
- **Server component** — Fetches data directly from Prisma
- `export const dynamic = 'force-dynamic'`
- **Data fetching:** 
  - `lovedProducts` — Top 12 products by avgRating + reviewCount (for the carousel)
  - `featuredProducts` — 12 newest products excluding loved ones (for the second carousel)
  - `activeSellers` — 6 sellers for the "Meet Our Artisans" section
- **Sections:**
  1. **Hero** — Dark green bg, headline "Discover Unique Handcrafted Treasures", CTA buttons, hero image, decorative SVG wave
  2. **Loved This Week** — Uses `<LovedThisWeekCarousel>` with serialized product data (converts Decimal to Number, dates to ISO strings)
  3. **Newest Arrivals** — Same carousel in reverse direction (`direction={-1}`) with `from-surface-warm` edge fade
  4. **Seller CTA** — Dark section encouraging sellers to join
  5. **Meet Our Artisans** — 3-column grid of seller cards with avatar, name, location, bio, and "Visit Shop" link

> ⚠️ You'll need to add these static images to `public/`:
> - `logo-hero.png` (hero illustration)
> - `logo-idea-haven.webp` (header logo)
> - `logo-idea-1.png` (footer logo)
