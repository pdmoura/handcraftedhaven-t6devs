# Issue 06 — Context Providers (Auth, Toast, Cart)

**Labels:** `feature`, `frontend` | **Priority:** 🔴 Critical | **Depends on:** Issues 04, 12

## Checklist
- [ ] Create `src/components/providers/AuthProvider.jsx`
- [ ] Create `src/components/providers/ToastProvider.jsx`
- [ ] Create `src/components/providers/CartProvider.jsx`

> ⚠️ All three files must use the `'use client'` directive at the top.

## Files to Create

### File 1 — `src/components/providers/AuthProvider.jsx`

```jsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUserAction, loginAction, registerAction, logoutAction } from '@/lib/actions/auth';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await getCurrentUserAction();
      if (data.success) {
        setUser(data.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email, password) => {
    try {
      const data = await loginAction(email, password);
      if (data.success) {
        setUser(data.data);
        return { success: true };
      }
      return { success: false, error: data.error || 'Login failed' };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const data = await registerAction(name, email, password, role);
      if (data.success) {
        setUser(data.data);
        return { success: true };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await logoutAction();
    } finally {
      setUser(null);
    }
  };


  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

---

### File 2 — `src/components/providers/ToastProvider.jsx`

```jsx
'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { X } from 'lucide-react';

const ToastContext = createContext(undefined);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type= 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const typeStyles = {
    success: 'bg-success text-white',
    error: 'bg-error text-white',
    info: 'bg-accent text-white',
    warning: 'bg-warning text-white',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-3"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${typeStyles[toast.type]} animate-fade-in-up flex items-center gap-3 rounded-lg px-5 py-3 font-ui text-sm shadow-dropdown min-w-[280px] max-w-[420px]`}
            role="alert"
          >
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 rounded-full p-1 hover:bg-white/20 transition-colors"
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
```

---

### File 3 — `src/components/providers/CartProvider.jsx`

```jsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import { getCartAction, addToCartAction, updateCartQuantityAction, removeCartItemAction } from '@/lib/actions/cart';

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => {
    const price = item.product ? Number(item.product.price) : 0;
    return sum + price * item.quantity;
  }, 0);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getCartAction();
      if (data.success) {
        setItems(data.data || []);
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = async (productId, quantity = 1) => {
    try {
      const data = await addToCartAction(productId, quantity);
      if (data.success) {
        await refreshCart();
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to add item' };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    // Optimistic update
    setItems((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
    try {
      await updateCartQuantityAction(cartItemId, quantity);
    } catch {
      refreshCart();
    }
  };

  const removeItem = async (cartItemId) => {
    // Optimistic update
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));
    try {
      await removeCartItemAction(cartItemId);
    } catch {
      refreshCart();
    }
  };


  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{ items, count, total, isLoading, addItem, updateQuantity, removeItem, clearCart, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
```
