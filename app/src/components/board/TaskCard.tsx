// Card do Kanban: título, quem está com a tarefa, prioridade, prazo, checklist, comentários e o que espera o Oliver.
import { CalendarDays, CheckSquare, CornerDownRight, Link2, Loader2, MessageSquare, MessageSquareWarning } from 'lucide-react';
import { cx } from '../kit';
import { assigneeLabel, checklist, fmtShortDate, isLate, PRIORITY_META, BOARD_LABEL, taskThread, type TaskDoc } from './taskUtils';
import { WhoAvatar } from './Who';

export function AssigneeBadge({ assignee }: { assignee: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground whitespace-nowrap">
      <WhoAvatar who={assignee} size="xs" />{assigneeLabel(assignee)}
    </span>
  );
}

export function PriorityDot({ priority }: { priority: TaskDoc['data']['priority'] }) {
  const p = PRIORITY_META[priority];
  return <span title={`Prioridade ${p.label.toLowerCase()}`} className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />;
}

export function TaskCard({ task, blocked, showBoard, dragging, running, ready, onOpen }: {
  task: TaskDoc; blocked?: boolean; showBoard?: boolean; dragging?: boolean; running?: boolean; ready?: boolean; onOpen?: () => void;
}) {
  const t = task.data;
  const ck = checklist(task.body);
  const late = isLate(t);
  const { comments, pending } = taskThread(task.body);
  return (
    <div
      onClick={onOpen}
      className={cx(
        'group bg-card border rounded-lg px-3 py-2.5 text-left cursor-pointer select-none shadow-xs',
        'hover:border-zinc-300 hover:shadow-sm transition',
        running ? 'border-primary/50 ring-2 ring-primary/15' : pending ? 'border-amber-300' : 'border-border',
        dragging && 'shadow-lg ring-1 ring-primary/30 rotate-[0.5deg]',
        t.status === 'done' && 'opacity-70',
      )}
    >
      {(running || pending) && (
        <div className="mb-1.5 flex">
          {running ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft text-primary-ink px-2 py-0.5 text-[11px] font-medium">
              <Loader2 className="size-3 animate-spin" /> IA trabalhando
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 px-2 py-0.5 text-[11px] font-medium" title={pending!.text}>
              <MessageSquareWarning className="size-3" /> {pending!.kind === 'pergunta' ? 'Pergunta para você' : 'Revisar'}
            </span>
          )}
        </div>
      )}
      <div className="flex items-start gap-2">
        <div className={cx('flex-1 text-sm leading-snug font-medium text-foreground', t.status === 'done' && 'line-through decoration-zinc-300')}>{t.title}</div>
        <WhoAvatar who={t.assignee} className="mt-0.5" />
      </div>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-2 text-[11px] text-muted-foreground">
        <PriorityDot priority={t.priority} />
        <span className="font-mono">{t.id}</span>
        {ready && <span className="text-primary-ink font-medium" title="Pronta: entra no próximo Rodar IA">pronta</span>}
        {showBoard && <span>{BOARD_LABEL[t.board]}</span>}
        {t.due && (
          <span className={cx('inline-flex items-center gap-1', late && 'text-destructive font-medium')} title={late ? 'Atrasada' : 'Prazo'}>
            <CalendarDays className="size-3" />{fmtShortDate(t.due)}
          </span>
        )}
        {ck.all > 0 && (
          <span className={cx('inline-flex items-center gap-1', ck.done === ck.all && 'text-success')} title="Checklist">
            <CheckSquare className="size-3" />{ck.done}/{ck.all}
          </span>
        )}
        {comments.length > 0 && (
          <span className="inline-flex items-center gap-1" title={`${comments.length} comentário(s)`}>
            <MessageSquare className="size-3" />{comments.length}
          </span>
        )}
        {t.depends.length > 0 && (
          <span className={cx('inline-flex items-center gap-1', blocked && 'text-warning font-medium')} title={`Depende de ${t.depends.join(', ')}${blocked ? ' (pendente)' : ''}`}>
            <Link2 className="size-3" />{blocked ? 'bloqueada' : t.depends.length}
          </span>
        )}
        {t.parent && <span className="inline-flex items-center gap-1" title="Tarefa-mãe"><CornerDownRight className="size-3" />{t.parent}</span>}
      </div>
    </div>
  );
}
