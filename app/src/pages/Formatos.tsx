// Formatos (tarefa 027): galeria GLOBAL dos formatos de conteúdo (library/formatos/<id>/formato.json), igual para todas as empresas.
// Formato = o como (texto cinético, meme…); tipo = o porquê (educativo, humor…). Verbete ativo = skill fmt-* que a IA executa;
// rascunho = referência solta (link/print + observação) que vira skill quando repetir 2–3 vezes.
// No verbete: editar essência e observações (a IA lê junto com a skill), usar num conteúdo novo, marcar numa peça,
// promover uma peça boa como exemplo e cadastrar referências.
import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Format, type FormatInfo, type NewFormatInput, type PieceCover } from '../api';
import { Badge, Button, Card, Drawer, Empty, ErrorBox, Field, Input, Select, Textarea, cx, fmtDate } from '../components/kit';
import { FillBox } from '../components/fill';
import { toast } from '../components/toast';
import { SaveIndicator, useAutosave } from '../components/notes/useAutosave';
import { qk, useFormats, usePieces } from '../queries';
import { CONTENT_TYPES, CONTENT_TYPE_LABEL, FORMAT_CHANNELS, FORMAT_RATIOS } from '../../../schema/format';
import { AppContent } from '../components/AppContent';
import GaleriaBlocos, { AbaGaleria } from '../components/blocos/GaleriaBlocos';

const MEDIA_LABEL = { imagem: 'Imagem', video: 'Vídeo' } as const;
const CHANNEL_LABEL: Record<string, string> = { feed: 'Feed', reels: 'Reels', stories: 'Stories', tiktok: 'TikTok', 'youtube-shorts': 'Shorts', anuncio: 'Anúncio', lp: 'Landing page' };
const MOTOR_LABEL = { carousel: 'motor carousel (PNG)', video: 'motor video (MP4)', mockup: 'motor mockup' } as const;

export default function Formatos() {
  const [sp] = useSearchParams();
  const id = sp.get('formato');
  return id ? <FormatDetail id={id} /> : sp.get('aba') === 'blocos' ? <GaleriaBlocos /> : <Gallery />;
}

const toBase64 = (f: File) => new Promise<string>((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(String(r.result).split(',')[1] ?? '');
  r.onerror = () => rej(r.error);
  r.readAsDataURL(f);
});

/** prévia de uma peça de qualquer empresa: vídeo toca mudo ao passar o mouse; imagem = capa */
function Media({ empresa, peca, cover, className, controls }: { empresa: string; peca: string; cover?: PieceCover; className?: string; controls?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const url = cover && api.pieceFileUrl(empresa, peca, cover.file);
  return (
    <div className={cx('relative bg-neutral-900 overflow-hidden flex items-center justify-center', className)}
      onMouseEnter={() => { if (!controls) void ref.current?.play().catch(() => {}); }}
      onMouseLeave={() => { if (!controls && ref.current) { ref.current.pause(); ref.current.currentTime = 1; } }}>
      {cover?.type === 'video' ? <video ref={ref} src={`${url}#t=1`} preload="metadata" muted={!controls} controls={controls} playsInline loop={!controls} className="h-full w-full object-contain" />
        : cover?.type === 'image' ? <img src={url} loading="lazy" alt="" className="h-full w-full object-contain" />
        : <span className="text-white/50 text-sm">sem arquivo</span>}
    </div>
  );
}

/** sem exemplo ainda: a estrutura do formato em blocos (o "esqueleto" visual) */
function Skeleton({ f, className }: { f: FormatInfo; className?: string }) {
  return (
    <div className={cx('bg-muted flex flex-col justify-center gap-1.5 p-4', className)}>
      {f.estrutura.slice(0, 6).map((b, i) => (
        <div key={i} className="flex items-center gap-2 text-[11px]">
          <span className="h-2 rounded-full bg-primary/50 shrink-0" style={{ width: `${18 + ((i * 37) % 40)}px` }} />
          <span className="text-muted-foreground truncate">{b.bloco}</span>
        </div>
      ))}
      <div className="text-[11px] text-muted-foreground/70 mt-2">sem exemplo nosso ainda</div>
    </div>
  );
}

// ---------- galeria ----------
function Gallery() {
  const { slug = '' } = useParams();
  const [sp, setSp] = useSearchParams();
  const { data: formats = [], isLoading, error } = useFormats();
  const [adding, setAdding] = useState(false);
  const f = { q: sp.get('q') ?? '', tipo: sp.get('tipo') ?? '', midia: sp.get('midia') ?? '', canal: sp.get('canal') ?? '', prop: sp.get('proporcao') ?? '', status: sp.get('status') ?? '' };
  const setF = (k: string, v: string) => { const n = new URLSearchParams(sp); if (v) n.set(k, v); else n.delete(k); setSp(n, { replace: true }); };
  const shown = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    return formats.filter((x) => (!f.tipo || x.tipos.includes(f.tipo as Format['tipos'][number])) && (!f.midia || x.midia === f.midia)
      && (!f.canal || x.canais.includes(f.canal as Format['canais'][number])) && (!f.prop || x.proporcoes.includes(f.prop as Format['proporcoes'][number]))
      && (!f.status || x.status === f.status)
      && (!q || `${x.nome} ${x.essencia} ${x.variacoes.join(' ')} ${x.observacoes}`.toLowerCase().includes(q)));
  }, [formats, f.q, f.tipo, f.midia, f.canal, f.prop, f.status]);
  const count = (t: string) => formats.filter((x) => x.tipos.includes(t as Format['tipos'][number])).length;

  return (
    <AppContent>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-3"><h1 className="text-2xl font-semibold tracking-tight">Formatos</h1><AbaGaleria /></div>
          <p className="text-sm text-muted-foreground mt-1">Galeria de todas as empresas: escolha "quero um conteúdo no estilo X" e a IA segue a skill e as suas observações daquele formato.</p>
        </div>
        <Button onClick={() => setAdding(true)}>Nova referência</Button>
      </div>

      <div className="flex gap-1 flex-wrap mb-3">
        {[['', 'Todos os tipos', formats.length] as const, ...CONTENT_TYPES.map((t) => [t, CONTENT_TYPE_LABEL[t], count(t)] as const)].map(([k, label, n]) => (
          <button key={k} onClick={() => setF('tipo', k)} className={cx('px-3 py-1 rounded-full text-sm border', f.tipo === k ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:text-foreground')}>
            {label} <span className="opacity-70">{n}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap items-center mb-5">
        <Input className="w-64" placeholder="Buscar formato…" value={f.q} onChange={(e) => setF('q', e.target.value)} />
        <Select aria-label="Mídia" value={f.midia} onChange={(e) => setF('midia', e.target.value)}>
          <option value="">imagem e vídeo</option><option value="imagem">só imagem</option><option value="video">só vídeo</option>
        </Select>
        <Select aria-label="Canal" value={f.canal} onChange={(e) => setF('canal', e.target.value)}>
          <option value="">todo canal</option>{FORMAT_CHANNELS.map((c) => <option key={c} value={c}>{CHANNEL_LABEL[c]}</option>)}
        </Select>
        <Select aria-label="Proporção" value={f.prop} onChange={(e) => setF('proporcao', e.target.value)}>
          <option value="">toda proporção</option>{FORMAT_RATIOS.map((r) => <option key={r} value={r}>{r}</option>)}
        </Select>
        <Select aria-label="Status" value={f.status} onChange={(e) => setF('status', e.target.value)}>
          <option value="">ativos e rascunhos</option><option value="ativo">só ativos (com skill)</option><option value="rascunho">só rascunhos</option>
        </Select>
      </div>

      <ErrorBox error={error} />
      {isLoading ? <div className="text-muted-foreground">Carregando…</div> : !shown.length ? <Empty title="Nenhum formato com esses filtros" hint="Limpe a busca ou troque o tipo." /> : (
        <FillBox><div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(230px,1fr))]">
          {shown.map((x) => {
            const ex = x.exemplos.find((e) => e.cover && !e.teste) ?? x.exemplos.find((e) => e.cover);
            const open = () => setSp({ formato: x.id });
            return (
              <div key={x.id} role="button" tabIndex={0} onClick={open} onKeyDown={(e) => e.key === 'Enter' && open()} data-format={x.id}
                className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-primary/40 transition cursor-pointer flex flex-col">
                <div className="relative">
                  {ex ? <Media empresa={ex.empresa} peca={ex.peca} cover={ex.cover} className="aspect-[4/5]" /> : <Skeleton f={x} className="aspect-[4/5]" />}
                  <Badge className="absolute top-2 left-2 !bg-white/90">{MEDIA_LABEL[x.midia]}</Badge>
                  {x.status === 'rascunho' && <Badge className="absolute top-2 right-2 !bg-amber-100 !text-amber-800">rascunho</Badge>}
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <div className="font-medium text-sm flex items-center gap-2">{x.nome}{x.nota ? <span className="text-amber-500 text-xs">{'★'.repeat(x.nota)}</span> : null}</div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{x.essencia}</p>
                  <div className="flex gap-1 flex-wrap mt-2">{x.tipos.map((t) => <Badge key={t}>{CONTENT_TYPE_LABEL[t]}</Badge>)}</div>
                  <div className="text-[11px] text-muted-foreground mt-auto pt-2">{x.tamanho}{x.tamanho ? ' · ' : ''}{x.exemplos.length} exemplo(s) · {x.usos.length} peça(s)</div>
                </div>
              </div>
            );
          })}
        </div></FillBox>
      )}
      <NewRef open={adding} onClose={() => setAdding(false)} formats={formats} onDone={(id) => { setAdding(false); setSp({ formato: id }); }} slug={slug} />
    </AppContent>
  );
}

/** referência nova: anexar a um formato existente ou abrir um verbete rascunho (link/print + observação, < 1 min) */
function NewRef({ open, onClose, formats, onDone, presetId = '' }: { open: boolean; onClose: () => void; formats: FormatInfo[]; onDone: (id: string) => void; slug?: string; presetId?: string }) {
  const qc = useQueryClient();
  const [target, setTarget] = useState(presetId || '__novo');
  const [nome, setNome] = useState('');
  const [midia, setMidia] = useState<Format['midia']>('video');
  const [url, setUrl] = useState('');
  const [obs, setObs] = useState('');
  const [upload, setUpload] = useState<{ name: string; base64: string }>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const isNew = target === '__novo';
  const reset = () => { setNome(''); setUrl(''); setObs(''); setUpload(undefined); setError(null); };
  const pick = async (f?: File) => { if (f) setUpload({ name: f.name, base64: await toBase64(f) }); };
  const submit = async () => {
    setBusy(true); setError(null);
    try {
      const r: NewFormatInput = { nome, midia, url: url.trim() || undefined, observacao: obs, upload };
      const id = isNew ? (await api.createFormat(r)).id : (await api.addFormatRef(target, r), target);
      void qc.invalidateQueries({ queryKey: qk.formats() });
      toast.ok(isNew ? 'Formato rascunho criado' : 'Referência adicionada');
      reset(); onDone(id);
    } catch (e) { setError(e); } finally { setBusy(false); }
  };
  return (
    <Drawer open={open} onClose={onClose} title="Nova referência">
      <div onPaste={(e) => { const f = [...e.clipboardData.files][0]; if (f?.type.startsWith('image/')) void pick(f); }}>
        <Field label="Onde entra">
          <Select className="w-full" value={target} onChange={(e) => setTarget(e.target.value)}>
            <option value="__novo">Formato novo (rascunho)</option>
            {formats.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </Select>
        </Field>
        {isNew && <div className="grid grid-cols-[1fr_auto] gap-2">
          <Field label="Nome do formato"><Input className="w-full" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="ex.: POV do terapeuta" autoFocus /></Field>
          <Field label="Mídia"><Select value={midia} onChange={(e) => setMidia(e.target.value as Format['midia'])}><option value="video">Vídeo</option><option value="imagem">Imagem</option></Select></Field>
        </div>}
        <Field label="Link" hint="post, reels, vídeo ou página onde viu"><Input className="w-full" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" /></Field>
        <Field label="Print (opcional)" hint="cole (Ctrl+V) aqui, arraste ou escolha o arquivo; fica só neste computador">
          <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); void pick(e.dataTransfer.files[0]); }}
            className="border border-dashed border-border rounded-md px-3 py-3 text-sm text-muted-foreground flex items-center gap-2">
            {upload ? <><span className="font-mono text-foreground">{upload.name}</span><button className="ml-auto text-xs text-destructive" onClick={() => setUpload(undefined)}>remover</button></>
              : <label className="cursor-pointer text-primary-ink hover:underline">escolher imagem…<input type="file" accept="image/*" className="hidden" onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ''; }} /></label>}
          </div>
        </Field>
        <Field label="O que tem de bom" hint="a essência que a gente quer copiar (o conceito, não a peça)">
          <Textarea rows={4} value={obs} onChange={(e) => setObs(e.target.value)} placeholder="ex.: abre com a frase da persona em POV, corta seco no produto em 3 s" />
        </Field>
      </div>
      <ErrorBox error={error} />
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button disabled={busy || (isNew && !nome.trim()) || (!url.trim() && !upload)} onClick={submit}>{busy ? 'Salvando…' : 'Salvar'}</Button>
      </div>
    </Drawer>
  );
}

// ---------- verbete ----------
function useFormatMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fn: () => Promise<unknown>) => fn(),
    onError: (e) => toast.error(e),
    onSettled: () => { void qc.invalidateQueries({ queryKey: qk.formats() }); },
  });
}

function FormatDetail({ id }: { id: string }) {
  const { slug = '' } = useParams();
  const [, setSp] = useSearchParams();
  const nav = useNavigate();
  const { data: formats = [], isLoading, error } = useFormats();
  const f = formats.find((x) => x.id === id);
  const mut = useFormatMutation();
  const [addingRef, setAddingRef] = useState(false);
  const [picking, setPicking] = useState<'' | 'marcar' | 'exemplo'>('');
  if (isLoading) return <AppContent className="text-muted-foreground">Carregando…</AppContent>;
  if (!f) return <AppContent><ErrorBox error={error} /><Empty title="Formato não encontrado" action={<Button onClick={() => setSp({})}>Voltar à galeria</Button>} /></AppContent>;

  return (
    <AppContent>
      <button className="text-sm text-muted-foreground hover:text-foreground mb-3" onClick={() => setSp({})}>← Formatos</button>
      <div className="flex items-start gap-4 mb-6 flex-wrap">
        <div className="flex-1 min-w-[280px]">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-semibold tracking-tight">{f.nome}</h1>
            <Badge>{MEDIA_LABEL[f.midia]}</Badge>
            {f.status === 'rascunho' ? <Badge className="!bg-amber-100 !text-amber-800">rascunho · sem skill</Badge> : <Badge color="#16a34a">ativo</Badge>}
          </div>
          <p className="text-muted-foreground mt-1 max-w-3xl">{f.essencia}</p>
          <div className="text-xs text-muted-foreground mt-2 flex gap-3 flex-wrap">
            {f.tamanho && <span>{f.tamanho}</span>}
            {f.proporcoes.length > 0 && <span>{f.proporcoes.join(' · ')}</span>}
            {f.canais.length > 0 && <span>{f.canais.map((c) => CHANNEL_LABEL[c]).join(', ')}</span>}
            {f.funil.length > 0 && <span>funil: {f.funil.join(' / ')}</span>}
            {f.motor && <span>{MOTOR_LABEL[f.motor]}</span>}
            {f.skill && <span className={cx('font-mono', !f.skillOk && 'text-destructive')}>.claude/skills/{f.skill}/{f.skillOk ? '' : ' (não encontrada)'}</span>}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => nav(`/p/${slug}/conteudos?novo=${f.id}`)}>Usar num conteúdo novo</Button>
          <Button variant="ghost" onClick={() => setPicking('marcar')}>Marcar numa peça</Button>
          <Button variant="ghost" onClick={() => setPicking('exemplo')}>Promover como exemplo</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <section>
            <h2 className="text-sm font-semibold mb-2">Exemplos nossos ({f.exemplos.length})</h2>
            {!f.exemplos.length ? <Card className="text-sm text-muted-foreground">Nenhum ainda. Quando uma peça neste formato ficar boa, use <b>Promover como exemplo</b>.</Card> : (
              <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
                {f.exemplos.map((e, i) => (
                  <Card key={`${e.empresa}/${e.peca}`} className="p-0 overflow-hidden">
                    {e.missing ? <div className="aspect-[4/5] bg-muted flex items-center justify-center text-sm text-muted-foreground">peça não encontrada</div>
                      : <Media empresa={e.empresa} peca={e.peca} cover={e.cover} controls className="aspect-[4/5]" />}
                    <div className="p-2.5 text-xs">
                      <div className="font-medium text-sm first-letter:uppercase">{e.legenda || e.title}</div>
                      <div className="text-muted-foreground mt-0.5 flex gap-2 items-center flex-wrap">
                        <span>{e.empresa}</span>{e.teste && <Badge className="!bg-amber-100 !text-amber-800">teste</Badge>}
                        {e.empresa === slug && !e.missing && <Link className="text-primary-ink hover:underline" to={`/p/${slug}/conteudos?peca=${encodeURIComponent(e.peca)}`}>abrir peça</Link>}
                        <button className="ml-auto text-muted-foreground hover:text-destructive" onClick={() => confirm('Tirar este exemplo do formato? A peça não é apagada.') && mut.mutate(() => api.removeExample(f.id, i))}>tirar</button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {f.estrutura.length > 0 && <section>
            <h2 className="text-sm font-semibold mb-2">Estrutura</h2>
            <Card className="p-0 divide-y divide-border">
              {f.estrutura.map((b, i) => (
                <div key={i} className="grid grid-cols-[130px_100px_1fr] gap-3 px-4 py-2 text-sm">
                  <span className="font-medium">{b.bloco}</span><span className="text-muted-foreground text-xs pt-0.5">{b.quando ?? ''}</span><span>{b.oque}</span>
                </div>
              ))}
            </Card>
          </section>}

          <div className="grid sm:grid-cols-2 gap-4">
            <Card><h2 className="text-sm font-semibold mb-2 text-green-700">Quando usar</h2><ul className="text-sm list-disc pl-4 space-y-1">{f.quandoUsar.map((x) => <li key={x}>{x}</li>)}</ul></Card>
            <Card><h2 className="text-sm font-semibold mb-2 text-destructive">Quando não usar</h2><ul className="text-sm list-disc pl-4 space-y-1">{f.quandoNaoUsar.map((x) => <li key={x}>{x}</li>)}</ul></Card>
          </div>
          {f.variacoes.length > 0 && <section>
            <h2 className="text-sm font-semibold mb-2">Variações</h2>
            <div className="flex gap-2 flex-wrap">{f.variacoes.map((v) => <Badge key={v} className="!text-sm">{v}</Badge>)}</div>
          </section>}

          <section>
            <div className="flex items-center mb-2"><h2 className="text-sm font-semibold">Referências externas ({f.referencias.length})</h2>
              <Button variant="ghost" className="ml-auto" onClick={() => setAddingRef(true)}>Adicionar</Button></div>
            <p className="text-xs text-muted-foreground mb-2">Só inspiração: a gente copia o conceito, nunca a peça.</p>
            {f.referencias.length > 0 && <div className="space-y-2">
              {f.referencias.map((r, i) => (
                <Card key={i} className="flex gap-3 items-start">
                  {r.imagem && <a href={api.formatRefUrl(f.id, r.imagem)} target="_blank" rel="noreferrer"><img src={api.formatRefUrl(f.id, r.imagem)} alt="" className="w-24 h-24 object-cover rounded-md border border-border" /></a>}
                  <div className="flex-1 min-w-0 text-sm">
                    {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="text-primary-ink hover:underline break-all">{r.url}</a>}
                    {r.observacao && <p className="mt-1 whitespace-pre-wrap">{r.observacao}</p>}
                    <div className="text-xs text-muted-foreground mt-1">{fmtDate(r.adicionadoEm)}</div>
                  </div>
                  <button className="text-xs text-muted-foreground hover:text-destructive" onClick={() => confirm('Apagar esta referência?') && mut.mutate(() => api.removeFormatRef(f.id, i))}>apagar</button>
                </Card>
              ))}
            </div>}
          </section>

          <section>
            <h2 className="text-sm font-semibold mb-2">Peças feitas com ele ({f.usos.length})</h2>
            {!f.usos.length ? <p className="text-sm text-muted-foreground">Nenhuma peça marcada com este formato ainda.</p> : (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {f.usos.map((u) => (
                  <Link key={`${u.empresa}/${u.peca}`} to={`/p/${u.empresa}/conteudos?peca=${encodeURIComponent(u.peca)}`} className="shrink-0 w-40 border border-border rounded-lg overflow-hidden bg-card hover:border-primary/40">
                    <Media empresa={u.empresa} peca={u.peca} cover={u.cover} className="aspect-[4/5]" />
                    <div className="p-2 text-xs"><div className="font-medium line-clamp-2 first-letter:uppercase">{u.title}</div><div className="text-muted-foreground">{u.empresa}{u.status ? ` · ${u.status}` : ''}</div></div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        <EditCard key={f.id} f={f} />
      </div>

      <NewRef open={addingRef} onClose={() => setAddingRef(false)} formats={formats} presetId={f.id} onDone={() => setAddingRef(false)} />
      <PickPiece open={!!picking} mode={picking || 'marcar'} f={f} slug={slug} onClose={() => setPicking('')} />
    </AppContent>
  );
}

/** o que o Oliver edita no verbete (autosave): a IA lê a essência e as observações junto com a skill, e elas mandam sobre ela */
function EditCard({ f }: { f: FormatInfo }) {
  const qc = useQueryClient();
  const [essencia, setEssencia] = useState(f.essencia);
  const [obs, setObs] = useState(f.observacoes);
  const auto = useAutosave<Partial<Format>>({ save: async (patch) => { await api.saveFormat(f.id, patch); void qc.invalidateQueries({ queryKey: qk.formats() }); } });
  const mut = useFormatMutation();
  const patch = (p: Parameters<typeof api.saveFormat>[1]) => mut.mutate(() => api.saveFormat(f.id, p));
  const toggleTipo = (t: Format['tipos'][number]) => patch({ tipos: f.tipos.includes(t) ? f.tipos.filter((x) => x !== t) : [...f.tipos, t] });
  return (
    <Card className="lg:sticky lg:top-4">
      <div className="flex items-center mb-3"><span className="text-sm font-medium">Seu verbete</span><span className="ml-auto"><SaveIndicator state={auto.state} /></span></div>
      <Field label="Essência (1 frase)">
        <Textarea rows={3} value={essencia} onChange={(e) => { setEssencia(e.target.value); auto.schedule({ essencia: e.target.value, observacoes: obs }); }} />
      </Field>
      <Field label="Suas observações" hint="A IA lê antes de produzir e segue mais do que a skill: o que gostou, o que evitar, ajustes de estilo.">
        <Textarea rows={7} value={obs} onChange={(e) => { setObs(e.target.value); auto.schedule({ essencia, observacoes: e.target.value }); }} placeholder="ex.: gancho sempre com hora do dia; nada de emoji na tela; CTA falado, não escrito" />
      </Field>
      <Field label="Nota">
        <div className="flex gap-1 text-xl">
          {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" aria-label={`nota ${n}`} onClick={() => patch({ nota: f.nota === n ? null : n })} className={cx((f.nota ?? 0) >= n ? 'text-amber-400' : 'text-muted-foreground hover:text-amber-400')}>{(f.nota ?? 0) >= n ? '★' : '☆'}</button>)}
        </div>
      </Field>
      <Field label="Tipos de conteúdo" hint="o porquê: filtra a galeria">
        <div className="flex gap-1 flex-wrap">
          {CONTENT_TYPES.map((t) => <button key={t} type="button" onClick={() => toggleTipo(t)} className={cx('px-2.5 py-0.5 rounded-full text-xs border', f.tipos.includes(t) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground')}>{CONTENT_TYPE_LABEL[t]}</button>)}
        </div>
      </Field>
      <div className="text-xs text-muted-foreground border-t border-border pt-3 mt-1 space-y-1">
        <div><b>Pedir à IA:</b> "quero um conteúdo no formato {f.nome} sobre …", ou marque o formato na peça.</div>
        {f.status === 'rascunho' && <div>Rascunho: depois de 2–3 peças boas, peça "transforma o formato {f.nome} em skill".</div>}
      </div>
    </Card>
  );
}

/** escolher uma peça da empresa aberta: marcar o formato na ficha, ou promover como exemplo do formato */
function PickPiece({ open, mode, f, slug, onClose }: { open: boolean; mode: 'marcar' | 'exemplo'; f: FormatInfo; slug: string; onClose: () => void }) {
  const qc = useQueryClient();
  const { data: pieces = [] } = usePieces(slug);
  const [q, setQ] = useState('');
  const [legenda, setLegenda] = useState('');
  const [busy, setBusy] = useState('');
  const isEx = mode === 'exemplo';
  const taken = new Set((isEx ? f.exemplos : f.usos).filter((e) => e.empresa === slug).map((e) => e.peca));
  const list = pieces.filter((p) => !p.archived && (!isEx || p.cover) && (!q || `${p.title} ${p.path}`.toLowerCase().includes(q.toLowerCase())));
  const choose = async (path: string) => {
    setBusy(path);
    try {
      if (isEx) await api.promoteExample(f.id, { empresa: slug, peca: path, legenda });
      else await api.savePieceMeta(slug, path, { formato: f.id });
      void qc.invalidateQueries({ queryKey: qk.formats() });
      void qc.invalidateQueries({ queryKey: qk.pieces(slug) });
      void qc.invalidateQueries({ queryKey: qk.piece(slug, path) });
      toast.ok(isEx ? 'Promovida como exemplo' : `Peça marcada como ${f.nome}`);
      setLegenda(''); onClose();
    } catch (e) { toast.error(e); } finally { setBusy(''); }
  };
  return (
    <Drawer open={open} onClose={onClose} title={isEx ? `Promover como exemplo de ${f.nome}` : `Marcar peça como ${f.nome}`}>
      <p className="text-sm text-muted-foreground mb-3">{isEx ? 'A peça vira exemplo na galeria (a mídia não é copiada) e já fica marcada com este formato.' : 'A ficha da peça passa a apontar para este formato: a IA carrega a skill dele ao produzir ou refazer.'}</p>
      <Input className="w-full mb-2" placeholder={`Buscar peça de ${slug}…`} value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
      {isEx && <Input className="w-full mb-3" placeholder="legenda do exemplo (opcional)" value={legenda} onChange={(e) => setLegenda(e.target.value)} />}
      <div className="divide-y divide-border border border-border rounded-lg max-h-[60vh] overflow-y-auto">
        {!list.length && <div className="p-4 text-sm text-muted-foreground">{isEx ? 'Nenhuma peça com arquivo exportado.' : 'Nenhuma peça.'}</div>}
        {list.map((p) => (
          <button key={p.path} disabled={!!busy || taken.has(p.path)} onClick={() => void choose(p.path)} className="w-full flex items-center gap-3 p-2 text-left hover:bg-muted disabled:opacity-50">
            <Media empresa={slug} peca={p.path} cover={p.cover} className="w-12 h-14 rounded shrink-0" />
            <div className="min-w-0 flex-1"><div className="text-sm font-medium truncate first-letter:uppercase">{p.title}</div><div className="text-xs text-muted-foreground font-mono truncate">{p.path}</div></div>
            {taken.has(p.path) && <span className="text-xs text-muted-foreground">já está</span>}
            {busy === p.path && <span className="text-xs text-muted-foreground">…</span>}
          </button>
        ))}
      </div>
    </Drawer>
  );
}
