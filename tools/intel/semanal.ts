// Coleta semanal dos concorrentes: redes de todos os ativos + anúncios ativos (Biblioteca da Meta) e um relatório digerido
// da semana em companies/<slug>/intel/semanas/AAAA-Wss.md (o que as skills leem). Estado em intel/coleta-semanal.json.
// Roda só quando o Oliver manda (sem agendamento): botão "Rodar agora" na aba Coletas, com o app aberto,
// ou npm run intel:semanal -- <slug>. Script puro: não gasta tokens.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as S from '../../core/store';
import { company } from '../../schema';
import { collectCompetitor } from './collect';
import type { CollectResult } from './types';

const posix = (...xs: string[]) => join(...xs).replace(/\\/g, '/');
const STALE_RUN_MS = 3 * 3_600_000;
const DAY = 86_400_000;

export interface WeeklyState {
  last?: string;
  lastWeek?: string;
  running?: { startedAt: string; done: number; total: number; current?: string } | null;
  lastSummary?: { profiles: number; ok: number; ads?: number; newAds?: number; report: string; errors: number };
}

const dir = (slug: string) => join(S.ROOT, company(slug), 'intel');
const stateFile = (slug: string) => join(dir(slug), 'coleta-semanal.json');
export function readState(slug: string): WeeklyState {
  try { const { last, lastWeek, running, lastSummary } = JSON.parse(readFileSync(stateFile(slug), 'utf8')); return { last, lastWeek, running, lastSummary }; } catch { return {}; }
}
function writeState(slug: string, s: WeeklyState) {
  mkdirSync(dir(slug), { recursive: true });
  writeFileSync(stateFile(slug), `${JSON.stringify(s, null, 2)}\n`);
}

/** semana ISO (AAAA-Wss) */
export function isoWeek(d: Date) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = t.getUTCFullYear();
  const w = Math.ceil(((t.getTime() - Date.UTC(y, 0, 1)) / DAY + 1) / 7);
  return `${y}-W${String(w).padStart(2, '0')}`;
}
const isRunning = (s: WeeklyState) => !!s.running && Date.now() - Date.parse(s.running.startedAt) < STALE_RUN_MS;
/** estado para a tela: última rodada, progresso (se rodando) e os relatórios */
export function status(slug: string, s = readState(slug)) {
  return { ...s, running: isRunning(s) ? s.running : null, reports: listReports(slug) };
}
export function listReports(slug: string) {
  const d = join(dir(slug), 'semanas');
  if (!existsSync(d)) return [];
  return readdirSync(d).filter((f) => /^\d{4}-W\d{2}\.md$/.test(f)).sort().reverse()
    .map((f) => ({ week: f.replace(/\.md$/, ''), file: posix(company(slug), 'intel', 'semanas', f) }));
}
export function readReport(slug: string, week: string) {
  if (!/^\d{4}-W\d{2}$/.test(week)) throw new Error('semana inválida');
  return readFileSync(join(dir(slug), 'semanas', `${week}.md`), 'utf8');
}

// anúncios: o coletor vive em ./ads (Biblioteca da Meta); se faltar, a semana segue só com as redes
type AdsMod = { collectAds: (slug: string, id: string, o?: { max?: number }) => Promise<{ ok: boolean; ads: number; errors: string[] }>; listAds: (slug: string, id: string) => { data: { collectedAt: string; ads: { id: string; text?: string | null; startedAt?: string | null; url: string; media?: { type?: string } }[] } }[] };
async function adsModule(): Promise<AdsMod | null> {
  try { return (await import('./ads')) as unknown as AdsMod; } catch { return null; }
}

/** roda a semana (não roda duas ao mesmo tempo); devolve o resumo */
export async function runWeekly(slug: string, { ads = true, onPasso }: { ads?: boolean; onPasso?: (t: string) => void } = {}) {
  const st = readState(slug);
  if (isRunning(st)) throw new Error('a coleta semanal já está rodando');
  const comps = S.listCompetitors(slug).filter((c) => c.data.status === 'ativo');
  const A = ads ? await adsModule() : null;
  const total = comps.length * (A ? 2 : 1);
  let done = 0;
  const started = new Date();
  const tick = (current?: string) => { writeState(slug, { ...readState(slug), running: { startedAt: started.toISOString(), done, total, current } }); if (current) onPasso?.(`${current} (${done + 1}/${total})`); };
  tick();
  const results: Record<string, CollectResult[]> = {};
  const adRes: Record<string, { ok: boolean; ads: number; errors: string[] }> = {};
  try {
    for (const c of comps) {
      tick(`${c.data.name} · redes`);
      try { results[c.data.id] = await collectCompetitor(slug, c.data.id); } catch (e) { results[c.data.id] = [{ key: '-', platform: '-', url: '', ok: false, items: 0, errors: [(e as Error).message], warnings: [] }]; }
      done++;
      if (A) {
        tick(`${c.data.name} · anúncios`);
        try { adRes[c.data.id] = await A.collectAds(slug, c.data.id); } catch (e) { adRes[c.data.id] = { ok: false, ads: 0, errors: [(e as Error).message] }; }
        done++;
      }
    }
    const week = isoWeek(started);
    const md = report(slug, week, started, results, adRes, A);
    mkdirSync(join(dir(slug), 'semanas'), { recursive: true });
    writeFileSync(join(dir(slug), 'semanas', `${week}.md`), md.text);
    const all = Object.values(results).flat();
    const s: WeeklyState = { ...readState(slug), running: null, last: new Date().toISOString(), lastWeek: week,
      lastSummary: { profiles: all.length, ok: all.filter((r) => r.ok).length, ads: A ? Object.values(adRes).reduce((n, r) => n + r.ads, 0) : undefined, newAds: md.newAds, report: posix(company(slug), 'intel', 'semanas', `${week}.md`), errors: all.filter((r) => !r.ok).length + Object.values(adRes).filter((r) => !r.ok).length } };
    writeState(slug, s);
    return status(slug, s);
  } catch (e) {
    writeState(slug, { ...readState(slug), running: null });
    throw e;
  }
}

// ---------- relatório ----------
const fmt = (n?: number | null) => (n == null ? '—' : n.toLocaleString('pt-BR'));
const signed = (n?: number) => (n == null ? '—' : n === 0 ? '0' : `${n > 0 ? '+' : ''}${n.toLocaleString('pt-BR')}`);
const med = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : undefined; };
const day = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('pt-BR') : '—');
/** anúncio de catálogo (DPA) vem com o modelo {{product.brand}} no lugar do texto */
const adText = (t?: string | null) => { const x = (t ?? '').replace(/\{\{[^}]+\}\}/g, '').trim(); return x || (t?.includes('{{') ? 'catálogo (texto dinâmico)' : ''); };
const clean = (t?: string | null, n = 110) => (t ?? '').replace(/\s+/g, ' ').trim().slice(0, n) + ((t ?? '').length > n ? '…' : '');

function report(slug: string, week: string, at: Date, results: Record<string, CollectResult[]>, adRes: Record<string, { ok: boolean; ads: number; errors: string[] }>, A: AdsMod | null) {
  const comps = S.listCompetitors(slug).filter((c) => results[c.data.id]);
  const since = at.getTime() - 7 * DAY;
  const aud: string[] = [], fresh: { name: string; line: string; score: number }[] = [], fails: string[] = [], adsLines: string[] = [];
  let newAds = 0;
  for (const c of comps) {
    const snaps = S.listSnapshots(slug, c.data.id);
    const keys = [...new Set(snaps.map((s) => s.key))];
    for (const key of keys) {
      const list = snaps.filter((s) => s.key === key);
      const last = list.at(-1)!.data;
      if (last.platform === 'site') continue;
      // base da comparação: a coleta mais recente com pelo menos 6 dias antes desta (senão, a anterior)
      const base = [...list].reverse().find((s) => Date.parse(last.collectedAt) - Date.parse(s.data.collectedAt) >= 6 * DAY)?.data ?? list.at(-2)?.data;
      const f = last.profile.followers, bf = base?.profile.followers;
      if (f != null) aud.push(`| ${c.data.name} | ${last.platform} | ${fmt(f)} | ${bf != null ? `${signed(f - bf)} desde ${day(base!.collectedAt)}` : 'primeira coleta'} |`);
      const mv = med(last.items.map((i) => i.metrics.views).filter((v): v is number => !!v));
      for (const it of last.items) {
        if (!it.publishedAt || Date.parse(it.publishedAt) < since) continue;
        const v = it.metrics.views;
        const score = v != null && mv ? v / mv : 0;
        fresh.push({ name: c.data.name, score, line: `- **${c.data.name}** (${last.platform}, ${it.type}, ${day(it.publishedAt)}) — [${clean(it.title || it.caption, 90) || it.id}](${it.url}) · ${fmt(v)} views · ${fmt(it.metrics.likes)} ♥${score ? ` · ${score.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}× a mediana` : ''}` });
      }
    }
    for (const r of results[c.data.id]) if (!r.ok) fails.push(`- ${c.data.name} · ${r.platform}: ${clean(r.errors[0] ?? 'falhou', 140)}`);
    if (A) {
      const a = adRes[c.data.id];
      if (a && !a.ok) fails.push(`- ${c.data.name} · anúncios: ${clean(a.errors[0] ?? 'falhou', 140)}`);
      const hist = A.listAds(slug, c.data.id);
      const cur = hist.at(-1)?.data, prev = hist.at(-2)?.data;
      if (cur) {
        const prevIds = new Set(prev?.ads.map((x) => x.id) ?? []);
        const novos = cur.ads.filter((x) => !prevIds.has(x.id));
        if (prev) newAds += novos.length;
        const old = a && !a.ok ? ` · dados de ${day(cur.collectedAt)}, a coleta desta semana falhou` : '';
        adsLines.push(`- **${c.data.name}**: ${cur.ads.length} ativo(s)${prev ? `, ${novos.length} novo(s) desde ${day(prev.collectedAt)}` : ' (primeira coleta)'}${old}`);
        for (const x of (prev ? novos : cur.ads).slice(0, 5)) adsLines.push(`  - ${x.media?.type ?? 'anúncio'} desde ${day(x.startedAt)} — ${clean(adText(x.text), 120) || 'sem texto'} ([ver](${x.url}))`);
      }
    }
  }
  fresh.sort((a, b) => b.score - a.score);
  const all = Object.values(results).flat();
  const text = [
    `# Semana ${week} — concorrentes (${slug})`,
    '',
    `Coletado em ${at.toLocaleString('pt-BR')} · ${all.filter((r) => r.ok).length}/${all.length} perfis ok${A ? ` · ${Object.values(adRes).reduce((n, r) => n + r.ads, 0)} anúncios ativos (${newAds} novos)` : ''}.`,
    'Gerado por `tools/intel/semanal.ts`. Números das redes: últimos itens de cada perfil (Instagram sem token = 6 posts).',
    '',
    '## Audiência (vs. a coleta de ~1 semana atrás; sem ela, a anterior)',
    '', '| concorrente | rede | seguidores | Δ |', '|---|---|---|---|', ...aud, '',
    `## Publicado nos últimos 7 dias (${fresh.length})`,
    '', ...(fresh.length ? fresh.slice(0, 15).map((x) => x.line) : ['- nada novo nas redes coletadas']), '',
    ...(A ? ['## Anúncios ativos (Biblioteca da Meta)', '', ...(adsLines.length ? adsLines : ['- nenhum anúncio encontrado']), ''] : []),
    ...(fails.length ? ['## Falhas da coleta', '', ...fails, ''] : []),
  ].join('\n');
  return { text, newAds };
}

// ---------- CLI ----------
if (process.argv[1]?.replace(/\\/g, '/').endsWith('tools/intel/semanal.ts')) {
  const [slug, ...rest] = process.argv.slice(2);
  if (!slug) { console.log('uso: npm run intel:semanal -- <slug> [--sem-anuncios]'); process.exit(1); }
  runWeekly(slug, { ads: !rest.includes('--sem-anuncios') })
    .then((r) => { console.log(`ok: ${r.lastSummary?.ok}/${r.lastSummary?.profiles} perfis · relatório ${r.lastSummary?.report}`); })
    .catch((e) => { console.error(e.message); process.exit(1); });
}
