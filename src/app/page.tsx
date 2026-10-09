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
  return <main className="min-h-screen flex flex-col bg-paper"><Navbar cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} onOpenCart={() => router.push('/cart')} /><Hero /><Programs /><RegistrationForm /><Shop /><About /><Contact /><Footer /></main>;
}
