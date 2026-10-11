import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
const previews = JSON.parse(readFileSync('scripts/catalogue-preview.json','utf8')) as {sku:string;phase:string;tier:string;category:string;name:string}[];
it('preserves exactly the verified workbook identity counts without restricted data',()=>{
 expect(new Set(previews.map(p=>p.sku)).size).toBe(66);
 expect(previews.filter(p=>p.phase==='Core')).toHaveLength(45);
 expect(previews.filter(p=>p.phase==='Phase 2')).toHaveLength(21);
 expect(new Set(previews.map(p=>p.category)).size).toBe(11);
 for(const [tier,count] of [['athlete',19],['supporter',17],['everyday',30]] as const) expect(previews.filter(p=>p.tier===tier)).toHaveLength(count);
 expect(JSON.stringify(previews)).not.toMatch(/UPF|UV |IPX8|reef-safe|protection|supplier|MOQ|margin|cost|flotation/i);
});
