// Tags em chips: Enter ou vírgula adiciona, Backspace no campo vazio remove a última.
// As tags do arquivo são slugs (schema TagList); as cores e rótulos vêm de tags.yml do projeto.
import { useId, useState } from 'react';
import type { TagDef } from '../../api';
import { useTags } from '../../queries';
import { slugify } from '../../../../core/platform';
import { cx } from '../kit';

export const toTag = (s: string) => (s.trim() ? slugify(s) : '');

/** Tags do projeto (tags.yml) indexadas por id. */
export function useProjectTags(slug?: string) {
  const q = useTags(slug);
  const list = q.data?.tags ?? [];
  const byId = Object.fromEntries(list.map((t) => [t.id, t])) as Record<string, TagDef>;
  return { list, byId };
}

export function TagChip({ id, def, onRemove, small }: { id: string; def?: TagDef; onRemove?: () => void; small?: boolean }) {
  const color = def?.color;
  return (
    <span
      className={cx('inline-flex items-center gap-1 rounded-full font-medium bg-muted text-muted-foreground', small ? 'px-1.5 py-0 text-[11px]' : 'px-2 py-0.5 text-xs')}
      style={color ? { background: `${color}22`, color } : undefined}
    >
      {def?.label ?? id}
      {onRemove && (
        <button type="button" onClick={onRemove} className="opacity-60 hover:opacity-100 leading-none" aria-label={`remover ${id}`}>×</button>
      )}
    </span>
  );
}

export function TagsInput({ value, onChange, slug, placeholder = 'adicionar tag…', className }: {
  value: string[]; onChange: (v: string[]) => void; slug?: string; placeholder?: string; className?: string;
}) {
  const [text, setText] = useState('');
  const { list, byId } = useProjectTags(slug);
  const dl = useId();
  const add = (raw: string) => {
    const novos = raw.split(',').map(toTag).filter(Boolean).filter((t) => !value.includes(t));
    if (novos.length) onChange([...value, ...[...new Set(novos)]]);
    setText('');
  };
  return (
    <div className={cx('flex flex-wrap items-center gap-1.5 px-2 py-1.5 rounded-md border border-border bg-card min-h-[34px] focus-within:border-primary', className)}>
      {value.map((t) => <TagChip key={t} id={t} def={byId[t]} onRemove={() => onChange(value.filter((x) => x !== t))} />)}
      <input
        list={dl}
        value={text}
        placeholder={value.length ? '' : placeholder}
        onChange={(e) => (e.target.value.endsWith(',') ? add(e.target.value) : setText(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); add(text); }
          else if (e.key === 'Backspace' && !text && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={() => text && add(text)}
        className="flex-1 min-w-[90px] bg-transparent outline-none text-sm"
      />
      <datalist id={dl}>
        {list.filter((t) => !value.includes(t.id)).map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
      </datalist>
    </div>
  );
}
