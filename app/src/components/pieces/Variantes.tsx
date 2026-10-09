// Aba Variantes da peça de vídeo com projeto.json (tarefa 045 D): a matriz de combinações (eixos × opções) em Fluxo
// (React Flow: base → ramos por eixo → variantes) ou Matriz (linhas × colunas), selo do QC de sincronia, aval
// (aprovada / final / descartada), marcar e Gerar no fundo (variantes.mjs, zero LLM), Baixar as marcadas (.zip) e Anotar
// (abre a Edição do vídeo da própria variante, revisão 022). Dados: core/variantes.ts.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Download, FolderOpen, GitBranch, Grid3x3, Loader2, MessageSquarePlus, Square, Star, X } from 'lucide-react';
import { api, type VariantesView, type VariantesVista, type VarianteView } from '../../api';
import { toast } from '../toast';
import { Badge, Button, Card, Select, cx } from '../kit';
import { useFillHeight } from '../fill';
import { desktop } from './library';
import VariantesFluxo from './VariantesFluxo';
import VariantesInsumos from './VariantesInsumos';

const qkVar = (slug: string, path: string) => ['variantes', slug, path] as const;
const MODO_KEY = 'hub:variantes:modo';
const loadModo = (): 'fluxo' | 'matriz' => { try { return localStorage.getItem(MODO_KEY) === 'matriz' ? 'matriz' : 'fluxo'; } catch { return 'fluxo'; } };

export const QC_COR = { ok: '#16a34a', aviso: '#d97706', erro: '#dc2626' } as const;
export const AVAL_LABEL = { aprovada: { label: 'Aprovada', color: '#16a34a' }, final: { label: 'Final', color: '#7c3aed' }, descartada: { label: 'Descartada', color: '#71717a' } } as const;

/** o MP4 da variante no formato pedido (ou 9:16, ou o primeiro) */
export const exportDe = (v: VarianteView, formato?: string) =>
  v.exports.find((e) => e.formato === formato) ?? v.exports.find((e) => e.formato === '9x16') ?? v.exports[0];
export const urlVar = (slug: string, path: string, v: VarianteView, file: string) => api.pieceFileUrl(slug, `${path}/variantes/${v.id}`, file);
/** rótulo curto da opção: "abertura pergunta" */
export const rotulo = (v: VarianteView, eixos: string[]) => eixos.map((e) => v.escolhas[e]).join(' · ');

/** miniatura que toca ao passar o mouse */
export function VarThumb({ src, className }: { src?: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  if (!src) return <div className={cx('bg-muted rounded grid place-items-center text-[10px] text-muted-foreground', className)}>sem vídeo</div>;
  return (
    <video ref={ref} src={`${src}#t=2`} muted playsInline loop preload="metadata" className={cx('bg-neutral-900 rounded object-cover', className)}
      onMouseEnter={() => void ref.current?.play().catch(() => {})}
      onMouseLeave={() => { const v = ref.current; if (v) { v.pause(); v.currentTime = 2; } }} />
  );
}

export function QcSelo({ v }: { v: VarianteView }) {
  if (!v.gerada) return <span className="text-[11px] text-muted-foreground">não gerada</span>;
  if (v.erro) return <Badge color={QC_COR.erro}>falhou</Badge>;
  if (!v.qc) return null;
  const t = v.qc.status === 'ok' ? (v.qc.corrigidos ? `ok · ${v.qc.corrigidos} corrigido(s)` : 'sincronia ok') : `${v.qc.status} · ${v.qc.pendentes} pendente(s)`;
  return <Badge color={QC_COR[v.qc.status]}>{t}{v.qc.sem_render && !v.exports.length ? ' · sem vídeo' : ''}</Badge>;
}
export function AvalSelo({ v }: { v: VarianteView }) {
  return v.aval ? <Badge color={AVAL_LABEL[v.aval].color}>{AVAL_LABEL[v.aval].label}</Badge> : null;
}

export default function Variantes({ slug, path }: { slug: string; path: string }) {
  const qc = useQueryClient();
  const { data, error } = useQuery({
    queryKey: qkVar(slug, path),
    queryFn: () => api.variantes(slug, path),
    refetchInterval: (q) => (q.state.data?.job?.estado === 'rodando' ? 2000 : 20_000), // parado: confere de vez em quando (o terminal ou outra aba pode ter gerado)
  });
  const set = (v: VariantesVista) => qc.setQueryData(qkVar(slug, path), v);
  const [modo, setModo] = useState(loadModo);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [foco, setFoco] = useState<string | null>(null);
  const [formato, setFormato] = useState('');
  const [busy, setBusy] = useState(false);
  const [showLog, setShowLog] = useState(false);

  // terminou de gerar: avisa e recarrega a peça (miniaturas novas)
  const estado = data?.job?.estado;
  const antes = useRef(estado);
  useEffect(() => {
    if (antes.current === 'rodando' && estado && estado !== 'rodando') {
      if (estado === 'ok') toast.ok('Variantes prontas');
      else if (estado === 'erro') toast.error(new Error(data?.job?.erro ?? 'alguma variante falhou'), 'Geração terminou com erro');
    }
    antes.current = estado;
  }, [estado]); // eslint-disable-line react-hooks/exhaustive-deps

  const eixos = useMemo(() => data?.eixos.map((e) => e.nome) ?? [], [data]);
  const formatos = useMemo(() => [...new Set(data?.variantes.flatMap((v) => v.exports.map((e) => e.formato)).filter(Boolean) ?? [])].sort(), [data]);
  if (error) return <Card className="text-sm text-destructive">{String((error as Error).message)}</Card>;
  if (!data) return <div className="text-muted-foreground">Carregando…</div>;
  if (!data.variantes.length) return (
    <div className="space-y-3">
      {data.insumosErro && <Card className="text-sm text-destructive">Insumos indisponíveis: {data.insumosErro}</Card>}
      {data.insumos && <VariantesInsumos slug={slug} path={path} ins={data.insumos} onView={set} onRecarregar={() => void qc.invalidateQueries({ queryKey: qkVar(slug, path) })} />}
      <Card className="text-sm text-muted-foreground">O projeto.json ainda não tem eixos (ver .claude/skills/video/references/variantes.md).</Card>
    </div>
  );

  const job = data.job;
  const rodando = job?.estado === 'rodando';
  const focada = data.variantes.find((v) => v.id === foco) ?? null;
  const marcadas = data.variantes.filter((v) => sel.has(v.id));
  const comVideo = marcadas.filter((v) => v.exports.some((e) => !formato || e.formato === formato));
  const toggle = (ids: string[], on?: boolean) => setSel((s) => {
    const n = new Set(s);
    const liga = on ?? ids.some((id) => !n.has(id));
    for (const id of ids) if (liga) n.add(id); else n.delete(id);
    return n;
  });
  const trocarModo = (m: 'fluxo' | 'matriz') => { setModo(m); try { localStorage.setItem(MODO_KEY, m); } catch { /* sem storage */ } };

  const gerar = async (soQc = false) => {
    setBusy(true);
    try { set(await api.gerarVariantes(slug, path, { ids: [...sel], formato: formato || undefined, soQc })); toast.ok(soQc ? 'Conferindo a sincronia no fundo' : 'Gerando no fundo: acompanhe aqui ou no dock'); }
    catch (e) { toast.error(e, 'Não foi possível gerar'); } finally { setBusy(false); }
  };
  const avaliar = async (ids: string[], status: string) => {
    try { set(await api.avaliarVariantes(slug, path, ids, status)); } catch (e) { toast.error(e); }
  };
  const vencedora = async (rodada: string, eixo: string, opcao: string) => {
    try { set(await api.definirRodada(slug, path, { rodada, eixo, opcoes: [opcao] })); toast.ok(`${rodada}: ${eixo} = ${opcao}`); } catch (e) { toast.error(e); }
  };

  return (
    <div className="space-y-3">
      {data.insumosErro && <Card className="text-sm text-destructive">Insumos indisponíveis: {data.insumosErro}</Card>}
      {data.insumos && <VariantesInsumos slug={slug} path={path} ins={data.insumos} onView={set} onRecarregar={() => void qc.invalidateQueries({ queryKey: qkVar(slug, path) })} />}
      {/* barra: modo, marcar por rodada, formato, ações */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-border p-0.5 bg-card">
          {(['fluxo', 'matriz'] as const).map((m) => (
            <button key={m} onClick={() => trocarModo(m)} className={cx('px-2.5 py-1 text-sm rounded-md inline-flex items-center gap-1.5', modo === m ? 'bg-muted font-medium' : 'text-muted-foreground hover:text-foreground')}>
              {m === 'fluxo' ? <GitBranch className="size-3.5" /> : <Grid3x3 className="size-3.5" />}{m === 'fluxo' ? 'Fluxo' : 'Matriz'}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground ml-1">Marcar:</span>
        {data.rodadas.map((r) => (
          <button key={r.id} disabled={!r.ids.length} title={r.pendente.length ? `falta escolher: ${r.pendente.map((p) => p.eixo).join(', ')}` : `${r.ids.length} variante(s)`}
            onClick={() => setSel(new Set(r.ids))}
            className={cx('px-2 py-0.5 text-xs rounded-full border border-border', r.ids.length ? 'hover:bg-muted' : 'opacity-50 cursor-not-allowed', r.id === data.projeto.rodada && 'font-semibold')}>
            {r.id}{r.ids.length ? ` (${r.ids.length})` : ''}
          </button>
        ))}
        <button className="px-2 py-0.5 text-xs rounded-full border border-border hover:bg-muted" onClick={() => setSel(new Set(data.variantes.map((v) => v.id)))}>todas ({data.variantes.length})</button>
        <button className="px-2 py-0.5 text-xs rounded-full border border-border hover:bg-muted" onClick={() => setSel(new Set(data.variantes.filter((v) => v.aval === 'aprovada' || v.aval === 'final').map((v) => v.id)))}>aprovadas</button>
        {sel.size > 0 && <button className="px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground" onClick={() => setSel(new Set())}>limpar</button>}
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground tabular-nums">{sel.size} marcada(s)</span>
          <Select aria-label="Formato" value={formato} onChange={(e) => setFormato(e.target.value)} title="formato para gerar, ver e baixar">
            <option value="">todos os formatos</option>
            {(formatos.length ? formatos : ['4x5', '9x16']).map((f) => <option key={f} value={f}>{f.replace('x', ':')}</option>)}
          </Select>
          <Button variant="ghost" disabled={!sel.size || rodando || busy} onClick={() => void gerar(true)} title="monta e confere a sincronia sem renderizar (rápido)">Conferir</Button>
          <Button disabled={!sel.size || rodando || busy} onClick={() => void gerar()}>{busy ? <Loader2 className="size-4 animate-spin" /> : null}Gerar {sel.size || ''}</Button>
          <a aria-disabled={!comVideo.length} href={comVideo.length ? api.variantesZipUrl(slug, path, comVideo.map((v) => v.id), formato || undefined) : undefined}
            className={cx('inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm', comVideo.length ? 'hover:bg-muted' : 'opacity-50 pointer-events-none')}>
            <Download className="size-4" />Baixar {comVideo.length || ''} (.zip)
          </a>
        </div>
      </div>

      {/* rodada que espera uma escolha (ex.: r2 = abertura vencedora da r1) */}
      {data.rodadas.filter((r) => r.pendente.length).map((r) => r.pendente.map((p) => (
        <Card key={`${r.id}-${p.eixo}`} className="py-2.5 flex flex-wrap items-center gap-2 text-sm bg-muted/50">
          <span><b>{r.id}</b> espera: {p.texto.replace(/[<>]/g, '')}.</span>
          <span className="text-muted-foreground">Escolher {p.eixo}:</span>
          {data.eixos.find((e) => e.nome === p.eixo)?.opcoes.map((o) => (
            <Button key={o.id} variant="soft" onClick={() => void vencedora(r.id, p.eixo, o.id)}><Star className="size-3.5" />{o.id}</Button>
          ))}
        </Card>
      )))}

      {job && (job.estado === 'rodando' || Date.parse(job.fim ?? '') > Date.now() - 10 * 60_000) && (
        <JobFaixa job={job} showLog={showLog} setShowLog={setShowLog} onParar={async () => { try { set(await api.pararVariantes(slug, path)); } catch (e) { toast.error(e); } }} />
      )}

      <Area>
        <div className="rounded-xl border border-border bg-card overflow-auto min-h-[420px] xl:min-h-0">
          {modo === 'fluxo'
            ? <VariantesFluxo slug={slug} path={path} data={data} sel={sel} foco={foco} formato={formato} onFoco={setFoco} onToggle={toggle} />
            : <Matriz slug={slug} path={path} data={data} sel={sel} foco={foco} formato={formato} onFoco={setFoco} onToggle={toggle} />}
        </div>
        <div className="min-h-0 overflow-y-auto"><Detalhe slug={slug} path={path} data={data} v={focada} formato={formato} eixos={eixos} onAval={avaliar} /></div>
      </Area>
    </div>
  );
}

/** fluxo/matriz + painel ocupam o resto da tela (padrão de altura do app): cada coluna rola por dentro */
function Area({ children }: { children: React.ReactNode }) {
  const [ref, h] = useFillHeight();
  return <div ref={ref} style={{ height: h }} className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-4 xl:grid-rows-1 max-xl:!h-auto">{children}</div>;
}

function JobFaixa({ job, showLog, setShowLog, onParar }: { job: NonNullable<VariantesView['job']>; showLog: boolean; setShowLog: (b: boolean) => void; onParar: () => void }) {
  const rodando = job.estado === 'rodando';
  const pct = Math.round((100 * (job.feitas + (rodando && job.atual ? 0.5 : 0))) / Math.max(1, job.ids.length));
  return (
    <Card className="py-2.5">
      <div className="flex items-center gap-3 text-sm">
        {rodando ? <Loader2 className="size-4 animate-spin text-primary-ink" /> : job.estado === 'ok' ? <Check className="size-4 text-green-600" /> : <X className="size-4 text-destructive" />}
        <span className="font-medium">
          {rodando ? `${job.soQc ? 'Conferindo' : 'Gerando'} ${Math.min(job.feitas + 1, job.ids.length)} de ${job.ids.length}` : job.estado === 'ok' ? `${job.ids.length} variante(s) prontas` : job.estado === 'parado' ? 'Parado' : 'Terminou com erro'}
        </span>
        {rodando && job.atual && <span className="font-mono text-xs text-muted-foreground truncate">{job.atual}{job.etapa ? ` · ${job.etapa}` : ''}</span>}
        {!rodando && job.erro && <span className="text-xs text-destructive truncate">{job.erro}</span>}
        <span className="ml-auto flex gap-2 shrink-0">
          <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setShowLog(!showLog)}>{showLog ? 'esconder log' : 'ver log'}</button>
          {rodando && <Button variant="ghost" className="whitespace-nowrap" onClick={onParar}><Square className="size-3.5" />Parar</Button>}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted mt-2 overflow-hidden"><div className={cx('h-full transition-all', job.estado === 'erro' ? 'bg-destructive' : 'bg-primary')} style={{ width: `${rodando ? pct : 100}%` }} /></div>
      {showLog && <pre className="mt-2 max-h-56 overflow-auto text-[11px] leading-snug bg-muted rounded p-2 whitespace-pre-wrap">{job.log.slice(-120).join('\n')}</pre>}
    </Card>
  );
}

type VistaProps = { slug: string; path: string; data: VariantesView; sel: Set<string>; foco: string | null; formato: string; onFoco: (id: string) => void; onToggle: (ids: string[], on?: boolean) => void };

/** Matriz: colunas = 1º eixo, linhas = combinações dos outros eixos (2 eixos = vozes × aberturas) */
function Matriz({ slug, path, data, sel, foco, formato, onFoco, onToggle }: VistaProps) {
  const [col, ...resto] = data.eixos;
  const linhas = resto.reduce<Record<string, string>[]>((acc, e) => acc.flatMap((c) => e.opcoes.map((o) => ({ ...c, [e.nome]: o.id }))), [{}]);
  const achar = (l: Record<string, string>, c: string) => data.variantes.find((v) => v.escolhas[col.nome] === c && resto.every((e) => v.escolhas[e.nome] === l[e.nome]))!;
  const ids = (vs: VarianteView[]) => vs.map((v) => v.id);
  return (
    <table className="w-full border-separate border-spacing-2 text-sm">
      <thead>
        <tr>
          <th className="text-left align-bottom text-xs font-normal text-muted-foreground p-1">{resto.map((e) => e.nome).join(' · ') || '—'} ↓ · {col.nome} →</th>
          {col.opcoes.map((o) => (
            <th key={o.id} className="text-left align-top font-normal p-1 min-w-[180px]">
              <button className="font-medium hover:underline" title="marcar a coluna" onClick={() => onToggle(ids(linhas.map((l) => achar(l, o.id))))}>{o.id}</button>
              {o.fala && <div className="text-xs text-muted-foreground line-clamp-2" title={o.fala}>“{o.fala}”</div>}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {linhas.map((l) => {
          const chave = resto.map((e) => l[e.nome]).join('·') || 'base';
          return (
            <tr key={chave}>
              <th className="text-left align-top font-medium p-1 whitespace-nowrap">
                <button className="hover:underline" title="marcar a linha" onClick={() => onToggle(ids(col.opcoes.map((o) => achar(l, o.id))))}>{resto.map((e) => l[e.nome]).join(' · ') || '—'}</button>
              </th>
              {col.opcoes.map((o) => {
                const v = achar(l, o.id);
                const ex = exportDe(v, formato);
                return (
                  <td key={o.id} className="align-top p-0">
                    <div role="button" tabIndex={0} onClick={() => onFoco(v.id)} onKeyDown={(e) => e.key === 'Enter' && onFoco(v.id)}
                      className={cx('flex gap-2 p-2 rounded-lg border cursor-pointer', foco === v.id ? 'border-primary ring-2 ring-primary/25' : 'border-border hover:border-foreground/30',
                        !v.gerada && 'border-dashed', v.aval === 'descartada' && 'opacity-50')}>
                      <VarThumb src={ex && urlVar(slug, path, v, ex.file)} className="w-12 h-[86px] shrink-0" />
                      <div className="min-w-0 flex-1 space-y-1">
                        <label className="flex items-center gap-1.5 text-xs" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={sel.has(v.id)} onChange={(e) => onToggle([v.id], e.target.checked)} aria-label={`marcar ${v.id}`} />
                          {v.duracao ? `${v.duracao.toFixed(1)} s` : ''}
                        </label>
                        <div className="flex flex-wrap gap-1"><QcSelo v={v} /><AvalSelo v={v} /></div>
                        {v.abertas > 0 && <div className="text-[11px] text-destructive">{v.abertas} anotação(ões)</div>}
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/** painel da variante focada: player, QC (o que o script corrigiu e o que falta), aval, anotar, baixar */
function Detalhe({ slug, path, data, v, formato, eixos, onAval }: { slug: string; path: string; data: VariantesView; v: VarianteView | null; formato: string; eixos: string[]; onAval: (ids: string[], status: string) => void }) {
  if (!v) {
    const n = (s: string) => data.variantes.filter((x) => x.qc?.status === s).length;
    const geradas = data.variantes.filter((x) => x.gerada).length;
    return (
      <Card className="text-sm space-y-2">
        <div className="font-medium">{data.projeto.nome}</div>
        {data.projeto.objetivo && <p className="text-muted-foreground">{data.projeto.objetivo}</p>}
        <p>{geradas} de {data.variantes.length} gerada(s) · <span style={{ color: QC_COR.ok }}>{n('ok')} ok</span>{n('aviso') ? <> · <span style={{ color: QC_COR.aviso }}>{n('aviso')} aviso</span></> : null}{n('erro') ? <> · <span style={{ color: QC_COR.erro }}>{n('erro')} erro</span></> : null}</p>
        <p className="text-muted-foreground">Clique numa variante para ver, anotar, aprovar ou baixar. Marque as caixas para gerar ou baixar várias de uma vez.</p>
        {data.eixos.map((e) => (
          <div key={e.nome}>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mt-2 mb-1">{e.nome} ({e.opcoes.length})</div>
            <ul className="space-y-1">
              {e.opcoes.map((o) => <li key={o.id} className="text-xs"><b>{o.id}</b>{o.fala ? <span className="text-muted-foreground"> — “{o.fala}”</span> : o.voz ? <span className="text-muted-foreground"> — {o.voz}</span> : null}</li>)}
            </ul>
          </div>
        ))}
      </Card>
    );
  }
  const ex = exportDe(v, formato);
  const vpath = `${path}/variantes/${v.id}`;
  const pend = v.problemas.filter((p) => !p.auto);
  return (
    <Card className="space-y-3 p-3">
      {ex ? <video key={ex.file} src={urlVar(slug, path, v, ex.file)} controls preload="metadata" className="w-full max-h-[46vh] rounded-lg bg-neutral-900" />
        : <div className="h-40 rounded-lg bg-muted grid place-items-center text-sm text-muted-foreground">{v.gerada ? 'sem MP4 (só conferida)' : 'ainda não gerada: marque e clique em Gerar'}</div>}
      <div>
        <div className="font-medium text-sm">{rotulo(v, eixos)}</div>
        <div className="text-xs text-muted-foreground font-mono break-all">{v.nome ?? v.id}</div>
        {v.gerada && <div className="text-xs text-muted-foreground mt-0.5">{v.duracao?.toFixed(1)} s · corpo começa em {v.abertura_s?.toFixed(1)} s{v.exports.length ? ` · ${v.exports.map((e) => e.formato.replace('x', ':')).join(', ')}` : ''}</div>}
      </div>
      <div className="flex flex-wrap gap-1.5"><QcSelo v={v} /><AvalSelo v={v} /></div>
      {v.erro && <p className="text-xs text-destructive">{v.erro}</p>}
      {v.auto.length > 0 && <p className="text-xs text-muted-foreground">O script corrigiu sozinho: {v.auto.join('; ')}.</p>}
      {pend.length > 0 && (
        <div className="text-xs space-y-1">
          <div className="font-medium">Falta resolver{v.relatorio ? ' (relatório para a IA em sincronia.md)' : ''}:</div>
          <ul className="space-y-1">{pend.map((p, i) => <li key={i}><span style={{ color: p.nivel === 'erro' ? QC_COR.erro : QC_COR.aviso }}>{p.regra}{p.cena ? ` ${p.cena}` : ''}</span>: {p.msg}</li>)}</ul>
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {(['aprovada', 'final', 'descartada'] as const).map((s) => (
          <Button key={s} variant={v.aval === s ? 'primary' : 'soft'} disabled={!v.gerada} onClick={() => onAval([v.id], v.aval === s ? '' : s)}>
            {s === 'aprovada' ? <Check className="size-3.5" /> : s === 'final' ? <Star className="size-3.5" /> : <X className="size-3.5" />}{s === 'aprovada' ? 'Aprovar' : s === 'final' ? 'Final' : 'Descartar'}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {v.gerada && <Link to={`?peca=${encodeURIComponent(vpath)}&aba=video`} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"><MessageSquarePlus className="size-4" />Anotar{v.abertas ? ` (${v.abertas})` : ''}</Link>}
        {ex && <a href={urlVar(slug, path, v, ex.file)} download className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"><Download className="size-4" />MP4 {ex.formato.replace('x', ':')}</a>}
        {v.gerada && <Button variant="ghost" onClick={() => desktop(slug, vpath, 'reveal', ex?.file ?? '')}><FolderOpen className="size-4" />Pasta</Button>}
      </div>
    </Card>
  );
}
