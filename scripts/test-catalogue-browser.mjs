// Run against a local build on 127.0.0.1:3000. Product API is mocked; orders are blocked.
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const manifest=JSON.parse(readFileSync(new URL('./catalogue-preview.json', import.meta.url)));
const products=manifest.filter(p=>p.phase==='Core').map((p,i)=>({id:`00000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`,slug:'planned-'+p.sku.toLowerCase(),name:p.name,category:p.category,tier:p.tier,price_jmd:null,is_active:true,price_is_provisional:true,launch_phase:p.phase,availability:'planned',public_content_approved:false,variants_approved:false,sizes:[],description:'Planned range preview. Product details, sizes, price and availability are awaiting confirmation.'}));
const approved={...products[0],id:'10000000-0000-4000-8000-000000000001',slug:'test-approved',name:'Test approved tee',price_jmd:2500,price_is_provisional:false,availability:'available',public_content_approved:true,variants_approved:true,sizes:['S','M']};
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const findings=[];
try {
 for(const width of [390,1280]) {
  const context=await browser.newContext({viewport:{width,height:900}});
  await context.route('**/api/products',route=>route.fulfill({json:{success:true,data:[...products,approved]}}));
  await context.route('**/api/config',route=>route.fulfill({json:{stripeEnabled:false}}));
  await context.route('**/api/orders',route=>{throw Error('Browser tests must never send orders');});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:3000/shop');
  await page.getByText('Price pending',{exact:true}).first().waitFor();
  assert.equal(await page.getByText('Price pending',{exact:true}).count(),45);
  for(const path of ['/shop','/shop/category/swimwear','/shop/planned-tf-sw-01']) {
   await page.goto('http://127.0.0.1:3000'+path);
   await page.getByText('Price pending',{exact:true}).first().waitFor();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
   if(path.includes('planned-')) { assert.equal(await page.getByRole('button',{name:'Add to cart'}).count(),0); assert.equal(await page.getByRole('link',{name:'Ask about this product'}).getAttribute('href'),'/#contact'); }
   const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze();
   findings.push({width,path,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)}))});
  }
  // A forged/stale cached approval must be replaced by today's planned state.
  await page.evaluate(p=>localStorage.setItem('tf_cart',JSON.stringify([{index:p.id+':',product:{id:p.id,slug:p.slug,n:p.name,p:1,orderable:true},quantity:1}])),products[0]);
  await page.goto('http://127.0.0.1:3000/cart');
  await page.getByText('Unavailable for ordering.',{exact:false}).waitFor();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
  await page.goto('http://127.0.0.1:3000/checkout');
  await page.getByRole('button',{name:'Place order'}).waitFor();
  assert(await page.getByRole('button',{name:'Place order'}).isDisabled());
  findings.push({width,path:'/checkout',violations:(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze()).violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)}))});
  await page.goto('http://127.0.0.1:3000/shop/test-approved');
  await page.getByRole('button',{name:'Add to cart'}).waitFor();
  assert(await page.getByRole('button',{name:'Add to cart'}).isDisabled());
  await page.getByRole('combobox',{name:/Size/}).selectOption('M');
  assert(await page.getByRole('button',{name:'Add to cart'}).isEnabled());
  await page.getByRole('button',{name:'Add to cart'}).click();
  await page.getByText('Added to your cart.',{exact:false}).waitFor();
  console.log(`Verified ${width}px browser behavior`);
  await context.close();
 }
 console.log(JSON.stringify(findings));
 assert.equal(findings.reduce((sum,item)=>sum+item.violations.length,0),0,'No WCAG A/AA violations on tested store screens');
 console.log('PASS: 390/1280px categories/details, pending prices, inquiry link, stale cart rejection, disabled checkout, approved size selection.');
} finally {await browser.close();}
