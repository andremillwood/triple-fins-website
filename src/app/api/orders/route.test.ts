import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ products: vi.fn(), insert: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ getServiceSupabase: () => ({
  from: (table: string) => table === 'products'
    ? { select: () => ({ in: () => ({ eq: mocks.products }) }) }
    : { insert: mocks.insert },
}) }));
vi.mock('@/lib/rateLimit', () => ({ rateLimit: () => true }));
vi.mock('@/lib/stripe', () => ({ stripe: null, stripeEnabled: false }));
vi.mock('@/lib/resend', () => ({ sendOrderEmails: vi.fn() }));
import { POST } from './route';
const request = () => new Request('https://example.com/api/orders', {
  method: 'POST',
  body: JSON.stringify({ customer_name: 'Sam Brown', email: 'sam@example.com', phone: '8765551234', payment_method: 'pay_on_pickup', fulfillment_method: 'pickup', items: [{product_id: 'product-1',quantity: 1}] }),
});
beforeEach(() => vi.clearAllMocks());
it('rejects provisional prices before creating an order', async () => {
  mocks.products.mockResolvedValue({ data: [{id:'product-1',name:'Preview tee',price_jmd:3500,price_is_provisional:true}], error:null });
  const response = await POST(request());
  expect(response.status).toBe(409);
  expect((await response.json()).error).toContain('provisional');
  expect(mocks.insert).not.toHaveBeenCalled();
});
it('rejects unavailable products before creating an order', async () => {
  mocks.products.mockResolvedValue({data:[],error:null});
  expect((await POST(request())).status).toBe(409);
  expect(mocks.insert).not.toHaveBeenCalled();
});
