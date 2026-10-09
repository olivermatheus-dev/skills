// Galeria de blocos de vídeo (tarefa 045 G): aba de Formatos. Mostra os blocos globais (library/blocos), os da marca
// (video-templates/blocos) e os que nasceram num vídeo da empresa, com a miniatura (1 quadro do vídeo onde foram usados),
// cues, slots e usos. Promover sobe o bloco um nível (projeto → marca → global) pelo mesmo tools/lib/blocos.mjs do terminal.
import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type Bloco } from '../../api';
import { Badge, Button, Drawer, Empty, ErrorBox, Input, Select, cx } from '../kit';
import { FillBox } from '../fill';
import { toast } from '../toast';
import { AppContent } from '../AppContent';

const fold = (s: unknown) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const ESCOPO_LABEL = { global: 'Global', empresa: 'Marca', projeto: 'Projeto' } as const;
const ESCOPO_COR = { global: '!bg-emerald-100 !text-emerald-800', empresa: '!bg-sky-100 !text-sky-800', projeto: '!bg-amber-100 !text-amber-800' } as const;
const chave = (b: Bloco) => `${b.escopo}|${b.pasta ?? ''}|${b.use}`;

/** Formatos | Blocos de vídeo: as duas galerias globais na mesma página */
export function AbaGaleria() {
  const [sp, setSp] = useSearchParams();
  const aba = sp.get('aba') === 'blocos' ? 'blocos' : 'formatos';
  return (
    <div className="inline-flex rounded-lg border border-border bg-card p-0.5 text-sm">
      {([['formatos', 'Formatos'], ['blocos', 'Blocos de vídeo']] as const).map(([k, label]) => (
        <button key={k} onClick={() => setSp(k === 'blocos' ? { aba: 'blocos' } : {})}
          className={cx('px-3 py-1 rounded-md', aba === k ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>{label}</button>
      ))}
    </div>
  );
}

export default function GaleriaBlocos() {
  const { slug = '' } = useParams();
  const [sp, setSp] = useSearchParams();
  const qc = useQueryClient();
  const { data: blocos = [], isLoading, error } = useQuery({ queryKey: ['blocos', slug], queryFn: () => api.blocos(slug), enabled: !!slug });
  const [aberto, setAberto] = useState<string | null>(null);
  const [v, setV] = useState(0); // força recarregar as miniaturas depois de gerar
  const f = { q: sp.get('q') ?? '', escopo: sp.get('escopo') ?? '', tipo: sp.get('tipo') ?? '', formato: sp.get('formato_video') ?? '' };
  const setF = (k: string, val: string) => { const n = new URLSearchParams(sp); if (val) n.set(k, val); else n.delete(k); setSp(n, { replace: true }); };

  const tipos = useMemo(() => [...new Set(blocos.map((b) => b.use.split('/')[0]))].sort(), [blocos]);
  const shown = useMemo(() => {
    const termos = fold(f.q).split(/[^a-z0-9]+/).filter(Boolean);
    return blocos.filter((b) => b.use !== 'rascunho/cena-nova'
      && (!f.escopo || b.escopo === f.escopo) && (!f.tipo || b.use.startsWith(`${f.tipo}/`))
      && (!f.formato || !b.meta.formatos?.length || b.meta.formatos.includes(f.formato))
      && (!termos.length || (() => {
        const t = fold(`${b.use} ${b.meta.titulo} ${(b.meta.cues ?? []).join(' ')} ${(b.meta.slots ?? []).join(' ')} ${b.meta.vivo ?? ''} ${b.pasta ?? ''} ${Object.keys(b.meta.params ?? {}).join(' ')}`);
        return termos.every((x) => t.includes(x.length >= 5 ? x.slice(0, -1) : x));
      })()));
  }, [blocos, f.q, f.escopo, f.tipo, f.formato]);
  const atual = blocos.find((b) => chave(b) === aberto) ?? null;
  const semPrevia = blocos.filter((b) => !b.preview && b.usos.length && b.use !== 'rascunho/cena-nova').length;

  const previews = useMutation({
    mutationFn: () => api.blocosPreviews(slug),
    onSuccess: (r) => {
      setV(Date.now());
      void qc.invalidateQueries({ queryKey: ['blocos', slug] });
      toast.ok(r.feitos.length ? `${r.feitos.length} miniatura(s) gerada(s)` : 'Nenhuma miniatura nova: só blocos usados num vídeo exportado ganham miniatura');
    },
    onError: (e) => toast.error(e, 'Não foi possível gerar as miniaturas'),
  });

  return (
    <AppContent>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-3"><h1 className="text-2xl font-semibold tracking-tight">Blocos de vídeo</h1><AbaGaleria /></div>
          <p className="text-sm text-muted-foreground mt-1">As peças de motion que os vídeos reaproveitam. A IA consulta esta lista antes de criar um bloco novo; o que ficou bom num vídeo você promove para a marca ou para a galeria global.</p>
        </div>
        <Button variant="soft" disabled={previews.isPending || !semPrevia} onClick={() => previews.mutate()} title={semPrevia ? '' : 'Todos os blocos usados já têm miniatura'}>
          {previews.isPending ? 'Gerando…' : `Gerar miniaturas${semPrevia ? ` (${semPrevia})` : ''}`}
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap items-center mb-5">
        <Input className="w-64" placeholder="Buscar: cta, cards, logo, navegador…" value={f.q} onChange={(e) => setF('q', e.target.value)} />
        <Select aria-label="Onde mora" value={f.escopo} onChange={(e) => setF('escopo', e.target.value)}>
          <option value="">global, marca e projetos</option><option value="global">só globais</option><option value="empresa">só da marca</option><option value="projeto">só de um vídeo</option>
        </Select>
        <Select aria-label="Tipo" value={f.tipo} onChange={(e) => setF('tipo', e.target.value)}>
          <option value="">todo tipo</option>{tipos.filter((t) => t !== 'rascunho').map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Select aria-label="Formato" value={f.formato} onChange={(e) => setF('formato_video', e.target.value)}>
          <option value="">todo formato</option><option value="4x5">4:5</option><option value="9x16">9:16</option>
        </Select>
        <span className="text-sm text-muted-foreground">{shown.length} de {blocos.filter((b) => b.use !== 'rascunho/cena-nova').length}</span>
      </div>

      <ErrorBox error={error} />
      {isLoading ? <div className="text-muted-foreground">Carregando…</div> : !shown.length ? <Empty title="Nenhum bloco com esses filtros" hint="Limpe a busca ou troque o filtro." /> : (
        <FillBox><div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(210px,1fr))]">
          {shown.map((b) => (
            <div key={chave(b)} role="button" tabIndex={0} onClick={() => setAberto(chave(b))} onKeyDown={(e) => e.key === 'Enter' && setAberto(chave(b))} data-bloco={b.use}
              className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-primary/40 transition cursor-pointer flex flex-col">
              <div className="relative aspect-[4/5] bg-muted">
                {b.preview ? <img src={api.blocoPreviewUrl(b.preview, v)} loading="lazy" alt="" className="h-full w-full object-cover" />
                  : <div className="h-full flex items-center justify-center text-xs text-muted-foreground px-4 text-center">{b.usos.length ? 'sem miniatura: clique em Gerar miniaturas' : 'ainda não usado num vídeo'}</div>}
                <Badge className={cx('absolute top-2 left-2', ESCOPO_COR[b.escopo])}>{ESCOPO_LABEL[b.escopo]}{b.escopo === 'empresa' ? ` ${b.empresa}` : ''}</Badge>
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <div className="font-mono text-[13px] font-medium">{b.use}</div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{b.meta.titulo}</p>
                <div className="text-[11px] text-muted-foreground mt-auto pt-2">
                  {(b.meta.cues ?? []).length} cues · {b.meta.min_s ? `mín. ${String(b.meta.min_s).replace('.', ',')} s · ` : ''}{b.usos.length} uso(s){b.escopo === 'projeto' ? ` · ${b.pasta}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div></FillBox>
      )}
      <Detalhe bloco={atual} slug={slug} v={v} onClose={() => setAberto(null)} onPromovido={(novo) => { void qc.invalidateQueries({ queryKey: ['blocos', slug] }); setAberto(novo); }} />
    </AppContent>
  );
}

function Detalhe({ bloco: b, slug, v, onClose, onPromovido }: { bloco: Bloco | null; slug: string; v: number; onClose: () => void; onPromovido: (chave: string | null) => void }) {
  const [problema, setProblema] = useState<{ erros: string[]; avisos: string[]; para: 'empresa' | 'global' } | null>(null);
  const promover = useMutation({
    mutationFn: (x: { para: 'empresa' | 'global'; forcar?: boolean }) => api.promoverBloco(slug, { use: b!.use, de: b!.escopo === 'projeto' ? b!.pasta! : slug, ...x }),
    onSuccess: (r, x) => {
      if (!r.ok) { setProblema({ erros: r.erros, avisos: r.avisos, para: x.para }); return; }
      setProblema(null);
      toast.ok(`${b!.use} agora mora ${x.para === 'global' ? 'na galeria global' : 'na marca'}${r.avisos.length ? ` (${r.avisos.length} aviso(s))` : ''}`);
      onPromovido(`${x.para}||${b!.use}`);
    },
    onError: (e) => toast.error(e, 'Não foi possível promover'),
  });
  if (!b) return <Drawer open={false} onClose={onClose} title="">{null}</Drawer>;
  const params = Object.entries(b.meta.params ?? {});
  const ir = (para: 'empresa' | 'global') => {
    const msg = para === 'global'
      ? `Mover ${b.use} para a galeria global (library/blocos)? Passa a servir a qualquer empresa; os vídeos que já usam continuam achando.`
      : `Mover ${b.use} deste vídeo para os blocos da marca ${slug}? Os outros vídeos da marca passam a poder usar; este continua igual.`;
    if (window.confirm(msg)) promover.mutate({ para });
  };
  return (
    <Drawer open onClose={() => { setProblema(null); onClose(); }} title={<span className="font-mono">{b.use}</span>}>
      <div className="grid gap-5 sm:grid-cols-[220px_1fr]">
        <div className="aspect-[4/5] bg-muted rounded-lg overflow-hidden">
          {b.preview ? <img src={api.blocoPreviewUrl(b.preview, v)} alt="" className="h-full w-full object-cover" /> : <div className="h-full flex items-center justify-center text-xs text-muted-foreground">sem miniatura</div>}
        </div>
        <div className="text-sm space-y-3">
          <div className="flex gap-1.5 flex-wrap">
            <Badge className={ESCOPO_COR[b.escopo]}>{ESCOPO_LABEL[b.escopo]}{b.escopo !== 'global' ? ` · ${b.escopo === 'projeto' ? b.pasta : b.empresa}` : ''}</Badge>
            {b.meta.camada && b.meta.camada !== 'palco' && <Badge>camada: {b.meta.camada}</Badge>}
            {(b.meta.formatos ?? []).map((x) => <Badge key={x}>{x.replace('x', ':')}</Badge>)}
            <Badge>{b.meta.licenca ?? 'sem licença'}</Badge>
          </div>
          <p>{b.meta.titulo}</p>
          {b.meta.vivo && <p className="text-muted-foreground"><span className="font-medium text-foreground">Vivo: </span>{b.meta.vivo}</p>}
          <p><span className="font-medium">Textos (slots):</span> {(b.meta.slots ?? []).join(' · ') || '—'}</p>
          <p><span className="font-medium">Momentos (cues):</span> {(b.meta.cues ?? []).join(' · ') || '—'}{b.meta.min_s ? ` · mínimo ${String(b.meta.min_s).replace('.', ',')} s` : ''}</p>
          <div>
            <div className="font-medium">Usado em</div>
            {b.usos.length ? <ul className="mt-1 space-y-0.5">{b.usos.map((u) => (
              <li key={`${u.pasta}|${u.cena}`}><Link className="text-primary-ink hover:underline" to={`/p/${slug}/conteudos?peca=${encodeURIComponent(u.pasta)}`}>{u.pasta}</Link> <span className="text-muted-foreground">· {u.cena}</span></li>
            ))}</ul> : <p className="text-muted-foreground">nenhum vídeo ainda</p>}
          </div>
        </div>
      </div>

      {b.escopo !== 'global' && (
        <div className="mt-6 rounded-lg border border-border p-4">
          <div className="font-medium text-sm">Promover</div>
          <p className="text-xs text-muted-foreground mt-1">
            {b.escopo === 'projeto' ? 'Nasceu neste vídeo. Na marca, qualquer vídeo da empresa pode usar; no global, qualquer empresa (só se não tiver texto, dado ou cor fixos da marca).'
              : 'É da marca. No global serve a qualquer empresa: só tokens, textos por slot, sem dado de demonstração fixo.'}
          </p>
          <div className="flex gap-2 mt-3">
            {b.escopo === 'projeto' && <Button disabled={promover.isPending} onClick={() => ir('empresa')}>Promover para a marca</Button>}
            <Button variant={b.escopo === 'projeto' ? 'soft' : 'primary'} disabled={promover.isPending} onClick={() => ir('global')}>{b.escopo === 'projeto' ? 'Direto para o global' : 'Promover para o global'}</Button>
          </div>
          {problema && (
            <div className="mt-3 text-sm bg-red-50 border border-red-200 rounded-md p-3">
              <div className="font-medium text-destructive">Não subiu para o {problema.para === 'global' ? 'global' : 'nível da marca'}:</div>
              <ul className="list-disc ml-5 mt-1">{problema.erros.map((x) => <li key={x}>{x}</li>)}</ul>
              {!!problema.avisos.length && <ul className="list-disc ml-5 mt-1 text-amber-800">{problema.avisos.map((x) => <li key={x}>{x}</li>)}</ul>}
              <p className="text-xs text-muted-foreground mt-2">Peça à IA para generalizar o bloco (trocar o texto fixo por slot ou param, a cor por token) ou deixe na marca.</p>
            </div>
          )}
        </div>
      )}

      {!!params.length && (
        <div className="mt-6">
          <div className="font-medium text-sm mb-2">Ajustes (params)</div>
          <dl className="text-sm space-y-2">{params.map(([k, p]) => (
            <div key={k}><dt className="font-mono text-[13px]">{k}</dt><dd className="text-muted-foreground">{p?.descricao ?? ''}</dd></div>
          ))}</dl>
        </div>
      )}
      {b.meta.origem && <p className="mt-6 text-xs text-muted-foreground">Origem: {b.meta.origem}</p>}
    </Drawer>
  );
}
