// Gabarito do classificador de anúncios (037 fase B): anúncios reais com o funil, o tipo e o objetivo "certos".
// O teste (npm run test:intel) mede o acerto do classificador contra ele e falha abaixo de 85% em funil e tipo.
//
// Uso:
//   npx tsx tools/intel/ads-gold.ts medir             acerto por campo + os erros (padrão)
//   npx tsx tools/intel/ads-gold.ts gerar [slug=kz]   (re)gera a partir da última coleta de cada concorrente
//
// Quem rotulou: `por: 'claude'` = conferência à mão da IA (2026-10-08, ver 037 §14), ainda a conferir pelo Oliver;
// `por: 'oliver'` = rótulo do Oliver, que o `gerar` nunca sobrescreve. `null` num campo = fora da conta
// (ex.: anúncio para paciente não tem tipo na nossa taxonomia).
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AdsSnapshot, type Ad } from '../../schema/ads';
import { classificarAnuncio, contarIrmaos, type Funil, type Objetivo, type Tipo } from './ads-classify';

export const GOLD_FILE = fileURLToPath(new URL('./fixtures/ads-gold.json', import.meta.url));
/** data das coletas do gabarito: o classificador usa "dias no ar", então o resultado tem de ser reproduzível */
const HOJE = '2026-10-08T12:00:00-03:00';

export interface GoldItem {
  comp: string;
  irmaos: number;
  ad: Ad;
  esperado: { funil: Funil | null; tipo: Tipo | null; objetivo: Objetivo | null };
  por: 'claude' | 'oliver';
  nota?: string;
}
export interface Gold { hoje: string; itens: GoldItem[] }

type Campo = keyof GoldItem['esperado'];
const CAMPOS: Campo[] = ['funil', 'tipo', 'objetivo'];

/** correções da conferência à mão (037 §14): onde o classificador errou */
const CORRECOES: Record<string, { esperado: Partial<GoldItem['esperado']>; nota: string }> = {
  '1302995391951963': { esperado: { funil: 'topo', tipo: 'conteudo' }, nota: 'Allminds "acabou de se formar": conteúdo de topo, não demonstração' },
  '2241042320065072': { esperado: { funil: 'meio', tipo: 'demonstracao' }, nota: 'Mais Terapias "demonstração gratuita": meio, demonstração' },
  '1072765912388161': { esperado: { tipo: null }, nota: 'Allminds "encontre seu terapeuta": anúncio para paciente, fora da taxonomia de tipo' },
  '1319974763108137': { esperado: { tipo: 'remarketing' }, nota: 'Corpora "você já usa a Corpora": upsell para quem já usa' },
  '1761170808209433': { esperado: { tipo: 'demonstracao' }, nota: 'Sintropia "garrancho": mostra o produto resolvendo, não oferta' },
  '27428635276787794': { esperado: { tipo: 'prova-social' }, nota: 'Sintropia "date": depoimento/UGC' },
  '2513495322460918': { esperado: { objetivo: 'cadastro' }, nota: 'Allminds teste grátis para LP: o "Saiba mais" esconde um cadastro' },
};

export function lerGold(file = GOLD_FILE): Gold {
  return JSON.parse(readFileSync(file, 'utf8')) as Gold;
}

export interface Medida { campo: Campo; certos: number; total: number; acerto: number; erros: { comp: string; id: string; esperado: string; veio: string }[] }

export function medir(g: Gold): Medida[] {
  const hoje = new Date(g.hoje);
  const out = CAMPOS.map((campo) => ({ campo, certos: 0, total: 0, acerto: 0, erros: [] as Medida['erros'] }));
  for (const it of g.itens) {
    const c = classificarAnuncio(it.ad, { hoje, irmaos: it.irmaos });
    for (const m of out) {
      const esp = it.esperado[m.campo];
      if (esp == null) continue;
      m.total++;
      if (c[m.campo] === esp) m.certos++;
      else m.erros.push({ comp: it.comp, id: it.ad.id, esperado: esp, veio: c[m.campo] });
    }
  }
  for (const m of out) m.acerto = m.total ? m.certos / m.total : 0;
  return out;
}

function gerar(slug: string) {
  const root = process.env.HUB_ROOT ?? fileURLToPath(new URL('../..', import.meta.url));
  const antigo = existsSync(GOLD_FILE) ? lerGold() : null;
  const doOliver = new Map((antigo?.itens ?? []).filter((i) => i.por === 'oliver').map((i) => [i.ad.id, i]));
  const hoje = new Date(HOJE);
  const base = join(root, 'companies', slug, 'competitors');
  const itens: GoldItem[] = [];
  for (const comp of readdirSync(base).sort()) {
    const dir = join(base, comp, 'ads');
    if (!existsSync(dir)) continue;
    const f = readdirSync(dir).filter((x) => x.endsWith('.json')).sort().at(-1);
    if (!f) continue;
    const ads = AdsSnapshot.parse(JSON.parse(readFileSync(join(dir, f), 'utf8'))).ads.filter((a) => a.active);
    const irmaos = contarIrmaos(ads);
    for (const ad of ads) {
      const keep = doOliver.get(ad.id);
      if (keep) { itens.push(keep); continue; }
      const c = classificarAnuncio(ad, { hoje, irmaos: irmaos.get(ad.id) });
      if (c.sinais.catalogoDinamico) continue; // texto de catálogo ({{product.name}}): não dá para rotular pelo texto
      const fix = CORRECOES[ad.id];
      itens.push({
        comp, irmaos: irmaos.get(ad.id) ?? 0, ad,
        esperado: { funil: c.funil, tipo: c.tipo, objetivo: c.objetivo, ...fix?.esperado },
        por: 'claude', ...(fix ? { nota: fix.nota } : {}),
      });
    }
  }
  const faltam = Object.keys(CORRECOES).filter((id) => !itens.some((i) => i.ad.id === id));
  if (faltam.length) console.warn(`⚠ correções sem anúncio na coleta: ${faltam.join(', ')}`);
  writeFileSync(GOLD_FILE, JSON.stringify({ hoje: HOJE, itens } satisfies Gold, null, 1) + '\n');
  console.log(`gabarito: ${itens.length} anúncios (${itens.filter((i) => i.por === 'oliver').length} do Oliver) → ${GOLD_FILE}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [cmd = 'medir', slug = 'kz'] = process.argv.slice(2);
  if (cmd === 'gerar') gerar(slug);
  const g = lerGold();
  console.log(`\n${g.itens.length} anúncios no gabarito (${g.itens.filter((i) => i.por === 'oliver').length} rotulados pelo Oliver)`);
  for (const m of medir(g)) {
    console.log(`${m.campo.padEnd(9)} ${m.certos}/${m.total} = ${(m.acerto * 100).toFixed(0)}%`);
    for (const e of m.erros) console.log(`   ✕ ${e.comp} ${e.id}: esperado ${e.esperado}, veio ${e.veio}`);
  }
}
