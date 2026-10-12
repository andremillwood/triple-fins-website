import { CartItem, Product, ProductTier } from '@/types';
export const categorySlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export function parsePrice(value: unknown): number | null {
  if (value == null || (typeof value === 'string' && !value.trim()) || !['number', 'string'].includes(typeof value)) return null;
  const price = Number(value);
  return Number.isFinite(price) && price > 0 ? price : null;
}
export const money = (amount: number | null) => amount === null || !Number.isFinite(amount) ? 'Price pending' : `JMD $${amount.toLocaleString('en-JM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const canOrder = (product: Product) => !!product.id && product.orderable === true && !product.provisional && parsePrice(product.p) !== null;
export const validSelection = (product: Product, size = '') => product.sizes?.length ? product.sizes.includes(size) : size === '';
export const cartSubtotal = (cart: CartItem[]) => cart.some(item => !canOrder(item.product)) ? null : cart.reduce((total, item) => total + item.product.p! * item.quantity, 0);
export function mapProduct(row: { id: string; slug?: string; name: string; category: string; tier: ProductTier; price_jmd: number | string | null; image_url?: string; image_urls?: string[]; description?: string; price_is_provisional?: boolean; sizes?: string[]; launch_phase?: Product['phase']; availability?: string; public_content_approved?: boolean; variants_approved?: boolean; is_active?: boolean }): Product {
  const price = parsePrice(row.price_jmd);
  return { id: row.id, slug: row.slug || row.id, n: row.name, cat: row.category, tier: row.tier, p: price, image: row.image_url, images: row.image_urls?.length ? row.image_urls : row.image_url ? [row.image_url] : [], description: row.description, provisional: row.price_is_provisional, sizes: row.sizes || [], phase: row.launch_phase,
    orderable: row.is_active === true && row.availability === 'available' && row.public_content_approved === true && row.variants_approved === true && row.price_is_provisional === false && price !== null };
}
