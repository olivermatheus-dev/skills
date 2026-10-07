// Datas em pt-BR (date-fns). Use sempre estes helpers na interface.
import { differenceInCalendarDays, format, formatDistanceToNowStrict, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/** aceita 'AAAA-MM-DD' (data local, sem fuso) ou ISO completo */
export function toDate(s?: string | null): Date | null {
  if (!s) return null;
  const d = /^\d{4}-\d{2}-\d{2}$/.test(s) ? parseISO(`${s}T12:00:00`) : parseISO(s);
  return isValid(d) ? d : null;
}
/** 07/10/2026 */
export const fmtDate = (s?: string | null) => { const d = toDate(s); return d ? format(d, 'dd/MM/yyyy', { locale: ptBR }) : '—'; };
/** 7 out */
export const fmtShort = (s?: string | null) => { const d = toDate(s); return d ? format(d, "d MMM", { locale: ptBR }) : '—'; };
/** 07/10/2026 às 14:32 */
export const fmtDateTime = (s?: string | null) => { const d = toDate(s); return d ? format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : '—'; };
/** há 3 dias / em 2 dias */
export const fmtRelative = (s?: string | null) => { const d = toDate(s); return d ? formatDistanceToNowStrict(d, { locale: ptBR, addSuffix: true }) : '—'; };
/** vencida (antes de hoje) */
export const isLate = (s?: string | null) => { const d = toDate(s); return !!d && differenceInCalendarDays(d, new Date()) < 0; };
/** dias até a data (negativo = atrasada) */
export const daysUntil = (s?: string | null) => { const d = toDate(s); return d ? differenceInCalendarDays(d, new Date()) : null; };
/** 'AAAA-MM-DD' de hoje (local) */
export const todayIso = () => format(new Date(), 'yyyy-MM-dd');
