import { Product } from '@/types';
export type StoreFilters = { search: string; collection: string; availability: string; sort: string };
export function browseProducts(products: Product[], filters: StoreFilters): Product[] {
  const query = filters.search.trim().toLowerCase();
  return products.filter(product =>
    (!query || [product.n, product.cat, product.description || ''].join(' ').toLowerCase().includes(query)) &&
    (filters.collection === 'all' || product.tier === filters.collection) &&
    (filters.availability !== 'available' || !product.provisional)
  ).sort((a, b) => filters.sort === 'price-low' ? a.p - b.p : filters.sort === 'price-high' ? b.p - a.p : filters.sort === 'name' ? a.n.localeCompare(b.n) : 0);
}
