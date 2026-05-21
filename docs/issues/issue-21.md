# Issue 21 — Cart & Checkout Pages

**Labels:** `feature`, `frontend` | **Priority:** 🟡 High | **Depends on:** Issues 06, 07, 15

## Checklist
- [ ] Create `src/app/cart/page.jsx`
- [ ] Create `src/app/checkout/page.jsx`

## Files to Create

### File 1 — `src/app/cart/page.jsx`

```jsx
'use client';

import Image from 'next/image';
import { useCart } from '@/components/providers/CartProvider';
import QuantitySelector from '@/components/ui/QuantitySelector';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { PageLoader } from '@/components/ui/LoadingSpinner';

export default function CartPage() {
  const { items, count, total, isLoading, updateQuantity, removeItem } = useCart();

  if (isLoading) return <PageLoader />;

  return (
    <div className="container-app py-4">
      <Breadcrumb items={[{ label: 'Cart' }]} />
      <h1 className="font-display text-3xl text-primary uppercase mb-8">Shopping Cart</h1>

      {items.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="Your Cart is Empty" description="Explore our shop to find unique handcrafted treasures!" actionLabel="Start Shopping" actionHref="/shop" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-16">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const product = item.product;
              if (!product) return null;
              const imgUrl = product.images?.[0]?.url || '/images/placeholder-product.jpg';
              return (
                <div key={item.id} className="flex gap-4 bg-white rounded-xl p-4 shadow-card">
                  <Link href={`/shop/${product.slug}`} className="shrink-0">
                    <Image src={imgUrl} alt={product.title} width={96} height={96} className="w-24 h-24 object-cover rounded-lg" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/shop/${product.slug}`} className="font-body font-semibold text-text hover:text-primary transition-colors line-clamp-1">{product.title}</Link>
                    <p className="font-body font-bold text-primary mt-2">{formatPrice(product.price)}</p>
                    <div className="flex items-center justify-between mt-3">
                      <QuantitySelector quantity={item.quantity} onChange={(qty) => updateQuantity(item.id, qty)} max={product.inventoryQty} />
                      <button onClick={() => removeItem(item.id)} className="p-2 text-text-muted hover:text-error transition-colors" aria-label="Remove item"><Trash2 size={18} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div>
            <div className="bg-white rounded-xl shadow-card p-6 sticky top-20">
              <h2 className="font-display text-xl text-primary uppercase mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between font-body text-sm"><span className="text-text-muted">Subtotal</span><span className="font-semibold">{formatPrice(total)}</span></div>
                <div className="flex justify-between font-body text-sm"><span className="text-text-muted">Shipping</span><span className="text-success">Free</span></div>
                <hr className="border-border-light" />
                <div className="flex justify-between font-body text-lg"><span className="font-semibold">Total</span><span className="font-bold text-primary">{formatPrice(total)}</span></div>
              </div>
              <div className="space-y-3 mt-4">
                <Link href="/checkout" className="block"><Button className="w-full" size="lg">Checkout <ArrowRight size={18} /></Button></Link>
                <Link href="/shop" className="block"><Button variant="outline" className="w-full" size="lg">Continue Shopping</Button></Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### File 2 — `src/app/checkout/page.jsx`

> This is a 136-line client component. Copy the full file from the reference repo: `src/app/checkout/page.jsx`

Key implementation (see reference repo for exact code):
- `'use client'` directive
- Uses `useCart()` for items, total, clearCart; `useToast()` for notifications
- State: `form` (fullName, address, city, state, zipCode, country), `isSubmitting`, `orderPlaced`
- Redirects to `/cart` if cart is empty (and not just placed)
- Shipping address form with 6 fields (2-column layout for city/state and zip/country)
- "This is a demo checkout" notice
- Calls `createOrderAction(form)` on submit
- On success: clears cart, sets `orderPlaced`, shows success toast
- Success state: CheckCircle icon, "Order Confirmed!" title, View Orders / Continue Shopping buttons
- Order summary sidebar: item list with title × qty and line totals, total at bottom
