// Peças (tarefa 022): tipos de anotação e o cartão de anotação, comuns ao vídeo e ao roteiro.
import type { ReactNode } from 'react';
import type { PieceKind, Review, ReviewComment } from '../../api';
import { Badge, Card, cx } from '../ui';

export type Anchor = ReviewComment['anchor'];
export type Tipo = ReviewComment['tipo'];

export const TIPOS: { id: Tipo; label: string; color: string; hint: string }[] = [
  { id: 'corrigir', label: 'Corrigir', color: '#dc2626', hint: 'bug: algo errado, quebrado ou fora da marca' },
  { id: 'ajustar', label: 'Ajustar', color: '#d97706', hint: 'ajuste fino (tempo, posição, tamanho, texto)' },
  { id: 'template', label: 'Template', color: '#4f46e5', hint: 'ficou bom: transformar em componente reutilizável (galeria)' },
  { id: 'ok', label: 'Ok', color: '#16a34a', hint: 'está certo, não mexer' },
];
export const tipoOf = (id: Tipo) => TIPOS.find((t) => t.id === id)!;

export const KIND_LABEL: Record<PieceKind, { label: string; color: string }> = {
  video: { label: 'Vídeo', color: '#7c3aed' },
  carrossel: { label: 'Carrossel', color: '#0891b2' },
  roteiro: { label: 'Roteiro', color: '#d97706' },
};
export const STATUS_LABEL: Record<NonNullable<Review['status']>, { label: string; color: string }> = {
  rascunho: { label: 'Rascunho', color: '#71717a' },
  em_revisao: { label: 'Em revisão', color: '#d97706' },
  aprovado: { label: 'Aprovado', color: '#16a34a' },
};

export function TipoPicker({ value, onChange }: { value: Tipo; onChange: (t: Tipo) => void }) {
  return (
    <div className="flex gap-1.5 flex-wrap" role="radiogroup" aria-label="Tipo">
      {TIPOS.map((t) => (
        <button key={t.id} type="button" role="radio" aria-checked={value === t.id} title={t.hint} onClick={() => onChange(t.id)}
          className={cx('px-2.5 py-1 rounded-full text-xs font-medium border transition', value === t.id ? 'text-white' : 'bg-surface text-text border-border')}
          style={value === t.id ? { background: t.color, borderColor: t.color } : undefined}>{t.label}</button>
      ))}
    </div>
  );
}

export const nextCommentId = (cs: ReviewComment[]) => `c${Math.max(0, ...cs.map((c) => parseInt(c.id.slice(1), 10) || 0)) + 1}`;
export const nowLocal = () => new Date().toISOString().slice(0, 19);

/** cartão de uma anotação: tipo, âncora (clicável), texto, resposta da IA, resolver/reabrir/excluir */
export function CommentCard({ c, anchor, onJump, onToggle, onDelete, extra }: {
  c: ReviewComment; anchor: ReactNode; onJump?: () => void; onToggle: () => void; onDelete: () => void; extra?: ReactNode;
}) {
  return (
    <Card className={cx('py-3', c.status === 'resolvido' && 'opacity-60')} data-comment={c.id}>
      <div className="flex items-center gap-2 text-xs flex-wrap">
        <span className="font-mono text-muted">{c.id}</span>
        <Badge color={tipoOf(c.tipo).color}>{tipoOf(c.tipo).label}</Badge>
        {onJump ? <button className="text-accent hover:underline text-left" onClick={onJump}>{anchor}</button> : <span className="text-muted">{anchor}</span>}
        {extra}
        <span className="ml-auto flex gap-2">
          <button className="text-muted hover:text-text" onClick={onToggle}>{c.status === 'aberto' ? 'marcar resolvida' : 'reabrir'}</button>
          <button className="text-danger" onClick={onDelete}>excluir</button>
        </span>
      </div>
      <p className="text-sm mt-1 whitespace-pre-wrap">{c.text}</p>
      {c.reply && <p className="text-sm mt-1 text-muted border-l-2 border-ok pl-2">IA: {c.reply}</p>}
    </Card>
  );
}
