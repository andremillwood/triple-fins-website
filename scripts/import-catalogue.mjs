// Offline SQL generator. Never connects to a database. Source and output are private.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
export const previews = JSON.parse(readFileSync(new URL('./catalogue-preview.json', import.meta.url), 'utf8'));
const tiers = { 'Kids & Athletes': 'athlete', Supporters: 'supporter', 'Everyday Gear': 'everyday' };
const literal = value => value == null ? 'NULL' : "'" + String(value).replaceAll("'", "''") + "'";
export function generateImport(source) {
  if (source.spreadsheetId !== '1nw4BD6Mm0EVYnLG8jJWsZA5LN9WimaU5Pj1T4HaeQmo' || !Number.isFinite(Date.parse(source.retrievedAt))) throw new Error('Workbook identity and read timestamp required.');
  if (!['Summary', 'Launch Range', 'Comparable Brand', 'Notes & Sources'].every(tab => Array.isArray(source.sheets?.[tab]))) throw new Error('All four source tabs required.');
  const sheet = source.sheets['Launch Range'];
  if (sheet[3]?.[0] !== 'SKU' || sheet[3]?.[8] !== 'Launch phase' || sheet[3]?.[15] !== 'Retail price (JMD)') throw new Error('Unexpected workbook headers.');
  const rows = sheet.slice(4).filter(row => row?.[0]);
  if (rows.length !== 66 || new Set(rows.map(row => row[0])).size !== 66) throw new Error('Expected 66 unique SKUs.');
  const digest = createHash('sha256').update(JSON.stringify(source)).digest('hex');
  const sql = ['begin;', "set local standard_conforming_strings = on;", `insert into catalogue_private.sources(digest,workbook_id,retrieved_at,snapshot) values (${literal(digest)},${literal(source.spreadsheetId)},${literal(source.retrievedAt)},${literal(JSON.stringify(source))}::jsonb) on conflict (digest) do nothing;`];
  for (const [index, row] of rows.entries()) {
    const preview = previews.find(item => item.sku === row[0]);
    const category = row[2] === 'Learn-to-Swim & Safety' ? 'Learn-to-Swim' : row[2];
    if (!preview || preview.tier !== tiers[row[1]] || preview.phase !== row[8] || preview.category !== category) throw new Error(`Source changed at ${row[0]}; review the preview manifest before importing.`);
    // Source prices never become selling prices, even when future quotes are entered.
    sql.push(`insert into public.products(catalogue_sku,slug,name,category,tier,launch_phase,price_jmd,price_is_provisional,is_active,availability,public_content_approved,variants_approved,description,sort_order)
values (${literal(preview.sku)},${literal('planned-' + preview.sku.toLowerCase())},${literal(preview.name)},${literal(preview.category)},${literal(preview.tier)},${literal(preview.phase)},NULL,true,${preview.phase === 'Core'},'planned',false,false,'Planned range preview. Product details, sizes, price and availability are awaiting confirmation.',${100 + index})
on conflict (catalogue_sku) do nothing;`);
    const commercial = Object.fromEntries(sheet[3].slice(10,18).map((name,i)=>[name,row[10+i] ?? null]));
    sql.push(`insert into catalogue_private.planned_skus(source_sku,product_id,source_digest,source_row,supplier_requirements,creative_suggestions,proposed_variants,manufacturing_notes,compliance_notes,commercial_inputs)
select ${literal(preview.sku)},id,${literal(digest)},${index + 5},${literal(row[4])},${literal(row[5])},${literal(row[6])},${literal(row[7])},${literal(row[9])},${literal(JSON.stringify(commercial))}::jsonb from public.products where catalogue_sku=${literal(preview.sku)}
on conflict (source_sku) do update set source_digest=excluded.source_digest,source_row=excluded.source_row,supplier_requirements=excluded.supplier_requirements,creative_suggestions=excluded.creative_suggestions,proposed_variants=excluded.proposed_variants,manufacturing_notes=excluded.manufacturing_notes,compliance_notes=excluded.compliance_notes,commercial_inputs=excluded.commercial_inputs;`);
  }
  sql.push('commit;');
  return sql.join('\n');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) throw new Error('Usage: node scripts/import-catalogue.mjs /private/source.json /private/import.sql');
  // Fail instead of accidentally committing restricted workbook data to this repo.
  const repo = fileURLToPath(new URL('../', import.meta.url));
  if ([input, output].some(path => resolve(path).startsWith(repo))) throw new Error('Keep both source and generated SQL outside the repository.');
  writeFileSync(output, generateImport(JSON.parse(readFileSync(input, 'utf8'))), { mode: 0o600, flag: 'wx' });
  console.log('Prepared 66 planned SKUs (45 Core, 21 Phase 2); no database changes applied.');
}
