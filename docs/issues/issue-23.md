# Issue 23 — Dashboard Layout & Overview

**Labels:** `feature`, `frontend` | **Priority:** 🟡 High | **Depends on:** Issues 06, 07, 14

## Checklist
- [ ] Create `src/app/dashboard/layout.jsx`
- [ ] Create `src/app/dashboard/page.jsx`

## Files to Create

### File 1 — `src/app/dashboard/layout.jsx`

```jsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, User } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  return (
    <div className="container-app py-6 pb-28 lg:pb-16">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-card p-5 sticky top-24 min-h-[calc(100vh-8rem)] flex flex-col border border-border-light">
            <h3 className="font-display text-xs text-text-muted uppercase tracking-widest mb-6 px-2">Seller Hub</h3>
            <nav className="flex lg:flex-col gap-2 flex-1" aria-label="Dashboard navigation">
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                return (
                  <Link key={href} href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm whitespace-nowrap transition-all ${isActive ? 'bg-primary/5 text-primary font-bold shadow-sm' : 'text-text-muted hover:bg-surface hover:text-text'}`}>
                    <Icon size={18} className={isActive ? 'text-primary' : ''} />{label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Mobile Bottom Tab Bar */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border-light z-50 px-2 py-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]" aria-label="Mobile navigation">
          <div className="flex justify-around items-center">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
              return (
                <Link key={href} href={href} className={`flex flex-col items-center justify-center gap-1 w-full p-2 rounded-xl transition-colors ${isActive ? 'text-primary' : 'text-text-muted'}`}>
                  <div className={`p-1.5 rounded-full ${isActive ? 'bg-primary/10' : ''}`}>
                    <Icon size={20} className={isActive ? 'text-primary' : 'text-text-muted'} />
                  </div>
                  <span className={`font-ui text-[10px] uppercase font-bold tracking-wider ${isActive ? 'text-primary' : 'text-text-muted'}`}>{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
```

---

### File 2 — `src/app/dashboard/page.jsx`

```jsx
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Package, ShoppingCart, Star, DollarSign, Plus } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session || session.role !== 'seller') redirect('/');

  const [productCount, orderItems, reviewStats] = await Promise.all([
    prisma.product.count({ where: { sellerId: session.id } }),
    prisma.orderItem.findMany({ where: { product: { sellerId: session.id } }, select: { quantity: true, unitPrice: true } }),
    prisma.product.aggregate({ where: { sellerId: session.id }, _avg: { avgRating: true } }),
  ]);

  const totalOrders = orderItems.length;
  const totalRevenue = orderItems.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
  const avgRating = reviewStats._avg.avgRating || 0;

  const stats = [
    { icon: Package, label: 'Products', value: productCount, color: 'bg-accent/10 text-accent' },
    { icon: ShoppingCart, label: 'Orders', value: totalOrders, color: 'bg-success-light text-success' },
    { icon: Star, label: 'Avg Rating', value: avgRating.toFixed(1), color: 'bg-warning-light text-warning' },
    { icon: DollarSign, label: 'Revenue', value: formatPrice(totalRevenue), color: 'bg-cta/10 text-cta' },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-primary uppercase">Dashboard</h1>
          <p className="font-body text-text-muted text-sm mt-1">Welcome back, {session.name}!</p>
        </div>
        <Link href="/dashboard/products/new"><Button className="w-full sm:w-auto"><Plus size={18} /> Add Product</Button></Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 stagger-children">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-card p-5">
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}><Icon size={20} /></div>
            <p className="font-body font-bold text-2xl text-text">{value}</p>
            <p className="font-ui text-xs text-text-muted">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```
