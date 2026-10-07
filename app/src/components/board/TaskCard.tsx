// Card do Kanban: id, título, responsável, prioridade, prazo, checklist e dependências.
import { cx } from '../ui';
import { assigneeLabel, checklist, fmtShortDate, isAi, isLate, PRIORITY_META, BOARD_LABEL, type TaskDoc } from './taskUtils';

export function AssigneeBadge({ assignee }: { assignee: string }) {
  const tone = assignee === 'oliver' ? 'bg-accent-soft text-accent' : isAi(assignee) ? 'bg-amber-50 text-amber-700' : 'bg-surface-2 text-muted';
  return (
    <span className={cx('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium whitespace-nowrap', tone)}>
      <span aria-hidden className="text-[10px]">{assignee === 'oliver' ? '●' : '◆'}</span>{assigneeLabel(assignee)}
    </span>
  );
}

export function PriorityDot({ priority }: { priority: TaskDoc['data']['priority'] }) {
  const p = PRIORITY_META[priority];
  return <span title={`Prioridade ${p.label.toLowerCase()}`} className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />;
}

export function TaskCard({ task, blocked, showBoard, dragging, onOpen }: {
  task: TaskDoc; blocked?: boolean; showBoard?: boolean; dragging?: boolean; onOpen?: () => void;
}) {
  const t = task.data;
  const ck = checklist(task.body);
  const late = isLate(t);
  return (
    <div
      onClick={onOpen}
      className={cx(
        'group bg-surface border border-border rounded-lg px-3 py-2.5 text-left cursor-pointer select-none',
        'hover:border-zinc-300 hover:shadow-sm transition',
        dragging && 'shadow-lg ring-1 ring-accent/30 rotate-[0.5deg]',
        t.status === 'done' && 'opacity-70',
      )}
    >
      <div className="flex items-center gap-2 text-[11px] text-muted mb-1">
        <PriorityDot priority={t.priority} />
        <span className="font-mono">{t.id}</span>
        {showBoard && <span className="truncate">· {BOARD_LABEL[t.board]}</span>}
        <span className="ml-auto"><AssigneeBadge assignee={t.assignee} /></span>
      </div>
      <div className={cx('text-sm leading-snug font-medium text-text', t.status === 'done' && 'line-through decoration-zinc-300')}>{t.title}</div>
      {(t.due || ck.all > 0 || t.depends.length > 0 || t.parent) && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-muted">
          {t.due && (
            <span className={cx('inline-flex items-center gap-1', late && 'text-danger font-medium')} title={late ? 'Atrasada' : 'Prazo'}>
              <span aria-hidden>◷</span>{fmtShortDate(t.due)}{late && ' · atrasada'}
            </span>
          )}
          {ck.all > 0 && (
            <span className={cx('inline-flex items-center gap-1', ck.done === ck.all && 'text-ok')} title="Checklist">
              <span aria-hidden>☑</span>{ck.done}/{ck.all}
            </span>
          )}
          {t.depends.length > 0 && (
            <span className={cx('inline-flex items-center gap-1', blocked && 'text-warn font-medium')} title={`Depende de ${t.depends.join(', ')}${blocked ? ' (pendente)' : ''}`}>
              <span aria-hidden>⛓</span>{blocked ? 'bloqueada' : t.depends.join(', ')}
            </span>
          )}
          {t.parent && <span className="inline-flex items-center gap-1" title="Tarefa-mãe"><span aria-hidden>↳</span>{t.parent}</span>}
        </div>
      )}
    </div>
  );
}
