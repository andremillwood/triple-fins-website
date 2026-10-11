import { expect, it } from 'vitest';
import { categorySlug, mapProduct } from './catalogue';
it('groups categories into stable readable URLs', () => { expect(categorySlug('T-Shirt')).toBe('t-shirt'); expect(categorySlug(' Bags & Gear ')).toBe('bags-gear'); });
it('uses the stable product ID when no slug exists', () => { expect(mapProduct({id:'id',name:'Bag',category:'Bags',tier:'everyday',price_jmd:'2500'}).slug).toBe('id'); });

import { canOrder, cartSubtotal, money, parsePrice, validSelection } from './catalogue';
const approved = { id:'id', name:'Test', category:'Bags', tier:'everyday' as const, price_jmd:2500, is_active:true, price_is_provisional:false, availability:'available', public_content_approved:true, variants_approved:true };
it('treats empty, malformed, zero and negative prices as unknown', () => {
  for(const value of [null,undefined,'','  ','no',NaN,Infinity,0,-1,false]) expect(parsePrice(value)).toBeNull();
  expect(parsePrice('2500.50')).toBe(2500.5);
  expect(money(mapProduct({...approved,price_jmd:null}).p)).toBe('Price pending');
});
it('requires every gate, never treats Core phase as stock', () => {
  expect(canOrder(mapProduct(approved))).toBe(true);
  for(const change of [{price_jmd:null},{price_is_provisional:true},{is_active:false},{availability:'planned'},{public_content_approved:false},{variants_approved:false}]) expect(canOrder(mapProduct({...approved,...change,launch_phase:'Core'}))).toBe(false);
  expect(canOrder({...mapProduct(approved),orderable:undefined})).toBe(false);
});
it('does not show a partial/free total for unavailable cart lines', () => {
  expect(cartSubtotal([{index:'id',product:mapProduct({...approved,price_jmd:null}),quantity:1}])).toBeNull();
  expect(cartSubtotal([{index:'id',product:mapProduct(approved),quantity:2}])).toBe(5000);
});
it('validates approved size choices', () => {
  expect(validSelection({...mapProduct(approved),sizes:['S','M']},'XL')).toBe(false);
  expect(validSelection({...mapProduct(approved),sizes:['S','M']},'M')).toBe(true);
  expect(validSelection(mapProduct(approved),'M')).toBe(false);
});
