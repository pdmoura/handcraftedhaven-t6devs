# Issue 18 — Shop Page with Filters

**Labels:** `feature`, `frontend` | **Priority:** 🟡 High | **Depends on:** Issues 08, 10, 16

## Checklist
- [ ] Create `src/app/shop/page.jsx`

## File to Create

### `src/app/shop/page.jsx`

> Copy the full 202-line file from the reference repo: `src/app/shop/page.jsx`

Key implementation details:
- **Server component** — Fetches data from Prisma directly
- `export const dynamic = 'force-dynamic'`
- **Search params:** `page`, `category`, `search`, `sort`, `minPrice`, `maxPrice`, `minRating`
- **Data fetching:** 3 parallel queries — products (paginated), total count, categories (for sidebar)
- **Layout:** Two-column — sidebar filters + main content
- **Sidebar:** Category links, price range inputs, RatingSlider wrapped in Suspense
- **Main content:** SearchBar + SortDropdown + ProductCard grid (3 columns on xl) + Pagination
- **Empty state:** Shows EmptyState with "Clear Filters" action when no products match
- Product prices converted from Decimal to Number via `Number(product.price)`
