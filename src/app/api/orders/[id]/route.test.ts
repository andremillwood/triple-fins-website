import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ single: vi.fn(), eq: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ getServiceSupabase: () => ({ from: () => ({ select: () => ({ eq: mocks.eq }) }) }) }));
vi.mock('@/lib/rateLimit', () => ({ rateLimit: () => true }));
import { GET } from './route';
const id = '00000000-0000-4000-8000-000000000001';
beforeEach(() => { vi.clearAllMocks(); mocks.eq.mockReturnValue({eq:mocks.eq,single:mocks.single}); });
it('does not allow an order ID alone to reveal a receipt', async () => {
  const response = await GET(new Request('https://example.com/api/orders/'+id), {params:{id}});
  expect(response.status).toBe(404); expect(mocks.eq).not.toHaveBeenCalled();
});
it('requires a matching receipt token and prevents caching', async () => {
  mocks.single.mockResolvedValue({data:{id,payment_status:'pending'},error:null});
  const token = 'a'.repeat(64);
  const response = await GET(new Request('https://example.com/api/orders/'+id+'?token='+token), {params:{id}});
  expect(response.status).toBe(200);
  expect(mocks.eq).toHaveBeenCalledWith('receipt_token', token);
  expect(response.headers.get('Cache-Control')).toBe('no-store');
});
it('returns a non-disclosing not-found response for an incorrect token', async () => {
  mocks.single.mockResolvedValue({data:null,error:{message:'not found'}});
  expect((await GET(new Request('https://example.com/api/orders/'+id+'?token='+'b'.repeat(64)), {params:{id}})).status).toBe(404);
});
