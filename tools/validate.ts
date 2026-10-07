// Valida todos os arquivos de dados do hub contra os schemas (schema/). Uso: npm run validate
import { validateAll } from '../core/store';
const errs = validateAll();
if (!errs.length) { console.log('✅ todos os arquivos de dados são válidos'); process.exit(0); }
for (const e of errs) console.log(`❌ ${e.file}\n   ${e.issues.join('\n   ')}`);
console.log(`\n${errs.length} arquivo(s) com erro`);
process.exit(1);
