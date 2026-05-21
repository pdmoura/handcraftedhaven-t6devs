# Handcrafted Haven

Handcrafted Haven is a beautiful, community-driven marketplace connecting independent artisans with customers who value high-quality, handmade, and sustainable products. Built on a modern tech stack, it features a seamless shopping experience for buyers and a powerful management dashboard for sellers.

## Features

### For Buyers
- **Explore & Discover:** Search for products with a powerful debounced search, or filter by category, price, and rating.
- **Cart & Checkout:** Add products to your cart and proceed through a simulated smooth checkout process.
- **Reviews:** Leave reviews and ratings on products you've purchased.
- **Account Management:** Track your recent orders, manage your profile, and upgrade to a seller account at any time.

### For Sellers
- **Dedicated Dashboard:** A native app-like dashboard experience designed for efficiency on both desktop and mobile.
- **Product Management:** Add, edit, and delete products. Includes rich integration with Cloudinary for seamless drag-and-drop image uploads.
- **Order Tracking:** View and manage incoming orders from buyers.
- **Community Engagement:** Reply directly to customer reviews on your products.

## Tech Stack

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router, Server Actions)
- **Styling:** Vanilla CSS with custom Tailwind-like utility classes and CSS variables for theming.
- **Database:** PostgreSQL (via [Render](https://render.com) or [Neon](https://neon.com))
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** Custom JWT-based authentication
- **Image Hosting:** [Cloudinary](https://cloudinary.com)
- **Icons:** [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites

- Node.js (v18+)
- `pnpm` package manager
- A PostgreSQL database URL
- A Cloudinary account


## Project Structure

```
handcraftedhaven-t6devs/
├── src/
│   ├── app/
│   │   ├── (home)/
│   │   │   ├── page.jsx
│   │   │   └── loading.jsx
│   │   ├── api/
│   │   │   ├── categories/
│   │   │   │   └── route.js
│   │   │   ├── products/
│   │   │   │   ├── route.js
│   │   │   │   └── [id]/
│   │   │   │       └── route.js
│   │   │   └── sellers/
│   │   │       └── [id]/
│   │   │           └── route.js
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.jsx
│   │   │   └── register/
│   │   │       └── page.jsx
│   │   ├── account/
│   │   │   ├── page.jsx
│   │   │   └── orders/
│   │   │       └── [id]/
│   │   │           ├── OrderReviewClient.jsx
│   │   │           └── page.jsx
│   │   ├── cart/
│   │   │   └── page.jsx
│   │   ├── categories/
│   │   │   └── page.jsx
│   │   ├── checkout/
│   │   │   └── page.jsx
│   │   ├── dashboard/
│   │   │   ├── layout.jsx
│   │   │   ├── page.jsx
│   │   │   ├── profile/
│   │   │   │   └── page.jsx
│   │   │   └── products/
│   │   │       ├── page.jsx
│   │   │       ├── DeleteProductButton.jsx
│   │   │       ├── new/
│   │   │       └── [id]/
│   │   ├── sell/
│   │   │   └── page.jsx
│   │   ├── seller/
│   │   │   └── [id]/
│   │   │       └── page.jsx
│   │   ├── shop/
│   │   │   ├── page.jsx
│   │   │   ├── loading.jsx
│   │   │   └── [slug]/
│   │   │       ├── page.jsx
│   │   │       ├── AddToCartButton.jsx
│   │   │       ├── ProductGallery.jsx
│   │   │       └── ReviewSection.jsx
│   │   ├── about/
│   │   │   └── page.jsx
│   │   ├── layout.jsx
│   │   ├── error.jsx
│   │   ├── not-found.jsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Badge.jsx
│   │   │   ├── Breadcrumb.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── CloudinaryUploadButton.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── InfiniteCarousel.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── LovedThisWeekCarousel.jsx
│   │   │   ├── MobileMenu.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── QuantitySelector.jsx
│   │   │   ├── RatingSlider.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   ├── SortDropdown.jsx
│   │   │   └── StarRating.jsx
│   │   └── providers/
│   │       ├── AuthProvider.jsx
│   │       ├── CartProvider.jsx
│   │       └── ToastProvider.jsx
│   ├── lib/
│   │   ├── auth.js
│   │   ├── prisma.js
│   │   ├── utils.js
│   │   └── actions/
│   │       ├── auth.js
│   │       ├── cart.js
│   │       ├── orders.js
│   │       ├── products.js
│   │       └── reviews.js
│   ├── types/
│   └── proxy.js
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── public/
├── docs/
│   └── issues/
│       └── issue-01.md through issue-25.md
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── next.config.mjs
├── eslint.config.mjs
├── jsconfig.json
├── postcss.config.mjs
├── prisma.config.mjs
├── AGENTS.md
├── CLAUDE.md
├── README.md
└── update-seed.js
```

### Key Directories

- **`/src/app`**: Next.js App Router pages and route handlers (pages, layouts, API routes)
- **`/src/components/ui`**: Reusable UI components (Buttons, Cards, Carousels, Selectors, etc.)
- **`/src/components/providers`**: React Context providers (Auth, Cart, Toast notifications)
- **`/src/lib/actions`**: Server Actions for handling authentication, cart, orders, products, and reviews
- **`/src/lib`**: Core utilities (Prisma client, authentication logic, formatting utilities)
- **`/prisma`**: Database schema definition and seed data
- **`/docs`**: Project documentation and issue tracking



---

# Issue Board Index

> **Package Manager:** `pnpm` | **Framework:** Next.js 16 (App Router, JavaScript)
> **Database:** PostgreSQL + Prisma ORM | **Auth:** Custom JWT (jose + bcryptjs) | **Styling:** Tailwind CSS v4

---

## Gitflow Strategy

Before starting **any** issue:

```bash
git checkout main
git pull origin main
git checkout -b [YOUR-INITIALS]-issue-[NUMBER]-short-name
```

**Example** (Pedro Moura working on issue 03):
```bash
git checkout main ; git pull origin main
git checkout -b PM-issue-03-prisma-schema
```

After finishing:
```bash
git add .
git commit -m "feat: setup prisma schema"
git push -u origin PM-issue-03-prisma-schema
```
Then open a **Pull Request** on GitHub → teammate reviews → merge into `main`.

---

## 📁 Issue Files

### EPIC 1 — Project Foundation
| # | File | Title |
|---|------|-------|
| 01 | [issue-01.md](./docs/issues/issue-01.md) | Initialize Next.js & Clean Boilerplate |
| 02 | [issue-02.md](./docs/issues/issue-02.md) | Install Dependencies & Configure Build |
| 03 | [issue-03.md](./docs/issues/issue-03.md) | Prisma ORM & Database Schema |
| 04 | [issue-04.md](./docs/issues/issue-04.md) | Core Libraries (prisma.js, auth.js, utils.js) |
| 05 | [issue-05.md](./docs/issues/issue-05.md) | Design System (globals.css) |

### EPIC 2 — Providers & Shared UI
| # | File | Title |
|---|------|-------|
| 06 | [issue-06.md](./docs/issues/issue-06.md) | Context Providers (Auth, Toast, Cart) |
| 07 | [issue-07.md](./docs/issues/issue-07.md) | Core UI Components (Button, Spinner, Badge, etc.) |
| 08 | [issue-08.md](./docs/issues/issue-08.md) | ProductCard, StarRating, Carousel Components |
| 09 | [issue-09.md](./docs/issues/issue-09.md) | Header, MobileMenu & Footer |
| 10 | [issue-10.md](./docs/issues/issue-10.md) | Shop Filter Components (SearchBar, Sort, etc.) |

### EPIC 3 — Layout & Error Pages
| # | File | Title |
|---|------|-------|
| 11 | [issue-11.md](./docs/issues/issue-11.md) | Root Layout, Error & 404 Pages |

### EPIC 4 — Authentication
| # | File | Title |
|---|------|-------|
| 12 | [issue-12.md](./docs/issues/issue-12.md) | Auth Server Actions |
| 13 | [issue-13.md](./docs/issues/issue-13.md) | Login & Register Pages |

### EPIC 5 — Backend (Server Actions & API Routes)
| # | File | Title |
|---|------|-------|
| 14 | [issue-14.md](./docs/issues/issue-14.md) | Product & Review Server Actions |
| 15 | [issue-15.md](./docs/issues/issue-15.md) | Cart & Order Server Actions |
| 16 | [issue-16.md](./docs/issues/issue-16.md) | API Routes (Products, Categories, Sellers) |

### EPIC 6 — Public Pages
| # | File | Title |
|---|------|-------|
| 17 | [issue-17.md](./docs/issues/issue-17.md) | Homepage |
| 18 | [issue-18.md](./docs/issues/issue-18.md) | Shop Page with Filters |
| 19 | [issue-19.md](./docs/issues/issue-19.md) | Product Detail Page |
| 20 | [issue-20.md](./docs/issues/issue-20.md) | Categories, Seller & About Pages |

### EPIC 7 — Cart, Checkout & Account
| # | File | Title |
|---|------|-------|
| 21 | [issue-21.md](./docs/issues/issue-21.md) | Cart & Checkout Pages |
| 22 | [issue-22.md](./docs/issues/issue-22.md) | Account Page |

### EPIC 8 — Seller Dashboard
| # | File | Title |
|---|------|-------|
| 23 | [issue-23.md](./docs/issues/issue-23.md) | Dashboard Layout & Overview |
| 24 | [issue-24.md](./docs/issues/issue-24.md) | Dashboard Product Management |
| 25 | [issue-25.md](./docs/issues/issue-25.md) | Dashboard Profile & Sell Pages |


Team members
| Name | Github |
|---|---|
| Imelda Lucia Robles Fuentes | [imeldaty](https://github.com/imeldaty) |
| Travis Abuton | [sundazekiks](https://github.com/sundazekiks) |
| Pedro Alves de Moura | [pdmoura](https://github.com/pdmoura) |
| Giovaughni Padilla | [Gio-Padilla](https://github.com/Gio-Padilla) |
| Emmanuel Ohene Kwadwo Jnr Kwakye | [oheneemmanuel](https://github.com/oheneemmanuel) |