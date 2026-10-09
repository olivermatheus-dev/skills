// Aba Variantes no app (tarefa 045 D): lê o projeto de vídeo (projeto.json + variantes/indice.json + sincronia.json de
// cada variante), grava o aval do Oliver (variantes/aval.json), gera variantes em segundo plano pelo mesmo script da
// linha de comando (tools/video-kit/scripts/variantes.mjs, zero LLM) e monta o .zip das selecionadas.
// Contrato do projeto: .claude/skills/video/references/variantes.md. Rotas em app/server/handler.ts.
import { existsSync, readFileSync, readdirSync, openSync, readSync, closeSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import { spawn, execFile, type ChildProcess } from 'node:child_process';
import type { ServerResponse } from 'node:http';
import { ROOT, ValidationError, getReview } from './store';
import { Slug } from '../schema';
import * as AT from '../tools/lib/atividade.mjs';

const okPath = (p: string) => !!p && !/(^|\/)\.\.(\/|$)|^\/|[\\:]/.test(p);
function pasta(slug: string, path: string) {
  if (!Slug.safeParse(slug).success) throw new ValidationError(slug, ['slug inválido']);
  if (!okPath(path)) throw new ValidationError(path, ['caminho da peça inválido']);
  const dir = join(ROOT, 'companies', slug, 'contents', path);
  if (!existsSync(join(dir, 'projeto.json'))) throw new ValidationError(dir, ['peça sem projeto.json (variantes)']);
  return dir;
}
const lerJson = <T>(f: string, padrao: T): T => { try { return JSON.parse(readFileSync(f, 'utf8')) as T; } catch { return padrao; } };
const okId = (s: string) => /^[\w-]+$/.test(s);

export const AVAL = ['aprovada', 'final', 'descartada'] as const;
export type Aval = (typeof AVAL)[number];

export interface Opcao { id: string; titulo?: string; fala?: string; voz?: string }
export interface Problema { nivel: 'erro' | 'aviso' | 'info'; regra: string; cena: string | null; msg: string; auto?: boolean; conserto?: string }
export interface VarianteView {
  id: string;
  escolhas: Record<string, string>;
  gerada: boolean;
  nome?: string;
  duracao?: number;
  abertura_s?: number;
  /** caminhos relativos à pasta da variante (exports/<nome>-9x16-rascunho.mp4) + o formato lido do nome */
  exports: { file: string; formato: string }[];
  gerada_em?: string;
  qc?: { status: 'ok' | 'aviso' | 'erro'; corrigidos: number; pendentes: number; sem_render?: boolean };
  erro?: string;
  problemas: Problema[];
  /** o que o script corrigiu sozinho */
  auto: string[];
  /** há sincronia.md (relatório curto para o LLM) */
  relatorio: boolean;
  aval?: Aval;
  /** anotações abertas na revisão da variante (revisao.json dela) */
  abertas: number;
}
export interface VariantesView {
  path: string;
  projeto: { nome: string; tipo?: string; objetivo?: string; rodada?: string };
  eixos: { nome: string; opcoes: Opcao[] }[];
  /** rodadas do projeto já resolvidas em ids de variante; opção que ainda não existe ("<vencedora da r1>") vai em `pendente` */
  rodadas: { id: string; ids: string[]; pendente: { eixo: string; texto: string }[] }[];
  base: { duracao?: number; exports: string[] };
  variantes: VarianteView[];
  job: Job | null;
}

const idDe = (nomes: string[], c: Record<string, string>) => nomes.map((e) => `${e}-${c[e]}`).join('__');
const formatoDe = (f: string) => f.match(/-(\d+x\d+)(?:-rascunho)?\.mp4$/)?.[1] ?? '';

function primeiraFala(o: Record<string, unknown>): string | undefined {
  const falas = o.falas as Record<string, unknown> | undefined;
  for (const v of Object.values(falas ?? {})) {
    if (typeof v === 'string') return v;
    if (v && typeof v === 'object' && typeof (v as { say?: unknown }).say === 'string') return (v as { say: string }).say;
  }
  return undefined;
}

export function lerVariantes(slug: string, path: string): VariantesView {
  const dir = pasta(slug, path);
  const proj = lerJson<Record<string, any>>(join(dir, 'projeto.json'), {});
  const eixosRaw: Record<string, Record<string, unknown>[]> = proj.eixos ?? {};
  const nomes = Object.keys(eixosRaw);
  const eixos = nomes.map((nome) => ({
    nome,
    // opção de voz: mostra a voz (as falas dela são só ajustes de ritmo); outras opções: a 1ª fala que trocam
    opcoes: (eixosRaw[nome] ?? []).map((o) => ({ id: String(o.id), titulo: o.titulo as string | undefined, fala: o.voz ? undefined : primeiraFala(o), voz: o.voz as string | undefined })),
  }));
  // matriz completa: todas as combinações (geradas ou não); a tela marca quais gerar
  const combos = eixos.reduce<Record<string, string>[]>((acc, e) => acc.flatMap((c) => e.opcoes.map((o) => ({ ...c, [e.nome]: o.id }))), [{}]);
  const indice = lerJson<{ variantes?: any[] }>(join(dir, 'variantes', 'indice.json'), {});
  const aval = lerJson<Record<string, { status: Aval }>>(join(dir, 'variantes', 'aval.json'), {});
  const variantes: VarianteView[] = (nomes.length ? combos : []).map((c) => {
    const id = idDe(nomes, c);
    const it = indice.variantes?.find((x) => x.id === id);
    const vdir = join(dir, 'variantes', id);
    const sinc = lerJson<{ problemas?: Problema[]; auto?: string[] }>(join(vdir, 'sincronia.json'), {});
    const exp = join(vdir, 'exports');
    const exports = existsSync(exp) ? readdirSync(exp).filter((f) => f.endsWith('.mp4')).sort().map((f) => ({ file: `exports/${f}`, formato: formatoDe(f) })) : [];
    let abertas = 0;
    try { if (existsSync(join(vdir, 'revisao.json'))) abertas = getReview(slug, `${path}/variantes/${id}`).comments.filter((x) => x.status === 'aberto').length; } catch { /* inválido: aparece no validate */ }
    return {
      id, escolhas: c, gerada: !!it, nome: it?.nome, duracao: it?.duracao, abertura_s: it?.abertura_s, exports, gerada_em: it?.gerada_em,
      qc: it?.qc, erro: it?.erro, problemas: (sinc.problemas ?? []).filter((p) => p.nivel !== 'info'), auto: sinc.auto ?? [],
      relatorio: existsSync(join(vdir, 'sincronia.md')), aval: aval[id]?.status, abertas,
    };
  });
  const rodadas = Object.entries((proj.rodadas ?? {}) as Record<string, unknown>).map(([rid, esc]) => {
    const pendente: { eixo: string; texto: string }[] = [];
    let lista: Record<string, string>[];
    if (Array.isArray(esc)) lista = esc as Record<string, string>[];
    else {
      const e = (esc ?? {}) as Record<string, string[]>;
      const por = eixos.map((x) => {
        const pedidas = e[x.nome] ?? [x.opcoes[0]?.id];
        const validas = pedidas.filter((id) => x.opcoes.some((o) => o.id === id));
        for (const p of pedidas) if (!validas.includes(p)) pendente.push({ eixo: x.nome, texto: p });
        return [x.nome, validas] as const;
      });
      lista = por.reduce<Record<string, string>[]>((acc, [n, ids]) => acc.flatMap((c) => ids.map((id) => ({ ...c, [n]: id }))), [{}]);
    }
    return { id: rid, ids: lista.map((c) => idDe(nomes, c)), pendente };
  });
  const bexp = join(dir, 'exports');
  const base = lerJson<{ duration?: number }>(join(dir, proj.base ?? 'timeline.json'), {});
  return {
    path,
    projeto: { nome: proj.nome ?? basename(dir), tipo: proj.tipo, objetivo: proj.objetivo, rodada: proj.rodada },
    eixos, rodadas,
    base: { duracao: base.duration, exports: existsSync(bexp) ? readdirSync(bexp).filter((f) => f.endsWith('.mp4')).sort().map((f) => `exports/${f}`) : [] },
    variantes,
    job: jobs.get(chave(slug, path)) ?? null,
  };
}

/** aprovar / marcar final / descartar uma variante (status vazio apaga) → variantes/aval.json */
export async function avaliar(slug: string, path: string, b: { ids?: unknown; status?: unknown }) {
  const dir = pasta(slug, path);
  const ids = Array.isArray(b?.ids) ? b.ids.map(String).filter(okId) : [];
  const status = b?.status ? String(b.status) : '';
  if (!ids.length) throw new ValidationError(dir, ['nenhuma variante']);
  if (status && !AVAL.includes(status as Aval)) throw new ValidationError(dir, [`status inválido (use ${AVAL.join(', ')})`]);
  const f = join(dir, 'variantes', 'aval.json');
  const cur = lerJson<Record<string, { status: Aval; em: string }>>(f, {});
  for (const id of ids) {
    if (status) cur[id] = { status: status as Aval, em: new Date().toISOString().slice(0, 19) + 'Z' };
    else delete cur[id];
  }
  const { mkdirSync, writeFileSync } = await import('node:fs');
  mkdirSync(join(dir, 'variantes'), { recursive: true });
  writeFileSync(f, JSON.stringify(cur, null, 2) + '\n');
  return lerVariantes(slug, path);
}

/** escolhe as opções de um eixo numa rodada (ex.: a abertura vencedora da r1 vira a r2) → projeto.json > rodadas */
export async function definirRodada(slug: string, path: string, b: { rodada?: unknown; eixo?: unknown; opcoes?: unknown }) {
  const dir = pasta(slug, path);
  const f = join(dir, 'projeto.json');
  const proj = JSON.parse(readFileSync(f, 'utf8'));
  const rodada = String(b?.rodada ?? ''), eixo = String(b?.eixo ?? '');
  const opcoes = Array.isArray(b?.opcoes) ? b.opcoes.map(String) : [];
  const validas = (proj.eixos?.[eixo] ?? []).map((o: { id: string }) => o.id);
  if (!okId(rodada) || !validas.length) throw new ValidationError(f, ['rodada ou eixo inválido']);
  if (!opcoes.length || opcoes.some((o) => !validas.includes(o))) throw new ValidationError(f, [`opções inválidas (tem: ${validas.join(', ')})`]);
  const r = proj.rodadas?.[rodada];
  if (Array.isArray(r)) throw new ValidationError(f, ['esta rodada é uma lista de combinações: edite o projeto.json']);
  proj.rodadas = { ...proj.rodadas, [rodada]: { ...(r ?? {}), [eixo]: opcoes } };
  const { writeFileSync } = await import('node:fs');
  writeFileSync(f, JSON.stringify(proj, null, 2) + '\n');
  return lerVariantes(slug, path);
}

// ---------- gerar (um job por projeto, em memória; o dock acompanha pelo registro de atividade) ----------
export interface Job {
  estado: 'rodando' | 'ok' | 'erro' | 'parado';
  ids: string[]; feitas: number; atual?: string; /** o que a variante atual está fazendo (render 46%…) */ etapa?: string; formato?: string; soQc: boolean;
  log: string[]; inicio: string; fim?: string; erro?: string;
}
const jobs = new Map<string, Job>();
const procs = new Map<string, ChildProcess>();
const fins = new Map<string, (estado: Job['estado'], erro?: string) => void>();
const chave = (slug: string, path: string) => `${slug}/${path}`;

export function gerar(slug: string, path: string, b: { ids?: unknown; formato?: unknown; soQc?: unknown }) {
  const dir = pasta(slug, path);
  const k = chave(slug, path);
  if (jobs.get(k)?.estado === 'rodando') return lerVariantes(slug, path);
  const view = lerVariantes(slug, path);
  const existentes = new Set(view.variantes.map((v) => v.id));
  const ids = Array.isArray(b?.ids) ? [...new Set(b.ids.map(String))].filter((id) => okId(id) && existentes.has(id)) : [];
  if (!ids.length) throw new ValidationError(dir, ['marque pelo menos uma variante']);
  const formato = typeof b?.formato === 'string' && /^\d+x\d+$/.test(b.formato) ? b.formato : undefined;
  const soQc = !!b?.soQc;
  const args = [join('tools', 'video-kit', 'scripts', 'variantes.mjs'), dir, '--matriz', '--so', ids.join(','), ...(formato ? [`--only=${formato}`] : []), ...(soQc ? ['--qc'] : [])];
  const job: Job = { estado: 'rodando', ids, feitas: 0, formato, soQc, log: [], inicio: new Date().toISOString() };
  jobs.set(k, job);
  const titulo = `${soQc ? 'Conferindo' : 'Gerando'} ${ids.length} variante(s) de ${basename(dir)}${formato ? ` (${formato})` : ''}`;
  const at = AT.iniciar({ slug, tipo: 'render', fonte: 'variantes', titulo, passo: 'montando', link: `/p/${slug}/conteudos?peca=${encodeURIComponent(path)}&aba=variantes`, ref: path });
  const push = (s: string) => {
    for (const l of s.split(/\r?\n|\r/)) {
      if (!l.trim()) continue;
      // progresso do render (HyperFrames): vira a etapa da faixa, não entra no log
      const hf = l.match(/@hf-progress (\{.*\})/);
      if (hf) { try { const p = JSON.parse(hf[1]); job.etapa = `vídeo ${p.pct ?? Math.round((100 * p.done) / p.total)}%`; } catch { /* linha cortada */ } continue; }
      if (/^\s*(──|▸)/.test(l)) job.etapa = undefined;
      job.log.push(l.trimEnd());
      const m = l.match(/^▸ (\S+)/);
      if (m) {
        if (job.atual) job.feitas++;
        job.atual = m[1];
        AT.passo(at.id, `${job.feitas + 1}/${ids.length}: ${m[1]}`);
      }
    }
    if (job.log.length > 300) job.log.splice(0, job.log.length - 300);
  };
  const p = spawn(process.execPath, args, { cwd: ROOT, env: { ...process.env, HUB_ROOT: ROOT, FORCE_COLOR: '0' } });
  procs.set(k, p);
  p.stdout.on('data', (d) => push(String(d)));
  p.stderr.on('data', (d) => push(String(d)));
  const fim = (estado: Job['estado'], erro?: string) => {
    if (job.estado !== 'rodando') return;
    job.estado = estado; job.fim = new Date().toISOString(); job.atual = undefined;
    if (estado === 'ok') job.feitas = ids.length;
    if (erro) job.erro = erro;
    procs.delete(k); fins.delete(k);
    AT.terminar(at.id, estado === 'ok' ? 'feito' : estado === 'parado' ? 'parado' : 'erro',
      estado === 'ok' ? { resumo: `${ids.length} variante(s) prontas` } : { erro: erro ?? estado });
  };
  fins.set(k, fim);
  p.on('error', (e) => fim('erro', e.message));
  p.on('close', (code) => {
    if (!code) return fim('ok');
    // o script sai com 1 quando alguma variante falhou: as outras ficaram prontas no índice
    const falhas = job.log.find((l) => /^✗ \d+ de \d+ falharam/.test(l));
    fim('erro', falhas ?? job.log.filter((l) => /✗|Error/.test(l)).at(-1) ?? `código ${code}`);
  });
  return lerVariantes(slug, path);
}

/** Parar: mata o script e o que ele abriu (render, navegador, ffmpeg) */
export function parar(slug: string, path: string) {
  pasta(slug, path);
  const k = chave(slug, path);
  const p = procs.get(k);
  const job = jobs.get(k);
  if (p?.pid && job?.estado === 'rodando') {
    if (process.platform === 'win32') execFile('taskkill', ['/pid', String(p.pid), '/T', '/F'], () => {});
    else p.kill('SIGTERM');
    job.log.push('── parado pelo Oliver');
    // o close do processo chega depois: marca já como parado para a tela não esperar
    fins.get(k)?.('parado', 'parado pelo Oliver');
  }
  return lerVariantes(slug, path);
}

// ---------- .zip das selecionadas (sem compressão: MP4 já é comprimido) ----------
const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
function crc32(file: string) {
  let c = 0xffffffff;
  const fd = openSync(file, 'r'), buf = Buffer.allocUnsafe(1 << 20);
  try {
    for (let n; (n = readSync(fd, buf, 0, buf.length, null)) > 0;) for (let i = 0; i < n; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  } finally { closeSync(fd); }
  return (c ^ 0xffffffff) >>> 0;
}

/** arquivos do .zip: MP4 das variantes marcadas (só do formato pedido, se houver) */
export function arquivosZip(slug: string, path: string, ids: string[], formato?: string) {
  const dir = pasta(slug, path);
  const view = lerVariantes(slug, path);
  return view.variantes.filter((v) => ids.includes(v.id))
    .flatMap((v) => v.exports.filter((e) => !formato || e.formato === formato).map((e) => join(dir, 'variantes', v.id, e.file)));
}

/** data/hora no formato do zip (MS-DOS) */
const dos = (d: Date) => [(d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()];

export async function enviarZip(res: ServerResponse, nomeZip: string, files: string[]) {
  res.statusCode = 200;
  res.setHeader('content-type', 'application/zip');
  res.setHeader('content-disposition', `attachment; filename="${nomeZip.replace(/[^\w.-]/g, '_')}"`);
  const central: Buffer[] = [];
  let offset = 0;
  const write = (b: Buffer) => new Promise<void>((ok, err) => { offset += b.length; res.write(b, (e) => (e ? err(e) : ok())); });
  for (const f of files) {
    const nome = Buffer.from(basename(f), 'utf8');
    const st = statSync(f), size = st.size, crc = crc32(f), at = offset, [dt, dd] = dos(st.mtime);
    const h = Buffer.alloc(30);
    h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(20, 4); h.writeUInt16LE(0x0800, 6); h.writeUInt16LE(0, 8);
    h.writeUInt16LE(dt, 10); h.writeUInt16LE(dd, 12); h.writeUInt32LE(crc, 14); h.writeUInt32LE(size, 18); h.writeUInt32LE(size, 22);
    h.writeUInt16LE(nome.length, 26); h.writeUInt16LE(0, 28);
    await write(Buffer.concat([h, nome]));
    const fd = openSync(f, 'r'), buf = Buffer.allocUnsafe(1 << 20);
    try { for (let n; (n = readSync(fd, buf, 0, buf.length, null)) > 0;) await write(Buffer.from(buf.subarray(0, n))); } finally { closeSync(fd); }
    const c = Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(20, 4); c.writeUInt16LE(20, 6); c.writeUInt16LE(0x0800, 8); c.writeUInt16LE(0, 10);
    c.writeUInt16LE(dt, 12); c.writeUInt16LE(dd, 14); c.writeUInt32LE(crc, 16); c.writeUInt32LE(size, 20); c.writeUInt32LE(size, 24);
    c.writeUInt16LE(nome.length, 28); c.writeUInt32LE(at, 42);
    central.push(Buffer.concat([c, nome]));
  }
  const cd = Buffer.concat(central), cdAt = offset;
  await write(cd);
  const e = Buffer.alloc(22);
  e.writeUInt32LE(0x06054b50, 0); e.writeUInt16LE(central.length, 8); e.writeUInt16LE(central.length, 10);
  e.writeUInt32LE(cd.length, 12); e.writeUInt32LE(cdAt, 16);
  await write(e);
  res.end();
}
