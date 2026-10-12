'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { categorySlug, mapProduct, money } from '@/lib/catalogue';
export function useCatalogue() {
  const [products, setProducts] = useState<Product[]>([]); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  useEffect(() => { const controller = new AbortController(); fetch('/api/products', { signal: controller.signal }).then(async response => {
    const result = await response.json(); if (!response.ok || !result.success) throw new Error('The store could not load. Please refresh or contact us.');
    setProducts(result.data.map(mapProduct));
  }).catch(err => { if (err.name !== 'AbortError') setError(err.message); }).finally(() => setLoading(false)); return () => controller.abort(); }, []);
  return { products, loading, error };
}
export function ProductCard({ product }: { product: Product }) {
  return <Link href={`/shop/${product.slug || product.id}`} className="bg-white border border-line group block hover:shadow-lg transition-shadow">
    <div className="aspect-square relative bg-foam"><Image src={product.images?.[0] || '/brand-assets/TF_Logo_Dark.png'} alt={product.n} fill sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw" className="object-contain p-5" /></div>
    <div className="p-5"><p className="eyebrow !text-deep">{product.cat}</p><h3 className="text-xl font-extrabold uppercase text-deep group-hover:text-aqua-deep">{product.n}</h3><p className="mt-3 font-semibold">{money(product.p)}</p>{product.phase && !product.orderable && <p className="text-sm text-muted mt-1">Planned collection · availability pending</p>}{product.provisional && product.p !== null && <p className="text-sm text-muted mt-1">Provisional price · preview only</p>}<span className="block mt-4 text-sm underline">View product →</span></div>
  </Link>;
}
export function Shop({ category }: { category?: string }) {
  const { products, loading, error } = useCatalogue(); const [tier, setTier] = useState('all');
  const categories = Array.from(new Set(products.map(product => product.cat)));
  const filtered = products.filter(product => (!category || categorySlug(product.cat) === category) && (tier === 'all' || product.tier === tier));
  return <section id="shop" className="py-16 md:py-24"><div className="wrap"><p className="eyebrow !text-deep">Official merchandise</p><h1 className="text-4xl md:text-6xl font-extrabold uppercase text-deep">{category ? categories.find(name => categorySlug(name) === category) || 'Category' : 'Triple Fins Store'}</h1>
    <p className="mt-4 text-muted max-w-xl">Team colours. Everyday pride. Explore the collection and every product angle. Preview prices will be confirmed before ordering opens.</p>
    <nav aria-label="Product categories" className="flex flex-wrap gap-3 my-8"><Link className="btn btn-sm btn-outline" href="/shop">All products</Link>{categories.map(name => <Link key={name} className="btn btn-sm btn-outline" aria-current={categorySlug(name) === category ? 'page' : undefined} href={`/shop/category/${categorySlug(name)}`}>{name}</Link>)}</nav>
    <label className="block mb-8">Collection <select className="ml-3 p-3 border border-line bg-white" value={tier} onChange={event => setTier(event.target.value)}><option value="all">All collections</option><option value="athlete">Kids & athletes</option><option value="supporter">Supporters</option><option value="everyday">Everyday gear</option></select></label>
    {loading && <p role="status">Loading catalogue…</p>}{error && <p role="alert">{error}</p>}{!loading && !error && filtered.length === 0 && <p>No products in this category.</p>}
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">{filtered.map(product => <ProductCard key={product.id} product={product} />)}</div>
  </div></section>;
}
