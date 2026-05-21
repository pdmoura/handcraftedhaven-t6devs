# Issue 15 — Cart & Order Server Actions

**Labels:** `feature`, `backend` | **Priority:** 🟡 High | **Depends on:** Issue 04

## Checklist
- [ ] Create `src/lib/actions/cart.js`
- [ ] Create `src/lib/actions/orders.js`

## Files to Create

### File 1 — `src/lib/actions/cart.js`

```js
'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getCartAction() {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    const items = await prisma.cartItem.findMany({
      where: { userId: session.id },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            seller: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: items };
  } catch (error) {
    console.error('getCartAction error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function addToCartAction(productId, quantity = 1) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!productId) {
      return { success: false, error: 'Product ID is required' };
    }

    // Check product exists and is in stock
    const product = await prisma.product.findUnique({ where: { id: parseInt(productId) } });
    if (!product || product.status !== 'active') {
      return { success: false, error: 'Product not available' };
    }

    // Upsert cart item
    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId: session.id,
          productId: parseInt(productId),
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        userId: session.id,
        productId: parseInt(productId),
        quantity,
      },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
    });

    revalidatePath('/cart');
    return { success: true, data: cartItem };
  } catch (error) {
    console.error('addToCartAction error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function updateCartQuantityAction(cartItemId, quantity) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!quantity || quantity < 1) {
      return { success: false, error: 'Valid quantity is required' };
    }

    const cartItem = await prisma.cartItem.findUnique({ where: { id: parseInt(cartItemId) } });
    if (!cartItem || cartItem.userId !== session.id) {
      return { success: false, error: 'Not found' };
    }

    const updated = await prisma.cartItem.update({
      where: { id: parseInt(cartItemId) },
      data: { quantity },
    });

    revalidatePath('/cart');
    return { success: true, data: updated };
  } catch (error) {
    console.error('updateCartQuantityAction error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function removeCartItemAction(cartItemId) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    const cartItem = await prisma.cartItem.findUnique({ where: { id: parseInt(cartItemId) } });
    if (!cartItem || cartItem.userId !== session.id) {
      return { success: false, error: 'Not found' };
    }

    await prisma.cartItem.delete({ where: { id: parseInt(cartItemId) } });

    revalidatePath('/cart');
    return { success: true, message: 'Item removed' };
  } catch (error) {
    console.error('removeCartItemAction error:', error);
    return { success: false, error: 'Internal server error' };
  }
}
```

---

### File 2 — `src/lib/actions/orders.js`

```js
'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getOrdersAction() {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: orders };
  } catch (error) {
    console.error('getOrdersAction error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function createOrderAction(shippingAddress) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!shippingAddress) {
      return { success: false, error: 'Shipping address is required' };
    }

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    // Calculate total and validate stock
    let totalAmount = 0;
    for (const item of cartItems) {
      if (item.product.status !== 'active' || item.product.inventoryQty < item.quantity) {
        return {
          success: false,
          error: `${item.product.title} is out of stock or has insufficient quantity`,
        };
      }
      totalAmount += Number(item.product.price) * item.quantity;
    }

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: session.id,
          status: 'confirmed',
          totalAmount,
          shippingAddress,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: Number(item.product.price),
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  images: { where: { isPrimary: true }, take: 1 },
                },
              },
            },
          },
        },
      });

      // Update inventory
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            inventoryQty: { decrement: item.quantity },
          },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { userId: session.id } });

      return newOrder;
    });

    revalidatePath('/account');
    revalidatePath('/dashboard/products'); // in case inventory changed
    return { success: true, data: order };
  } catch (error) {
    console.error('createOrderAction error:', error);
    return { success: false, error: 'Internal server error' };
  }
}
```
