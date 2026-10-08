// "Virar ideia" a partir de um conteúdo de concorrente (ficha e aba Conteúdos): cria a ideia com a referência e as
// métricas, e marca o item como analisado com o id da ideia. Otimista: a ideia e a marcação aparecem na hora.
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, type CompetitorFull, type Doc, type Idea, type ItemMark } from '../../api';
import { nextSeqId, qk, runOptimistic, trackCreate, upsertDoc } from '../../queries';
import { titleOf } from './Items';
import { TYPE_LABEL, fmtPct, fmtRatio, platformLabel, type Row } from './lib';

export function useMakeIdea(slug: string) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);

  async function make(comp: { id: string; name: string }, profileLabel: string, r: Row, title = titleOf(r).slice(0, 120), tags = r.mark?.tags ?? [], note = r.mark?.note ?? '') {
    setBusy(r.mk); setError(null);
    try {
      const m = r.item.metrics;
      const body = [
        `Referência: [${titleOf(r).replace(/[[\]]/g, '')}](${r.item.url}) — ${comp.name} (${platformLabel(r.platform)} ${profileLabel}), ${TYPE_LABEL[r.item.type]?.toLowerCase() ?? r.item.type}${r.item.publishedAt ? ` publicado em ${new Date(r.item.publishedAt).toLocaleDateString('pt-BR')}` : ''}.`,
        '',
        '| métrica | valor |', '|---|---|',
        `| views | ${m.views?.toLocaleString('pt-BR') ?? '—'} |`,
        `| curtidas | ${m.likes?.toLocaleString('pt-BR') ?? '—'} |`,
        `| comentários | ${m.comments?.toLocaleString('pt-BR') ?? '—'} |`,
        `| outlier | ${fmtRatio(r.outlier)} a mediana do perfil |`,
        `| engajamento | ${fmtPct(r.engagement)} |`,
        '',
        ...(r.item.caption ? ['## Legenda original', '', `> ${r.item.caption.slice(0, 600).replace(/\n/g, '\n> ')}`, ''] : []),
        '## Observações do Oliver', '', note, '',
      ].join('\n');
      // a ideia entra no banco e o item já aparece como "virou ideia" (id previsto);
      // o servidor cria a ideia e só então grava a marcação com o id real (sem marcação órfã se falhar)
      const key = qk.competitor(slug, comp.id);
      const ideasKey = qk.ideas(slug);
      const tempId = nextSeqId('I', (qc.getQueryData<Doc<Idea>[]>(ideasKey) ?? []).map((i) => i.data.id)) as Idea['id'];
      const data = { title, status: 'nova', source: { competitor: comp.id, platform: r.platform as never, itemId: r.item.id, url: r.item.url }, tags } as Partial<Idea> & { title: string };
      const opt: Doc<Idea> = { data: { ...data, id: tempId, created: new Date().toISOString().slice(0, 10) } as Idea, body, file: '' };
      const markPatch = (ideaId: string) => ({ ideaId, status: 'analisada' as const, tags });
      setBusy(null);
      await runOptimistic(qc, {
        mutationFn: async () => {
          const p = api.createIdea(slug, data, body);
          trackCreate('idea', slug, tempId, p.then((x) => x.data.id));
          const idea = await p;
          const mk = await api.setMark(slug, comp.id, r.mk, markPatch(idea.data.id));
          return { idea, m: mk };
        },
        apply: () => [
          [ideasKey, (old: Doc<Idea>[] | undefined) => (old ? upsertDoc(old, opt) : old)],
          [key, (old: CompetitorFull | undefined) => old && { ...old, marks: { ...old.marks, [r.mk]: { ...({ status: 'nova', favorite: false, tags: [], note: '' } as Partial<ItemMark>), ...old.marks[r.mk], ...markPatch(tempId), updated: new Date().toISOString() } } }],
        ],
        onSuccess: ({ idea, m: mk }) => {
          qc.setQueryData<Doc<Idea>[]>(ideasKey, (old) => (old ? upsertDoc(old, idea, tempId) : old));
          qc.setQueryData<CompetitorFull>(key, (old) => old && { ...old, marks: { ...old.marks, [r.mk]: mk } });
        },
        invalidate: () => [ideasKey, key, qk.competitorsFeed(slug)],
        okMessage: `Ideia ${tempId} criada`,
        errorMessage: 'Não foi possível criar a ideia',
      }, undefined);
    } catch (e) { setError(e); } finally { setBusy(null); }
  }
  return { make, busy, error };
}
