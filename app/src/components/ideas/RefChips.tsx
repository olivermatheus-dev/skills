// Chips de referência no cartão da ideia (041 F3): Quote + veículo + ano; o link abre o item (artigo, notícia, resolução).
// Dentro do cartão (que é clicável), o clique no chip só abre o link e não abre a ideia.
import { Quote } from 'lucide-react';
import type { SourceRef } from '../../api';
import { cx } from '../kit';
import { Tip } from '../competitors/toolbar';

const venueCurto = (v?: string | null) => (v ?? '').replace(/^The\s+/i, '').trim();

export function RefChip({ r, comTitulo, className }: { r: SourceRef; comTitulo?: boolean; className?: string }) {
  const ano = r.publishedAt?.slice(0, 4);
  const rotulo = [venueCurto(r.venue) || r.id, ano].filter(Boolean).join(' · ');
  return (
    <Tip content={`${r.title}\n“${r.quote}”\nverificado em ${r.verify.checkedAt.slice(0, 10).split('-').reverse().join('/')} · abre o item`}>
      <a href={r.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}
        className={cx('inline-flex max-w-full items-center gap-1 rounded-md border border-border bg-muted/50 px-1.5 py-0.5 text-[11px] leading-tight text-muted-foreground transition hover:border-primary/40 hover:text-primary-ink', className)}>
        <Quote className="size-3 shrink-0" aria-hidden />
        <span className={cx('truncate', comTitulo ? 'max-w-[7rem]' : 'max-w-[11rem]')}>{rotulo}</span>
        {comTitulo && <span className="truncate text-foreground/80">{r.title}</span>}
      </a>
    </Tip>
  );
}

/** os chips das referências de uma ideia (ids R-NNNN); some em silêncio o que ainda não carregou */
export function RefChips({ ids, refs, max = 3 }: { ids: string[]; refs: SourceRef[] | undefined; max?: number }) {
  if (!ids.length) return null;
  const byId = new Map((refs ?? []).map((r) => [r.id, r]));
  const achadas = ids.map((id) => byId.get(id)).filter((r): r is SourceRef => !!r);
  if (!achadas.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {achadas.slice(0, max).map((r) => <RefChip key={r.id} r={r} />)}
      {achadas.length > max && <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">+{achadas.length - max}</span>}
    </div>
  );
}
