'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount, onOpenCart }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#07223A]/90 backdrop-blur-md border-b border-aqua/20">
      <div className="wrap flex items-center justify-between h-[66px]">
        {/* Brand Logo */}
        <Link href="#top" className="flex items-center gap-2">
          <Image
            src="/brand-assets/TF_Wordmark_C.png"
            alt="Triple Fins Swim Program"
            width={180}
            height={30}
            className="h-[30px] w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-7">
          <Link
            href="#program"
            className="font-display font-semibold uppercase tracking-wider text-[#CFE6EC] text-[0.96rem] hover:text-aqua transition-colors relative py-1"
          >
            Programs
          </Link>
          <Link
            href="#shop"
            className="font-display font-semibold uppercase tracking-wider text-[#CFE6EC] text-[0.96rem] hover:text-aqua transition-colors relative py-1"
          >
            Store
          </Link>
          <Link
            href="#about"
            className="font-display font-semibold uppercase tracking-wider text-[#CFE6EC] text-[0.96rem] hover:text-aqua transition-colors relative py-1"
          >
            About
          </Link>
          <Link
            href="#contact"
            className="font-display font-semibold uppercase tracking-wider text-[#CFE6EC] text-[0.96rem] hover:text-aqua transition-colors relative py-1"
          >
            Contact
          </Link>

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            aria-label="Open Shopping Cart"
            className="relative bg-sun text-ink border-0 cursor-pointer font-display font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-sm inline-flex items-center gap-2 hover:brightness-105 transition-all"
          >
            <span>Cart</span>
            <span className="bg-deep text-white rounded-full min-w-[20px] h-[20px] inline-flex items-center justify-center text-xs px-1.5">
              {cartCount}
            </span>
          </button>
        </div>

        {/* Mobile Buttons */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={onOpenCart}
            aria-label="Open Shopping Cart"
            className="bg-sun text-ink font-display font-bold uppercase tracking-wider px-3 py-1 rounded-sm inline-flex items-center gap-1.5 text-sm"
          >
            <span>Cart</span>
            <span className="bg-deep text-white rounded-full min-w-[18px] h-[18px] inline-flex items-center justify-center text-[10px] px-1">
              {cartCount}
            </span>
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            className="p-2 text-[#CFE6EC] focus:outline-none"
          >
            <div className="w-6 flex flex-col gap-1">
              <span
                className={`block h-0.5 bg-[#CFE6EC] transition-transform ${
                  menuOpen ? 'rotate-45 translate-y-1.5' : ''
                }`}
              />
              <span
                className={`block h-0.5 bg-[#CFE6EC] transition-opacity ${
                  menuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block h-0.5 bg-[#CFE6EC] transition-transform ${
                  menuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div className="md:hidden bg-deep2/95 border-b border-aqua/20 px-6 py-5 flex flex-col gap-4">
          <Link
            href="#program"
            onClick={() => setMenuOpen(false)}
            className="font-display font-semibold uppercase tracking-wider text-[#CFE6EC] text-lg hover:text-aqua"
          >
            Programs
          </Link>
          <Link
            href="#shop"
            onClick={() => setMenuOpen(false)}
            className="font-display font-semibold uppercase tracking-wider text-[#CFE6EC] text-lg hover:text-aqua"
          >
            Store
          </Link>
          <Link
            href="#about"
            onClick={() => setMenuOpen(false)}
            className="font-display font-semibold uppercase tracking-wider text-[#CFE6EC] text-lg hover:text-aqua"
          >
            About
          </Link>
          <Link
            href="#contact"
            onClick={() => setMenuOpen(false)}
            className="font-display font-semibold uppercase tracking-wider text-[#CFE6EC] text-lg hover:text-aqua"
          >
            Contact
          </Link>
        </div>
      )}
    </nav>
  );
};
