# Issue 19 — Product Detail Page

**Labels:** `feature`, `frontend` | **Priority:** 🟡 High | **Depends on:** Issues 07, 08, 14

## Checklist
- [ ] Create `src/app/shop/[slug]/page.jsx`
- [ ] Create `src/app/shop/[slug]/ProductGallery.jsx`
- [ ] Create `src/app/shop/[slug]/AddToCartButton.jsx`
- [ ] Create `src/app/shop/[slug]/ReviewSection.jsx`

## Files to Create

### File 1 — `src/app/shop/[slug]/page.jsx`

> This is a 252-line server component. Copy the full file from the reference repo: `src/app/shop/[slug]/page.jsx`

Key implementation (see reference repo for exact code):
- Server component with `generateMetadata` for SEO + Open Graph + Twitter cards
- JSON-LD structured data for product schema
- Fetches product by slug with images, seller, category, reviews
- Two-column grid: `<ProductGallery>` (left) + info (right)
- Info: category badge, title, star rating, stock status, price, description, `<AddToCartButton>`, trust badges, seller card, tags
- `<ReviewSection>` at the bottom

---

### File 2 — `src/app/shop/[slug]/ProductGallery.jsx`

```jsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ProductGallery({ images, title }) {
  // Find the primary image or default to the first image
  const defaultImage = images.find((img) => img.isPrimary) || images[0];
  const [selectedImage, setSelectedImage] = useState(defaultImage);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square bg-white rounded-xl overflow-hidden shadow-card relative group">
        <Image
          src={selectedImage?.url || '/images/placeholder-product.jpg'}
          alt={title}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img) => (
            <div
              key={img.id}
              onClick={() => setSelectedImage(img)}
              className={`relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                img.id === selectedImage?.id
                  ? 'border-cta opacity-100'
                  : 'border-transparent hover:border-border opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={img.url}
                alt={`Thumbnail for ${title}`}
                fill
                sizes="80px"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### File 3 — `src/app/shop/[slug]/AddToCartButton.jsx`

```jsx
'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import Button from '@/components/ui/Button';
import QuantitySelector from '@/components/ui/QuantitySelector';
import { useCart } from '@/components/providers/CartProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { useRouter } from 'next/navigation';

export default function AddToCartButton({ productId, maxQty, disabled }) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { addItem } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setIsLoading(true);
    const result = await addItem(productId, quantity);
    setIsLoading(false);

    if (result.success) {
      showToast('Added to cart!', 'success');
    } else {
      showToast(result.error || 'Failed to add to cart', 'error');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <QuantitySelector
        quantity={quantity}
        onChange={setQuantity}
        max={maxQty}
        disabled={disabled}
      />
      <Button
        onClick={handleAddToCart}
        isLoading={isLoading}
        disabled={disabled}
        size="lg"
        className="w-full sm:w-auto"
      >
        <ShoppingCart size={18} />
        {disabled ? 'Out of Stock' : 'Add to Cart'}
      </Button>
    </div>
  );
}
```

---

### File 4 — `src/app/shop/[slug]/ReviewSection.jsx`

> This is a 209-line client component. Copy the full file from the reference repo: `src/app/shop/[slug]/ReviewSection.jsx`

Key implementation (see reference repo for exact code):
- `'use client'` directive
- Imports: `useState`, `Image`, `StarRating`, `Button`, `useAuth`, `useToast`, `formatDate`, `MessageSquare`, `Link`, `replyToReviewAction`
- Props: `productId`, `sellerId`, `reviews` (initial), `avgRating`, `reviewCount`
- Seller reply state management: `replyingTo`, `replyText`, `isSubmittingReply`
- Shows aggregate rating with StarRating component
- Sign-in prompt for unauthenticated users, "Go to My Orders" link for authenticated
- Reviews list: user avatar, name, date, rating, comment
- Seller reply display with border-left accent
- Seller reply form with textarea and Save/Cancel buttons
- Delete reply support (submits empty string)
