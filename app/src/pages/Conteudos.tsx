// Conteúdos: a central de peças (vídeos, carrosséis, posts e roteiros) de contents/.
// Lista em grade ou lista, com busca, filtros, favoritos e arquivadas. Em cada peça, abas:
// Ficha (prévia, versões, legenda/copy/notas, tags, publicação → peca.json),
// Roteiro (texto anotável) e Edição do vídeo (player + faixas → revisao.json; a IA lê com `node tools/review.mjs <pasta>`).
import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type PieceFull, type PieceInfo, type Review, type ReviewComment } from '../api';
import { Badge, Button, Card, Empty, ErrorBox, Input, Select, cx, fmtDate } from '../components/kit';
import { FillBox } from '../components/fill';
import { toast } from '../components/toast';
import { qk, usePiece, usePieces } from '../queries';
import NewPiece from '../components/pieces/NewPiece';
import TextReview from '../components/pieces/TextReview';
import VideoReview from '../components/pieces/VideoReview';
import PieceSheet from '../components/pieces/PieceSheet';
import { KIND_LABEL, STATUS_LABEL } from '../components/pieces/shared';
import { Star, Thumb, desktop, useSaveMeta } from '../components/pieces/library';
import { TagChip, useProjectTags } from '../components/notes/TagsInput';

export default function Conteudos() {
  const [sp] = useSearchParams();
  const path = sp.get('peca');
  return path ? <PieceDetail path={path} /> : <PieceList />;
}

// preferência de visualização (só conveniência deste navegador)
const VIEW_KEY = 'conteudos:view';
const loadView = (): 'grade' | 'lista' => { try { return localStorage.getItem(VIEW_KEY) === 'lista' ? 'lista' : 'grade'; } catch { return 'grade'; } };

type Sort = 'recentes' | 'data' | 'nome';
function PieceList() {
  const { slug = '' } = useParams();
  const [sp, setSp] = useSearchParams();
  const { data: pieces = [], isLoading, error } = usePieces(slug);
  const { byId } = useProjectTags(slug);
  const save = useSaveMeta(slug);
  // ?novo=<formato> (vindo da galeria de formatos) abre o 'Novo conteúdo' já com o formato
  const newFormat = sp.get('novo') ?? '';
  const [creating, setCreating] = useState(sp.has('novo'));
  const closeNew = () => { setCreating(false); if (sp.has('novo')) setF('novo', ''); };
  const [view, setView] = useState(loadView);
  const f = { q: sp.get('q') ?? '', kind: sp.get('tipo') ?? '', status: sp.get('status') ?? '', tag: sp.get('tag') ?? '', fav: sp.has('fav'), arq: sp.has('arquivadas'), sort: (sp.get('ordem') ?? 'recentes') as Sort };
  const setF = (k: string, v: string | boolean) => {
    const n = new URLSearchParams(sp);
    if (v === '' || v === false) n.delete(k); else n.set(k, v === true ? '1' : v);
    setSp(n, { replace: true });
  };
  const changeView = (v: 'grade' | 'lista') => { setView(v); try { localStorage.setItem(VIEW_KEY, v); } catch { /* sem storage */ } };

  const allTags = useMemo(() => [...new Set(pieces.flatMap((p) => p.tags))].sort(), [pieces]);
  const shown = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    const out = pieces.filter((p) => (f.arq ? p.archived : !p.archived)
      && (!f.kind || p.kind === f.kind) && (!f.status || (p.status ?? 'sem') === f.status) && (!f.tag || p.tags.includes(f.tag)) && (!f.fav || p.favorite)
      && (!q || `${p.title} ${p.path} ${p.tags.join(' ')}`.toLowerCase().includes(q)));
    const by: Record<Sort, (a: PieceInfo, b: PieceInfo) => number> = {
      recentes: (a, b) => b.mtime - a.mtime,
      data: (a, b) => (b.date ?? '').localeCompare(a.date ?? '') || b.path.localeCompare(a.path),
      nome: (a, b) => a.title.localeCompare(b.title, 'pt-BR'),
    };
    return out.sort((a, b) => Number(b.favorite) - Number(a.favorite) || by[f.sort](a, b));
  }, [pieces, f.q, f.kind, f.status, f.tag, f.fav, f.arq, f.sort]);
  const counts = useMemo(() => Object.fromEntries(Object.keys(KIND_LABEL).map((k) => [k, pieces.filter((p) => !p.archived && p.kind === k).length])), [pieces]);
  const archivedCount = pieces.filter((p) => p.archived).length;
  const openPiece = (p: PieceInfo) => setSp({ peca: p.path });

  return (
    <div className="p-8 max-w-[1500px]">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Conteúdos</h1>
          <p className="text-sm text-muted-foreground mt-1">Todas as peças da empresa: abra, veja, anote a legenda/copy e revise a edição.</p>
        </div>
        <Button onClick={() => setCreating(true)}>Novo conteúdo</Button>
      </div>

      {/* tipos como abas rápidas */}
      <div className="flex gap-1 flex-wrap mb-3">
        {[['', 'Todos', pieces.filter((p) => !p.archived).length] as const, ...Object.entries(KIND_LABEL).map(([k, v]) => [k, v.label, counts[k]] as const)].map(([k, label, n]) => (
          <button key={k} onClick={() => setF('tipo', k)} className={cx('px-3 py-1 rounded-full text-sm border', f.kind === k ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:text-foreground')}>
            {label} <span className="opacity-70">{n}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap items-center mb-5">
        <Input className="w-64" placeholder="Buscar por nome, pasta ou tag…" value={f.q} onChange={(e) => setF('q', e.target.value)} />
        <Select aria-label="Status" value={f.status} onChange={(e) => setF('status', e.target.value)}>
          <option value="">todo status</option>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}<option value="sem">sem status</option>
        </Select>
        {allTags.length > 0 && <Select aria-label="Tag" value={f.tag} onChange={(e) => setF('tag', e.target.value)}>
          <option value="">toda tag</option>{allTags.map((t) => <option key={t} value={t}>{byId[t]?.label ?? t}</option>)}
        </Select>}
        <Select aria-label="Ordem" value={f.sort} onChange={(e) => setF('ordem', e.target.value === 'recentes' ? '' : e.target.value)}>
          <option value="recentes">mexidas por último</option><option value="data">data da peça</option><option value="nome">nome</option>
        </Select>
        <label className="text-sm flex items-center gap-1.5"><input type="checkbox" checked={f.fav} onChange={(e) => setF('fav', e.target.checked)} /> só favoritos</label>
        <label className="text-sm flex items-center gap-1.5"><input type="checkbox" checked={f.arq} onChange={(e) => setF('arquivadas', e.target.checked)} /> arquivadas ({archivedCount})</label>
        <div className="ml-auto flex border border-border rounded-md overflow-hidden text-sm">
          {(['grade', 'lista'] as const).map((v) => <button key={v} onClick={() => changeView(v)} className={cx('px-3 py-1', view === v ? 'bg-muted font-medium' : 'text-muted-foreground')}>{v === 'grade' ? 'Grade' : 'Lista'}</button>)}
        </div>
      </div>

      <ErrorBox error={error} />
      {isLoading ? <div className="text-muted-foreground">Carregando…</div> : !shown.length ? (
        pieces.length ? <Empty title="Nada com esses filtros" hint="Limpe a busca ou troque o tipo." />
          : <Empty title="Nenhum conteúdo ainda" hint="Cole um roteiro pronto para começar, ou peça à IA uma pauta." action={<Button onClick={() => setCreating(true)}>Novo conteúdo</Button>} />
      ) : view === 'grade' ? (
        <FillBox><div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(210px,1fr))]">
          {shown.map((p) => (
            <div key={p.path} role="button" tabIndex={0} data-piece={p.path} onClick={() => openPiece(p)} onKeyDown={(e) => e.key === 'Enter' && openPiece(p)}
              className="group text-left bg-card border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-primary/40 transition cursor-pointer">
              <div className="relative">
                <Thumb slug={slug} piece={p} className="aspect-[4/5]" />
                <Badge color={KIND_LABEL[p.kind].color} className="absolute top-2 left-2 !bg-white/90">{KIND_LABEL[p.kind].label}</Badge>
                <span className="absolute top-1.5 right-2"><Star on={p.favorite} onClick={() => save.mutate({ path: p.path, patch: { favorite: !p.favorite } })} /></span>
                {p.openComments > 0 && <span className="absolute bottom-2 right-2 text-[11px] font-medium bg-red-600 text-white rounded-full px-2 py-0.5">{p.openComments} anotação(ões)</span>}
              </div>
              <div className="p-3">
                <div className="font-medium text-sm leading-snug line-clamp-2 first-letter:uppercase">{p.title}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 flex-wrap">
                  {p.date && <span>{fmtDate(p.date)}</span>}
                  {p.videos.length > 1 && <span>· {p.videos.length} versões</span>}
                  {p.images.length > 1 && <span>· {p.images.length} slides</span>}
                </div>
                <div className="flex items-center gap-1 mt-2 flex-wrap">
                  {p.status && <Badge color={STATUS_LABEL[p.status].color}>{STATUS_LABEL[p.status].label}</Badge>}
                  {p.publication?.url && <Badge color="#16a34a">publicado</Badge>}
                  {p.tags.slice(0, 3).map((t) => <TagChip key={t} id={t} def={byId[t]} small />)}
                  <button title="Abrir a pasta no Explorer" onClick={(e) => { e.stopPropagation(); desktop(slug, p.path, 'reveal'); }}
                    className="ml-auto text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100">pasta ↗</button>
                </div>
              </div>
            </div>
          ))}
        </div></FillBox>
      ) : (
        <FillBox><div className="divide-y divide-border border border-border rounded-xl bg-card">
          {shown.map((p) => (
            <div key={p.path} role="button" tabIndex={0} data-piece={p.path} onClick={() => openPiece(p)} onKeyDown={(e) => e.key === 'Enter' && openPiece(p)}
              className="group w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/60 cursor-pointer first:rounded-t-xl last:rounded-b-xl">
              <Star on={p.favorite} onClick={() => save.mutate({ path: p.path, patch: { favorite: !p.favorite } })} />
              <Thumb slug={slug} piece={p} className="w-12 h-14 rounded" />
              <Badge color={KIND_LABEL[p.kind].color} className="w-20 justify-center">{KIND_LABEL[p.kind].label}</Badge>
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate first-letter:uppercase">{p.title}</div>
                <div className="text-xs text-muted-foreground truncate">{p.date ? fmtDate(p.date) : ''} · <span className="font-mono">{p.path}</span>{p.videos.length ? ` · ${p.videos.length} vídeo(s)` : ''}{p.images.length ? ` · ${p.images.length} imagem(ns)` : ''}</div>
              </div>
              {p.tags.slice(0, 3).map((t) => <TagChip key={t} id={t} def={byId[t]} small />)}
              {p.approvals?.roteiro && <Badge color="#16a34a">roteiro aprovado</Badge>}
              {p.status && <Badge color={STATUS_LABEL[p.status].color}>{STATUS_LABEL[p.status].label}</Badge>}
              <span className={cx('text-xs w-24 text-right', p.openComments ? 'text-destructive font-medium' : 'text-muted-foreground')}>
                {p.openComments ? `${p.openComments} aberta(s)` : p.totalComments ? 'tudo resolvido' : '—'}
              </span>
              <button title="Abrir a pasta no Explorer" onClick={(e) => { e.stopPropagation(); desktop(slug, p.path, 'reveal'); }} className="text-xs text-muted-foreground hover:text-foreground">pasta ↗</button>
            </div>
          ))}
        </div></FillBox>
      )}
      <NewPiece slug={slug} open={creating} initialFormat={newFormat} onClose={closeNew} onCreated={(pth) => { setCreating(false); setSp({ peca: pth }); }} />
    </div>
  );
}

function PieceDetail({ path }: { path: string }) {
  const { slug = '' } = useParams();
  const [sp, setSp] = useSearchParams();
  const { data: piece, error, isLoading } = usePiece(slug, path);
  const qc = useQueryClient();
  const saveMeta = useSaveMeta(slug);
  const [renaming, setRenaming] = useState<string | null>(null);

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

  const tabs = piece ? ['ficha', ...(piece.texts.length ? ['roteiro'] : []), ...(piece.kind === 'video' ? ['video'] : [])] : [];
  const tab = tabs.includes(sp.get('aba') ?? '') ? sp.get('aba')! : 'ficha';
  const go = (aba: string) => setSp({ peca: path, aba });
  const review = piece?.review ?? { comments: [] };
  const open = (pred: (c: ReviewComment) => boolean) => review.comments.filter((c) => c.status === 'aberto' && pred(c)).length;
  const rename = () => {
    const t = renaming?.trim();
    if (piece && t && t !== piece.title) saveMeta.mutate({ path, patch: { title: t } });
    setRenaming(null);
  };
  const TAB_LABEL: Record<string, string> = { ficha: 'Ficha', roteiro: 'Roteiro', video: 'Edição do vídeo' };

  return (
    <div className="p-8 max-w-[1500px]">
      <div className="mb-1 text-sm"><Link to="?" className="text-muted-foreground hover:text-foreground">← Conteúdos</Link></div>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="min-w-0 flex-1">
          {renaming !== null ? (
            <Input autoFocus className="text-2xl font-semibold w-full max-w-xl !py-0.5" value={renaming} onChange={(e) => setRenaming(e.target.value)}
              onBlur={rename} onKeyDown={(e) => { if (e.key === 'Enter') rename(); if (e.key === 'Escape') setRenaming(null); }} />
          ) : (
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2 first-letter:uppercase">
              {piece && <Star on={piece.favorite} onClick={() => saveMeta.mutate({ path, patch: { favorite: !piece.favorite } })} />}
              <span className="truncate">{piece?.title ?? path}</span>
              {piece && <button className="text-xs font-normal text-muted-foreground hover:text-foreground" onClick={() => setRenaming(piece.title)}>renomear</button>}
            </h1>
          )}
          <p className="text-xs text-muted-foreground mt-1 font-mono truncate">contents/{path}</p>
        </div>
        {piece && (
          <div className="flex gap-2 shrink-0 items-center flex-wrap justify-end">
            <Badge color={KIND_LABEL[piece.kind].color}>{KIND_LABEL[piece.kind].label}</Badge>
            <Select aria-label="Status" value={review.status ?? ''} onChange={(e) => save.mutate({ ...review, status: (e.target.value || undefined) as Review['status'] })}>
              <option value="">sem status</option>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
            {piece.cover && <Button variant="ghost" onClick={() => desktop(slug, path, 'open', piece.cover!.file)}>{piece.cover.type === 'video' ? 'Abrir no player' : 'Abrir imagem'}</Button>}
            <Button variant="ghost" onClick={() => desktop(slug, path, 'reveal', piece.cover?.file ?? '')}>Abrir pasta</Button>
            <Button variant="ghost" onClick={() => saveMeta.mutate({ path, patch: { archived: !piece.archived } })}>{piece.archived ? 'Desarquivar' : 'Arquivar'}</Button>
          </div>
        )}
      </div>
      <ErrorBox error={error} />
      {isLoading && <div className="text-muted-foreground">Carregando…</div>}
      {piece && (
        <>
          {piece.archived && <Card className="mb-4 text-sm bg-muted">Peça arquivada: não aparece na lista principal.</Card>}
          <div className="flex gap-1 border-b border-border mb-5">
            {tabs.map((t) => {
              const n = t === 'ficha' ? 0 : open((c) => (t === 'roteiro') === (c.anchor.kind === 'roteiro'));
              return (
                <button key={t} onClick={() => go(t)} className={cx('px-4 py-2 text-sm -mb-px border-b-2', tab === t ? 'border-primary text-primary-ink font-medium' : 'border-transparent text-muted-foreground hover:text-foreground')}>
                  {TAB_LABEL[t]}{n ? <span className="ml-1.5 text-xs text-destructive">{n}</span> : null}
                </button>
              );
            })}
          </div>
          {tab === 'ficha' && <PieceSheet slug={slug} piece={piece} />}
          {tab === 'roteiro' && <TextReview slug={slug} path={path} texts={piece.texts} review={review} saveReview={(r) => save.mutate(r)} saving={save.isPending} />}
          {tab === 'video' && (piece.videos.length || piece.timeline
            ? <VideoReview slug={slug} path={path} piece={piece} comments={review.comments} setComments={(cs) => save.mutate({ ...review, comments: cs })} saving={save.isPending} />
            : <Card className="text-sm text-muted-foreground">Sem vídeo exportado ainda.</Card>)}
        </>
      )}
    </div>
  );
}
