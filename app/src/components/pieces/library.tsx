// Central de peças: miniatura, ações de computador (abrir pasta/player) e gravação da ficha (peca.json).
// Comum a vídeo, carrossel, post e roteiro: toda peça nova (de qualquer gerador) aparece aqui sem código extra.
import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type PieceFull, type PieceInfo, type PieceMeta } from '../../api';
import { qk } from '../../queries';
import { toast } from '../toast';
import { cx } from '../ui';
import { KIND_LABEL } from './shared';

/** grava um pedaço da ficha com atualização otimista na lista e no detalhe */
export function useSaveMeta(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ path, patch }: { path: string; patch: Partial<PieceMeta> }) => api.savePieceMeta(slug, path, patch),
    onMutate: ({ path, patch }) => {
      const sum = (p: PieceInfo): PieceInfo => p.path !== path ? p : {
        ...p,
        ...(patch.title !== undefined && { title: patch.title }),
        ...(patch.tags && { tags: patch.tags }),
        ...(patch.favorite !== undefined && { favorite: patch.favorite }),
        ...(patch.archived !== undefined && { archived: patch.archived }),
        ...(patch.status !== undefined && { status: patch.status || undefined }),
      };
      qc.setQueryData(qk.pieces(slug), (old: PieceInfo[] | undefined) => old?.map(sum));
      qc.setQueryData(qk.piece(slug, path), (old: PieceFull | undefined) => old && { ...old, ...sum(old), meta: { ...old.meta, ...patch, notes: { ...old.meta.notes, ...patch.notes } } });
    },
    onError: (e, { path }) => { toast.error(e); void qc.invalidateQueries({ queryKey: qk.piece(slug, path) }); void qc.invalidateQueries({ queryKey: qk.pieces(slug) }); },
    onSettled: (_, __, { path }) => { void qc.invalidateQueries({ queryKey: qk.pieces(slug) }); void qc.invalidateQueries({ queryKey: qk.piece(slug, path) }); },
  });
}

export function desktop(slug: string, path: string, how: 'reveal' | 'open', file = '') {
  api.pieceDesktop(slug, path, how, file).catch((e) => toast.error(e));
}

/** miniatura: vídeo toca mudo ao passar o mouse; imagem = 1º slide (ou o principal) */
export function Thumb({ slug, piece, className }: { slug: string; piece: PieceInfo; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const c = piece.cover;
  const url = c && api.pieceFileUrl(slug, piece.path, c.file);
  return (
    <div className={cx('relative bg-neutral-900 overflow-hidden flex items-center justify-center', className)}
      onMouseEnter={() => { void ref.current?.play().catch(() => {}); }}
      onMouseLeave={() => { if (ref.current) { ref.current.pause(); ref.current.currentTime = 1; } }}>
      {c?.type === 'video' ? <video ref={ref} src={`${url}#t=1`} preload="metadata" muted playsInline loop className="h-full w-full object-contain" />
        : c?.type === 'image' ? <img src={url} loading="lazy" alt="" className="h-full w-full object-contain" />
        : <span className="text-white/50 text-sm">{KIND_LABEL[piece.kind].label}{piece.texts.length ? ' · só texto' : ''}</span>}
    </div>
  );
}

export function Star({ on, onClick, className }: { on: boolean; onClick: () => void; className?: string }) {
  return (
    <button type="button" title={on ? 'tirar dos favoritos' : 'favoritar'} aria-pressed={on}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={cx('leading-none text-lg', on ? 'text-amber-400' : 'text-muted hover:text-amber-400', className)}>{on ? '★' : '☆'}</button>
  );
}
