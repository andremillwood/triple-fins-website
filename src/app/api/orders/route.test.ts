import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), read: vi.fn(), email: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ getServiceSupabase: () => ({ rpc: mocks.rpc, from: () => ({ select: () => ({ eq: () => ({ single: mocks.read }) }) }) }) }));
vi.mock('@/lib/rateLimit', () => ({ rateLimit: () => true }));
vi.mock('@/lib/stripe', () => ({ stripe: null, stripeEnabled: false }));
vi.mock('@/lib/resend', () => ({ sendOrderEmails: mocks.email }));
import { POST } from './route';
const id = '00000000-0000-4000-8000-000000000001';
const payload = { checkout_key: id, customer_name: 'Sam Brown', email: 'sam@example.com', phone: '8765551234', payment_method: 'pay_on_pickup', fulfillment_method: 'pickup', items: [{ product_id: id, quantity: 1, size: '' }] };
const request = (overrides = {}) => new Request('https://example.com/api/orders', { method: 'POST', body: JSON.stringify({ ...payload, ...overrides }) });
beforeEach(() => { vi.clearAllMocks(); mocks.email.mockResolvedValue({success:true}); mocks.read.mockResolvedValue({data:{id,customer_name:'Sam',email:'sam@example.com',subtotal_jmd:3500,payment_method:'pay_on_pickup',order_items:[]},error:null}); });
it('rejects provisional products rejected by the transaction', async () => {
  mocks.rpc.mockResolvedValue({ data: null, error: {code:'P0001',message:'Provisional products cannot be ordered.'} });
  expect((await POST(request())).status).toBe(409);
  expect(mocks.email).not.toHaveBeenCalled();
});
it('rejects duplicate lines rather than silently reducing quantities', async () => {
  expect((await POST(request({items:[payload.items[0],payload.items[0]]}))).status).toBe(400);
  expect(mocks.rpc).not.toHaveBeenCalled();
});
it('rejects malformed IDs, excessive quantities and empty carts', async () => {
  for (const items of [[], [{product_id:'bad',quantity:1}], [{product_id:id,quantity:21}]]) expect((await POST(request({items}))).status).toBe(400);
  expect(mocks.rpc).not.toHaveBeenCalled();
});
it('ignores browser prices and sends only IDs, size and quantity to the atomic RPC', async () => {
  mocks.rpc.mockResolvedValue({data:{id,token:'a'.repeat(64),reused:false},error:null});
  const response = await POST(request({items:[{...payload.items[0],unit_price_jmd:1}]}));
  expect(response.status).toBe(200);
  expect(mocks.rpc.mock.calls[0][1].p_items).toEqual(payload.items);
  expect((await response.json()).data.receiptUrl).toContain('token=');
});
it('reuses an order without sending duplicate confirmation emails', async () => {
  mocks.rpc.mockResolvedValue({data:{id,token:'a'.repeat(64),reused:true},error:null});
  expect((await POST(request())).status).toBe(200);
  expect(mocks.email).not.toHaveBeenCalled();
});
it('keeps failures retryable and does not report unsaved orders as successful', async () => {
  mocks.rpc.mockResolvedValue({data:null,error:{code:'42883',message:'missing migration'}});
  expect((await POST(request())).status).toBe(503);
});
it('does not offer unconfigured Stripe payment', async () => {
  expect((await POST(request({payment_method:'stripe'}))).status).toBe(400);
  expect(mocks.rpc).not.toHaveBeenCalled();
});
