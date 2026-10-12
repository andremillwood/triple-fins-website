'use client';
import { useRouter } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useCart } from './CartProvider';
export function StoreShell({ children }: { children: React.ReactNode }) {
  const { cart } = useCart(); const router = useRouter();
  return <><Navbar cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} onOpenCart={() => router.push('/cart')} /><main id="main-content" className="min-h-[70vh]">{children}</main><Footer /></>;
}
