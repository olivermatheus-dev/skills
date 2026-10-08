// Contexto por seção (021): ler só o trecho necessário em vez do arquivo inteiro.
// Uso:
//   node tools/contexto.mjs indice <slug>            arquivos de contexto + seções e tamanho (para montar o `context:` da tarefa)
//   node tools/contexto.mjs ler <slug> <ref> [<ref>…]  imprime os trechos (ref = "context/BUSINESS.md#Modelo e preço")
// Refs relativas a companies/<slug>/ ou à raiz do repo. Regra completa em tools/lib/contexto.mjs.
import { contextIndex, readRef, norm } from './lib/contexto.mjs';

// Ref curta e única (vírgula não pode: a lista do frontmatter é separada por vírgula).
const short = (title, all) => {
  const cut = title.split(/\s*[,(:—]\s*/)[0].trim() || title;
  return all.filter((t) => norm(t).startsWith(norm(cut))).length === 1 || norm(cut) === norm(title) ? cut : title;
};

const [cmd, slug, ...refs] = process.argv.slice(2);
if (cmd === 'indice' && slug) {
  for (const f of contextIndex(slug)) {
    console.log(`${f.file}  (${f.lines} linhas)`);
    const titles = f.sections.map((s) => s.title);
    for (const s of f.sections.filter((x) => x.level > Math.min(...f.sections.map((y) => y.level)) || f.sections.length === 1))
      console.log(`  ${f.file}#${short(s.title, titles)}  · ${s.lines} linhas`);
  }
  process.exit(0);
}
if (cmd === 'ler' && slug && refs.length) {
  let bad = 0;
  for (const r of refs) {
    const x = readRef(slug, r);
    console.log(`\n### ▸ ${r}${x.warn ? `  ⚠ ${x.warn}` : ''}`);
    if (x.ok) console.log(x.text); else { bad++; console.log(`✗ ${x.error}`); }
  }
  process.exit(bad ? 1 : 0);
}
console.log('Uso: node tools/contexto.mjs indice <slug> | ler <slug> <ref> [<ref>…]');
process.exit(1);
