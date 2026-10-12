'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { canOrder, mapProduct, validSelection } from '@/lib/catalogue';
import { CartItem, Product } from '@/types';

const Context = createContext<{ cart: CartItem[]; ready: boolean; add: (product: Product, size?: string, quantity?: number) => void; update: (key: string, delta: number) => void; remove: (key: string) => void; clear: () => void } | null>(null);
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function restore() {
      let saved: CartItem[] = [];
      try {
        const value = JSON.parse(localStorage.getItem('tf_cart') || '[]');
        if (Array.isArray(value)) saved = value.filter(item => item.product?.id && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 20);
      } catch { /* Ignore corrupt storage. */ }
      // Never trust cached prices or cached approvals, including carts from older releases.
      try {
        const response = await fetch('/api/products', { cache: 'no-store' });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error('Unavailable');
        const products: Product[] = result.data.map(mapProduct);
        saved = saved.map(item => {
          const product = products.find(p => p.id === item.product.id);
          return { ...item, product: product ? { ...product, orderable: canOrder(product) && validSelection(product, item.size) } : { ...item.product, p: null, orderable: false } };
        });
      } catch { saved = saved.map(item => ({ ...item, product: { ...item.product, p: null, orderable: false } })); }
      if (!cancelled) { setCart(saved); setReady(true); }
    }
    restore();
    return () => { cancelled = true; };
  }, []);
  useEffect(() => { if (ready) { try { localStorage.setItem('tf_cart', JSON.stringify(cart)); } catch { /* Cart still works in memory. */ } } }, [cart, ready]);
  return <Context.Provider value={{ cart, ready,
    add: (product, size = '', quantity = 1) => {
      if (!canOrder(product) || !validSelection(product, size) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) return;
      const index = `${product.id}:${size}`;
      setCart(current => current.some(item => item.index === index) ? current.map(item => item.index === index ? { ...item, quantity: Math.min(20, item.quantity + quantity) } : item) : [...current, { index, product, size, quantity: Math.min(20, quantity) }]);
    },
    update: (key, delta) => setCart(current => current.map(item => item.index === key ? { ...item, quantity: Math.min(20, item.quantity + delta) } : item).filter(item => item.quantity > 0)),
    remove: key => setCart(current => current.filter(item => item.index !== key)), clear: () => {
      // Persist before checkout navigates away; an effect may not run in time.
      try { localStorage.setItem('tf_cart', '[]'); } catch { /* Memory cart still clears. */ }
      setCart([]);
    },
  }}>{children}</Context.Provider>;
}
export function useCart() { const value = useContext(Context); if (!value) throw new Error('Cart provider missing'); return value; }
