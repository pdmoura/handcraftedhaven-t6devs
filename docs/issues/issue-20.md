# Issue 20 — Categories, Seller & About Pages

**Labels:** `feature`, `frontend` | **Priority:** 🟢 Medium | **Depends on:** Issues 07, 08

## Checklist
- [ ] Create `src/app/categories/page.jsx`
- [ ] Create `src/app/seller/[id]/page.jsx`
- [ ] Create `src/app/about/page.jsx`

## Files to Create

### File 1 — `src/app/categories/page.jsx`

```jsx
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { Palette } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Categories', description: 'Browse handcrafted products by category.' };

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: { where: { status: 'active' } } } } },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="container-app py-8 pb-16">
      <h1 className="font-display text-3xl md:text-4xl text-primary uppercase mb-3">Categories</h1>
      <p className="font-body text-text-muted mb-10">Explore our curated collection of handmade goods</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-children">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/shop?category=${cat.slug}`} className="group bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1">
            <div className="aspect-[16/10] bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden group-hover:opacity-90 transition-opacity">
              {cat.imageUrl ? (
                <Image src={cat.imageUrl} alt={cat.name} fill sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Palette size={48} className="text-primary/30 group-hover:text-cta transition-colors" />
                </div>
              )}
            </div>
            <div className="p-5">
              <h2 className="font-display text-lg text-primary uppercase mb-1">{cat.name}</h2>
              <p className="font-body text-sm text-text-muted line-clamp-2 mb-2">{cat.description}</p>
              <span className="font-ui text-xs text-accent">{cat._count.products} product{cat._count.products !== 1 ? 's' : ''}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

---

### File 2 — `src/app/seller/[id]/page.jsx`

> This is an 87-line server component. Copy the full file from the reference repo: `src/app/seller/[id]/page.jsx`

Key implementation (see reference repo for exact code):
- Server component with `generateMetadata`
- Custom SVG icon components: `InstagramIcon`, `XIcon`
- Imports `formatDate` from utils
- Fetches seller with products, images, category
- Aggregates stats via `prisma.product.aggregate`
- Profile card: avatar, name, location, join date, bio, star rating, social links
- Product grid using `<ProductCard>`

---

### File 3 — `src/app/about/page.jsx`

> This is a 112-line server component. Copy the full file from the reference repo: `src/app/about/page.jsx`

Key implementation (see reference repo for exact code):
- Server component (static content)
- Sections: Hero (dark green), Our Mission (3-column cards), How It Works (2-column: buyers/sellers), FAQ
- Icons: Leaf, Heart, Globe, Users, ShieldCheck, Sparkles, ArrowRight
- FAQ items as card layout with Q/A format
- CTA: "Start Selling Today" → `/sell`
