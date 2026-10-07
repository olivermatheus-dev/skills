// Ficha de produção da peça (peca.json, tarefa 025): a peça como ela é (prévia, versões e principal), o briefing,
// os textos que NÃO são edição (legenda, copy, CTA, hashtags, notas), tags, publicação e resultado, o custo de IA
// por rodada (gravado por `node tools/usage.mjs … --piece`), os dados de produção e o histórico de observações.
// Campos de texto salvam sozinhos (autosave).
import { useEffect, useState } from 'react';
import { api, type CostRound, type PieceFull, type PieceMeta, type PieceObservation } from '../../api';
import { PIECE_NIVEIS, PIECE_OBJETIVOS, PIECE_PROPORCOES, RESULT_FIELDS } from '../../../../schema/piece';
import { Platform } from '../../../../schema/common';
import { Badge, Button, Card, Field, Input, Select, Textarea, cx, fmtDate, fmtNum } from '../ui';
import { SaveIndicator, useAutosave } from '../notes/useAutosave';
import { TagsInput } from '../notes/TagsInput';
import { usePersonas } from '../../queries';
import { desktop, useSaveMeta } from './library';
import { fmtUsd } from './shared';

type Notes = PieceMeta['notes'];
type Briefing = PieceMeta['briefing'];
type Result = NonNullable<PieceMeta['resultado']>;
const NOTE_FIELDS: { key: keyof Notes; label: string; rows: number; hint?: string }[] = [
  { key: 'legenda', label: 'Legenda', rows: 6, hint: 'texto do post (Instagram, TikTok…)' },
  { key: 'copy', label: 'Copy', rows: 4, hint: 'texto de anúncio, título, chamada' },
  { key: 'cta', label: 'CTA', rows: 2 },
  { key: 'hashtags', label: 'Hashtags', rows: 2 },
  { key: 'notas', label: 'Notas', rows: 5, hint: 'ideias, contexto, o que testar' },
];
/** receitas fmt-* (CLAUDE.md > Formatos); a galeria de formatos (027) vai substituir esta lista */
const FORMATOS = ['fmt-post-frase', 'fmt-meme', 'fmt-antes-depois', 'fmt-carrossel-educativo', 'fmt-trailer-lancamento', 'fmt-recorte-funcionalidade', 'fmt-texto-cinetico', 'fmt-dialogo', 'fmt-3d-produto'];
const OBJETIVO_LABEL: Record<typeof PIECE_OBJETIVOS[number], string> = { atrair: 'Atrair', educar: 'Educar', engajar: 'Engajar', converter: 'Converter', reter: 'Reter' };
const NIVEL_LABEL: Record<typeof PIECE_NIVEIS[number], string> = { simples: 'Simples', medio: 'Médio', alto: 'Alto' };
const RESULT_LABEL: Record<typeof RESULT_FIELDS[number], string> = { views: 'Views', alcance: 'Alcance', curtidas: 'Curtidas', comentarios: 'Comentários', salvamentos: 'Salvamentos', compartilhamentos: 'Compart.' };
const ETAPA_LABEL: Record<CostRound['etapa'], string> = { pauta: 'Pauta', roteiro: 'Roteiro', plano: 'Plano', producao: 'Produção', voz: 'Voz', trilha: 'Trilha', revisao: 'Revisão', ajustes: 'Ajustes', outro: 'Outro' };
const today = () => new Date().toISOString().slice(0, 10);

export default function PieceSheet({ slug, piece }: { slug: string; piece: PieceFull }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-6 items-start">
      <div className="space-y-4 min-w-0">
        <Preview slug={slug} piece={piece} />
        <Versions slug={slug} piece={piece} />
        <Cost slug={slug} piece={piece} />
        <History slug={slug} piece={piece} />
      </div>
      <div className="space-y-4">
        <BriefingCard slug={slug} piece={piece} />
        <SheetFields slug={slug} piece={piece} />
      </div>
    </div>
  );
}

function Preview({ slug, piece }: { slug: string; piece: PieceFull }) {
  const c = piece.cover;
  if (c?.type === 'video')
    return <Card className="p-0 overflow-hidden bg-neutral-900"><video key={c.file} src={api.pieceFileUrl(slug, piece.path, c.file)} controls preload="metadata" className="w-full max-h-[70vh] bg-neutral-900" /></Card>;
  if (piece.images.length)
    return (
      <div className="flex gap-3 overflow-x-auto pb-2">
        {piece.images.map((f) => (
          <button key={f} type="button" title="abrir a imagem" onClick={() => desktop(slug, piece.path, 'open', `png/${f}`)} className="shrink-0">
            <img src={api.pieceFileUrl(slug, piece.path, `png/${f}`)} alt={f} loading="lazy" className="h-[420px] rounded-lg border border-border bg-neutral-900" />
            <div className="text-xs text-muted mt-1 text-left font-mono">{f}</div>
          </button>
        ))}
      </div>
    );
  return <Card className="text-sm text-muted">Ainda sem arquivo exportado (exports/ ou png/). Os textos estão na aba Roteiro.</Card>;
}

/** todas as versões exportadas: escolher a principal (capa e player), abrir no player do computador ou no Explorer */
function Versions({ slug, piece }: { slug: string; piece: PieceFull }) {
  const save = useSaveMeta(slug);
  const files = [...piece.videos.map((v) => `exports/${v}`).reverse(), ...piece.images.map((i) => `png/${i}`)];
  if (!files.length) return null;
  const principal = piece.cover?.file;
  return (
    <Card className="p-0">
      <div className="px-4 py-2.5 border-b border-border flex items-center">
        <span className="text-sm font-medium">Arquivos ({files.length})</span>
        <Button variant="ghost" className="ml-auto" onClick={() => desktop(slug, piece.path, 'reveal')}>Abrir pasta</Button>
      </div>
      <div className="divide-y divide-border max-h-80 overflow-y-auto">
        {files.map((f) => (
          <div key={f} className="flex items-center gap-2 px-4 py-2 text-sm">
            <input type="radio" name="principal" checked={principal === f} title="usar como principal" aria-label={`principal: ${f}`}
              onChange={() => save.mutate({ path: piece.path, patch: { principal: f } })} />
            <span className={cx('font-mono text-xs truncate flex-1', principal === f && 'font-semibold')}>{f.replace(/^(exports|png)\//, '')}</span>
            {principal === f && <span className="text-xs text-accent">principal</span>}
            <button className="text-xs text-accent hover:underline" onClick={() => desktop(slug, piece.path, 'open', f)}>abrir</button>
            <button className="text-xs text-muted hover:text-text" onClick={() => desktop(slug, piece.path, 'reveal', f)}>no Explorer</button>
          </div>
        ))}
      </div>
    </Card>
  );
}

const shortModel = (m: string) => m.replace(/^claude-/, '').replace(/-(\d+)-(\d+)$/, ' $1.$2');
const fmtTok = (n: number) => fmtNum(n);

/** custo de IA por rodada (preenchido pela IA com tools/usage.mjs) + dados de produção */
function Cost({ slug, piece }: { slug: string; piece: PieceFull }) {
  const { custo, producao } = piece.meta;
  const cmd = `node tools/usage.mjs --atual --piece companies/${slug}/contents/${piece.path} --etapa producao`;
  const prod: [string, string | undefined][] = [
    ['Duração', producao.duracao ? `${producao.duracao.toLocaleString('pt-BR')} s` : undefined],
    ['Formatos', producao.formatos?.join(' · ')],
    ['Voz', producao.voz],
    ['Trilha', producao.trilha && `${producao.trilha.arquivo}${producao.trilha.licenca ? ` (licença: ${producao.trilha.licenca})` : ' (⚠ sem licença registrada)'}`],
    ['Skills', producao.skills?.join(', ')],
    ['Agentes', producao.agentes?.join(', ')],
    ['Commit', producao.commit],
  ];
  const shownProd = prod.filter(([, v]) => v);
  return (
    <Card className="p-0">
      <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
        <span className="text-sm font-medium">Custo de IA</span>
        {custo.length > 0 && <span className="ml-auto text-sm font-semibold">{fmtUsd(piece.cost)}</span>}
      </div>
      {custo.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted text-left">
              <tr className="border-b border-border">
                <th className="px-4 py-1.5 font-normal">Quando</th><th className="px-2 font-normal">Etapa</th><th className="px-2 font-normal">Modelo</th>
                <th className="px-2 font-normal text-right">Saída</th><th className="px-2 font-normal text-right">Cache (leit./escr.)</th><th className="px-2 font-normal text-right">Tempo</th><th className="px-4 font-normal text-right">US$</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {custo.map((r) => (
                <tr key={`${r.sessao}-${r.etapa}`} title={[`sessão ${r.sessao}`, ...r.porModelo.map((m) => `${m.quem}: ${m.chamadas} chamadas, ${fmtUsd(m.usd)}`), r.nota].filter(Boolean).join('\n')}>
                  <td className="px-4 py-1.5 whitespace-nowrap">{fmtDate(r.data)}</td>
                  <td className="px-2">{ETAPA_LABEL[r.etapa]}</td>
                  <td className="px-2 whitespace-nowrap">{shortModel(r.modelo)}{r.esforco ? <span className="text-muted"> · {r.esforco}</span> : null}{r.porModelo.some((m) => m.quem.includes('subagente')) && <Badge className="ml-1">+ subagentes</Badge>}</td>
                  <td className="px-2 text-right tabular-nums">{fmtTok(r.tokens.saida)}</td>
                  <td className="px-2 text-right tabular-nums whitespace-nowrap">{fmtTok(r.tokens.cacheLeitura)} / {fmtTok(r.tokens.cacheEscrita)}</td>
                  <td className="px-2 text-right tabular-nums">{r.minutos} min</td>
                  <td className="px-4 text-right tabular-nums font-medium">{r.usd.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-4 py-3 text-sm text-muted">
          Nenhuma rodada medida ainda. A IA grava ao fechar cada etapa:
          <code className="block mt-1 text-xs bg-surface-2 rounded px-2 py-1 break-all select-all">{cmd}</code>
        </div>
      )}
      {shownProd.length > 0 && (
        <dl className="px-4 py-3 border-t border-border grid grid-cols-[90px_1fr] gap-x-3 gap-y-1 text-sm">
          {shownProd.map(([k, v]) => <div key={k} className="contents"><dt className="text-muted">{k}</dt><dd className={cx('min-w-0 break-words', k === 'Commit' && 'font-mono text-xs')}>{v}</dd></div>)}
        </dl>
      )}
    </Card>
  );
}

/** histórico de observações com data: o que mudou de uma versão para outra e por quê */
function History({ slug, piece }: { slug: string; piece: PieceFull }) {
  const save = useSaveMeta(slug);
  const [texto, setTexto] = useState('');
  const [versao, setVersao] = useState('');
  const list = piece.meta.historico;
  const set = (historico: PieceObservation[]) => save.mutate({ path: piece.path, patch: { historico } });
  const add = () => {
    if (!texto.trim()) return;
    set([...list, { data: today(), autor: 'oliver', texto: texto.trim(), ...(versao.trim() && { versao: versao.trim() }) }]);
    setTexto(''); setVersao('');
  };
  return (
    <Card>
      <div className="text-sm font-medium mb-2">Histórico de observações</div>
      {list.length > 0 && (
        <ol className="space-y-2 mb-3">
          {[...list].map((o, i) => ({ o, i })).reverse().map(({ o, i }) => (
            <li key={i} className="group text-sm border-l-2 pl-3" style={{ borderColor: o.autor === 'ia' ? 'var(--color-accent, #4f46e5)' : '#16a34a' }}>
              <div className="text-xs text-muted flex gap-2">
                <span>{fmtDate(o.data)}</span>{o.versao && <span className="font-mono">{o.versao}</span>}<span>{o.autor === 'ia' ? 'IA' : 'Oliver'}</span>
                <button className="ml-auto text-danger opacity-0 group-hover:opacity-100" onClick={() => set(list.filter((_, j) => j !== i))}>excluir</button>
              </div>
              <p className="whitespace-pre-wrap">{o.texto}</p>
            </li>
          ))}
        </ol>
      )}
      <div className="flex gap-2 items-start">
        <Input className="w-20" placeholder="v02" value={versao} onChange={(e) => setVersao(e.target.value)} aria-label="versão" />
        <Textarea rows={2} className="flex-1" placeholder="O que mudou e por quê…" value={texto} onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) add(); }} />
        <Button variant="soft" disabled={!texto.trim() || save.isPending} onClick={add}>Anotar</Button>
      </div>
    </Card>
  );
}

function Chips<T extends string>({ options, value, onChange, label }: { options: readonly T[]; value: T[]; onChange: (v: T[]) => void; label: (v: T) => string }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button key={o} type="button" aria-pressed={on} onClick={() => onChange(on ? value.filter((x) => x !== o) : [...value, o])}
            className={cx('px-2.5 py-0.5 rounded-full text-xs border', on ? 'bg-accent text-white border-accent' : 'bg-surface border-border text-muted hover:text-text')}>{label(o)}</button>
        );
      })}
    </div>
  );
}

const PLATFORMS = Platform.options;
/** briefing: o que a peça precisa ser (headline, objetivo, formato, persona, onde sai) */
function BriefingCard({ slug, piece }: { slug: string; piece: PieceFull }) {
  const save = useSaveMeta(slug);
  const { data: personas = [] } = usePersonas(slug);
  const [b, setB] = useState<Briefing>(piece.meta.briefing);
  useEffect(() => { setB(piece.meta.briefing); }, [piece.path]); // eslint-disable-line react-hooks/exhaustive-deps
  const auto = useAutosave<Briefing>({ save: (briefing) => save.mutateAsync({ path: piece.path, patch: { briefing } }) });
  // vazio = apagar o campo (o servidor tira "" e null)
  const set = <K extends keyof Briefing>(k: K, v: Briefing[K] | '' | null) => { const n = { ...b, [k]: v } as Briefing; setB(n); auto.schedule(n); };
  return (
    <Card>
      <div className="flex items-center mb-3">
        <span className="text-sm font-medium">Briefing</span>
        <span className="ml-auto"><SaveIndicator state={auto.state} /></span>
      </div>
      <Field label="Headline" hint="a frase principal: gancho ou título">
        <Textarea rows={2} value={b.headline ?? ''} onChange={(e) => set('headline', e.target.value)} />
      </Field>
      <Field label="Tema"><Input className="w-full" value={b.tema ?? ''} onChange={(e) => set('tema', e.target.value)} /></Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Objetivo">
          <Select className="w-full" value={b.objetivo ?? ''} onChange={(e) => set('objetivo', (e.target.value || '') as Briefing['objetivo'])}>
            <option value="">—</option>{PIECE_OBJETIVOS.map((o) => <option key={o} value={o}>{OBJETIVO_LABEL[o]}</option>)}
          </Select>
        </Field>
        <Field label="Persona">
          <Select className="w-full" value={b.persona ?? ''} onChange={(e) => set('persona', e.target.value)}>
            <option value="">—</option>{personas.map((p) => <option key={p.data.id} value={p.data.id}>{p.data.name}</option>)}
            {b.persona && !personas.some((p) => p.data.id === b.persona) && <option value={b.persona}>{b.persona}</option>}
          </Select>
        </Field>
      </div>
      <Field label="Formato" hint="receita fmt-* (galeria de formatos)">
        <Input className="w-full font-mono text-xs" list="fmt-list" placeholder="fmt-…" value={b.formato ?? ''}
          onChange={(e) => { const v = e.target.value.trim(); if (!v || /^fmt-[a-z0-9-]*$/.test(v)) set('formato', v); }} />
        <datalist id="fmt-list">{FORMATOS.map((f) => <option key={f} value={f} />)}</datalist>
      </Field>
      <Field label="Plataformas"><Chips options={PLATFORMS} value={b.plataformas ?? []} onChange={(v) => set('plataformas', v)} label={(p) => p} /></Field>
      <Field label="Proporções"><Chips options={PIECE_PROPORCOES} value={b.proporcoes ?? []} onChange={(v) => set('proporcoes', v)} label={(p) => p} /></Field>
      {(piece.kind === 'video' || b.duracao || b.nivel) && (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Duração-alvo (s)">
            <Input type="number" min={1} className="w-full" value={b.duracao ?? ''} onChange={(e) => set('duracao', e.target.value ? Number(e.target.value) : null)} />
          </Field>
          <Field label="Nível de edição">
            <Select className="w-full" value={b.nivel ?? ''} onChange={(e) => set('nivel', (e.target.value || '') as Briefing['nivel'])}>
              <option value="">—</option>{PIECE_NIVEIS.map((n) => <option key={n} value={n}>{NIVEL_LABEL[n]}</option>)}
            </Select>
          </Field>
        </div>
      )}
    </Card>
  );
}

function SheetFields({ slug, piece }: { slug: string; piece: PieceFull }) {
  const save = useSaveMeta(slug);
  const [notes, setNotes] = useState<Notes>(piece.meta.notes);
  const [pub, setPub] = useState(piece.meta.publication ?? {});
  const [res, setRes] = useState<Partial<Result>>(piece.meta.resultado ?? {});
  // trocou de peça: recarrega os campos
  useEffect(() => { setNotes(piece.meta.notes); setPub(piece.meta.publication ?? {}); setRes(piece.meta.resultado ?? {}); }, [piece.path]); // eslint-disable-line react-hooks/exhaustive-deps
  const auto = useAutosave<Partial<PieceMeta>>({ save: (patch) => save.mutateAsync({ path: piece.path, patch }) });
  const all = (p: Partial<PieceMeta>) => auto.schedule({ notes, publication: pub, resultado: res as Result, ...p });
  const setNote = (k: keyof Notes, v: string) => { const n = { ...notes, [k]: v }; setNotes(n); all({ notes: n }); };
  const setPubField = (k: keyof typeof pub, v: string) => {
    const p = { ...pub, [k]: v }; setPub(p);
    // link do post publicado preenchido: a peça entra em "publicado"
    all({ publication: p, ...(k === 'url' && v.trim() && piece.status !== 'publicado' && { status: 'publicado' as const }) });
  };
  const setResField = (k: keyof Result, v: string) => {
    const r = { ...res, [k]: k === 'coletadoEm' ? v : v === '' ? null : Math.max(0, Math.round(Number(v))) } as Partial<Result>;
    if (k !== 'coletadoEm' && !r.coletadoEm) r.coletadoEm = today();
    setRes(r); all({ resultado: r as Result });
  };

  return (
    <Card>
      <div className="flex items-center mb-3">
        <span className="text-sm font-medium">Textos da peça</span>
        <span className="ml-auto"><SaveIndicator state={auto.state} /></span>
      </div>
      {NOTE_FIELDS.map((f) => (
        <Field key={f.key} label={f.label} hint={f.hint}>
          <Textarea rows={f.rows} value={notes[f.key] ?? ''} onChange={(e) => setNote(f.key, e.target.value)} />
        </Field>
      ))}
      <Field label="Tags">
        <TagsInput slug={slug} value={piece.tags} onChange={(tags) => save.mutate({ path: piece.path, patch: { tags } })} />
      </Field>
      <div className="text-xs font-medium text-muted mb-1 uppercase tracking-wide">Publicação</div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <Input placeholder="plataforma" value={pub.platform ?? ''} onChange={(e) => setPubField('platform', e.target.value)} />
        <Input type="date" value={pub.date ?? ''} onChange={(e) => setPubField('date', e.target.value)} />
      </div>
      <Input className="w-full" placeholder="link do post publicado" value={pub.url ?? ''} onChange={(e) => setPubField('url', e.target.value)} />
      {(pub.url || piece.status === 'publicado' || Object.keys(res).length > 0) && (
        <>
          <div className="text-xs font-medium text-muted mt-4 mb-1 uppercase tracking-wide flex items-center">
            Resultado
            <span className="ml-auto normal-case tracking-normal font-normal flex items-center gap-1">coletado em
              <Input type="date" className="!py-0.5 text-xs" value={res.coletadoEm ?? ''} onChange={(e) => setResField('coletadoEm', e.target.value)} />
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {RESULT_FIELDS.map((k) => (
              <label key={k} className="text-xs text-muted">{RESULT_LABEL[k]}
                <Input type="number" min={0} className="w-full mt-0.5 tabular-nums" value={res[k] ?? ''} onChange={(e) => setResField(k, e.target.value)} />
              </label>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
