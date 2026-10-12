'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StoreShell } from '@/components/StoreShell';
import { ProductGallery } from '@/components/ProductGallery';
import { ProductCard, useCatalogue } from '@/components/Shop';
import { useCart } from '@/components/CartProvider';
import { canOrder, categorySlug, money } from '@/lib/catalogue';
export default function ProductPage({ params }: { params: { slug: string } }) {
  const { products, loading, error } = useCatalogue(); const { add, ready } = useCart();
  const [size, setSize] = useState(''); const [quantity, setQuantity] = useState(1); const [added, setAdded] = useState(false);
  useEffect(() => { setSize(''); setQuantity(1); setAdded(false); }, [params.slug]);
  const product = products.find(item => item.slug === params.slug || item.id === params.slug);
  return <StoreShell><div className="wrap py-12 md:py-20">
    {loading ? <p role="status">Loading product…</p> : error ? <p role="alert">{error}</p> : !product ? <><h1 className="text-3xl">Product unavailable</h1><Link href="/shop" className="btn btn-sun mt-6">Browse the store</Link></> : <>
      <nav aria-label="Breadcrumb" className="flex flex-wrap gap-3 text-sm mb-8"><Link href="/shop">Store</Link><span>/</span><Link href={`/shop/category/${categorySlug(product.cat)}`}>{product.cat}</Link><span>/</span><span>{product.n}</span></nav>
      <div className="grid md:grid-cols-2 gap-10 md:gap-16">
        <ProductGallery name={product.n} images={product.images?.length ? product.images : ['/brand-assets/TF_Logo_Dark.png']} />
        <div><p className="eyebrow !text-deep">{product.cat} · {product.tier}</p><h1 className="text-4xl md:text-5xl font-extrabold uppercase text-deep">{product.n}</h1><p className="text-2xl font-bold mt-6">{money(product.p)}</p>
          <p className="text-muted mt-6 leading-relaxed">{product.description || 'Represent Triple Fins at training, meets and beyond. Contact the team for product specifications and availability.'}</p>
          {!canOrder(product) ? <div className="p-5 bg-foam mt-8"><h2 className="font-bold">Planned / preview product</h2><p className="mt-2">Ordering is not open. Price, availability, sizes and product details must be confirmed before this item can be purchased.</p><Link href="/#contact" className="btn btn-deep mt-4">Ask about this product</Link></div> : <div className="mt-8 space-y-5">
            {!!product.sizes?.length && <label className="block">Size<select required value={size} onChange={event => { setSize(event.target.value); setAdded(false); }} className="block w-full border border-line p-3 mt-2 bg-white"><option value="">Choose a size</option>{product.sizes.map(value => <option key={value}>{value}</option>)}</select></label>}
            <label className="block">Quantity<input className="block w-24 border border-line p-3 mt-2" type="number" min="1" max="20" value={quantity} onChange={event => setQuantity(Number(event.target.value))} /></label>
            <button disabled={!ready || (!!product.sizes?.length && !size) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20} className="btn btn-sun w-full disabled:opacity-50" onClick={() => { add(product, size, quantity); setAdded(true); }}>Add to cart</button>
            {added && <p role="status">Added to your cart. <Link className="underline font-bold" href="/cart">View cart →</Link></p>}
          </div>}
          <div className="border-t border-line mt-8 pt-5 text-sm text-muted space-y-2"><p>Pickup or delivery coordination with the Triple Fins team.</p><p>Delivery costs, if applicable, are confirmed separately before dispatch. Images are product mockups; confirm fit and specifications with the team.</p></div>
        </div>
      </div><h2 className="text-3xl font-bold uppercase mt-16 mb-6">More from the collection</h2><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">{products.filter(item => item.id !== product.id && item.cat === product.cat).slice(0, 4).map(item => <ProductCard key={item.id} product={item} />)}</div>
    </>}
  </div></StoreShell>;
}
