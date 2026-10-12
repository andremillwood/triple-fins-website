// Read-only UI verification using the public catalogue; no live orders are submitted.
const { chromium } = require(process.env.TF_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
async function run() {
  const base = process.env.TF_TEST_BASE || 'http://127.0.0.1:3015';
  const result = await (await fetch('https://www.triplefins.com/api/products')).json();
  assert.equal(result.success, true);
  // Isolated approved fixture exercises quick-add without changing live approvals.
  result.data.push({id:'00000000-0000-4000-8000-000000000099',slug:'ui-test-bag',name:'UI test bag',category:'Bags',tier:'everyday',price_jmd:2500,image_urls:[],sizes:[],is_active:true,availability:'available',public_content_approved:true,variants_approved:true,price_is_provisional:false});
  const orderable = p => p.is_active && p.availability === 'available' && p.public_content_approved && p.variants_approved && !p.price_is_provisional && Number(p.price_jmd)>0;
  const browser = await chromium.launch({ headless:true, executablePath:process.env.TF_BROWSER_EXECUTABLE || undefined });
  try {
    const page = await browser.newPage({viewport:{width:1440,height:1000}});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    // Local development has no service-role key; use the same public API payload.
    await page.route('**/api/products', route => route.fulfill({json:result}));
    await page.goto(base, {waitUntil:'networkidle'});
    await page.getByRole('heading',{name:'The teamwear edit.'}).waitFor();
    assert.equal(await page.locator('h1').count(),1);
    assert.equal(await page.locator('.retail-product').count(),4);
    await page.screenshot({path:'/tmp/triple-fins-reference-home-desktop.png',fullPage:true});
    await page.goto(base+'/shop?search=hummingbird', {waitUntil:'networkidle'});
    assert.equal(await page.locator('.retail-product').count(),result.data.filter(p=>[p.name,p.category,p.description||''].join(' ').toLowerCase().includes('hummingbird')).length);
    await page.getByRole('searchbox',{name:'Search products',exact:true}).fill('duffle');
    assert.equal(await page.locator('.retail-product').count(),1);
    await page.getByRole('searchbox',{name:'Search products',exact:true}).fill('not-a-product');
    await page.getByRole('heading',{name:'No matches in this lane.'}).waitFor();
    await page.getByRole('button',{name:'Reset filters'}).click();
    assert.equal(await page.locator('.retail-product').count(),result.data.length);
    await page.locator('.collection-menu summary').click();
    await page.getByRole('link',{name:'Supporter collection',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('input[name="collection"][value="supporter"]')?.checked);
    assert.equal(await page.locator('.retail-product').count(),result.data.filter(p=>p.tier==='supporter').length);
    await page.getByRole('button',{name:'Clear filters',exact:true}).click();
    await page.getByLabel('Available to order').check();
    assert.equal(await page.locator('.retail-product').count(),result.data.filter(orderable).length);
    await page.getByRole('button',{name:'Quick add',exact:true}).first().click();
    await page.getByRole('link',{name:'View cart',exact:true}).click();
    await page.getByRole('heading',{name:'Shopping cart',exact:true}).waitFor();
    await page.reload({waitUntil:'networkidle'});
    await page.getByRole('link',{name:'Review checkout',exact:true}).waitFor();
    await page.goto(base+'/shop/hummingbird-black', {waitUntil:'networkidle'});
    await page.getByRole('button',{name:/View 2 of/}).click();
    assert.equal(await page.getByRole('button',{name:/View 2 of/}).getAttribute('aria-pressed'),'true');
    assert.equal(await page.getByRole('button',{name:'Add to cart',exact:true}).count(),0);
    await page.setViewportSize({width:390,height:844});
    await page.goto(base,{waitUntil:'networkidle'});
    await page.getByRole('button',{name:'Open navigation',exact:true}).click();
    await page.getByRole('link',{name:'Bags & gear',exact:true}).click();
    await page.getByRole('heading',{name:'Bags',exact:true}).waitFor();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth > window.innerWidth),false);
    await page.screenshot({path:'/tmp/triple-fins-reference-shop-mobile.png',fullPage:true});
    await page.goto(base,{waitUntil:'networkidle'});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth > window.innerWidth),false);
    await page.screenshot({path:'/tmp/triple-fins-reference-home-mobile.png',fullPage:true});
    assert.deepEqual(errors,[]);
    console.log('PASS: desktop/mobile layouts, search, filters, empty state, quick-add, cart reload, alternate gallery, preview protection and mobile category navigation. No live orders created.');
  } finally { await browser.close(); }
}
run().catch(error=>{console.error(error);process.exitCode=1;});
