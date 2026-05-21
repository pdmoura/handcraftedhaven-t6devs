# Issue 14 — Product & Review Server Actions

**Labels:** `feature`, `backend` | **Priority:** 🟡 High | **Depends on:** Issue 04

## Checklist
- [ ] Create `src/lib/actions/products.js`
- [ ] Create `src/lib/actions/reviews.js`

## Files to Create

### File 1 — `src/lib/actions/products.js`

```js
'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export async function createProductAction(data) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'seller') {
      return { success: false, error: 'Unauthorized' };
    }

    const { title, description, price, categoryId, tags, inventoryQty, images, status } = data;

    if (!title || !description || !price || !categoryId) {
      return { success: false, error: 'Title, description, price, and category are required' };
    }

    // Generate unique slug
    let slug = slugify(title);
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const product = await prisma.product.create({
      data: {
        sellerId: session.id,
        categoryId: parseInt(categoryId),
        title,
        slug,
        description,
        price: parseFloat(price),
        inventoryQty: parseInt(inventoryQty) || 0,
        tags: tags || [],
        status: status || 'active',
        images: images?.length
          ? {
              create: images.map((img, i) => ({
                url: img.url,
                publicId: img.publicId || null,
                displayOrder: i,
                isPrimary: i === 0,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        category: true,
        seller: { select: { id: true, name: true } },
      },
    });

    revalidatePath('/shop');
    revalidatePath('/dashboard/products');
    return { success: true, data: product };
  } catch (error) {
    console.error('createProductAction error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function updateProductAction(id, data) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    const productId = parseInt(id);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.sellerId !== session.id) {
      return { success: false, error: 'Not found or unauthorized' };
    }

    const { title, description, price, categoryId, tags, inventoryQty, status, images } = data;

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(tags && { tags }),
        ...(inventoryQty !== undefined && { inventoryQty: parseInt(inventoryQty) }),
        ...(status && { status }),
      },
      include: {
        images: true,
        category: true,
      },
    });

    // Handle images if provided
    if (images) {
      await prisma.productImage.deleteMany({ where: { productId } });
      await prisma.productImage.createMany({
        data: images.map((img, i) => ({
          productId,
          url: img.url,
          publicId: img.publicId || null,
          displayOrder: i,
          isPrimary: i === 0,
        })),
      });
    }

    revalidatePath('/shop');
    revalidatePath(`/shop/${product.slug}`);
    revalidatePath('/dashboard/products');
    revalidatePath(`/dashboard/products/${productId}/edit`);
    return { success: true, data: updated };
  } catch (error) {
    console.error('updateProductAction error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function deleteProductAction(id) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    const productId = parseInt(id);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.sellerId !== session.id) {
      return { success: false, error: 'Not found or unauthorized' };
    }

    await prisma.product.delete({ where: { id: productId } });

    revalidatePath('/shop');
    revalidatePath('/dashboard/products');
    return { success: true, message: 'Product deleted' };
  } catch (error) {
    console.error('deleteProductAction error:', error);
    return { success: false, error: 'Internal server error' };
  }
}
```

---

### File 2 — `src/lib/actions/reviews.js`

```js
'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createReviewAction(data) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Must be logged in to review' };
    }

    const { productId, rating, comment, orderItemId } = data;

    if (!productId || !rating || !comment || !orderItemId) {
      return {
        success: false,
        error: 'Product ID, order item ID, rating, and comment are required',
      };
    }

    if (rating < 1 || rating > 5) {
      return {
        success: false,
        error: 'Rating must be between 1 and 5',
      };
    }

    // Verify the order item belongs to the user and hasn't been reviewed
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: parseInt(orderItemId) },
      include: { order: true, review: true },
    });

    if (!orderItem || orderItem.order.userId !== session.id || orderItem.productId !== parseInt(productId)) {
      return {
        success: false,
        error: 'Invalid order item or unauthorized',
      };
    }

    if (orderItem.review) {
      return {
        success: false,
        error: 'You have already reviewed this specific purchase',
      };
    }

    // Check that user isn't reviewing own product
    const product = await prisma.product.findUnique({ where: { id: parseInt(productId) } });
    if (product?.sellerId === session.id) {
      return {
        success: false,
        error: 'You cannot review your own product',
      };
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        productId: parseInt(productId),
        userId: session.id,
        orderItemId: parseInt(orderItemId),
        rating: parseInt(rating),
        comment,
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Update product avg rating
    const stats = await prisma.review.aggregate({
      where: { productId: parseInt(productId) },
      _avg: { rating: true },
      _count: true,
    });

    await prisma.product.update({
      where: { id: parseInt(productId) },
      data: {
        avgRating: stats._avg.rating || 0,
        reviewCount: stats._count,
      },
    });

    revalidatePath('/account');
    revalidatePath(`/shop/${product?.slug}`);
    return { success: true, data: review };
  } catch (error) {
    console.error('createReviewAction error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function replyToReviewAction(reviewId, sellerReply) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    const rId = parseInt(reviewId, 10);
    if (isNaN(rId)) {
      return { success: false, error: 'Invalid review ID' };
    }

    if (sellerReply === undefined) {
      return { success: false, error: 'sellerReply is required' };
    }

    // Check if review exists and get the product's seller ID
    const review = await prisma.review.findUnique({
      where: { id: rId },
      include: { product: true },
    });

    if (!review) {
      return { success: false, error: 'Review not found' };
    }

    if (review.product.sellerId !== session.id) {
      return { success: false, error: 'Forbidden. Only the seller can reply to this review.' };
    }

    const updatedReview = await prisma.review.update({
      where: { id: rId },
      data: {
        sellerReply: sellerReply === '' ? null : sellerReply,
        sellerReplyAt: sellerReply === '' ? null : new Date(),
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    revalidatePath(`/shop/${review.product.slug}`);
    return { success: true, data: updatedReview };
  } catch (error) {
    console.error('replyToReviewAction error:', error);
    return { success: false, error: 'Internal server error' };
  }
}
```
