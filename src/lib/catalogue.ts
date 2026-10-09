import { Product, ProductTier } from '@/types';
export const categorySlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const money = (amount: number) => `JMD $${amount.toLocaleString('en-JM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export function mapProduct(row: { id: string; slug?: string; name: string; category: string; tier: ProductTier; price_jmd: number | string; image_url?: string; image_urls?: string[]; description?: string; price_is_provisional?: boolean; sizes?: string[] }): Product {
  return { id: row.id, slug: row.slug || row.id, n: row.name, cat: row.category, tier: row.tier, p: Number(row.price_jmd), image: row.image_url, images: row.image_urls?.length ? row.image_urls : row.image_url ? [row.image_url] : [], description: row.description, provisional: row.price_is_provisional, sizes: row.sizes || [] };
}
