// Card compacto da persona na lista: faixa e avatar na cor dela, nome curto, papel, resumo em 2 linhas,
// ocupação/idade, consciência, 1 frase real e a contagem de cada seção com ícone.
import { Briefcase, Cake, Quote } from 'lucide-react';
import type { Doc, Persona, TagDef } from '../../api';
import { cx } from '../kit';
import { TagChip } from '../notes/TagsInput';
import { AwarenessMeter } from './awareness';
import { Avatar, colorOf, colorVars, RoleBadge, splitName } from './identity';
import { SECTIONS } from './sections';

export function PersonaCard({ doc, tagDefs, onOpen }: { doc: Doc<Persona>; tagDefs: Record<string, TagDef>; onOpen: () => void }) {
  const p = doc.data;
  const color = colorOf(p);
  const { short, tagline } = splitName(p.name);
  const facts = [p.occupation && { icon: Briefcase, text: p.occupation }, p.age && { icon: Cake, text: p.age }].filter(Boolean) as { icon: typeof Briefcase; text: string }[];
  const quote = p.quotes[0];
  const counts = SECTIONS.filter((s) => s.key !== 'quotes' && p[s.key].length > 0);

  return (
    <button type="button" onClick={onOpen} style={colorVars(color)}
      className={cx('group relative text-left bg-card border border-border rounded-xl overflow-hidden flex flex-col',
        'transition hover:shadow-md hover:border-[var(--pc-line)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pc)]',
        p.role === 'anti-persona' && 'border-dashed')}>
      <span className="absolute inset-x-0 top-0 h-1 bg-[var(--pc)]" aria-hidden />
      <div className="p-4 pt-[18px] flex flex-col gap-2.5 flex-1">
        <div className="flex items-start gap-3">
          <Avatar name={p.name} color={color} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold truncate">{short}</span>
              <RoleBadge role={p.role} className="ml-auto shrink-0" />
            </div>
            {tagline && <div className="text-xs text-muted-foreground truncate" title={tagline}>{tagline}</div>}
          </div>
        </div>

        {p.summary && <p className="text-sm text-foreground/80 leading-snug line-clamp-2" title={p.summary}>{p.summary}</p>}

        {facts.length > 0 && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground min-w-0">
            {facts.map(({ icon: Icon, text }) => (
              <span key={text} className="inline-flex items-center gap-1 min-w-0 last:shrink-0"><Icon className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{text}</span></span>
            ))}
          </div>
        )}

        <AwarenessMeter value={p.awareness} color="var(--pc)" />

        {quote && (
          <div className="flex gap-2 rounded-lg px-2.5 py-1.5 bg-[var(--pc-soft)] text-[13px] text-[var(--pc-ink)]">
            <Quote className="h-3.5 w-3.5 mt-0.5 shrink-0 opacity-70" />
            <span className="italic line-clamp-1">{quote}</span>
          </div>
        )}

        <div className="mt-auto pt-2.5 border-t border-border flex items-center gap-3 flex-wrap">
          {counts.length ? counts.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1 text-xs text-muted-foreground" title={`${p[s.key].length} ${s.short}`}>
              <s.icon className="h-3.5 w-3.5" />{p[s.key].length}<span className="sr-only"> {s.short}</span>
            </span>
          )) : <span className="text-xs text-muted-foreground">Sem dores, desejos ou objeções ainda</span>}
          {p.tags.length > 0 && <span className="ml-auto flex gap-1">{p.tags.slice(0, 2).map((t) => <TagChip key={t} id={t} def={tagDefs[t]} small />)}</span>}
        </div>
      </div>
    </button>
  );
}
