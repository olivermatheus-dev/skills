// npm run curadoria -- <comando> <slug> [rodada] [opções]   (041 F2; tudo sob comando, nada agendado)
//   pedir <slug> (--serie N | --pilar N | --tema "…") [--fontes a,b | --sugeridas] [--ideias 8] [--meses 24] [--dias-noticia 60] [--rapida]
//         [--pt "consulta 1; consulta 2"] [--en "q1; q2"] [--termos "a; b"]      → rodadas/<id>/pedido.json + consultas.json
//   buscar <slug> <rodada> [--fontes a,b]  (só essas, juntando ao que já veio) → data/curadoria/<slug>/<rodada>/brutos.json (APIs e RSS, sem LLM)
//   triar <slug> <rodada> [--top 60 | --anexar doi1,doi2 | --sem-modelo [--top 20]]  → candidatos.json (ou achados.json por regra) (pré-triagem por regra; a triagem do Haiku lê este arquivo e grava achados.json)
//   rodada <slug> <rodada>        → buscar + triar (para antes do modelo)
//   verificar <slug> <rodada> [--sem-doi-ok]  → verificados.json (link, DOI, trecho)
//   gravar <slug> <rodada>        → referências, ideias e resultado.json a partir de sintese.json
//   status <slug>                 → rodadas e contagens
import * as S from '../../core/store';
import { buscar } from './buscar';
import { gravar } from './gravar';
import { queriesFile, roundDir, writeJsonFile, type Queries } from './paths';
import { anexar, triar, triarSemModelo } from './triar';
import { verificar } from './verificar';
import { slugify } from '../../core/platform';

const argv = process.argv.slice(2);
const [cmd, slug, round] = argv;
const opt = (k: string) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : undefined; };
const flag = (k: string) => argv.includes(`--${k}`);
const list = (s?: string) => (s ?? '').split(';').map((x) => x.trim()).filter(Boolean);
const monthsBefore = (d: Date, m: number) => { const x = new Date(d); x.setMonth(x.getMonth() - m); return x.toISOString().slice(0, 10); };

function pedir() {
  const serie = opt('serie') ? +opt('serie')! : null, pilar = opt('pilar') ? +opt('pilar')! : null, tema = opt('tema') ?? null;
  if (!serie && !pilar && !tema) throw new Error('informe --serie, --pilar ou --tema');
  const all = S.listSources(slug);
  const fits = (s: (typeof all)[number]) => (serie ? s.series.includes(serie) : pilar ? s.pillars.includes(pilar) : true);
  let sources = opt('fontes') ? opt('fontes')!.split(',').map((x) => x.trim()) : all.filter((s) => s.status === 'ativa' && fits(s)).map((s) => s.id);
  let note = '';
  if (!sources.length && flag('sugeridas')) {
    // nenhuma aceita ainda: usa as sugeridas conferidas de confiança 3 (registrado nas instruções do pedido)
    sources = all.filter((s) => s.status === 'sugerida' && s.verifiedAt && s.trust === 3 && fits(s)).map((s) => s.id);
    note = 'Nenhuma fonte aceita pelo Oliver ainda: rodada com as sugeridas conferidas de confiança 3. ';
  }
  if (!sources.length) throw new Error('nenhuma fonte ativa para esse filtro (aceite fontes no app ou use --sugeridas / --fontes)');
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
  const label = slugify(tema ?? (serie ? `serie-${serie}` : `pilar-${pilar}`)).slice(0, 30);
  const id = `${stamp}-${label}`;
  const rapida = flag('rapida');
  const req = S.saveRoundRequest(slug, {
    id, topic: tema, pillar: pilar, series: serie, sources,
    period: { from: monthsBefore(now, +(opt('meses') ?? 24)), to: now.toISOString().slice(0, 10) },
    maxIdeas: +(opt('ideias') ?? 8), depth: rapida ? 'rapida' : 'normal', languages: ['pt', 'en'],
    instructions: `${note}${opt('instrucoes') ?? ''}`.trim(),
    estimate: rapida ? { minutes: 8, usdLow: 1.0, usdHigh: 2.1 } : { minutes: 12, usdLow: 1.3, usdHigh: 3.0 },
    requestedAt: now.toISOString().replace(/\.\d+Z$/, 'Z'), status: 'pendente',
  });
  const q: Queries = { pt: list(opt('pt')), en: list(opt('en')), noticias: list(opt('noticias')), noticiasDias: +(opt('dias-noticia') ?? 60), termos: list(opt('termos')), max: +(opt('max') ?? 20) };
  if (!q.pt.length && !q.en.length) { if (!tema) throw new Error('informe as consultas (--pt e/ou --en) ou um --tema'); q.pt = [tema]; }
  writeJsonFile(queriesFile(slug, id), q);
  console.log(`pedido ${req.id} (${sources.length} fontes) em ${roundDir(slug, id)}`);
}

function status() {
  for (const r of S.listRounds(slug)) {
    const req = S.getRoundRequest(slug, r), res = S.getRoundResult(slug, r);
    console.log(`${r}  ${req.status}  ${req.sources.length} fontes${res ? `  · ${res.ideas.length} ideias · ${res.refs.length} refs${res.cost ? ` · US$ ${res.cost.usd.toFixed(2)}` : ''}` : ''}`);
  }
  console.log(`referências: ${S.listRefs(slug).length}`);
}

const need = () => { if (!slug || !round) throw new Error(`uso: npm run curadoria -- ${cmd} <slug> <rodada>`); };
try {
  switch (cmd) {
    case 'pedir': if (!slug) throw new Error('uso: npm run curadoria -- pedir <slug> --serie N …'); pedir(); break;
    case 'buscar': need(); await buscar(slug, round, (opt('fontes') ?? '').split(',').filter(Boolean)); break;
    case 'triar': need(); if (opt('anexar')) anexar(slug, round, opt('anexar')!.split(',').map((x) => x.trim())); else if (flag('sem-modelo')) triarSemModelo(slug, round, +(opt('top') ?? 20)); else triar(slug, round, +(opt('top') ?? 60)); break;
    case 'rodada': need(); await buscar(slug, round); triar(slug, round, +(opt('top') ?? 60)); console.log('próximo: triagem (Haiku) → achados.json → npm run curadoria -- verificar'); break;
    case 'verificar': need(); await verificar(slug, round, { requireDoi: !flag('sem-doi-ok') }); break;
    case 'gravar': need(); gravar(slug, round); break;
    case 'status': if (!slug) throw new Error('uso: npm run curadoria -- status <slug>'); status(); break;
    default: console.log('comandos: pedir · buscar · triar · rodada · verificar · gravar · status (ver o topo de tools/curadoria/cli.ts)'); process.exit(cmd ? 1 : 0);
  }
} catch (e) {
  console.error(`✗ ${(e as Error).message}`);
  process.exit(1);
}
