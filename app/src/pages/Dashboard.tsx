// Visão geral do projeto: o que espera o Oliver, andamento do quadro, anotações, ideias e concorrentes.
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, type Idea } from '../api';
import { Card, ErrorBox, cx, fmtDate } from '../components/ui';
import { TaskCard } from '../components/board/TaskCard';
import { COLUMNS, isLate, type TaskDoc } from '../components/board/taskUtils';

const IDEA_STATUS: { id: Idea['status']; label: string; color: string }[] = [
  { id: 'nova', label: 'Novas', color: '#60a5fa' },
  { id: 'analisada', label: 'Analisadas', color: 'var(--color-accent)' },
  { id: 'aprovada', label: 'Aprovadas', color: 'var(--color-ok)' },
  { id: 'virou-tarefa', label: 'Viraram tarefa', color: 'var(--color-warn)' },
  { id: 'descartada', label: 'Descartadas', color: '#a1a1aa' },
];
const COL_COLOR: Record<string, string> = { backlog: '#a1a1aa', todo: '#60a5fa', doing: 'var(--color-accent)', review: 'var(--color-warn)', done: 'var(--color-ok)' };

export default function Dashboard() {
  const { slug = '' } = useParams();
  const to = (p: string) => `/p/${slug}/${p}`;
  const project = useQuery({ queryKey: ['project', slug], queryFn: () => api.project(slug), enabled: !!slug });
  const tasks = useQuery({ queryKey: ['tasks', slug], queryFn: () => api.tasks(slug), enabled: !!slug });
  const notes = useQuery({ queryKey: ['notes', slug], queryFn: () => api.notes(slug), enabled: !!slug });
  const ideas = useQuery({ queryKey: ['ideas', slug], queryFn: () => api.ideas(slug), enabled: !!slug });
  const comps = useQuery({ queryKey: ['competitors', slug], queryFn: () => api.competitors(slug), enabled: !!slug });

  const all = tasks.data ?? [];
  const review = all.filter((t) => t.data.status === 'review');
  const mine = all.filter((t) => t.data.assignee === 'oliver' && t.data.status === 'todo');
  const waiting = [...review, ...mine].sort((a, b) => (a.data.status === 'review' ? -1 : 0) - (b.data.status === 'review' ? -1 : 0) || a.data.id.localeCompare(b.data.id));
  const late = all.filter((t) => isLate(t.data));
  const open = all.filter((t) => t.data.status !== 'done').length;
  const p = project.data;

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          {p?.color && <span className="w-3 h-3 rounded-full" style={{ background: p.color }} />}
          <h1 className="text-2xl font-semibold tracking-tight">{p?.name ?? (project.isLoading ? '…' : slug)}</h1>
          {p && p.status !== 'ativo' && <span className="text-xs px-2 py-0.5 rounded-full bg-surface-2 text-muted">{p.status}</span>}
        </div>
        <p className="text-sm text-muted mt-1">{[p?.segment, p?.description].filter(Boolean).join(' · ') || 'Visão geral do projeto'}</p>
        <ErrorBox error={project.error} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat label="Aguardando você" value={tasks.data ? waiting.length : undefined} to={`${to('quadro')}?visao=oliver`} tone={waiting.length ? 'warn' : undefined} hint={`${review.length} em revisão · ${mine.length} a fazer`} />
        <Stat label="Tarefas abertas" value={tasks.data ? open : undefined} to={to('quadro')} hint={`${all.length - open} concluídas`} />
        <Stat label="Atrasadas" value={tasks.data ? late.length : undefined} to={to('quadro')} tone={late.length ? 'danger' : undefined} hint={late.length ? late.map((t) => t.data.id).join(', ') : 'nenhuma'} />
        <Stat label="Concorrentes" value={comps.data?.filter((c) => c.data.status === 'ativo').length} to={to('concorrentes')} hint={comps.data ? `${comps.data.length} cadastrados` : undefined} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Section className="lg:col-span-2" title="Aguardando o Oliver" subtitle="Em revisão + suas tarefas a fazer" link={{ to: `${to('quadro')}?visao=oliver`, label: 'Abrir minha visão' }}>
          {tasks.isLoading ? <Skeleton rows={3} /> : tasks.isError ? <ErrorBox error={tasks.error} /> : waiting.length === 0 ? (
            <EmptyLine>Nada esperando por você.</EmptyLine>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {waiting.slice(0, 8).map((t) => (
                <Link key={t.data.id} to={`${to('quadro')}?visao=oliver&t=${t.data.id}`} className="block">
                  <TaskCard task={t} showBoard />
                </Link>
              ))}
              {waiting.length > 8 && <Link to={`${to('quadro')}?visao=oliver`} className="text-sm text-accent self-center">+ {waiting.length - 8} {waiting.length - 8 === 1 ? "tarefa" : "tarefas"}</Link>}
            </div>
          )}
        </Section>

        <Section title="Quadro" subtitle="Tarefas por coluna" link={{ to: to('quadro'), label: 'Abrir' }}>
          {tasks.isLoading ? <Skeleton rows={5} /> : <ColumnBars tasks={all} />}
        </Section>

        <Section className="lg:col-span-2" title="Últimas anotações" link={{ to: to('anotacoes'), label: 'Ver todas' }}>
          {notes.isLoading ? <Skeleton rows={3} /> : notes.isError ? <ErrorBox error={notes.error} /> : !notes.data?.length ? (
            <EmptyLine>Nenhuma anotação ainda. <Link to={to('anotacoes')} className="text-accent">Escrever a primeira</Link></EmptyLine>
          ) : (
            <ul className="divide-y divide-border -my-1">
              {[...notes.data].sort((a, b) => b.data.updated.localeCompare(a.data.updated)).slice(0, 5).map((n) => (
                <li key={n.data.id}>
                  <Link to={`${to('anotacoes')}?n=${n.data.id}`} className="flex items-center gap-3 py-2 group">
                    {n.data.pinned && <span className="text-[10px] uppercase tracking-wide text-accent font-medium" title="Fixada">fixada</span>}
                    <span className="text-sm font-medium group-hover:text-accent truncate">{n.data.title}</span>
                    {n.data.folder && <span className="text-xs text-muted truncate">{n.data.folder}</span>}
                    <span className="ml-auto text-xs text-muted shrink-0">{fmtDate(n.data.updated)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Ideias" link={{ to: to('ideias'), label: 'Banco de ideias' }}>
          {ideas.isLoading ? <Skeleton rows={4} /> : ideas.isError ? <ErrorBox error={ideas.error} /> : !ideas.data?.length ? (
            <EmptyLine>Nenhuma ideia ainda. <Link to={to('ideias')} className="text-accent">Adicionar</Link></EmptyLine>
          ) : (
            <ul className="space-y-1.5">
              {IDEA_STATUS.map((s) => {
                const n = ideas.data.filter((i) => i.data.status === s.id).length;
                return (
                  <li key={s.id} className={cx('flex items-center gap-2 text-sm', !n && 'text-muted')}>
                    <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />{s.label}
                    <span className="ml-auto tabular-nums font-medium">{n}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        {[['quadro', 'Quadro'], ['concorrentes', 'Concorrentes'], ['ideias', 'Ideias'], ['personas', 'Personas'], ['anotacoes', 'Anotações'], ['contexto', 'Contexto e marca']].map(([path, label]) => (
          <Link key={path} to={to(path)} className="px-3 py-1.5 rounded-md border border-border bg-surface hover:border-accent hover:text-accent transition">{label} →</Link>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, hint, to, tone }: { label: string; value?: number; hint?: string; to: string; tone?: 'warn' | 'danger' }) {
  return (
    <Link to={to}>
      <Card className="hover:border-zinc-300 transition h-full">
        <div className="text-xs font-medium text-muted uppercase tracking-wide">{label}</div>
        <div className={cx('text-3xl font-semibold tabular-nums mt-1', tone === 'warn' && 'text-warn', tone === 'danger' && 'text-danger')}>{value ?? '—'}</div>
        {hint && <div className="text-xs text-muted mt-1 truncate" title={hint}>{hint}</div>}
      </Card>
    </Link>
  );
}

function Section({ title, subtitle, link, className, children }: { title: string; subtitle?: string; link?: { to: string; label: string }; className?: string; children: ReactNode }) {
  return (
    <Card className={className}>
      <div className="flex items-baseline gap-2 mb-3">
        <h2 className="font-semibold">{title}</h2>
        {subtitle && <span className="text-xs text-muted">{subtitle}</span>}
        {link && <Link to={link.to} className="ml-auto text-xs text-accent hover:underline">{link.label} →</Link>}
      </div>
      {children}
    </Card>
  );
}

function ColumnBars({ tasks }: { tasks: TaskDoc[] }) {
  const max = Math.max(1, ...COLUMNS.map((c) => tasks.filter((t) => t.data.status === c.id).length));
  return (
    <ul className="space-y-2.5">
      {COLUMNS.map((c) => {
        const n = tasks.filter((t) => t.data.status === c.id).length;
        return (
          <li key={c.id}>
            <div className="flex items-center text-sm mb-1"><span>{c.label}</span><span className="ml-auto tabular-nums font-medium">{n}</span></div>
            <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(n / max) * 100}%`, background: COL_COLOR[c.id] }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

const EmptyLine = ({ children }: { children: ReactNode }) => <div className="text-sm text-muted py-4">{children}</div>;
const Skeleton = ({ rows }: { rows: number }) => (
  <div className="space-y-2">{Array.from({ length: rows }, (_, i) => <div key={i} className="h-8 rounded-md bg-surface-2 animate-pulse" />)}</div>
);
