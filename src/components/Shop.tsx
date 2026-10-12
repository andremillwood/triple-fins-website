'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ArrowUpRight, SlidersHorizontal, Plus } from 'lucide-react';
import { Product } from '@/types';
import { canOrder, categorySlug, mapProduct, money } from '@/lib/catalogue';
import { browseProducts } from '@/lib/storefront';
import { useCart } from './CartProvider';
export function useCatalogue() {
  const [products, setProducts] = useState<Product[]>([]); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  useEffect(() => { const controller = new AbortController(); fetch('/api/products', { signal: controller.signal }).then(async response => {
    const result = await response.json(); if (!response.ok || !result.success) throw new Error('The store could not load. Please refresh or contact us.');
    setProducts(result.data.map(mapProduct)); setLoading(false);
  }).catch(err => { if (err.name !== 'AbortError') { setError(err.message); setLoading(false); } }); return () => controller.abort(); }, []);
  return { products, loading, error };
}
export function ProductCard({ product }: { product: Product }) {
  const { add, ready } = useCart(); const [added, setAdded] = useState(false);
  const href = `/shop/${product.slug || product.id}`;
  return <article className="retail-product">
    <Link href={href} className="retail-product-visual"><Image src={product.images?.[0] || '/brand-assets/TF_Logo_Dark.png'} alt={product.n} fill sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,25vw" className="product-primary object-contain" />
      {!!product.images?.[1] && <Image src={product.images[1]} alt="" fill sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,25vw" className="product-alternate object-contain" />}
      <span className={'product-tag ' + (!canOrder(product) ? 'is-preview' : '')}>{!canOrder(product) ? 'Collection preview' : 'Shop the collection'}</span>
      <span className="product-view">Explore product <ArrowUpRight size={17} aria-hidden="true" /></span>
    </Link>
    <div className="retail-product-info"><p className="product-category">{product.cat}</p><h3><Link href={href}>{product.n}</Link></h3><p className="product-price">{money(product.p)}</p>
      {!canOrder(product) ? <p className="product-note">{product.p === null ? 'Price and availability pending' : product.provisional ? 'Provisional price · preview only' : 'Planned collection · availability pending'}</p> : product.sizes?.length ? <Link className="quick-add" href={href}>Choose size <Plus size={15} aria-hidden="true" /></Link> : <button className="quick-add" disabled={!ready || !product.id} onClick={() => { add(product); setAdded(true); }}>Quick add <Plus size={15} aria-hidden="true" /></button>}
      {added && <p role="status" className="text-sm mt-2">Added. <Link href="/cart" className="underline">View cart</Link></p>}
    </div>
  </article>;
}
const edits = [
  { title: 'Wear your colours.', subtitle: 'The Hummingbird edit', href: '/shop?search=hummingbird', image: '/images/products/hummingbird-green-1.webp', tone: 'edit-aqua' },
  { title: 'Everywhere essentials.', subtitle: 'Bags & everyday gear', href: '/shop/category/bags', image: '/images/products/duffle-1.webp', tone: 'edit-sun' },
  { title: 'Team spirit. Head to toe.', subtitle: 'Tracksuits & outerwear', href: '/shop?collection=athlete', image: '/images/products/tracksuit-1.webp', tone: 'edit-navy' },
];
export function Shop({ category, featured = false }: { category?: string; featured?: boolean }) {
  return <Suspense fallback={<div className="retail-wrap py-12" role="status">Loading collection…</div>}><ShopContent category={category} featured={featured} /></Suspense>;
}
function ShopContent({ category, featured = false }: { category?: string; featured?: boolean }) {
  const { products, loading, error } = useCatalogue();
  const queryString = useSearchParams().toString();
  const [search, setSearch] = useState(''), [collection, setCollection] = useState('all'), [availability, setAvailability] = useState('all'), [sort, setSort] = useState('featured');
  useEffect(() => {
    const params = new URLSearchParams(queryString);
    setSearch(params.get('search') || '');
    const value = params.get('collection');
    setCollection(value && ['athlete','supporter','everyday'].includes(value) ? value : 'all');
  }, [category, queryString]);
  const categories = Array.from(new Set(products.map(product => product.cat)));
  const scoped = products.filter(product => !category || categorySlug(product.cat) === category);
  const filtered = browseProducts(scoped, { search, collection, availability, sort });
  const selected = featured ? [...products.filter(product => product.images?.length), ...products.filter(product => !product.images?.length)].slice(0, 4) : filtered;
  const reset = () => { setSearch(''); setCollection('all'); setAvailability('all'); setSort('featured'); };
  return <section id="shop" className={'store-section ' + (featured ? 'featured-section' : '')}>
    {featured && <div className="retail-wrap collection-edits">{edits.map(edit => <Link key={edit.title} href={edit.href} className={'collection-edit ' + edit.tone}><div className="edit-image"><Image src={edit.image} alt="" fill sizes="(max-width:640px) 100vw,33vw" className="object-contain" /></div><div className="edit-copy"><p>{edit.subtitle}</p><h2>{edit.title}</h2><span>Explore <ArrowUpRight size={19} aria-hidden="true" /></span></div></Link>)}</div>}
    <div className="retail-wrap">
      <div className="shop-heading"><div><p className="eyebrow">{featured ? 'Made to represent' : 'Triple Fins / Official collection'}</p>{featured ? <h2>The teamwear edit.</h2> : <h1>{category ? categories.find(name => categorySlug(name) === category) || 'Explore the collection' : 'Find your element.'}</h1>}<p>{featured ? 'Standout colours. One unmistakable team spirit.' : 'Teamwear, supporter favourites and gear for the everyday. Your next favourite starts here.'}</p></div>{featured && <Link className="text-link" href="/shop">Shop the full collection <ArrowUpRight size={19} aria-hidden="true" /></Link>}</div>
      {!featured && <><nav aria-label="Product categories" className="category-rail"><Link aria-current={!category ? 'page' : undefined} href="/shop">All products</Link>{categories.map(name => <Link key={name} aria-current={categorySlug(name) === category ? 'page' : undefined} href={`/shop/category/${categorySlug(name)}`}>{name}</Link>)}</nav>
        <div className="shop-toolbar"><label className="catalogue-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Search products</span><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search the collection" /></label><label>Sort by<select value={sort} onChange={event => setSort(event.target.value)}><option value="featured">Catalogue order</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A–Z</option></select></label></div></>}
      <div className={!featured ? 'catalogue-layout' : ''}>
        {!featured && <aside className="catalogue-filters" aria-label="Filter products"><h2><SlidersHorizontal size={17} aria-hidden="true" /> Find your fit</h2><fieldset><legend>Collection</legend>{[['all','All collections'],['athlete','Kids & athletes'],['supporter','Supporters'],['everyday','Everyday gear']].map(([value,label]) => <label key={value}><input type="radio" name="collection" value={value} checked={collection === value} onChange={() => setCollection(value)} />{label}</label>)}</fieldset><fieldset><legend>Availability</legend><label><input type="checkbox" checked={availability === 'available'} onChange={event => setAvailability(event.target.checked ? 'available' : 'all')} /> Available to order</label></fieldset><button onClick={reset} className="text-link">Clear filters</button><p className="filter-note">Preview prices are provisional. Ordering opens once pricing is approved.</p></aside>}
        <div>{!featured && <p role="status" className="result-count">{loading ? 'Loading collection…' : `${filtered.length} product${filtered.length === 1 ? '' : 's'}`}</p>}{loading && <div role="status" className="catalogue-loading">Getting your team colours ready…</div>}{error && <p role="alert" className="catalogue-loading">{error}</p>}{!loading && !error && !selected.length && <div className="catalogue-loading"><h2>No matches in this lane.</h2><p>Try another search or clear the filters.</p><button onClick={reset} className="btn btn-deep mt-5">Reset filters</button></div>}<div className="retail-product-grid">{selected.map(product => <ProductCard key={product.id} product={product} />)}</div></div>
      </div>
      {featured && <div className="swim-story"><div><p className="eyebrow">More than what we wear</p><h2>It starts in the water.</h2><p>Technique. Endurance. Discipline. Join a swimming community building confident swimmers and champions in St. Thomas, Jamaica.</p><Link href="/#program" className="btn btn-deep">Explore swim programmes <ArrowUpRight size={18} aria-hidden="true" /></Link></div><div className="swim-story-image"><Image src="/images/about-swim.jpg" alt="Swimming at Triple Fins in Jamaica" fill sizes="(max-width:768px) 100vw,50vw" className="object-cover" /></div></div>}
    </div>
  </section>;
}
