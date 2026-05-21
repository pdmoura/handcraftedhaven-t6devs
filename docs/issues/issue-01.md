# Issue 01 — Initialize Next.js & Clean Boilerplate

**Labels:** `setup` | **Priority:** 🔴 Critical (blocks everything)

## Description
As a developer, I need to create the Next.js project from scratch and remove the default boilerplate so the team has a clean foundation.

## Checklist
- [ ] Run `pnpm create next-app@latest ./`
- [ ] Delete all default boilerplate files
- [ ] Create the entire folder structure
- [ ] Verify `pnpm dev` works
- [ ] Push to `main`

## Instructions

### 1. Initialize the project
```bash
pnpm create next-app@latest ./
```
When prompted, select:
- ✅ JavaScript (not TypeScript)
- ✅ ESLint
- ✅ Tailwind CSS
- ✅ Use `src/` directory
- ✅ App Router
- ✅ Import alias `@/*`

### 2. Delete default boilerplate files
```powershell
Remove-Item -Force public/file.svg, public/globe.svg, public/next.svg, public/vercel.svg, public/window.svg -ErrorAction SilentlyContinue
Remove-Item -Force src/app/page.module.css -ErrorAction SilentlyContinue
```

### 3. Create the required folder structure
```powershell
mkdir src/components/ui ; mkdir src/components/providers
mkdir src/lib/actions ; mkdir src/types
mkdir "src/app/(home)" ; mkdir src/app/about ; mkdir src/app/account
mkdir src/app/api/categories ; mkdir src/app/api/products/[id] ; mkdir src/app/api/sellers/[id]
mkdir src/app/auth/login ; mkdir src/app/auth/register
mkdir src/app/cart ; mkdir src/app/categories ; mkdir src/app/checkout
mkdir src/app/dashboard/products/new ; mkdir "src/app/dashboard/products/[id]/edit"
mkdir src/app/dashboard/profile ; mkdir src/app/sell
mkdir "src/app/seller/[id]" ; mkdir "src/app/shop/[slug]"
```

### 4. Replace `src/app/page.jsx` with a clean placeholder
```jsx
export default function Home() {
  return (
    <main>
      <h1>Handcrafted Haven</h1>
    </main>
  );
}
```

### 5. Verify it runs
```bash
pnpm dev
```
Open `http://localhost:3000` — you should see "Handcrafted Haven".
