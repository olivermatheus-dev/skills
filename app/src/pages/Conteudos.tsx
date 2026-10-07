// Conteúdos (tarefa 022): lista das peças (pastas de contents/) com tipo, status e anotações abertas; "Novo conteúdo"
// a partir de roteiro pronto; e, em cada peça, abas Roteiro (texto anotável/editável) e Vídeo (player + faixas).
// Tudo vai para <peça>/revisao.json; a IA lê com `node tools/review.mjs <pasta>`.
import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type PieceFull, type PieceKind, type Review, type ReviewComment } from '../api';
import { Badge, Button, Card, Empty, ErrorBox, PageHeader, Select, cx, fmtDate } from '../components/ui';
import { toast } from '../components/toast';
import { qk, usePiece, usePieces } from '../queries';
import NewPiece from '../components/pieces/NewPiece';
import TextReview from '../components/pieces/TextReview';
import VideoReview from '../components/pieces/VideoReview';
import { KIND_LABEL, STATUS_LABEL } from '../components/pieces/shared';

const dateOf = (path: string) => path.match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
const nameOf = (path: string) => path.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/-/g, ' ');

export default function Conteudos() {
  const [sp] = useSearchParams();
  const path = sp.get('peca');
  return path ? <PieceDetail path={path} /> : <PieceList />;
}

function PieceList() {
  const { slug = '' } = useParams();
  const [, setSp] = useSearchParams();
  const { data: pieces = [], isLoading, error } = usePieces(slug);
  const [kind, setKind] = useState<PieceKind | ''>('');
  const [creating, setCreating] = useState(false);
  const shown = pieces.filter((p) => !kind || p.kind === kind);

  return (
    <div className="p-8 max-w-[1100px]">
      <PageHeader title="Conteúdos" subtitle="Roteiros, carrosséis e vídeos de cada peça. Anote no ponto exato e peça à IA para corrigir lendo só as anotações."
        actions={<>
          <Select aria-label="Tipo" value={kind} onChange={(e) => setKind(e.target.value as PieceKind | '')}>
            <option value="">todos os tipos</option>{Object.entries(KIND_LABEL).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
          <Button onClick={() => setCreating(true)}>Novo conteúdo</Button>
        </>} />
      <ErrorBox error={error} />
      {isLoading ? <div className="text-muted">Carregando…</div> : !shown.length ? (
        <Empty title="Nenhum conteúdo ainda" hint="Cole um roteiro pronto para começar, ou peça à IA uma pauta." action={<Button onClick={() => setCreating(true)}>Novo conteúdo</Button>} />
      ) : (
        <div className="divide-y divide-border border border-border rounded-xl bg-surface">
          {shown.map((p) => (
            <button key={p.path} onClick={() => setSp({ peca: p.path })} data-piece={p.path}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-2/60 first:rounded-t-xl last:rounded-b-xl">
              <Badge color={KIND_LABEL[p.kind].color} className="w-20 justify-center">{KIND_LABEL[p.kind].label}</Badge>
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate first-letter:uppercase">{nameOf(p.path)}</div>
                <div className="text-xs text-muted truncate">
                  {dateOf(p.path) ? fmtDate(dateOf(p.path)) : ''} · <span className="font-mono">{p.path}</span>
                  {p.texts.length ? ` · ${p.texts.join(', ')}` : ''}{p.videos.length ? ` · ${p.videos.length} vídeo(s)` : ''}
                </div>
              </div>
              {p.approvals?.roteiro && <Badge color="#16a34a">roteiro aprovado</Badge>}
              {p.status && <Badge color={STATUS_LABEL[p.status].color}>{STATUS_LABEL[p.status].label}</Badge>}
              <span className={cx('text-xs w-24 text-right', p.openComments ? 'text-danger font-medium' : 'text-muted')}>
                {p.openComments ? `${p.openComments} aberta(s)` : p.totalComments ? 'tudo resolvido' : '—'}
              </span>
            </button>
          ))}
        </div>
      )}
      <NewPiece slug={slug} open={creating} onClose={() => setCreating(false)} onCreated={(pth) => { setCreating(false); setSp({ peca: pth }); }} />
    </div>
  );
}

function PieceDetail({ path }: { path: string }) {
  const { slug = '' } = useParams();
  const [sp, setSp] = useSearchParams();
  const { data: piece, error, isLoading } = usePiece(slug, path);
  const qc = useQueryClient();

  const save = useMutation({
    mutationFn: (review: Review) => api.saveReview(slug, path, review),
    onMutate: (review) => {
      const prev = qc.getQueryData<PieceFull>(qk.piece(slug, path));
      qc.setQueryData(qk.piece(slug, path), (old: PieceFull | undefined) => (old ? { ...old, review } : old));
      return { prev };
    },
    onSuccess: (r) => qc.setQueryData(qk.piece(slug, path), (old: PieceFull | undefined) => (old ? { ...old, review: r } : old)),
    onError: (e, _, ctx) => { if (ctx?.prev) qc.setQueryData(qk.piece(slug, path), ctx.prev); toast.error(e); },
    onSettled: () => { void qc.invalidateQueries({ queryKey: qk.pieces(slug) }); },
  });

  const tabs = piece ? [...(piece.texts.length ? ['roteiro'] as const : []), ...(piece.kind === 'video' ? ['video'] as const : [])] : [];
  const tab = (tabs as string[]).includes(sp.get('aba') ?? '') ? sp.get('aba')! : piece?.kind === 'video' && piece.videos.length ? 'video' : tabs[0];
  const go = (aba: string) => setSp({ peca: path, aba });
  const review = piece?.review ?? { comments: [] };
  const open = (pred: (c: ReviewComment) => boolean) => review.comments.filter((c) => c.status === 'aberto' && pred(c)).length;

  return (
    <div className="p-8 max-w-[1400px]">
      <div className="mb-1 text-sm"><Link to="?" className="text-muted hover:text-text">← Conteúdos</Link></div>
      <PageHeader title={nameOf(path.split('/').pop() ?? path)} subtitle={path}
        actions={piece && <>
          <Badge color={KIND_LABEL[piece.kind].color}>{KIND_LABEL[piece.kind].label}</Badge>
          <Select aria-label="Status" value={review.status ?? ''} onChange={(e) => save.mutate({ ...review, status: (e.target.value || undefined) as Review['status'] })}>
            <option value="">sem status</option>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
        </>} />
      <ErrorBox error={error} />
      {isLoading && <div className="text-muted">Carregando…</div>}
      {piece && (
        <>
          {tabs.length > 1 && (
            <div className="flex gap-1 border-b border-border mb-5">
              {tabs.map((t) => {
                const n = open((c) => (t === 'roteiro') === (c.anchor.kind === 'roteiro'));
                return (
                  <button key={t} onClick={() => go(t)} className={cx('px-4 py-2 text-sm -mb-px border-b-2', tab === t ? 'border-accent text-accent font-medium' : 'border-transparent text-muted hover:text-text')}>
                    {t === 'roteiro' ? 'Roteiro' : 'Vídeo'}{n ? <span className="ml-1.5 text-xs text-danger">{n}</span> : null}
                  </button>
                );
              })}
            </div>
          )}
          {tab === 'roteiro' && <TextReview slug={slug} path={path} texts={piece.texts} review={review} saveReview={(r) => save.mutate(r)} saving={save.isPending} />}
          {tab === 'video' && <VideoReview slug={slug} path={path} piece={piece} comments={review.comments} setComments={(cs) => save.mutate({ ...review, comments: cs })} saving={save.isPending} />}
          {!tabs.length && <Card className="text-sm text-muted">Nada para revisar aqui ainda (sem textos e sem vídeo).</Card>}
        </>
      )}
    </div>
  );
}
