// Ficha da peça (peca.json): a peça como ela é (prévia, versões e principal) e os textos que NÃO são edição:
// legenda, copy, CTA, hashtags, notas livres, tags e publicação. Salva sozinho (autosave).
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api, type PieceFull, type PieceMeta } from '../../api';
import { qk, useFormats } from '../../queries';
import { Button, Card, Field, Input, Select, Textarea, cx } from '../ui';
import { SaveIndicator, useAutosave } from '../notes/useAutosave';
import { TagsInput } from '../notes/TagsInput';
import { desktop, useSaveMeta } from './library';

type Notes = PieceMeta['notes'];
const NOTE_FIELDS: { key: keyof Notes; label: string; rows: number; hint?: string }[] = [
  { key: 'legenda', label: 'Legenda', rows: 6, hint: 'texto do post (Instagram, TikTok…)' },
  { key: 'copy', label: 'Copy', rows: 4, hint: 'texto de anúncio, título, chamada' },
  { key: 'cta', label: 'CTA', rows: 2 },
  { key: 'hashtags', label: 'Hashtags', rows: 2 },
  { key: 'notas', label: 'Notas', rows: 5, hint: 'ideias, contexto, o que testar, resultado depois de publicar' },
];

export default function PieceSheet({ slug, piece }: { slug: string; piece: PieceFull }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-6 items-start">
      <div className="space-y-4 min-w-0">
        <Preview slug={slug} piece={piece} />
        <Versions slug={slug} piece={piece} />
      </div>
      <SheetFields slug={slug} piece={piece} />
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

/** formato da galeria (027): a IA carrega a skill dele ao produzir ou refazer a peça */
function FormatField({ slug, piece }: { slug: string; piece: PieceFull }) {
  const save = useSaveMeta(slug);
  const qc = useQueryClient();
  const { data: formats = [] } = useFormats();
  const cur = piece.meta.formato ?? '';
  const fmt = formats.find((f) => f.id === cur);
  const set = (formato: string) => save.mutate({ path: piece.path, patch: { formato } }, { onSuccess: () => void qc.invalidateQueries({ queryKey: qk.formats() }) });
  return (
    <Field label="Formato" hint={fmt ? fmt.essencia : 'A IA segue a skill do formato escolhido.'}>
      <div className="flex gap-2 items-center">
        <Select className="flex-1" value={cur} onChange={(e) => set(e.target.value)}>
          <option value="">— sem formato —</option>
          {formats.map((f) => <option key={f.id} value={f.id}>{f.nome}{f.status === 'rascunho' ? ' (rascunho)' : ''}</option>)}
        </Select>
        {fmt && <Link className="text-xs text-accent hover:underline shrink-0" to={`/p/${slug}/formatos?formato=${fmt.id}`}>ver na galeria</Link>}
      </div>
    </Field>
  );
}

function SheetFields({ slug, piece }: { slug: string; piece: PieceFull }) {
  const save = useSaveMeta(slug);
  const [notes, setNotes] = useState<Notes>(piece.meta.notes);
  const [pub, setPub] = useState(piece.meta.publication ?? {});
  // trocou de peça: recarrega os campos
  useEffect(() => { setNotes(piece.meta.notes); setPub(piece.meta.publication ?? {}); }, [piece.path]); // eslint-disable-line react-hooks/exhaustive-deps
  const auto = useAutosave<Partial<PieceMeta>>({ save: (patch) => save.mutateAsync({ path: piece.path, patch }) });
  const setNote = (k: keyof Notes, v: string) => { const n = { ...notes, [k]: v }; setNotes(n); auto.schedule({ notes: n, publication: pub }); };
  const setPubField = (k: keyof typeof pub, v: string) => { const p = { ...pub, [k]: v }; setPub(p); auto.schedule({ notes, publication: p }); };

  return (
    <Card className="lg:sticky lg:top-4">
      <div className="flex items-center mb-3">
        <span className="text-sm font-medium">Textos da peça</span>
        <span className="ml-auto"><SaveIndicator state={auto.state} /></span>
      </div>
      <FormatField slug={slug} piece={piece} />
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
    </Card>
  );
}
