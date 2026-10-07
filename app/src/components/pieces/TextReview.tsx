// Textos da peça (tarefa 022, fase A): roteiro.md e afins. Modo Revisar = selecionar um trecho → anotar (âncora `roteiro`
// com quote + linha); modo Editar = texto cru com salvar explícito. A IA lê as anotações com `node tools/review.mjs <pasta>`.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, type PieceStatus, type Review, type ReviewComment } from '../../api';
import { useSaveMeta } from './library';
import { Badge, Button, Card, ErrorBox, Select, Textarea, cx, fmtDate } from '../ui';
import { toast } from '../toast';
import { qk, usePieceText } from '../../queries';
import { CommentCard, TipoPicker, nextCommentId, nowLocal, tipoOf, type Tipo } from './shared';

type TextAnchor = Extract<ReviewComment['anchor'], { kind: 'roteiro' }>;
const isText = (c: ReviewComment): c is ReviewComment & { anchor: TextAnchor } => c.anchor.kind === 'roteiro';
const head = (quote: string) => quote.split('\n').map((l) => l.trim()).find(Boolean)?.slice(0, 80) ?? '';

/** linha atual do trecho: a anotada, se ainda contém o começo do trecho; senão a mais próxima que contém; null = o trecho mudou */
export function locate(lines: string[], quote: string, line: number): number | null {
  const h = head(quote);
  if (!h) return null;
  if (lines[line - 1]?.includes(h)) return line;
  let best: number | null = null, dist = Infinity;
  lines.forEach((l, i) => { if (l.includes(h) && Math.abs(i + 1 - line) < dist) { best = i + 1; dist = Math.abs(i + 1 - line); } });
  return best;
}

function Line({ n, text, mark }: { n: number; text: string; mark?: { h: string; color: string; id: string } }) {
  const hd = text.match(/^(#{1,6})\s/);
  let content: React.ReactNode = text || ' ';
  const i = mark ? text.indexOf(mark.h) : -1;
  if (mark && i >= 0) content = <>{text.slice(0, i)}<mark className="rounded-sm px-0.5" style={{ background: `${mark.color}33`, color: 'inherit', boxShadow: `inset 0 -2px 0 ${mark.color}` }}>{text.slice(i, i + mark.h.length)}</mark>{text.slice(i + mark.h.length)}</>;
  return (
    <div data-line={n} className={cx('grid grid-cols-[2.75rem_1fr] gap-3 px-2 rounded', mark && 'bg-amber-50/60')}>
      <span className="select-none text-right text-[11px] text-muted font-mono pt-[3px] tabular-nums relative">
        {mark && <span className="absolute -left-1 top-[7px] w-2 h-2 rounded-full" style={{ background: mark.color }} title={mark.id} />}{n}
      </span>
      <span className={cx('whitespace-pre-wrap break-words leading-6 text-[14px]', hd && 'font-semibold', hd?.[1] === '#' && 'text-lg', hd?.[1] === '##' && 'text-base')}>{content}</span>
    </div>
  );
}

export default function TextReview({ slug, path, texts, review, status, saveReview, saving }: {
  slug: string; path: string; texts: string[]; review: Review; status?: PieceStatus; saveReview: (r: Review) => void; saving: boolean;
}) {
  const qc = useQueryClient();
  const saveMeta = useSaveMeta(slug);
  const [file, setFile] = useState(texts[0] ?? '');
  useEffect(() => { if (!texts.includes(file)) setFile(texts[0] ?? ''); }, [texts, file]);
  const { data, error, isLoading } = usePieceText(slug, path, file);
  const text = data?.text ?? '';
  const lines = useMemo(() => text.replace(/\n$/, '').split('\n'), [text]);

  const [mode, setMode] = useState<'revisar' | 'editar'>('revisar');
  const [edit, setEdit] = useState('');
  const dirty = mode === 'editar' && edit !== text;
  const [savingText, setSavingText] = useState(false);

  const [draft, setDraft] = useState<TextAnchor | null>(null);
  const [tipo, setTipo] = useState<Tipo>('ajustar');
  const [note, setNote] = useState('');
  const [filter, setFilter] = useState<'abertas' | 'todas'>('abertas');
  const box = useRef<HTMLDivElement>(null);

  const comments = review.comments;
  const mine = comments.filter(isText).filter((c) => c.anchor.file === file);
  const located = useMemo(() => mine.map((c) => ({ c, at: locate(lines, c.anchor.quote, c.anchor.line) })), [mine, lines]);
  const markByLine = useMemo(() => {
    const m = new Map<number, { h: string; color: string; id: string }>();
    for (const { c, at } of located) if (c.status === 'aberto' && at && !m.has(at)) m.set(at, { h: head(c.anchor.quote), color: tipoOf(c.tipo).color, id: c.id });
    return m;
  }, [located]);
  const setComments = (cs: ReviewComment[]) => saveReview({ ...review, comments: cs });

  // selecionar texto no modo Revisar = começar uma anotação naquele trecho
  const onMouseUp = () => {
    const sel = window.getSelection();
    const quote = sel?.toString().trim() ?? '';
    if (!sel || !quote || !box.current || !sel.rangeCount) return;
    const r = sel.getRangeAt(0);
    if (!box.current.contains(r.commonAncestorContainer)) return;
    const el = (r.startContainer.nodeType === 1 ? r.startContainer as Element : r.startContainer.parentElement)?.closest('[data-line]')
      ?? (sel.focusNode?.parentElement?.closest('[data-line]') ?? null);
    const line = Number(el?.getAttribute('data-line') ?? 1);
    setDraft({ kind: 'roteiro', file, quote: quote.slice(0, 600), line });
  };
  const jump = (n: number | null) => {
    if (!n) return;
    const el = box.current?.querySelector(`[data-line="${n}"]`);
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    el?.animate([{ background: '#fde68a' }, { background: 'transparent' }], { duration: 1200 });
  };
  const submit = () => {
    if (!draft || !note.trim()) return;
    setComments([...comments, { id: nextCommentId(comments), at: nowLocal(), author: 'oliver', tipo, status: 'aberto', anchor: draft, text: note.trim() }]);
    setDraft(null); setNote(''); window.getSelection()?.removeAllRanges();
  };

  const saveText = async () => {
    setSavingText(true);
    try {
      const r = await api.savePieceText(slug, path, file, edit);
      qc.setQueryData(qk.pieceText(slug, path, file), r);
      setMode('revisar'); toast.ok();
    } catch (e) { toast.error(e, 'Não foi possível salvar o texto'); } finally { setSavingText(false); }
  };
  const switchFile = (f: string) => { if (dirty && !confirm('Há alterações não salvas. Trocar sem salvar?')) return; setMode('revisar'); setDraft(null); setFile(f); };

  const approved = review.approvals?.roteiro;
  const approve = (on: boolean) => {
    saveReview({ ...review, approvals: { ...review.approvals, roteiro: on ? new Date().toISOString().slice(0, 10) : undefined } });
    // roteiro aprovado libera a produção: o funil anda (só para frente, e só se ainda estava antes da produção)
    if (on && (!status || status === 'ideia' || status === 'roteiro')) saveMeta.mutate({ path, patch: { status: 'producao' } });
  };
  const shown = located.filter(({ c }) => filter === 'todas' || c.status === 'aberto');

  if (!texts.length) return <Card className="text-sm text-muted">Esta peça não tem textos (.md/.txt) na pasta.</Card>;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] items-start">
      <div>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {texts.length > 1 ? (
            <Select aria-label="Arquivo" value={file} onChange={(e) => switchFile(e.target.value)}>{texts.map((t) => <option key={t}>{t}</option>)}</Select>
          ) : <span className="font-mono text-sm">{file}</span>}
          <div className="flex rounded-md border border-border overflow-hidden text-sm">
            {(['revisar', 'editar'] as const).map((m) => (
              <button key={m} className={cx('px-3 py-1', mode === m ? 'bg-accent text-white' : 'bg-surface hover:bg-surface-2')}
                onClick={() => { if (m === mode) return; if (m === 'editar') setEdit(text); else if (dirty && !confirm('Descartar alterações?')) return; setMode(m); }}>
                {m === 'revisar' ? 'Revisar' : 'Editar'}
              </button>
            ))}
          </div>
          <span className="ml-auto flex items-center gap-2">
            {approved ? (
              <><Badge color="#16a34a">Roteiro aprovado · {fmtDate(approved)}</Badge><button className="text-xs text-muted hover:text-text" onClick={() => approve(false)}>desfazer</button></>
            ) : <Button variant="ghost" disabled={saving} onClick={() => approve(true)} title="Libera a produção: a IA só anima/diagrama depois disso">Aprovar roteiro</Button>}
          </span>
        </div>
        <ErrorBox error={error} />
        {isLoading ? <div className="text-muted text-sm">Carregando…</div> : mode === 'revisar' ? (
          <Card className="py-3 px-1">
            <div ref={box} onMouseUp={onMouseUp} data-testid="roteiro">
              {lines.map((l, i) => <Line key={i} n={i + 1} text={l} mark={markByLine.get(i + 1)} />)}
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            <Textarea className="font-mono text-[13px] leading-6" rows={Math.min(40, lines.length + 3)} value={edit} onChange={(e) => setEdit(e.target.value)} />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setMode('revisar')}>Cancelar</Button>
              <Button disabled={!dirty || savingText} onClick={saveText}>{savingText ? 'Salvando…' : 'Salvar texto'}</Button>
            </div>
            <p className="text-xs text-muted">As anotações seguem o trecho citado: se a linha mudar de lugar, ela é reencontrada pelo texto.</p>
          </div>
        )}
      </div>

      <div className="space-y-4 lg:sticky lg:top-4">
        <Card>
          <div className="text-sm font-medium mb-2">Nova anotação</div>
          {!draft ? (
            <p className="text-sm text-muted">No modo <b>Revisar</b>, selecione um trecho do texto para anotar.</p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <button className="text-xs text-accent shrink-0 pt-0.5" onClick={() => jump(draft.line)}>linha {draft.line}</button>
                <blockquote className="text-xs text-muted border-l-2 border-border pl-2 line-clamp-4 whitespace-pre-wrap">{draft.quote}</blockquote>
                <button className="ml-auto text-xs text-muted shrink-0" onClick={() => setDraft(null)}>limpar</button>
              </div>
              <TipoPicker value={tipo} onChange={setTipo} />
              <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} autoFocus
                placeholder={tipo === 'ok' ? 'O que está bom aqui (não mexer)' : 'O que mudar neste trecho? (ex.: formal demais, encurtar, trocar o gancho)'} />
              <div className="flex justify-end"><Button disabled={!note.trim() || saving} onClick={submit}>Salvar anotação</Button></div>
            </div>
          )}
        </Card>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="font-medium text-sm">Anotações em {file}</h2>
            <Badge>{mine.filter((c) => c.status === 'aberto').length} abertas</Badge>
            <Select className="ml-auto" value={filter} onChange={(e) => setFilter(e.target.value as 'abertas' | 'todas')}><option value="abertas">só abertas</option><option value="todas">todas</option></Select>
          </div>
          {!shown.length && <p className="text-sm text-muted">Nada por aqui. Depois de anotar, peça: <code>revisa as anotações de {path}</code>.</p>}
          <div className="space-y-2">
            {shown.map(({ c, at }) => (
              <CommentCard key={c.id} c={c}
                anchor={<>{at ? `linha ${at}` : 'trecho mudou'} · <span className="italic">“{head(c.anchor.quote).slice(0, 40)}{c.anchor.quote.length > 40 ? '…' : ''}”</span></>}
                onJump={at ? () => jump(at) : undefined}
                onToggle={() => setComments(comments.map((x) => (x.id === c.id ? { ...x, status: x.status === 'aberto' ? 'resolvido' : 'aberto' } : x)))}
                onDelete={() => setComments(comments.filter((x) => x.id !== c.id))} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
