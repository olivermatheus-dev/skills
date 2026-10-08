// Personas: filtros por papel + busca à vista, cards compactos na cor de cada persona (a grade rola por dentro)
// e o painel lateral de leitura/edição (components/personas/PersonaSheet).
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Search, X } from 'lucide-react';
import { Button, Empty, ErrorBox, PageHeader, cx } from '../components/kit';
import { FillBox } from '../components/fill';
import { useProjectTags } from '../components/notes/TagsInput';
import { ROLES, type Role } from '../components/personas/identity';
import { PersonaCard } from '../components/personas/PersonaCard';
import { blankPersona, PersonaSheet, type OpenPersona } from '../components/personas/PersonaSheet';
import { usePersonas } from '../queries';
import { AppContent } from '../components/AppContent';

const norm = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

export default function Personas() {
  const { slug = '' } = useParams();
  const { data, isLoading, error } = usePersonas(slug);
  const { byId: tagDefs } = useProjectTags(slug);
  // painel aberto; `error` = a gravação falhou e o painel voltou com o rascunho do usuário
  const [open, setOpen] = useState<OpenPersona | null>(null);
  const [role, setRole] = useState<Role | ''>('');
  const [q, setQ] = useState('');

  const sorted = useMemo(() => {
    const order = (r: Role) => ROLES.findIndex((x) => x.id === r);
    return [...(data ?? [])].sort((a, b) => order(a.data.role) - order(b.data.role) || a.data.name.localeCompare(b.data.name, 'pt-BR'));
  }, [data]);
  const counts = useMemo(() => Object.fromEntries(ROLES.map((r) => [r.id, sorted.filter((p) => p.data.role === r.id).length])), [sorted]);
  const shown = useMemo(() => {
    const nq = norm(q.trim());
    return sorted.filter((p) => (!role || p.data.role === role) && (!nq || norm([p.data.name, p.data.summary, p.data.occupation ?? '', ...p.data.tags].join(' ')).includes(nq)));
  }, [sorted, role, q]);

  const chip = (active: boolean) => cx('inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-sm border transition',
    active ? 'bg-foreground text-background border-foreground' : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/30');

  return (
    <AppContent>
      <PageHeader
        title="Personas"
        subtitle="Para quem a gente fala (e para quem não). Base de roteiros, anúncios e páginas."
        actions={<Button onClick={() => setOpen(blankPersona())}><span className="inline-flex items-center gap-1.5"><Plus className="h-4 w-4" />Nova persona</span></Button>}
      />
      {isLoading && <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-60 rounded-xl bg-muted animate-pulse" />)}</div>}
      <ErrorBox error={error} />
      {data && !data.length && (
        <Empty title="Nenhuma persona cadastrada" hint="Comece pela persona primária: quem mais sente a dor que o produto resolve."
          action={<Button onClick={() => setOpen(blankPersona())}>Criar persona</Button>} />
      )}
      {sorted.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <button type="button" className={chip(!role)} onClick={() => setRole('')}>Todas <span className="tabular-nums opacity-70">{sorted.length}</span></button>
            {ROLES.map((r) => (
              <button key={r.id} type="button" className={chip(role === r.id)} onClick={() => setRole(role === r.id ? '' : r.id)} disabled={!counts[r.id] && role !== r.id}
                style={!counts[r.id] && role !== r.id ? { opacity: 0.5 } : undefined}>
                <r.icon className="h-3.5 w-3.5" />{r.label} <span className="tabular-nums opacity-70">{counts[r.id]}</span>
              </button>
            ))}
            <label className="ml-auto relative flex items-center">
              <Search className="h-4 w-4 absolute left-2.5 text-muted-foreground pointer-events-none" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar persona…" aria-label="Buscar persona"
                className="h-8 w-56 rounded-full border border-border bg-card pl-8 pr-7 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" />
              {q && <button type="button" onClick={() => setQ('')} className="absolute right-2 text-muted-foreground hover:text-foreground" aria-label="Limpar busca"><X className="h-3.5 w-3.5" /></button>}
            </label>
          </div>
          <FillBox>
            {shown.length ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 pb-1">
                {shown.map((p) => <PersonaCard key={p.data.id} doc={p} tagDefs={tagDefs} onOpen={() => setOpen(p)} />)}
              </div>
            ) : <div className="text-sm text-muted-foreground py-10 text-center">Nenhuma persona com esse filtro.</div>}
          </FillBox>
        </>
      )}
      {open && <PersonaSheet key={`${open.data.id || 'nova'}${open.error ? ':erro' : ''}`} slug={slug} initial={open} tagDefs={tagDefs} onClose={() => setOpen(null)} onFailed={setOpen} />}
    </AppContent>
  );
}
