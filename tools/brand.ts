// Kit de marca (tarefa 024): gera brand.css + bloco do BRAND.md a partir do brand.json.
// Uso:
//   npm run brand -- <slug>            gera (se não houver brand.json, importa do brand.css atual primeiro)
//   npm run brand -- <slug> --check    só confere se o brand.css está igual ao gerado (sai 1 se não)
//   npm run brand -- --all [--check]   todas as empresas
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { getBrand, saveBrand, brandInSync, ROOT } from '../core/store';
import { tokenMap } from '../core/brand';
import { readFileSync, existsSync } from 'node:fs';

const args = process.argv.slice(2);
const check = args.includes('--check');
const slugs = args.includes('--all')
  ? readdirSync(join(ROOT, 'companies')).filter((d) => !d.startsWith('_') && statSync(join(ROOT, 'companies', d)).isDirectory())
  : args.filter((a) => !a.startsWith('--'));
if (!slugs.length) { console.log('Uso: npm run brand -- <slug> [--check] | --all [--check]'); process.exit(1); }

let bad = 0;
for (const slug of slugs) {
  if (check) {
    const ok = await brandInSync(slug);
    console.log(ok === null ? `· ${slug}: sem brand.json (brand.css escrito à mão)` : ok ? `✅ ${slug}: brand.css em dia` : `❌ ${slug}: brand.css diferente do brand.json — rode npm run brand -- ${slug}`);
    if (ok === false) bad++;
    continue;
  }
  const cssFile = join(ROOT, 'companies', slug, 'brand', 'brand.css');
  const before = existsSync(cssFile) ? tokenMap(readFileSync(cssFile, 'utf8')) : {};
  const { brand, imported } = await getBrand(slug);
  await saveBrand(slug, brand);
  const after = tokenMap(readFileSync(cssFile, 'utf8'));
  const changed = Object.keys({ ...before, ...after }).filter((k) => before[k] !== after[k]);
  console.log(`✅ ${slug}: ${imported ? 'brand.json criado a partir do brand.css · ' : ''}brand.css gerado (${Object.keys(after).length} tokens)${changed.length ? ` · mudaram: ${changed.join(', ')}` : ' · nenhum token mudou'}`);
}
process.exit(bad ? 1 : 0);
