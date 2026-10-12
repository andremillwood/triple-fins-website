'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StoreShell } from '@/components/StoreShell';
import { ProductGallery } from '@/components/ProductGallery';
import { ProductCard, useCatalogue } from '@/components/Shop';
import { useCart } from '@/components/CartProvider';
import { categorySlug, money } from '@/lib/catalogue';
export default function ProductPage({ params }: { params: { slug: string } }) {
  const { products, loading, error } = useCatalogue(); const { add, ready } = useCart();
  const [size, setSize] = useState(''); const [quantity, setQuantity] = useState(1); const [added, setAdded] = useState(false);
  useEffect(() => { setSize(''); setQuantity(1); setAdded(false); }, [params.slug]);
  const product = products.find(item => item.slug === params.slug || item.id === params.slug);
  return <StoreShell><div className="retail-wrap py-10 md:py-14">
    {loading ? <p role="status">Loading product…</p> : error ? <p role="alert">{error}</p> : !product ? <><h1 className="text-3xl">Product unavailable</h1><Link href="/shop" className="btn btn-sun mt-6">Browse the store</Link></> : <>
      <nav aria-label="Breadcrumb" className="flex flex-wrap gap-3 text-sm mb-8"><Link href="/shop">Store</Link><span>/</span><Link href={`/shop/category/${categorySlug(product.cat)}`}>{product.cat}</Link><span>/</span><span>{product.n}</span></nav>
      <div className="grid md:grid-cols-2 gap-10 md:gap-16">
        <ProductGallery large name={product.n} images={product.images?.length ? product.images : ['/brand-assets/TF_Logo_Dark.png']} />
        <div className="product-detail-panel"><p className="eyebrow">{product.cat} / Triple Fins</p><h1 className="text-4xl md:text-5xl font-extrabold uppercase text-deep mt-3">{product.n}</h1><p className="text-xl font-bold mt-6">{money(product.p)}</p>
          <p className="text-muted mt-6 leading-relaxed">{product.description || 'Represent Triple Fins at training, meets and beyond. Contact the team for product specifications and availability.'}</p>
          {product.provisional ? <div className="p-5 bg-foam mt-8"><h2 className="font-bold">Collection preview</h2><p className="mt-2">This price is provisional. Ordering will open after the team confirms pricing and availability.</p><Link href="/#contact" className="btn btn-deep mt-4">Ask about this product</Link></div> : <div className="mt-8 space-y-5">
            {!!product.sizes?.length && <fieldset><legend className="text-sm font-semibold mb-3">Select size{size ? ' — ' + size : ''}</legend><div className="flex flex-wrap gap-2">{product.sizes.map(value => <button key={value} type="button" aria-pressed={size === value} className={'min-w-12 min-h-12 px-4 border ' + (size === value ? 'bg-deep text-white border-deep' : 'border-line')} onClick={() => { setSize(value); setAdded(false); }}>{value}</button>)}</div></fieldset>}
            <label className="block">Quantity<input className="block w-24 border border-line p-3 mt-2" type="number" min="1" max="20" value={quantity} onChange={event => setQuantity(Number(event.target.value))} /></label>
            <button disabled={!ready || (!!product.sizes?.length && !size) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20} className="btn btn-sun w-full disabled:opacity-50" onClick={() => { add(product, size, quantity); setAdded(true); }}>Add to cart</button>
            {added && <p role="status">Added to your cart. <Link className="underline font-bold" href="/cart">View cart →</Link></p>}
          </div>}
          <div className="mt-8"><details className="product-disclosure" open><summary>The details</summary><p>Images show product mockups. Confirm fabric, fit and specifications with the team before ordering. {product.provisional ? 'Preview pricing is subject to approval.' : 'Merchandise prices are shown in Jamaican dollars.'}</p></details><details className="product-disclosure"><summary>Size & fit</summary><p>Choose from the sizes configured for this product. For measurements or help selecting a fit, <Link className="underline" href="/#contact">contact the Triple Fins team</Link>. A size chart will be added once supplier measurements are confirmed.</p></details><details className="product-disclosure"><summary>Pickup & delivery</summary><p>Pickup or delivery is coordinated with the team after ordering. Any delivery fees, collection location and timing are confirmed separately before dispatch.</p></details><details className="product-disclosure"><summary>Need a hand?</summary><p>Questions about an order, product or exchange? <Link className="underline" href="/#contact">Speak to Triple Fins</Link> before sending anything back so the team can confirm the next steps.</p></details></div>
        </div>
      </div><h2 className="text-3xl font-bold uppercase mt-16 mb-6">More from the collection</h2><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">{products.filter(item => item.id !== product.id && item.cat === product.cat).slice(0, 4).map(item => <ProductCard key={item.id} product={item} />)}</div>
    </>}
  </div></StoreShell>;
}
