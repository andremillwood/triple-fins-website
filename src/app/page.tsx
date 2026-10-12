'use client';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { Programs } from '@/components/Programs';
import { Shop } from '@/components/Shop';
import { About } from '@/components/About';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { RegistrationForm } from '@/components/RegistrationForm';
import { useCart } from '@/components/CartProvider';
export default function Home() {
  const { cart } = useCart(); const router = useRouter();
  return <><Navbar cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} onOpenCart={() => router.push('/cart')} /><main id="main-content" className="min-h-screen bg-paper"><Hero /><Shop featured /><Programs /><RegistrationForm /><About /><Contact /></main><Footer /></>;
}
