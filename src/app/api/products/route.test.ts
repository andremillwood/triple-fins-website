import { expect, it, vi } from 'vitest';
const mocks=vi.hoisted(()=>({select:vi.fn(),eq:vi.fn(),order:vi.fn()}));
vi.mock('@/lib/supabase',()=>({getServiceSupabase:()=>({from:(table:string)=>{
 if(table!=='products') throw new Error('Private table must never be queried');
 return {select:mocks.select};
}})}));
import { GET } from './route';
it('selects only public product fields and preserves unknown price as null',async()=>{
 mocks.select.mockReturnValue({eq:mocks.eq});mocks.eq.mockReturnValue({order:mocks.order});
 mocks.order.mockResolvedValue({data:[{id:'id',price_jmd:null}],error:null});
 const response=await GET();
 expect((await response.json()).data[0].price_jmd).toBeNull();
 expect(mocks.eq).toHaveBeenCalledWith('is_active',true);
 expect(mocks.select.mock.calls[0][0]).not.toMatch(/\*|cost|margin|supplier|source|MOQ|commercial|snapshot/i);
 expect(response.headers.get('Cache-Control')).toBe('no-store');
});
