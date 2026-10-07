// Valida todos os arquivos de dados do hub contra os schemas (schema/). Uso: npm run validate
import { readdirSync } from 'node:fs';
import { validateAll, brandInSync } from '../core/store';
const errs = validateAll();
// kit de marca: brand.css tem que ser o gerado pelo brand.json (tarefa 024)
for (const d of readdirSync('companies').filter((x) => !x.startsWith('_') && !x.includes('.'))) {
  if ((await brandInSync(d).catch(() => true)) === false) errs.push({ file: `companies/${d}/brand/brand.css`, issues: [`diferente do brand.json (editado à mão?): edite o brand.json e rode npm run brand -- ${d}`] });
}
if (!errs.length) { console.log('✅ todos os arquivos de dados são válidos'); process.exit(0); }
for (const e of errs) console.log(`❌ ${e.file}\n   ${e.issues.join('\n   ')}`);
console.log(`\n${errs.length} arquivo(s) com erro`);
process.exit(1);
