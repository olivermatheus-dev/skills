// Gaveta de uma fonte (041): todos os campos, conferência do link e as ações de status (aceitar, recusar, pausar, arquivar).
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Archive, Check, CircleAlert, Pause, Play, Quote, RotateCcw, ShieldCheck, X } from 'lucide-react';
import { api, type Source, type StrategyRefs } from '../../api';
import { Button, Drawer, ErrorBox, cx } from '../kit';
import { qk, runOptimistic } from '../../queries';
import { SourceForm, type SourceDraft } from './SourceForm';
import { statusMeta } from './sources-meta';

const today = () => new Date().toISOString().slice(0, 10);
const fmt = (d?: string) => (d ? d.slice(0, 10).split('-').reverse().join('/') : '—');
const toDraft = (s: Source): SourceDraft => ({
  name: s.name, url: s.url, type: s.type, language: s.language, access: { ...s.access, filters: { ...s.access.filters } }, defaultQuery: s.defaultQuery,
  keywords: [...s.keywords], pillars: [...s.pillars], series: [...s.series], tags: [...s.tags], trust: s.trust, weight: s.weight, notes: s.notes,
});

export function SourceDrawer({ slug, source, refs, onClose, onStatus }: {
  slug: string; source: Source; refs?: StrategyRefs; onClose: () => void; onStatus: (st: Source['status']) => void;
}) {
  const qc = useQueryClient();
  const [v, setV] = useState<SourceDraft>(() => toDraft(source));
  const [verifiedAt, setVerifiedAt] = useState(source.verifiedAt);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const set = (p: Partial<SourceDraft>) => { setV((x) => ({ ...x, ...p })); setDirty(true); };
  const key = qk.sources(slug);

  const save = () => {
    const clean: SourceDraft = { ...v, name: v.name.trim(), url: v.url.trim(), keywords: v.keywords.map((k) => k.trim()).filter(Boolean), notes: v.notes.trim() };
    const next: Source = { ...source, ...clean, verifiedAt };
    setError(null);
    void runOptimistic(qc, {
      mutationFn: () => api.saveSource(slug, source.id, { ...clean, verifiedAt }),
      apply: () => [[key, (old: Source[] | undefined) => old?.map((s) => (s.id === source.id ? next : s))]],
      onSuccess: (r) => qc.setQueryData<Source[]>(key, (old) => old?.map((s) => (s.id === r.id ? r : s))),
      onError: (e) => setError(e),
      invalidate: () => [key],
      okMessage: 'Fonte salva',
    }, undefined).then(onClose, () => {});
  };
  const close = () => { if (!dirty || confirm('Descartar as alterações desta fonte?')) onClose(); };
  const act = (st: Source['status']) => { if (dirty && !confirm('Descartar as alterações desta fonte?')) return; onStatus(st); onClose(); };
  const m = statusMeta(source.status);

  return (
    <Drawer open onClose={onClose} canClose={() => !dirty || confirm('Descartar as alterações desta fonte?')} width="max-w-2xl"
      title={<span className="flex items-center gap-2 min-w-0"><span className="truncate">{source.name}</span><span className={cx('inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium', m.pill)}><span className={cx('size-1.5 rounded-full', m.dot)} />{m.label}</span></span>}>

      {/* conferência e origem */}
      <div className={cx('mb-5 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border px-3 py-2.5 text-sm', verifiedAt ? 'border-border bg-muted/40' : 'border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/20')}>
        {verifiedAt
          ? <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400"><ShieldCheck className="size-4" />Link conferido em {fmt(verifiedAt)}</span>
          : <span className="inline-flex items-center gap-1.5 font-medium text-amber-800 dark:text-amber-300"><CircleAlert className="size-4" />Link não conferido</span>}
        <span className="text-xs text-muted-foreground">{source.addedBy === 'ai' ? 'Sugerida pela IA' : 'Adicionada por você'} em {fmt(source.created)} · último uso: {source.lastUsedAt ? fmt(source.lastUsedAt) : 'nunca'}</span>
        {!verifiedAt && (
          <button type="button" onClick={() => { setVerifiedAt(today()); setDirty(true); }} className="ml-auto inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs font-medium hover:bg-muted">
            <ShieldCheck className="size-3.5" />Abri e funciona
          </button>
        )}
      </div>

      <SourceForm v={v} set={set} refs={refs} slug={slug} />

      <div className="mb-2 rounded-lg border border-dashed border-border px-3 py-2.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 font-medium text-foreground/80"><Quote className="size-3.5" />Referências e ideias desta fonte</span>
        <div className="mt-0.5">Aparecem aqui depois das primeiras pesquisas (fase 2 da 041): o que ela trouxe e quantas ideias viraram pauta.</div>
      </div>

      <ErrorBox error={error} />
      <div className="sticky bottom-0 -mx-6 -mb-6 mt-4 flex items-center gap-2 border-t border-border bg-card px-6 py-3">
        <Button onClick={save} disabled={!dirty || !v.name.trim() || !v.url.trim()}>Salvar</Button>
        <Button variant="ghost" onClick={close}>{dirty ? 'Cancelar' : 'Fechar'}</Button>
        <div className="ml-auto flex items-center gap-2">
          {source.status === 'sugerida' && <>
            <Button variant="ghost" onClick={() => act('arquivada')} className="inline-flex items-center gap-1.5"><X className="size-4" />Recusar</Button>
            <Button variant="soft" onClick={() => act('ativa')} className="inline-flex items-center gap-1.5"><Check className="size-4" />Aceitar</Button>
          </>}
          {source.status === 'ativa' && <Button variant="ghost" onClick={() => act('pausada')} className="inline-flex items-center gap-1.5"><Pause className="size-4" />Pausar</Button>}
          {source.status === 'pausada' && <Button variant="soft" onClick={() => act('ativa')} className="inline-flex items-center gap-1.5"><Play className="size-4" />Ativar</Button>}
          {(source.status === 'ativa' || source.status === 'pausada') && <Button variant="ghost" onClick={() => act('arquivada')} className="inline-flex items-center gap-1.5"><Archive className="size-4" />Arquivar</Button>}
          {source.status === 'arquivada' && <Button variant="ghost" onClick={() => act('sugerida')} className="inline-flex items-center gap-1.5"><RotateCcw className="size-4" />Restaurar</Button>}
        </div>
      </div>
    </Drawer>
  );
}
