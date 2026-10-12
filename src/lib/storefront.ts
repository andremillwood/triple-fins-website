import { Product } from '@/types';
import { canOrder } from './catalogue';
export type StoreFilters = { search: string; collection: string; availability: string; sort: string };
export function browseProducts(products: Product[], filters: StoreFilters): Product[] {
  const query = filters.search.trim().toLowerCase();
  return products.filter(product =>
    (!query || [product.n, product.cat, product.description || ''].join(' ').toLowerCase().includes(query)) &&
    (filters.collection === 'all' || product.tier === filters.collection) &&
    (filters.availability !== 'available' || canOrder(product))
  ).sort((a, b) => {
    if (filters.sort === 'price-low' || filters.sort === 'price-high') {
      if (a.p === null) return b.p === null ? 0 : 1;
      if (b.p === null) return -1;
      return filters.sort === 'price-low' ? a.p - b.p : b.p - a.p;
    }
    return filters.sort === 'name' ? a.n.localeCompare(b.n) : 0;
  });
}
