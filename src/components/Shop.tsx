'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Product, ProductTier } from '@/types';
import { ProductGallery } from './ProductGallery';

const PALETTE = ['#0B2E4E', '#0F8BBF', '#16B3C9', '#15D2DB', '#FFB020', '#FF5A5F'];

const TIER_LABEL: Record<ProductTier, string> = {
  athlete: 'Kids / Athlete',
  supporter: 'Adult / Supporter',
  everyday: 'Everyday Gear',
};

interface ShopProps {
  onAddToCart: (index: number, product: Product) => void;
}

export const Shop: React.FC<ShopProps> = ({ onAddToCart }) => {
  const [activeTier, setActiveTier] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadState, setLoadState] = useState<'loading'|'ready'|'error'>('loading');
  useEffect(() => {
    fetch('/api/products').then(async (response) => {
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error();
      setProducts(result.data.map((p: { id: string; name: string; category: string; tier: ProductTier; price_jmd: number|string; image_url?: string; image_urls?: string[]; description?: string; price_is_provisional?: boolean }) => ({ id: p.id, n: p.name, cat: p.category, tier: p.tier, p: Number(p.price_jmd), image: p.image_url, images: p.image_urls?.length ? p.image_urls : p.image_url ? [p.image_url] : [], description: p.description, provisional: p.price_is_provisional })));
      setLoadState('ready');
    }).catch(() => setLoadState('error'));
  }, []);

  const filteredProducts = products.map((prod, index) => ({
    ...prod,
    originalIndex: index,
  })).filter((prod) => (activeTier === 'all' ? true : prod.tier === activeTier));

  const formatJMD = (amount: number) => {
    return `JMD $${amount.toLocaleString()}`;
  };

  return (
    <section id="shop" className="sec bg-paper py-20 md:py-28">
      <div className="wrap">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-[580px]">
            <p className="eyebrow">Official Merchandise</p>
            <h2 className="font-extrabold uppercase text-3xl md:text-5xl text-deep mt-1">
              Triple Fins Store
            </h2>
            <div className="h-[3px] w-16 bg-aqua mt-2"></div>
            <p className="text-muted mt-3 text-base md:text-lg">
              Equip your athlete with high-performance team wear, supporter gear, and training essentials.
            </p>
          </div>

          {/* Tier Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'athlete', label: 'Kids & Athletes' },
              { id: 'supporter', label: 'Supporters' },
              { id: 'everyday', label: 'Everyday Gear' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTier(tab.id)}
                className={`font-display font-bold uppercase tracking-wider text-xs md:text-sm px-4 py-2 rounded-sm transition-all ${
                  activeTier === tab.id
                    ? 'bg-deep text-white shadow-md'
                    : 'bg-foam text-deep hover:bg-line'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loadState === 'loading' && <p className="p-6 bg-foam text-muted">Loading the current merchandise catalogue…</p>}
        {loadState === 'error' && <p className="p-6 bg-rose-50 text-rose-800">The store could not load. Please refresh or contact us.</p>}
        {loadState === 'ready' && products.length === 0 && <p className="p-6 bg-foam text-muted">No merchandise is available right now.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => {
            const colorBg = PALETTE[p.originalIndex % PALETTE.length];
            const useLightLogo = colorBg !== '#FFB020' && colorBg !== '#15D2DB';

            return (
              <div
                key={p.id || p.originalIndex}
                className="bg-white border border-line flex flex-col justify-between corner-cut transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group"
              >
                {p.images?.length ? <ProductGallery name={p.n} images={p.images} /> : <>
                {/* Tile Visual */}
                <div
                  className="relative aspect-square flex items-center justify-center p-8 transition-transform group-hover:scale-[1.02]"
                  style={{ backgroundColor: colorBg }}
                >
                  <span className="absolute top-3 left-3 bg-deep2/80 backdrop-blur-sm text-white font-display font-semibold text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-sm">
                    {p.cat}
                  </span>

                  <Image
                    src={
                      useLightLogo
                        ? '/brand-assets/TF_Logo_light.png'
                        : '/brand-assets/TF_Logo_Dark.png'
                    }
                    alt={p.n}
                    width={100}
                    height={100}
                    className="w-2/5 h-auto opacity-80 drop-shadow-md"
                  />
                </div>
                </>}

                {/* Details */}
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <span className="font-display font-semibold text-xs text-muted uppercase tracking-wider block">
                      {TIER_LABEL[p.tier]}
                    </span>
                    <h3 className="font-extrabold uppercase text-xl text-deep mt-1">
                      {p.n}
                    </h3>
                    {p.description && <p className="text-sm text-muted mt-3">{p.description}</p>}
                    {p.provisional && <p className="text-xs text-aqua-deep font-semibold mt-3">Preview · provisional price · ordering opens after pricing is confirmed</p>}
                  </div>

                  <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between">
                    <span className="font-display font-bold text-deep text-lg">
                      {formatJMD(p.p)}
                    </span>
                    <button
                      disabled={p.provisional}
                      onClick={() => onAddToCart(p.originalIndex, p)}
                      className="btn btn-sm btn-sun text-xs py-1.5 px-3"
                    >
                      {p.provisional ? 'Coming soon' : '+ Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
