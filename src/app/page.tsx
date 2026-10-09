'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { Programs } from '@/components/Programs';
import { Shop } from '@/components/Shop';
import { About } from '@/components/About';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { RegistrationForm } from '@/components/RegistrationForm';
import { CartItem, Product } from '@/types';

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Hydrate cart from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tf_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCart(parsed.filter((item) => item.product?.id && Number.isInteger(item.quantity) && item.quantity > 0).map((item) => ({ ...item, index: item.product.id })));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save cart to localStorage when updated
  const updateCartState = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem('tf_cart', JSON.stringify(newCart));
    } catch {
      // ignore
    }
  };

  const handleAddToCart = (_index: number, product: Product) => {
    if (!product.id) return;
    const index = product.id;
    const existingIndex = cart.findIndex((item) => item.index === index);
    let updated: CartItem[];

    if (existingIndex > -1) {
      updated = cart.map((item, i) =>
        i === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updated = [...cart, { index, product, quantity: 1 }];
    }

    updateCartState(updated);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (index: string, delta: number) => {
    const updated = cart
      .map((item) => {
        if (item.index === index) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];

    updateCartState(updated);
  };

  const handleRemoveItem = (index: string) => {
    const updated = cart.filter((item) => item.index !== index);
    updateCartState(updated);
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <main className="min-h-screen flex flex-col bg-paper">
      {/* Navigation */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Hero Section */}
      <Hero />

      {/* Highlights & Training Programs */}
      <Programs />

      <RegistrationForm />

      {/* Merchandise Store */}
      <Shop onAddToCart={handleAddToCart} />

      {/* About & Mission */}
      <About />

      {/* Contact & Registration Form */}
      <Contact />

      {/* Footer */}
      <Footer />

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </main>
  );
}
