import { expect, it } from 'vitest';
import { categorySlug, mapProduct } from './catalogue';
it('groups categories into stable readable URLs', () => { expect(categorySlug('T-Shirt')).toBe('t-shirt'); expect(categorySlug(' Bags & Gear ')).toBe('bags-gear'); });
it('uses the stable product ID when no slug exists', () => { expect(mapProduct({id:'id',name:'Bag',category:'Bags',tier:'everyday',price_jmd:'2500'}).slug).toBe('id'); });
