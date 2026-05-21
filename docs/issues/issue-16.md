# Issue 16 — API Routes (Products, Categories, Sellers)

**Labels:** `feature`, `backend` | **Priority:** 🟡 High | **Depends on:** Issue 04

## Checklist
- [ ] Create `src/app/api/products/route.js`
- [ ] Create `src/app/api/products/[id]/route.js`
- [ ] Create `src/app/api/categories/route.js`
- [ ] Create `src/app/api/sellers/[id]/route.js`

## Files to Create

### File 1 — `src/app/api/products/route.js`

> Public GET endpoint for the product listing page. Supports pagination, search, filtering, and sorting.

```js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minRating = searchParams.get('minRating');
    const sellerId = searchParams.get('sellerId');

    // Build where clause
    const where = { status: 'active' };

    if (category) {
      where.category = { slug: category };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } },
      ];
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price).gte = parseFloat(minPrice);
      if (maxPrice) (where.price).lte = parseFloat(maxPrice);
    }
    if (minRating) {
      where.avgRating = { gte: parseFloat(minRating) };
    }
    if (sellerId) {
      where.sellerId = parseInt(sellerId);
    }

    // Build orderBy
    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'rating') orderBy = { avgRating: 'desc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          images: { orderBy: { displayOrder: 'asc' }, take: 1 },
          seller: { select: { id: true, name: true, avatarUrl: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
```

---

### File 2 — `src/app/api/products/[id]/route.js`

```js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request,
  { params }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        seller: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            bio: true,
            location: true,
          },
        },
        category: true,
        reviews: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Product GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
```

---

### File 3 — `src/app/api/categories/route.js`

```js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: { where: { status: 'active' } } } } },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Categories GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
```

---

### File 4 — `src/app/api/sellers/[id]/route.js`

```js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request,
  { params }
) {
  try {
    const { id } = await params;
    const seller = await prisma.user.findUnique({
      where: { id: parseInt(id), role: 'seller' },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        bio: true,
        location: true,
        socialLinks: true,
        createdAt: true,
        products: {
          where: { status: 'active' },
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            category: { select: { name: true, slug: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!seller) {
      return NextResponse.json({ success: false, error: 'Seller not found' }, { status: 404 });
    }

    // Calculate stats
    const stats = await prisma.product.aggregate({
      where: { sellerId: parseInt(id), status: 'active' },
      _avg: { avgRating: true },
      _count: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...seller,
        stats: {
          totalProducts: stats._count,
          avgRating: stats._avg.avgRating || 0,
        },
      },
    });
  } catch (error) {
    console.error('Seller GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
```
