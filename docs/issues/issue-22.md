# Issue 22 — Account Page

**Labels:** `feature`, `frontend` | **Priority:** 🟢 Medium | **Depends on:** Issues 06, 07, 14, 15

## Checklist
- [ ] Create `src/app/account/page.jsx`

## File to Create

### `src/app/account/page.jsx`

> This is a 270-line client component. Copy the full file from the reference repo: `src/app/account/page.jsx`

Key implementation (see reference repo for exact code):
- `'use client'` directive
- Imports: `Image`, `useAuth`, `useToast`, `useEffect`, `useState`, `formatPrice`, `formatDate`, `Badge`, `PageLoader`, `EmptyState`, icons (Package, Upload, Trash2, AlertTriangle, X), `Button`, `CloudinaryUploadButton`, `Link`
- Server action imports: `updateProfileAction`, `deleteAccountAction`, `getOrdersAction`
- **State:** orders, loadingOrders, name, email, avatarUrl, isSaving, showDeleteModal, isDeleting
- **useEffect:** On user load, sets form fields and fetches orders via `getOrdersAction()`
- **Layout:** 3-column grid — 1 col profile, 2 cols orders
- **Profile card:** Avatar with hover overlay for upload, CloudinaryUploadButton integration, name/email inputs, Save button, Danger Zone with delete button
- **Orders list:** Cards linking to `/account/orders/{id}`, showing order ID, status badge, date, total
- Status badge variants: delivered=success, confirmed=accent, shipped=warning, default
- **Delete modal:** Confirmation dialog with seller warning, Cancel/Delete buttons
- `handleDeleteAccount()` calls `deleteAccountAction()` then hard redirects to `/`

> ⚠️ This component uses `CloudinaryUploadButton`. If you don't have Cloudinary set up yet, you can create a placeholder component that renders nothing, and implement it in a future issue.
