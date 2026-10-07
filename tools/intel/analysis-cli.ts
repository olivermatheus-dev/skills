// Ferramentas da análise de concorrentes (o Claude e o Oliver usam pelo terminal).
//   npm run analise -- fila <slug>                              lista os pedidos pendentes (o que rodar)
//   npm run analise -- site <slug> <id|--fila|--all>           módulo site (script): baixa site, sitemap, contatos
//   npm run analise -- ra <slug> <id|--all>                    só a busca no Reclame Aqui (script)
//   npm run analise -- pedir <slug> <id|--all> <mod,mod|completa|triagem> [--force]
//   npm run analise -- salvar <slug> <id> <arquivo.json>       valida e grava o resultado de 1 módulo (JSON do AnalysisResult, sem updatedAt)
//   npm run analise -- feito <slug> <id> <mod,mod>             tira módulos do pedido
//   npm run analise -- status <slug> [id]                      o que cada concorrente já tem (módulo → data)
import { readFileSync } from 'node:fs';
import * as S from '../../core/store';
import { FULL_ANALYSIS, TRIAGE, MODULES } from '../../schema';

const [cmd, slug, ...rest] = process.argv.slice(2);
const has = (f: string) => rest.includes(f);
const pos = rest.filter((a) => !a.startsWith('--'));
const usage = () => { console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//   ')).map((l) => l.slice(5)).join('\n')); process.exit(1); };
if (!cmd || !slug) usage();

const active = () => S.listCompetitors(slug).filter((c) => c.data.status !== 'arquivado').map((c) => c.data.id);
const age = (iso?: string) => (iso ? `${Math.round((Date.now() - Date.parse(iso)) / 86_400_000)}d` : '—');

try {
  if (cmd === 'fila') {
    const q = S.listAnalysisQueue(slug);
    if (!q.length) console.log('fila vazia');
    for (const x of q) {
      const done = S.getAnalysisResults(slug, x.id);
      console.log(`■ ${x.id} (${x.status}) · ${x.request.status} · pedido ${x.request.requestedAt}${x.request.force ? ' · REFAZER' : ''}`);
      console.log(`  módulos: ${x.request.modules.map((m) => `${m}${done[m] ? `(tem, ${age(done[m]!.updatedAt)})` : ''}`).join(' ')}`);
      if (x.request.instructions) console.log(`  instruções: ${x.request.instructions.replace(/\n/g, ' / ')}`);
    }
  } else if (cmd === 'site') {
    const { analyzeSites } = await import('./site');
    const ids = has('--all') ? active() : has('--fila') ? S.listAnalysisQueue(slug).filter((x) => x.request.modules.includes('site')).map((x) => x.id) : pos;
    if (!ids.length) { console.log('nada para rodar'); process.exit(0); }
    let fail = 0;
    await analyzeSites(slug, ids, (r) => {
      if (!r.ok) fail++;
      console.log(`${r.ok ? '✅' : '❌'} ${r.id.padEnd(16)} ${r.ok ? `${r.pages} páginas · sitemap ${r.sitemap} URLs · ${r.contacts} contatos${r.ra ? ` · RA: ${r.ra}` : ''}` : ''} (${(r.ms / 1000).toFixed(0)}s)`);
      for (const e of r.errors) console.log(`   ⚠ ${e}`);
    });
    process.exit(fail ? 2 : 0);
  } else if (cmd === 'ra') {
    const { chromium } = await import('playwright');
    const { updateReclameAqui } = await import('./reclameaqui');
    const ids = has('--all') ? active() : pos;
    const { BROWSER_ARGS, UA } = await import('./reclameaqui');
    const browser = await chromium.launch({ headless: true, args: BROWSER_ARGS });
    const page = await (await browser.newContext({ locale: 'pt-BR', userAgent: UA })).newPage();
    for (const id of ids) {
      try { const h = await updateReclameAqui(slug, id, page); console.log(`${h.found ? '✅' : '·'} ${id.padEnd(16)} ${h.found ? `${h.name} (${h.domain}) · ${h.status}${h.score != null ? ` ${h.score}` : ''} · ${h.complaints} reclamações · ${h.solvedRate ?? '—'}% resolvidas · ${h.years ?? '—'} anos · por ${h.match}` : 'não achado'}`); }
      catch (e) { console.log(`❌ ${id} ${(e as Error).message.split('\n')[0]}`); }
    }
    await browser.close();
  } else if (cmd === 'pedir') {
    const [target, mods] = pos;
    const modules = mods === 'completa' ? FULL_ANALYSIS : mods === 'triagem' ? TRIAGE : (mods ?? '').split(',');
    for (const id of target === undefined ? [] : has('--all') ? active() : [target]) console.log(id, S.requestAnalysis(slug, id, { modules, force: has('--force') }).modules.join(','));
  } else if (cmd === 'salvar') {
    const [id, file] = pos;
    const v = S.saveAnalysisResult(slug, id, JSON.parse(readFileSync(file, 'utf8')));
    S.clearAnalysisRequest(slug, id, [v.module]);
    console.log(`✅ ${id}/${v.module} gravado`);
  } else if (cmd === 'feito') {
    const [id, mods] = pos;
    console.log(S.clearAnalysisRequest(slug, id, mods.split(',')) ?? 'pedido concluído');
  } else if (cmd === 'status') {
    const ids = pos[0] ? [pos[0]] : S.listCompetitors(slug).map((c) => c.data.id);
    console.log(`${'id'.padEnd(16)} ${MODULES.map((m) => m.id.slice(0, 7).padEnd(8)).join('')}`);
    for (const id of ids) {
      const r = S.getAnalysisResults(slug, id);
      console.log(`${id.padEnd(16)} ${MODULES.map((m) => age(r[m.id]?.updatedAt).padEnd(8)).join('')}`);
    }
  } else usage();
} catch (e) {
  const err = e as S.ValidationError;
  console.error(`❌ ${err.message}`);
  process.exit(1);
}
