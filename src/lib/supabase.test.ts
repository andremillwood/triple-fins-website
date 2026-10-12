import { afterEach, expect, it, vi } from 'vitest';
const createClient=vi.hoisted(()=>vi.fn(()=>({})));
vi.mock('@supabase/supabase-js',()=>({createClient}));
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();vi.resetModules();});
it('bypasses fetch caching for current server-side catalogue and order reads',async()=>{
 vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://example.supabase.co');
 vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY','test-only-placeholder');
 const fetchMock=vi.fn().mockResolvedValue(new Response('{}'));vi.stubGlobal('fetch',fetchMock);
 const {getServiceSupabase}=await import('./supabase');getServiceSupabase();
 const options=(createClient.mock.calls.at(-1) as unknown as [string,string,{global:{fetch:typeof fetch}}])[2];
 await options.global.fetch('https://example.invalid/products',{cache:'force-cache'});
 expect(fetchMock).toHaveBeenCalledWith('https://example.invalid/products',{cache:'no-store'});
});
