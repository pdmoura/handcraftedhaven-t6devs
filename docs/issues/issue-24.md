# Issue 24 — Dashboard Product Management

**Labels:** `feature`, `frontend` | **Priority:** 🟡 High | **Depends on:** Issues 07, 14, 23

## Checklist
- [ ] Create `src/app/dashboard/products/page.jsx`
- [ ] Create `src/app/dashboard/products/DeleteProductButton.jsx`
- [ ] Create `src/app/dashboard/products/new/page.jsx`
- [ ] Create `src/app/dashboard/products/[id]/edit/page.jsx`

## Files to Create

### File 1 — `src/app/dashboard/products/page.jsx`

> Copy the full 106-line file from the reference repo: `src/app/dashboard/products/page.jsx`

Key implementation:
- Server component, `export const dynamic = 'force-dynamic'`
- Verifies seller session, redirects to `/` if not seller
- Fetches seller's products with primary image and category
- **Mobile view:** Card list with image, title, price, category, status badge, edit/delete actions
- **Desktop view:** Table with Product, Category, Price, Stock, Status, Actions columns
- Empty state with "Add First Product" CTA
- Uses `<Badge>` with variant mapping: active=success, draft=default, sold_out=error

---

### File 2 — `src/app/dashboard/products/DeleteProductButton.jsx`

```jsx
'use client';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deleteProductAction } from '@/lib/actions/products';

export default function DeleteProductButton({ productId }) {
  const { showToast } = useToast();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const data = await deleteProductAction(productId);
      
      if (data.success) {
        showToast('Product deleted successfully', 'success');
        router.refresh();
      } else {
        showToast(data.error || 'Failed to delete product', 'error');
      }
    } catch {
      showToast('Network error while deleting product', 'error');
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center gap-1 text-error/80 hover:text-error font-ui text-sm transition-colors disabled:opacity-50"
      aria-label="Delete Product"
    >
      <Trash2 size={14} /> Delete
    </button>
  );
}
```

---

### File 3 — `src/app/dashboard/products/new/page.jsx`

> Copy the full 96-line file from the reference repo: `src/app/dashboard/products/new/page.jsx`

Key implementation:
- `'use client'` directive
- Form fields: Title, Description, Price, Inventory Qty, Category (fetched from `/api/categories`), Status, Tags, Images
- Image upload via `<CloudinaryUploadButton>` with preview thumbnails and remove button
- Calls `createProductAction()` on submit
- Redirects to `/dashboard/products` on success

---

### File 4 — `src/app/dashboard/products/[id]/edit/page.jsx`

> Similar to the "new" page but pre-filled with existing product data.

Key implementation:
- `'use client'` directive
- Fetches product data from `/api/products/[id]` on mount
- Pre-fills all form fields with existing data
- Calls `updateProductAction(id, data)` on submit
- Same UI as new product page with "Save Changes" instead of "Save Product"
