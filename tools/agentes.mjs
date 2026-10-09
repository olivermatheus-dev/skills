// Fichas de agente e skill (048). Molde: .claude/skills/orquestrar/references/ficha.md
// Uso:
//   node tools/agentes.mjs check [--todos]          confere todas as fichas: campos do molde e refs do ## Contexto
//                                                   (arquivo/seção existe em cada empresa). Sem --todos, as fora do molde viram 1 linha.
//   node tools/agentes.mjs contexto <agente> [--skill a,b] [--slug kz] [--ler]
//                                                   o que o agente lê (agente + skills); --ler imprime os trechos "sempre"
//   node tools/agentes.mjs ficha <agente|skill> [--skill]   mostra a ficha em campos (para conferir o parse)
import { conferirTudo, conferirFicha, contextoDoAgente, lerFicha, CAMPOS } from './lib/ficha-agente.mjs';
import { readRef } from './lib/contexto.mjs';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };

if (argv[0] === 'check') {
  const todas = conferirTudo();
  let erros = 0;
  const fora = [];
  for (const f of todas) {
    if (!f.noMolde && !f.erros.length && !argv.includes('--todos')) { fora.push(`${f.tipo === 'agente' ? '@' : ''}${f.id}`); continue; }
    erros += f.erros.length;
    if (!f.erros.length && !f.avisos.length) { console.log(`✓ ${f.path}`); continue; }
    console.log(`${f.erros.length ? '✗' : '⚠'} ${f.path}`);
    for (const e of f.erros) console.log(`   ✗ ${e}`);
    for (const a of f.avisos) console.log(`   ⚠ ${a}`);
  }
  if (fora.length) console.log(`\n${fora.length} fora do molde (ainda não revisadas): ${fora.join(' · ')}`);
  console.log(erros ? `\n${erros} erro(s)` : '\nsem erros');
  process.exit(erros ? 1 : 0);
}

if (argv[0] === 'contexto' && argv[1]) {
  const agente = argv[1];
  const skills = (opt('--skill') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const slug = opt('--slug') ?? 'kz';
  const itens = contextoDoAgente(agente, skills);
  if (!itens.length) { console.log(`(${agente}: nenhum contexto declarado nas fichas)`); process.exit(0); }
  for (const i of itens) console.log(`- ${i.ref} · ${i.quando === 'sempre' ? 'sempre' : `quando: ${i.quando}`}${i.motivo ? ` — ${i.motivo}` : ''}  [${i.de.join(', ')}]`);
  if (argv.includes('--ler')) for (const i of itens.filter((x) => x.quando === 'sempre')) {
    const x = readRef(slug, i.ref);
    console.log(`\n### ▸ ${i.ref}${x.warn ? `  ⚠ ${x.warn}` : ''}`);
    console.log(x.ok ? x.text : `✗ ${x.error}`);
  }
  process.exit(0);
}

if (argv[0] === 'ficha' && argv[1]) {
  const tipo = argv.includes('--skill') ? 'skill' : 'agente';
  const f = lerFicha(tipo, argv[1]);
  if (!f) { console.log(`não achei ${tipo} ${argv[1]}`); process.exit(1); }
  console.log(`# ${f.path}${f.noMolde ? '' : '  (fora do molde)'}\ndescrição: ${f.fm.description ?? '—'}`);
  for (const c of CAMPOS) {
    if (c.key === 'contexto') { console.log(`\n[${c.titulo}] ${f.contexto.itens.length} item(ns)`); for (const i of f.contexto.itens) console.log(`  ${i.ref} · ${i.quando}${i.agentes.length ? ` · só: ${i.agentes.join(', ')}` : ''}${i.motivo ? ` — ${i.motivo}` : ''}`); continue; }
    console.log(`\n[${c.titulo}] ${f.campos[c.key] ? `${f.campos[c.key].split('\n').length} linha(s)` : '—'}`);
  }
  if (f.outras.length) console.log(`\n[Outras seções] ${f.outras.map((o) => o.titulo).join(' · ')}`);
  const r = conferirFicha(tipo, argv[1]);
  for (const e of r.erros) console.log(`✗ ${e}`);
  for (const a of r.avisos) console.log(`⚠ ${a}`);
  process.exit(0);
}

console.log('Uso: node tools/agentes.mjs check [--todos] | contexto <agente> [--skill a,b] [--slug kz] [--ler] | ficha <id> [--skill]');
process.exit(1);
