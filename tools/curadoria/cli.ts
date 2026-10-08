// npm run curadoria -- <comando> <slug> [rodada] [opções]   (041 F2; tudo sob comando, nada agendado)
//   pedir <slug> (--serie N | --pilar N | --tema "…") [--fontes a,b | --sugeridas] [--ideias 8] [--meses 24] [--dias-noticia 60] [--rapida]
//         [--pt "consulta 1; consulta 2"] [--en "q1; q2"] [--termos "a; b"]      → rodadas/<id>/pedido.json + consultas.json
//   consultas <slug> <rodada> [--pt "a; b"] [--en "c; d"] [--noticias "…"] [--termos "x; y"]  → define as consultas de uma rodada pedida pelo app (sem elas)
//   buscar <slug> <rodada> [--fontes a,b]  (só essas, juntando ao que já veio) → data/curadoria/<slug>/<rodada>/brutos.json (APIs e RSS, sem LLM)
//   triar <slug> <rodada> [--top 60 | --anexar doi1,doi2 | --sem-modelo [--top 20]]  → candidatos.json (ou achados.json por regra) (pré-triagem por regra; a triagem do Haiku lê este arquivo e grava achados.json)
//   rodada <slug> <rodada>        → buscar + triar (para antes do modelo)
//   verificar <slug> <rodada> [--sem-doi-ok]  → verificados.json (link, DOI, trecho)
//   gravar <slug> <rodada>        → referências, ideias e resultado.json a partir de sintese.json
//   status <slug>                 → rodadas e contagens
import { existsSync, readFileSync } from 'node:fs';
import * as S from '../../core/store';
import { buscar } from './buscar';
import { gravar } from './gravar';
import { queriesFile, roundDir, writeJsonFile, type Queries } from './paths';
import { anexar, triar, triarSemModelo } from './triar';
import { verificar } from './verificar';
import { criarPedido } from './pedido';

const argv = process.argv.slice(2);
const [cmd, slug, round] = argv;
const opt = (k: string) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : undefined; };
const flag = (k: string) => argv.includes(`--${k}`);
const list = (s?: string) => (s ?? '').split(';').map((x) => x.trim()).filter(Boolean);

function pedir() {
  const serie = opt('serie') ? +opt('serie')! : null, pilar = opt('pilar') ? +opt('pilar')! : null, tema = opt('tema') ?? null;
  if (!serie && !pilar && !tema) throw new Error('informe --serie, --pilar ou --tema');
  const pt = list(opt('pt')), en = list(opt('en'));
  if (!pt.length && !en.length && !tema) throw new Error('informe as consultas (--pt e/ou --en) ou um --tema');
  const { req } = criarPedido(slug, {
    serie, pilar, tema, fontes: opt('fontes') ? opt('fontes')!.split(',').map((x) => x.trim()) : undefined, sugeridas: flag('sugeridas'),
    ideias: +(opt('ideias') ?? 8), meses: +(opt('meses') ?? 24), diasNoticia: +(opt('dias-noticia') ?? 60), rapida: flag('rapida'),
    instrucoes: opt('instrucoes'), pt, en, noticias: list(opt('noticias')), termos: list(opt('termos')), max: +(opt('max') ?? 20),
  });
  console.log(`pedido ${req.id} (${req.sources.length} fontes) em ${roundDir(slug, req.id)}`);
}

/** define (ou troca) as consultas de uma rodada que veio do app sem elas: consultas <slug> <rodada> --pt "a; b" --en "c; d" --termos "x; y" */
function consultas() {
  const file = queriesFile(slug, round);
  const prev: Queries = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : { pt: [], en: [] };
  const q: Queries = {
    ...prev, pt: opt('pt') ? list(opt('pt')) : prev.pt, en: opt('en') ? list(opt('en')) : prev.en,
    noticias: opt('noticias') ? list(opt('noticias')) : prev.noticias, termos: opt('termos') ? list(opt('termos')) : prev.termos,
    noticiasDias: opt('dias-noticia') ? +opt('dias-noticia')! : prev.noticiasDias ?? 60, max: opt('max') ? +opt('max')! : prev.max ?? 20,
  };
  if (!q.pt.length && !q.en.length) throw new Error('informe --pt e/ou --en');
  S.getRoundRequest(slug, round); // confere que a rodada existe
  writeJsonFile(file, q);
  console.log(`consultas de ${round}: ${q.pt.length} pt, ${q.en.length} en, ${q.termos?.length ?? 0} termos`);
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
    case 'consultas': need(); consultas(); break;
    case 'buscar': need(); await buscar(slug, round, (opt('fontes') ?? '').split(',').filter(Boolean)); break;
    case 'triar': need(); if (opt('anexar')) anexar(slug, round, opt('anexar')!.split(',').map((x) => x.trim())); else if (flag('sem-modelo')) triarSemModelo(slug, round, +(opt('top') ?? 20)); else triar(slug, round, +(opt('top') ?? 60)); break;
    case 'rodada': need(); await buscar(slug, round); triar(slug, round, +(opt('top') ?? 60)); console.log('próximo: triagem (Haiku) → achados.json → npm run curadoria -- verificar'); break;
    case 'verificar': need(); await verificar(slug, round, { requireDoi: !flag('sem-doi-ok') }); break;
    case 'gravar': need(); gravar(slug, round); break;
    case 'status': if (!slug) throw new Error('uso: npm run curadoria -- status <slug>'); status(); break;
    default: console.log('comandos: pedir · consultas · buscar · triar · rodada · verificar · gravar · status (ver o topo de tools/curadoria/cli.ts)'); process.exit(cmd ? 1 : 0);
  }
} catch (e) {
  console.error(`✗ ${(e as Error).message}`);
  process.exit(1);
}
