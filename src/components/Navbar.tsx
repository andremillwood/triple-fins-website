'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ShoppingBag, Menu, X, ArrowUpRight } from 'lucide-react';
const categories = [['Team tees','t-shirt'],['Polos','polo'],['Tracksuits','tracksuit'],['Outerwear','outerwear'],['Bags & gear','bags']];
export function Navbar({ cartCount, onOpenCart }: { cartCount: number; onOpenCart: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  return <header className="store-header">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <div className="announcement"><span>From the pool to everywhere. Wear your team spirit.</span><Link href="/#program">Train with Triple Fins <ArrowUpRight size={13} aria-hidden="true" /></Link></div>
    <nav aria-label="Main navigation" className="retail-nav">
      <div className="retail-nav-inner">
        <Link href="/" aria-label="Triple Fins home" className="retail-logo flex items-center gap-2"><Image src="/brand-assets/TF_Logo_Dark.png" alt="" width={38} height={38} priority className="h-9 w-9 object-contain" /><span className="font-display font-extrabold uppercase text-deep text-2xl leading-none">Triple Fins<span className="block text-[9px] font-body tracking-[.18em] mt-1">SWIM / TEAM / LIFE</span></span></Link>
        <div className="retail-desktop-links">
          <Link href="/shop">Shop all</Link>
          <details className="collection-menu"><summary>Collections <span aria-hidden="true">⌄</span></summary><div className="collection-dropdown"><div><p className="eyebrow">Find your lane</p><Link href="/shop?collection=athlete">Athletes & teamwear</Link><Link href="/shop?collection=supporter">Supporter collection</Link><Link href="/shop?collection=everyday">Everyday gear</Link></div><div><p className="eyebrow">Shop by category</p>{categories.map(([name, slug]) => <Link key={slug} href={`/shop/category/${slug}`}>{name}</Link>)}</div><div className="menu-story"><span className="eyebrow">One team. Many colours.</span><p>Made to represent.</p><Link href="/shop?search=hummingbird">Explore Hummingbird →</Link></div></div></details>
          <Link href="/shop/category/bags">Bags & gear</Link><Link href="/#program">Swim programmes</Link><Link href="/#about">Our story</Link>
        </div>
        <div className="retail-actions"><button onClick={() => setSearchOpen(!searchOpen)} aria-label="Search products" aria-expanded={searchOpen} aria-controls="product-search"><Search size={21} /></button><button onClick={onOpenCart} aria-label={`View cart, ${cartCount} items`}><ShoppingBag size={21} /><span className="cart-count">{cartCount}</span></button><button className="retail-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}>{menuOpen ? <X size={23} /> : <Menu size={23} />}</button></div>
      </div>
      {searchOpen && <form id="product-search" action="/shop" className="nav-search"><label htmlFor="nav-search-input">Find your next favourite</label><input id="nav-search-input" name="search" type="search" placeholder="Search tees, teamwear, bags…" autoFocus /><button type="submit" className="btn btn-deep">Search</button></form>}
      {menuOpen && <div id="mobile-navigation" className="mobile-retail-menu" onClick={() => setMenuOpen(false)}><Link href="/shop">Shop all products</Link>{categories.map(([name, slug]) => <Link key={slug} href={`/shop/category/${slug}`}>{name}</Link>)}<Link href="/shop?collection=supporter">Supporter collection</Link><Link href="/#program">Swim programmes</Link><Link href="/#about">Our story</Link><Link href="/#contact">Contact & help</Link></div>}
    </nav>
  </header>;
}
