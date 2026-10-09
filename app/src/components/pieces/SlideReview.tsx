// Slides e imagens da peça (tarefa 022 fase D): grade dos PNG de png/ + pino com anotação no ponto clicado
// (âncora `slide`: arquivo, número, x/y 0–1) em <peça>/revisao.json. A IA lê com `node tools/review.mjs <pasta>`,
// que devolve o slide com o pino marcado.
import { useState } from 'react';
import { api, type ReviewComment } from '../../api';
import { Badge, Button, Card, Select, Textarea, cx } from '../kit';
import { CommentCard, TipoPicker, nextCommentId, nowLocal, tipoOf, type Anchor, type Tipo } from './shared';

type SlideAnchor = Extract<Anchor, { kind: 'slide' }>;
const isSlide = (c: ReviewComment): c is ReviewComment & { anchor: SlideAnchor } => c.anchor.kind === 'slide';
const where = (a: SlideAnchor) => (a.x == null || a.y == null ? 'slide todo'
  : `${a.y < 0.33 ? 'topo' : a.y < 0.66 ? 'meio' : 'base'} · ${a.x < 0.33 ? 'esquerda' : a.x < 0.66 ? 'centro' : 'direita'}`);

function Pin({ n, color, x, y, faded, pulse, title, onClick }: { n: string; color: string; x: number; y: number; faded?: boolean; pulse?: boolean; title?: string; onClick?: () => void }) {
  return (
    <button type="button" title={title} onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      className={cx('absolute -translate-x-1/2 -translate-y-1/2 min-w-6 h-6 px-1 rounded-full border-2 border-white shadow-md text-[10px] font-semibold text-white z-10', faded && 'opacity-40', pulse && 'animate-pulse')}
      style={{ left: `${x * 100}%`, top: `${y * 100}%`, background: color }}>{n}</button>
  );
}

export default function SlideReview({ slug, path, images, comments, setComments, saving }: {
  slug: string; path: string; images: string[]; comments: ReviewComment[]; setComments: (next: ReviewComment[]) => void; saving: boolean;
}) {
  const [file, setFile] = useState(images[0] ?? '');
  const cur = images.includes(file) ? file : images[0] ?? '';
  const idx = images.indexOf(cur);
  const [draft, setDraft] = useState<SlideAnchor | null>(null);
  const [tipo, setTipo] = useState<Tipo>('corrigir');
  const [text, setText] = useState('');
  const [filter, setFilter] = useState<'abertas' | 'todas'>('abertas');
  const mine = comments.filter(isSlide);
  const here = mine.filter((c) => c.anchor.file === cur);
  const shown = mine.filter((c) => filter === 'todas' || c.status === 'aberto');
  const url = (f: string) => api.pieceFileUrl(slug, path, `png/${f}`);
  const go = (f: string) => { setFile(f); if (draft && draft.file !== f) setDraft(null); };

  const place = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - r.left) / r.width) * 1000) / 1000, y = Math.round(((e.clientY - r.top) / r.height) * 1000) / 1000;
    setDraft({ kind: 'slide', file: cur, slide: idx + 1, x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
  };
  const submit = () => {
    if (!draft || !text.trim()) return;
    setComments([...comments, { id: nextCommentId(comments), at: nowLocal(), author: 'oliver', tipo, status: 'aberto', anchor: draft, text: text.trim() }]);
    setText(''); setDraft(null);
  };
  const keys = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowRight' && idx < images.length - 1) go(images[idx + 1]);
    if (e.key === 'ArrowLeft' && idx > 0) go(images[idx - 1]);
  };

  if (!images.length) return <Card className="text-sm text-muted-foreground">Sem imagens em <code>png/</code>: exporte o carrossel para anotar.</Card>;
  return (
    <div onKeyDown={keys} tabIndex={-1} className="outline-none">
      <div className="grid gap-6 lg:grid-cols-[auto_1fr] items-start">
        <div className="space-y-2">
          <div className="relative inline-block cursor-crosshair select-none" onClick={place} data-testid="slide-view">
            <img src={url(cur)} alt={`Slide ${idx + 1}`} draggable={false} className="block max-h-[70vh] w-auto max-w-full rounded-lg shadow-sm bg-muted" />
            {here.map((c) => c.anchor.x != null && c.anchor.y != null && (
              <Pin key={c.id} n={c.id.slice(1)} color={tipoOf(c.tipo).color} x={c.anchor.x} y={c.anchor.y!} faded={c.status === 'resolvido'} title={`${c.id} · ${tipoOf(c.tipo).label} · ${c.text}`} />
            ))}
            {draft?.file === cur && draft.x != null && <Pin n="+" color={tipoOf(tipo).color} x={draft.x} y={draft.y!} pulse />}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="soft" disabled={idx <= 0} onClick={() => go(images[idx - 1])} aria-label="Slide anterior">←</Button>
            <span className="text-sm tabular-nums">{idx + 1} / {images.length}</span>
            <Button variant="soft" disabled={idx >= images.length - 1} onClick={() => go(images[idx + 1])} aria-label="Próximo slide">→</Button>
            <span className="text-xs text-muted-foreground font-mono truncate">{cur}</span>
            <Button variant="soft" className="ml-auto" onClick={() => setDraft({ kind: 'slide', file: cur, slide: idx + 1 })}>Anotar o slide todo</Button>
          </div>
        </div>

        <Card>
          <div className="text-sm font-medium mb-2">Nova anotação</div>
          {!draft ? (
            <p className="text-sm text-muted-foreground">Clique no ponto do slide que quer comentar (vira um pino) — ou “Anotar o slide todo”. Setas ← → trocam de slide.</p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Badge>slide {draft.slide} · {where(draft)}</Badge>
                <button className="ml-auto text-xs text-muted-foreground" onClick={() => setDraft(null)}>limpar</button>
              </div>
              <TipoPicker value={tipo} onChange={setTipo} />
              <Textarea rows={3} autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder={tipo === 'template' ? 'O que virar componente? (ex.: este card de citação)' : 'O que está errado / o que mudar?'}
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(); }} />
              <div className="flex justify-end"><Button disabled={!text.trim() || saving} onClick={submit}>Salvar anotação</Button></div>
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-3 grid-cols-[repeat(auto-fill,minmax(120px,1fr))]" data-testid="slide-grid">
        {images.map((f, i) => {
          const open = mine.filter((c) => c.anchor.file === f && c.status === 'aberto').length;
          return (
            <button key={f} onClick={() => go(f)} className={cx('relative rounded-lg overflow-hidden border-2 bg-muted', f === cur ? 'border-primary' : 'border-transparent hover:border-border')}>
              <img src={url(f)} alt={`Slide ${i + 1}`} loading="lazy" className="block w-full h-auto" />
              <span className="absolute bottom-1 left-1 text-[10px] font-medium bg-black/60 text-white rounded px-1">{i + 1}</span>
              {open > 0 && <span className="absolute top-1 right-1 text-[10px] font-semibold bg-destructive text-white rounded-full min-w-5 h-5 px-1 flex items-center justify-center">{open}</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="font-medium">Anotações dos slides</h2>
          <Badge>{mine.filter((c) => c.status === 'aberto').length} abertas</Badge>
          <Select className="ml-auto" value={filter} onChange={(e) => setFilter(e.target.value as 'abertas' | 'todas')}><option value="abertas">só abertas</option><option value="todas">todas</option></Select>
        </div>
        {!shown.length && <p className="text-sm text-muted-foreground">Nada por aqui. Depois de anotar, use <b>Pedir ajustes ao Claude</b> (acima): a IA corrige e responde em cada anotação.</p>}
        <div className="space-y-2">
          {shown.map((c) => {
            const n = images.indexOf(c.anchor.file) + 1;
            return (
              <CommentCard key={c.id} c={c} anchor={n ? `slide ${n} · ${where(c.anchor)}` : `${c.anchor.file} (não existe mais)`} onJump={n ? () => go(c.anchor.file) : undefined}
                onToggle={() => setComments(comments.map((x) => (x.id === c.id ? { ...x, status: x.status === 'aberto' ? 'resolvido' : 'aberto' } : x)))}
                onDelete={() => setComments(comments.filter((x) => x.id !== c.id))} />
            );
          })}
        </div>
      </div>
    </div>
  );
}
