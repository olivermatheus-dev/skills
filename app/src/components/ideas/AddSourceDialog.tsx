// "Adicionar fonte" (041 F1): cola o link → o servidor abre a página (sem IA), lê título e feed, reconhece o domínio
// e devolve um rascunho com nome, tipo, idioma, consulta e o que alimenta. O Oliver confere e adiciona (entra ativa).
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CircleAlert, Link2, Loader2, Rss, ScanSearch, ShieldCheck } from 'lucide-react';
import { api, type Source, type SourceSuggestion, type StrategyRefs } from '../../api';
import { Button, ErrorBox, Input, cx } from '../kit';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { qk } from '../../queries';
import { toast } from '../toast';
import { SourceForm, type SourceDraft } from './SourceForm';

const looksLikeUrl = (s: string) => /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(s.trim());

export function AddSourceDialog({ slug, open, onClose, refs, onOpenExisting }: {
  slug: string; open: boolean; onClose: () => void; refs?: StrategyRefs; onOpenExisting: (id: string) => void;
}) {
  const qc = useQueryClient();
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [sug, setSug] = useState<SourceSuggestion | null>(null);
  const [v, setV] = useState<SourceDraft | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);
  const seq = useRef(0);
  const lastRead = useRef('');

  useEffect(() => { if (open) { setLink(''); setSug(null); setV(null); setError(null); setBusy(false); setSaving(false); lastRead.current = ''; } }, [open]);

  const read = async (raw: string) => {
    const url = raw.trim();
    if (!looksLikeUrl(url) || url === lastRead.current) return;
    lastRead.current = url;
    const id = ++seq.current;
    setBusy(true); setError(null);
    try {
      const r = await api.suggestSource(slug, url);
      if (id !== seq.current) return;
      setSug(r);
      setV({ ...r.draft, defaultQuery: undefined, keywords: [], tags: [] });
    } catch (e) {
      if (id === seq.current) { setError(e); setSug(null); setV(null); }
    } finally { if (id === seq.current) setBusy(false); }
  };

  // lê sozinho ao colar e quando a pessoa para de digitar
  useEffect(() => {
    if (!open || !looksLikeUrl(link)) return;
    const t = setTimeout(() => void read(link), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [link, open]);

  const set = (p: Partial<SourceDraft>) => setV((x) => (x ? { ...x, ...p } : x));
  const add = async () => {
    if (!v || !sug) return;
    setSaving(true); setError(null);
    try {
      const created = await api.createSource(slug, {
        ...v, id: sug.draft.id, name: v.name.trim(), keywords: v.keywords.map((k) => k.trim()).filter(Boolean), notes: v.notes.trim(),
        status: 'ativa', addedBy: 'oliver', verifiedAt: sug.draft.verifiedAt,
      });
      qc.setQueryData<Source[]>(qk.sources(slug), (old) => (old ? [...old, created] : old));
      void qc.invalidateQueries({ queryKey: qk.sources(slug) });
      toast.ok(`${created.name} adicionada às fontes ativas`);
      onClose();
    } catch (e) { setError(e); } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[88vh] flex-col gap-0 p-0 sm:max-w-xl">
        <DialogHeader className="border-b border-border px-6 pb-4 pt-5">
          <DialogTitle>Adicionar fonte</DialogTitle>
          <DialogDescription>Cole o link. O app abre a página e sugere nome, tipo e como a IA consulta; você confere e adiciona.</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-4">
          <div className="relative mb-3">
            <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input autoFocus value={link} onChange={(e) => setLink(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { lastRead.current = ''; void read(link); } }}
              placeholder="https://www.scielo.br/j/pcp/" className="h-10 w-full pl-9 pr-9" aria-label="Link da fonte" />
            {busy && <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
          </div>

          {!sug && !busy && !error && (
            <div className="rounded-lg bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
              Vale periódico, base de artigos, órgão oficial, veículo de notícias, editora, podcast ou newsletter. Sem IA nesta etapa: o script lê o título, procura feed RSS e reconhece domínios conhecidos (SciELO, PubMed, CFP, CRPs, gov.br…).
            </div>
          )}
          {busy && !sug && <div className="rounded-lg bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">Abrindo o link…</div>}
          <ErrorBox error={error} />

          {sug && v && (
            <div className={cx(busy && 'opacity-60 transition-opacity')}>
              <Found sug={sug} onOpenExisting={onOpenExisting} />
              <SourceForm compact v={v} set={set} refs={refs} slug={slug} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-border bg-muted/40 px-6 py-3">
          <span className="text-xs text-muted-foreground">{sug && v ? 'Entra como ativa: já vale para as próximas pesquisas.' : ''}</span>
          <Button variant="ghost" className="ml-auto" onClick={onClose}>Cancelar</Button>
          <Button onClick={add} disabled={!sug || !v || !v.name.trim() || saving || busy || !!sug.duplicateOf}>{saving ? 'Adicionando…' : 'Adicionar fonte'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** o que o script achou: abriu ou não, título, feed, regra de domínio, duplicada */
function Found({ sug, onOpenExisting }: { sug: SourceSuggestion; onOpenExisting: (id: string) => void }) {
  return (
    <div className="mb-4 space-y-1.5">
      {sug.duplicateOf && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
          <CircleAlert className="size-4 shrink-0" />Essa fonte já está no cadastro.
          <button type="button" className="ml-auto font-medium underline-offset-2 hover:underline" onClick={() => onOpenExisting(sug.duplicateOf!)}>Abrir a existente</button>
        </div>
      )}
      <div className={cx('flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-3 py-2 text-xs', sug.ok ? 'border-border bg-muted/40' : 'border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/20')}>
        {sug.ok
          ? <span className="inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400"><ShieldCheck className="size-3.5" />Abriu</span>
          : <span className="inline-flex items-center gap-1 font-medium text-amber-800 dark:text-amber-300"><CircleAlert className="size-3.5" />{sug.error ?? 'Não abriu'}</span>}
        {sug.pageTitle && <span className="min-w-0 truncate text-muted-foreground">título: <span className="text-foreground">“{sug.pageTitle}”</span></span>}
        <span className="inline-flex items-center gap-1 text-muted-foreground"><Rss className="size-3.5" />{sug.feed ? 'feed RSS achado' : 'sem feed RSS'}</span>
        {sug.matched && <span className="inline-flex items-center gap-1 text-muted-foreground"><ScanSearch className="size-3.5" />reconhecido: {sug.matched}</span>}
      </div>
    </div>
  );
}
