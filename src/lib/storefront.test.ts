import { expect, it } from 'vitest';
import { browseProducts } from './storefront';
import { Product } from '@/types';
const products: Product[] = [
  { id:'1', n:'Hummingbird tee', cat:'T-Shirt', tier:'athlete', p:3800, provisional:true },
  { id:'2', n:'Team duffle', cat:'Bags', tier:'everyday', p:6500, orderable:true, description:'Carry your training gear' },
  { id:'3', n:'Polo', cat:'Polo', tier:'supporter', p:4500, orderable:true },
];
const defaults = { search:'', collection:'all', availability:'all', sort:'featured' };
it('searches name, category and description case-insensitively', () => { expect(browseProducts(products,{...defaults,search:' TRAINING '}).map(p=>p.id)).toEqual(['2']); expect(browseProducts(products,{...defaults,search:'t-shirt'}).map(p=>p.id)).toEqual(['1']); });
it('combines collection and available-to-order filters', () => { expect(browseProducts(products,{...defaults,collection:'athlete',availability:'available'})).toEqual([]); expect(browseProducts(products,{...defaults,collection:'everyday'}).map(p=>p.id)).toEqual(['2']); });
it('sorts numeric prices without mutating the catalogue', () => { expect(browseProducts(products,{...defaults,sort:'price-high'}).map(p=>p.id)).toEqual(['2','3','1']); expect(products.map(p=>p.id)).toEqual(['1','2','3']); });
it('preserves catalogue order and allows empty results', () => { expect(browseProducts(products,defaults)).toEqual(products); expect(browseProducts(products,{...defaults,search:'no match'})).toEqual([]); });
it('excludes unapproved products and sorts pending prices last', () => {
  const pending: Product = {id:'4',n:'Pending',cat:'Bags',tier:'everyday',p:null,orderable:false};
  expect(browseProducts([...products,pending],{...defaults,availability:'available'}).map(p=>p.id)).toEqual(['2','3']);
  expect(browseProducts([pending,...products],{...defaults,sort:'price-low'}).at(-1)?.id).toBe('4');
});
