// Roda o classificador determinístico nos snapshots reais (último de cada concorrente) e imprime um resumo.
// Uso: npx tsx tools/intel/ads-classify-run.ts [slug=kz] [--todos] [--exemplos=10] [--id=<ad id>] [--json]
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AdsSnapshot } from '../../schema/ads';
import { classificarAnuncio, contarIrmaos } from './ads-classify';

const root = process.env.HUB_ROOT ?? fileURLToPath(new URL('../..', import.meta.url));
const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--')) ?? 'kz';
const nEx = Number(args.find((a) => a.startsWith('--exemplos='))?.split('=')[1] ?? 10);
const onlyId = args.find((a) => a.startsWith('--id='))?.split('=')[1];
const hoje = new Date('2026-10-08T12:00:00-03:00'); // data da coleta, para o resultado ser reproduzível

const base = join(root, 'companies', slug, 'competitors');
const linhas: { comp: string; ad: any; c: ReturnType<typeof classificarAnuncio> }[] = [];
for (const comp of readdirSync(base)) {
  const dir = join(base, comp, 'ads');
  if (!existsSync(dir)) continue;
  const f = readdirSync(dir).filter((x) => x.endsWith('.json')).sort().at(-1);
  if (!f) continue;
  const snap = AdsSnapshot.parse(JSON.parse(readFileSync(join(dir, f), 'utf8')));
  const ads = snap.ads.filter((a) => a.active);
  const irmaos = contarIrmaos(ads);
  for (const ad of ads) linhas.push({ comp, ad, c: classificarAnuncio(ad, { hoje, irmaos: irmaos.get(ad.id) }) });
}

const conta = (f: (l: (typeof linhas)[number]) => string) => {
  const o: Record<string, number> = {};
  for (const l of linhas) o[f(l)] = (o[f(l)] ?? 0) + 1;
  return Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(' · ');
};
const pct = (n: number) => `${Math.round((100 * n) / linhas.length)}%`;

if (args.includes('--json')) { console.log(JSON.stringify(linhas.map((l) => ({ comp: l.comp, id: l.ad.id, ...l.c })), null, 1)); process.exit(0); }

console.log(`\n${linhas.length} anúncios ativos em ${new Set(linhas.map((l) => l.comp)).size} concorrentes (${slug}), hoje = 2026-10-08\n`);
console.log('FUNIL     :', conta((l) => l.c.funil));
console.log('TIPO      :', conta((l) => l.c.tipo));
console.log('OBJETIVO  :', conta((l) => l.c.objetivo));
console.log('LINK      :', conta((l) => (l.c.temLink ? 'com link' : 'sem link')));
console.log('DESTINO   :', conta((l) => l.c.destino.kind));
console.log('OFERTA    :', conta((l) => (l.c.oferta.tem ? `explícita (${l.c.oferta.tipos.join('+')})` : 'sem oferta explícita')));
console.log('UTM       :', conta((l) => (l.c.sinais.utm ? 'com UTM' : 'sem UTM')));
console.log('CATÁLOGO  :', conta((l) => (l.c.sinais.catalogoDinamico ? 'texto dinâmico' : 'texto real')));
const baixa = linhas.filter((l) => l.c.confianca < 0.5).length;
console.log(`CONFIANÇA : média ${(linhas.reduce((s, l) => s + l.c.confianca, 0) / linhas.length).toFixed(2)} · abaixo de 0,50: ${baixa} (${pct(baixa)}) → vão para a camada de IA`);
console.log('\nPOR CONCORRENTE (funil / tipo)');
for (const comp of [...new Set(linhas.map((l) => l.comp))]) {
  const ls = linhas.filter((l) => l.comp === comp);
  const c = (f: (l: (typeof ls)[number]) => string) => Object.entries(ls.reduce<Record<string, number>>((o, l) => ({ ...o, [f(l)]: (o[f(l)] ?? 0) + 1 }), {})).map(([k, n]) => `${k} ${n}`).join(', ');
  console.log(`  ${comp.padEnd(14)} ${String(ls.length).padStart(2)} | ${c((l) => l.c.funil)} | ${c((l) => l.c.tipo)}`);
}

// exemplos: espalha por concorrente e prioriza variedade de tipo
const escolhidos = onlyId ? linhas.filter((l) => l.ad.id === onlyId) : args.includes('--todos') ? linhas : (() => {
  const vistos = new Set<string>(); const out: typeof linhas = [];
  for (const l of linhas) { const k = `${l.comp}|${l.c.tipo}|${l.c.funil}`; if (!vistos.has(k)) { vistos.add(k); out.push(l); } }
  return out.slice(0, nEx);
})();
console.log(`\nEXEMPLOS (${escolhidos.length})`);
for (const { comp, ad, c } of escolhidos) {
  console.log(`\n── ${comp} · ${ad.id} · ${ad.media.type} · ${c.sinais.diasNoAr ?? '?'} dias · var ${c.sinais.variacoes ?? '-'} · irmãos ${c.sinais.irmaos}`);
  console.log(`   texto : ${(ad.text ?? '').replace(/\s+/g, ' ').slice(0, 170)}`);
  console.log(`   botão : ${ad.cta ?? '-'} → ${c.destino.kind} ${c.destino.dominio ?? ''}${c.destino.caminho ?? ''}`);
  console.log(`   ⇒ funil ${c.funil} (${c.confiancaCampos.funil}) · tipo ${c.tipo} (${c.confiancaCampos.tipo}) · objetivo ${c.objetivo} (${c.confiancaCampos.objetivo}) · oferta ${c.oferta.tem ? c.oferta.tipos.join('+') + (c.oferta.precoBRL ? ` R$${c.oferta.precoBRL}/${c.oferta.precoPor ?? "?"}` : '') : 'não'}`);
  for (const m of c.motivos) console.log(`      · ${m}`);
}
