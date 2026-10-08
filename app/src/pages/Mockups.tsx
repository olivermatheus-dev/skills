// Mockups (tarefa 030): editor estilo Canva, enxuto. Print → aparelho real + texto + fundo (gradiente, malha, padrão) +
// camadas sobrepostas → vários formatos de uma vez → PNG em 3×. O desenho é o runtime library/mockups/runtime/cena.js
// num iframe (o mesmo do export pelo Playwright: o que se vê é o que sai). Documento: contents/<peça>/mockup.json (versão 2).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type CapturaRuntime, type MockupCatalogo, type MockupExport } from '../api';
import { Button, Empty, ErrorBox, Select, cx, fmtDate } from '../components/kit';
import { FillBox } from '../components/fill';
import { toast } from '../components/toast';
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Image as ImageIcon, ImagePlus, Lock, LockOpen, Shapes, Smartphone, Trash2, Type, type LucideIcon } from 'lucide-react';
import ContextSidebar from '../components/ContextSidebar';
import Palco, { type Init } from '../components/mockups/Palco';
import { AppContent } from '../components/AppContent';
import { PainelCamada, PainelFundo, Secao } from '../components/mockups/Propriedades';
import { FMT_NOME, FORMATOS, comGeo, geo, novaCamada, props, semAjuste, type Camada, type Doc, type Fmt, type Geo } from '../components/mockups/doc';

export default function Mockups() {
  const [sp] = useSearchParams();
  const path = sp.get('peca');
  return path ? <Editor key={path} path={path} /> : <Lista />;
}

const toBase64 = (f: Blob) => new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => rej(r.error); r.readAsDataURL(f); });
const extDe = (f: Blob) => (f.type.split('/')[1] ?? 'png').replace('jpeg', 'jpg');
const nomeCap = (c: CapturaRuntime) => c.nome.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/-/g, ' ');
/** imagem colada ou arrastada → captura nova (mede e sugere cortes no servidor) */
async function enviarCaptura(slug: string, f: File | Blob, nome?: string) {
  return api.novaCaptura(slug, { nome: nome ?? ((f as File).name?.replace(/\.[^.]+$/, '') || 'colado'), base64: await toBase64(f), ext: extDe(f) });
}

// ---------- lista ----------
function Lista() {
  const { slug = '' } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const mockups = useQuery({ queryKey: ['mockups', slug], queryFn: () => api.mockups(slug) });
  const capturas = useQuery({ queryKey: ['capturas', slug], queryFn: () => api.capturas(slug) });
  const [ocupado, setOcupado] = useState(false);
  const abrir = (p: string) => nav(`?peca=${encodeURIComponent(p)}`);
  const criar = async (captura?: string) => {
    setOcupado(true);
    try { const r = await api.criarMockup(slug, { captura, formatos: ['4:5', '9:16'] }); void qc.invalidateQueries({ queryKey: ['mockups', slug] }); abrir(r.path); }
    catch (e) { toast.error(e); } finally { setOcupado(false); }
  };
  const novoPrint = async (f: File | Blob) => {
    setOcupado(true);
    try { const c = await enviarCaptura(slug, f); void qc.invalidateQueries({ queryKey: ['capturas', slug] }); await criar(c.ref); }
    catch (e) { toast.error(e); setOcupado(false); }
  };
  useEffect(() => {
    const colar = (e: ClipboardEvent) => { const f = [...(e.clipboardData?.files ?? [])].find((x) => x.type.startsWith('image/')); if (f) { e.preventDefault(); void novoPrint(f); } };
    addEventListener('paste', colar);
    return () => removeEventListener('paste', colar);
  });
  return (
    <AppContent wide className="space-y-6"
      onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const f = [...e.dataTransfer.files].find((x) => x.type.startsWith('image/')); if (f) void novoPrint(f); }}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Mockups</h1>
          <p className="text-sm text-muted-foreground">Cole (Ctrl+V) ou arraste um print aqui para começar, ou escolha um print já registrado.</p>
        </div>
        <Button disabled={ocupado} onClick={() => criar()}>Mockup em branco</Button>
      </div>
      <ErrorBox error={mockups.error ?? capturas.error} />
      <FillBox className="space-y-6">
      {(mockups.data?.length ?? 0) > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-2">Seus mockups</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {mockups.data!.map((m) => (
              <button key={m.path} onClick={() => abrir(m.path)} className="text-left bg-card border border-border rounded-xl overflow-hidden hover:ring-2 hover:ring-primary/30">
                <div className="aspect-[4/5] bg-muted flex items-center justify-center">
                  {m.png[0] ? <img src={`${api.pieceFileUrl(slug, m.path, m.png[0])}?v=${m.updatedAt}`} className="w-full h-full object-contain" alt="" loading="lazy" /> : <span className="text-xs text-muted-foreground">sem export</span>}
                </div>
                <div className="p-2"><div className="text-sm font-medium truncate">{m.title}</div><div className="text-[11px] text-muted-foreground">{m.formatos.join(' · ')} · {fmtDate(m.updatedAt)}</div></div>
              </button>
            ))}
          </div>
        </section>
      )}
      <section>
        <h2 className="text-sm font-semibold mb-2">Prints registrados · clique para criar um mockup</h2>
        {capturas.data?.length === 0 ? <Empty title="Nenhum print ainda" hint="Cole (Ctrl+V) ou arraste uma imagem nesta tela." /> : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {capturas.data?.map((c) => (
              <button key={c.ref} disabled={ocupado} onClick={() => criar(c.ref)} className="text-left bg-card border border-border rounded-lg overflow-hidden hover:ring-2 hover:ring-primary/30">
                <div className="aspect-video bg-muted"><img src={c.src} className="w-full h-full object-cover object-top" alt="" loading="lazy" /></div>
                <div className="px-2 py-1.5 text-xs truncate">{nomeCap(c)} <span className="text-muted-foreground">· {c.largura}×{c.altura}</span></div>
              </button>
            ))}
          </div>
        )}
      </section>
      </FillBox>
      {ocupado && <div className="fixed inset-0 bg-white/60 flex items-center justify-center text-sm">preparando…</div>}
    </AppContent>
  );
}

// ---------- editor ----------
const ICONE: Record<Camada['tipo'], LucideIcon> = { aparelho: Smartphone, imagem: ImageIcon, texto: Type, forma: Shapes };

function Editor({ path }: { path: string }) {
  const { slug = '' } = useParams();
  const qc = useQueryClient();
  const cat = useQuery({ queryKey: ['mockup-catalogo'], queryFn: api.mockupCatalogo, staleTime: Infinity });
  const aps = useQuery({ queryKey: ['mockup-aparelhos'], queryFn: api.mockupAparelhos, staleTime: Infinity });
  const caps = useQuery({ queryKey: ['capturas', slug], queryFn: () => api.capturas(slug) });
  const inicial = useQuery({ queryKey: ['mockup', slug, path], queryFn: () => api.mockup(slug, path), staleTime: Infinity, gcTime: 0 });
  const [doc, setDocRaw] = useState<Doc | null>(null);
  const [fmt, setFmt] = useState<Fmt>('4:5');
  const [sel, setSel] = useState<string | null>(null);
  const [guias, setGuias] = useState(true);
  const [zoom, setZoom] = useState<number | null>(null);
  const [qa, setQa] = useState<string[]>([]);
  const [salvo, setSalvo] = useState<'salvo' | 'salvando' | 'pendente' | 'erro'>('salvo');
  const [exportando, setExportando] = useState(false);
  const [resultado, setResultado] = useState<MockupExport | null>(null);
  const hist = useRef<{ antes: Doc[]; depois: Doc[] }>({ antes: [], depois: [] });

  useEffect(() => { if (inicial.data && !doc) { setDocRaw(inicial.data.doc); setFmt(inicial.data.doc.formatos[0]); } }, [inicial.data, doc]);
  /** muda o documento; registra=true guarda o estado anterior para desfazer (gestos contínuos registram só no início) */
  const setDoc = useCallback((fn: (d: Doc) => Doc, registra = true) => {
    setDocRaw((d) => {
      if (!d) return d;
      const n = fn(d);
      if (n === d) return d;
      if (registra) { hist.current.antes.push(d); if (hist.current.antes.length > 100) hist.current.antes.shift(); hist.current.depois = []; }
      setSalvo('pendente');
      return n;
    });
  }, []);
  const marcarHistorico = useCallback(() => { setDocRaw((d) => { if (d) { hist.current.antes.push(d); hist.current.depois = []; } return d; }); }, []);
  const desfazer = () => setDocRaw((d) => { const a = hist.current.antes.pop(); if (!a || !d) return d; hist.current.depois.push(d); setSalvo('pendente'); return a; });
  const refazer = () => setDocRaw((d) => { const a = hist.current.depois.pop(); if (!a || !d) return d; hist.current.antes.push(d); setSalvo('pendente'); return a; });

  // salva sozinho (0,8 s depois da última mudança)
  useEffect(() => {
    if (!doc || salvo !== 'pendente') return;
    const t = setTimeout(async () => {
      setSalvo('salvando');
      try { await api.salvarMockup(slug, path, doc); setSalvo((s) => (s === 'salvando' ? 'salvo' : s)); }
      catch (e) { setSalvo('erro'); toast.error(e); }
    }, 800);
    return () => clearTimeout(t);
  }, [doc, salvo, slug, path]);

  // capturas conhecidas pelo runtime: as do documento + as da biblioteca
  const capturasMapa = useMemo(() => {
    const m: Record<string, CapturaRuntime> = { ...(inicial.data?.capturas ?? {}) };
    for (const c of caps.data ?? []) m[c.ref] = c;
    return m;
  }, [inicial.data, caps.data]);
  const init = useMemo<Init | null>(() => (aps.data ? { brandCss: `/mk/emp/${slug}/brand/brand.css`, aparelhos: aps.data, capturas: capturasMapa, qualidade: zoom ? Math.min(2, zoom) : 0.5 } : null), [aps.data, capturasMapa, slug, zoom]);

  const camadas = (doc?.camadas ?? []) as Camada[];
  const selC = camadas.find((c) => c.id === sel) ?? null;
  const adicionar = (c: Camada) => { setDoc((d) => ({ ...d, camadas: [...d.camadas, c] })); setSel(c.id); };
  const remover = (id: string) => { setDoc((d) => ({ ...d, camadas: d.camadas.filter((c) => c.id !== id) })); setSel(null); };
  const duplicar = (id: string) => {
    if (!doc) return;
    const c = camadas.find((k) => k.id === id);
    if (!c) return;
    const n = { ...structuredClone(c), id: novaCamada(doc, c.tipo).id, nome: `${c.nome ?? c.tipo} (cópia)`, x: geo(c, fmt).x + 0.03, y: geo(c, fmt).y + 0.03 };
    adicionar(n);
  };
  const mover = (id: string, delta: number) => setDoc((d) => {
    const i = d.camadas.findIndex((c) => c.id === id), j = i + delta;
    if (i < 0 || j < 0 || j >= d.camadas.length) return d;
    const l = [...d.camadas]; [l[i], l[j]] = [l[j], l[i]];
    return { ...d, camadas: l };
  });
  const adicionarCaptura = (ref: string, x = 0.5, y = 0.58, tipo: 'aparelho' | 'imagem' = 'aparelho') => {
    if (!doc) return;
    const c = novaCamada(doc, tipo, { captura: ref, x, y, ...(tipo === 'aparelho' ? { modelo: '' } : {}) });
    adicionar(c);
  };
  const novosArquivos = async (files: (File | Blob)[], x = 0.5, y = 0.5) => {
    for (const f of files) {
      try {
        const c = await enviarCaptura(slug, f);
        await qc.invalidateQueries({ queryKey: ['capturas', slug] });
        adicionarCaptura(c.ref, x, y);
        toast.ok(`print registrado: ${nomeCap(c)}`);
      } catch (e) { toast.error(e); }
    }
  };

  // atalhos e colar
  const estado = useRef({ sel, fmt, doc });
  estado.current = { sel, fmt, doc };
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, select, [contenteditable]')) return;
      const { sel } = estado.current;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) refazer(); else desfazer(); }
      else if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); refazer(); }
      else if (mod && e.key.toLowerCase() === 'd' && sel) { e.preventDefault(); duplicar(sel); }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && sel) { e.preventDefault(); remover(sel); }
      else if (e.key === 'Escape') setSel(null);
      else if (sel && e.key.startsWith('Arrow')) {
        e.preventDefault();
        const c = estado.current.doc?.camadas.find((k) => k.id === sel) as Camada | undefined;
        if (!c || c.travada) return;
        const [W, H] = FORMATOS[estado.current.fmt], g = geo(c, estado.current.fmt), passo = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -passo : e.key === 'ArrowRight' ? passo : 0, dy = e.key === 'ArrowUp' ? -passo : e.key === 'ArrowDown' ? passo : 0;
        setDoc((d) => comGeo(d, sel, estado.current.fmt, { x: +(g.x + dx / W).toFixed(4), y: +(g.y + dy / H).toFixed(4) }));
      }
    };
    const colar = (e: ClipboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest?.('input, textarea, [contenteditable]')) return;
      const f = [...(e.clipboardData?.files ?? [])].filter((x) => x.type.startsWith('image/'));
      if (f.length) { e.preventDefault(); void novosArquivos(f); }
    };
    addEventListener('keydown', tecla);
    addEventListener('paste', colar);
    return () => { removeEventListener('keydown', tecla); removeEventListener('paste', colar); };
  });

  const exportar = async () => {
    if (!doc) return;
    setExportando(true); setResultado(null);
    try {
      if (salvo !== 'salvo') { await api.salvarMockup(slug, path, doc); setSalvo('salvo'); }
      const r = await api.exportarMockup(slug, path, { formatos: doc.formatos });
      setResultado(r);
      void qc.invalidateQueries({ queryKey: ['mockups', slug] });
      void qc.invalidateQueries({ queryKey: ['pieces', slug] });
      if (r.ok) toast.ok(`${r.arquivos.length} imagem(ns) em 3× na peça`); else toast.error(new Error(r.erro ?? 'export falhou'));
    } catch (e) { toast.error(e); } finally { setExportando(false); }
  };
  const alternarFormato = (f: Fmt) => setDoc((d) => {
    const tem = d.formatos.includes(f);
    if (tem && d.formatos.length === 1) return d;
    const formatos = tem ? d.formatos.filter((x) => x !== f) : [...d.formatos, f];
    return { ...d, formatos: (Object.keys(FORMATOS) as Fmt[]).filter((x) => formatos.includes(x)).sort((a, b) => (a === d.formatos[0] ? -1 : b === d.formatos[0] ? 1 : 0)) };
  });
  useEffect(() => { if (doc && !doc.formatos.includes(fmt)) setFmt(doc.formatos[0]); }, [doc, fmt]);

  if (inicial.error || cat.error) return <div className="p-6"><ErrorBox error={inicial.error ?? cat.error} /><Link to="?" className="text-sm text-primary-ink">← voltar</Link></div>;
  if (!doc || !cat.data) return <div className="p-6 text-sm text-muted-foreground">abrindo o editor…</div>;
  const catalogo = cat.data as MockupCatalogo;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* barra de cima */}
      <header className="h-12 shrink-0 flex items-center gap-3 px-3 border-b border-border bg-card">
        <Link to="?" className="text-sm text-muted-foreground hover:text-foreground">← Mockups</Link>
        <span className="text-sm font-medium truncate max-w-[220px]">{path.replace(/^\d{4}-\d{2}-\d{2}-mockup-/, '').replace(/-/g, ' ')}</span>
        <div className="flex items-center gap-1 ml-2">
          {(Object.keys(FORMATOS) as Fmt[]).map((f) => {
            const ativo = doc.formatos.includes(f);
            return (
              <div key={f} className={cx('flex items-center rounded-md border text-xs', fmt === f ? 'border-primary bg-primary-soft' : 'border-border')}>
                <input type="checkbox" checked={ativo} onChange={() => alternarFormato(f)} className="ml-1.5 accent-primary" title={ativo ? 'exporta este formato (desmarque para tirar)' : 'incluir no export'} />
                <button disabled={!ativo} onClick={() => setFmt(f)} className={cx('px-2 py-1', !ativo && 'text-muted-foreground/60', fmt === f && 'text-primary-ink font-medium')} title={FMT_NOME[f]}>
                  {f}{doc.formatos[0] === f && <span className="ml-1 text-[10px] text-muted-foreground">principal</span>}
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex-1" />
        <button className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30" disabled={!hist.current.antes.length} onClick={desfazer} title="Desfazer (Ctrl+Z)">↶</button>
        <button className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30" disabled={!hist.current.depois.length} onClick={refazer} title="Refazer (Ctrl+Y)">↷</button>
        <Select value={zoom ?? ''} onChange={(e) => setZoom(e.target.value ? Number(e.target.value) : null)} className="h-7 text-xs px-2" title="zoom (confira detalhes em 100%)">
          <option value="">Ajustar</option><option value="0.5">50%</option><option value="1">100%</option><option value="2">200%</option>
        </Select>
        <label className="text-xs text-muted-foreground flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={guias} onChange={(e) => setGuias(e.target.checked)} className="accent-primary" />área segura</label>
        <span className={cx('text-xs w-16 text-right', salvo === 'erro' ? 'text-destructive' : 'text-muted-foreground')}>{{ salvo: 'salvo', salvando: 'salvando…', pendente: '…', erro: 'erro ao salvar' }[salvo]}</span>
        <Button disabled={exportando} onClick={exportar}>{exportando ? 'Exportando…' : `Exportar ${doc.formatos.length > 1 ? `${doc.formatos.length} formatos` : doc.formatos[0]} (3×)`}</Button>
      </header>

      <div className="flex-1 min-h-0 flex">
        {/* esquerda: adicionar, camadas, prints (barra contextual padrão do app) */}
        <ContextSidebar storageKey="mockups-editor" title="Camadas" width={248}
          footer={selC && (
            <div className="grid grid-cols-4 gap-1 text-[11px]">
              <button className="flex flex-col items-center gap-0.5 py-1 rounded hover:bg-muted" onClick={() => mover(selC.id, 1)} title="trazer para frente"><ArrowUp className="size-3.5" />frente</button>
              <button className="flex flex-col items-center gap-0.5 py-1 rounded hover:bg-muted" onClick={() => mover(selC.id, -1)} title="mandar para trás"><ArrowDown className="size-3.5" />trás</button>
              <button className="flex flex-col items-center gap-0.5 py-1 rounded hover:bg-muted" onClick={() => duplicar(selC.id)} title="duplicar (Ctrl+D)"><Copy className="size-3.5" />duplicar</button>
              <button className="flex flex-col items-center gap-0.5 py-1 rounded hover:bg-destructive/10 text-destructive" onClick={() => remover(selC.id)} title="apagar (Delete)"><Trash2 className="size-3.5" />apagar</button>
            </div>
          )}>
          <div className="grid grid-cols-4 gap-1">
            {(['aparelho', 'texto', 'forma', 'imagem'] as const).map((t) => {
              const I = ICONE[t];
              return (
                <button key={t} onClick={() => adicionar(novaCamada(doc, t, t === 'aparelho' || t === 'imagem' ? { captura: caps.data?.[0]?.ref, ...(t === 'aparelho' ? { modelo: '' } : {}) } : {}))}
                  className="flex flex-col items-center gap-1 py-2 rounded-md border border-border hover:bg-muted text-[11px]" title={`adicionar ${t}`}>
                  <I className="size-4" strokeWidth={1.8} />{t}
                </button>
              );
            })}
          </div>
          <ContextSidebar.Section title="Camadas">
            {[...camadas].reverse().map((c) => {
              const I = ICONE[c.tipo];
              return (
                <div key={c.id} draggable onDragStart={(e) => e.dataTransfer.setData('text/x-camada', c.id)} onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const de = e.dataTransfer.getData('text/x-camada');
                    if (!de || de === c.id) return;
                    setDoc((d) => { const l = d.camadas.filter((k) => k.id !== de); const alvo = l.findIndex((k) => k.id === c.id); l.splice(alvo + 1, 0, d.camadas.find((k) => k.id === de)!); return { ...d, camadas: l }; });
                  }}
                  onClick={() => setSel(c.id)}
                  className={cx('group flex items-center gap-2 h-8 px-2 rounded-md text-sm cursor-pointer', sel === c.id ? 'bg-primary-soft text-primary-ink font-medium' : 'hover:bg-muted', c.visivel === false && 'opacity-50')}>
                  <I className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.8} />
                  <span className="flex-1 truncate">{c.nome || c.tipo}{c.tipo === 'texto' && c.texto ? <span className="text-muted-foreground font-normal"> · {c.texto.replace(/[*_]/g, '').slice(0, 18)}</span> : null}</span>
                  <button title={c.visivel === false ? 'mostrar' : 'ocultar'} onClick={(e) => { e.stopPropagation(); setDoc((d) => props(d, c.id, { visivel: c.visivel === false ? undefined : false })); }} className={cx('text-muted-foreground hover:text-foreground', c.visivel === false ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}>{c.visivel === false ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}</button>
                  <button title={c.travada ? 'destravar' : 'travar'} onClick={(e) => { e.stopPropagation(); setDoc((d) => props(d, c.id, { travada: c.travada ? undefined : true })); }} className={cx('text-muted-foreground hover:text-foreground', c.travada ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}>{c.travada ? <Lock className="size-3.5" /> : <LockOpen className="size-3.5" />}</button>
                </div>
              );
            })}
            <ContextSidebar.Item onClick={() => setSel(null)} active={!sel} icon={<span className="size-4 rounded border border-border" style={{ background: 'linear-gradient(135deg,#fffaf5,#f2d9cb)' }} />}>Fundo</ContextSidebar.Item>
          </ContextSidebar.Section>
          <ContextSidebar.Section title="Prints · arraste para o quadro">
            <div className="grid grid-cols-2 gap-1.5">
              {caps.data?.map((c) => (
                <button key={c.ref} draggable onDragStart={(e) => e.dataTransfer.setData('text/x-captura', c.ref)}
                  onClick={() => (selC && (selC.tipo === 'aparelho' || selC.tipo === 'imagem') ? setDoc((d) => props(d, selC.id, { captura: c.ref, recorte: undefined })) : adicionarCaptura(c.ref))}
                  title={`${nomeCap(c)} · ${c.largura}×${c.altura}${selC && (selC.tipo === 'aparelho' || selC.tipo === 'imagem') ? ' · clique troca o print da camada' : ' · clique adiciona num aparelho'}`}
                  className="rounded-md overflow-hidden border border-border hover:ring-2 hover:ring-primary/40 bg-muted">
                  <img src={c.src} alt="" className="w-full aspect-video object-cover object-top" loading="lazy" />
                </button>
              ))}
              <label className="col-span-2 flex flex-col items-center gap-1 text-[11px] text-muted-foreground border border-dashed border-border rounded-md py-3 cursor-pointer hover:bg-muted">
                <ImagePlus className="size-4" />Ctrl+V cola um print · ou clique para enviar
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { void novosArquivos([...(e.target.files ?? [])]); e.target.value = ''; }} />
              </label>
            </div>
          </ContextSidebar.Section>
        </ContextSidebar>

        {/* centro */}
        <div className="flex-1 min-w-0 flex flex-col">
          <Palco doc={doc} fmt={fmt} init={init} sel={sel} guias={guias} zoom={zoom}
            onSel={setSel}
            onGestoInicio={marcarHistorico}
            onGeo={(id, patch: Geo) => setDoc((d) => comGeo(d, id, fmt, patch), false)}
            onTexto={(id, texto) => setDoc((d) => props(d, id, { texto }), false)}
            onQa={setQa}
            onSoltarCaptura={(ref, x, y) => adicionarCaptura(ref, x, y)}
            onSoltarArquivos={(files, x, y) => void novosArquivos(files, x, y)} />
          {(qa.length > 0 || resultado) && (
            <div className="shrink-0 border-t border-border bg-card px-4 py-2 text-xs space-y-1 max-h-32 overflow-y-auto">
              {qa.map((q) => <div key={q} className="text-warning">⚠ {q}</div>)}
              {resultado?.ok && (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-success">✓ exportado:</span>
                  {resultado.arquivos.map((a) => <a key={a} href={`${api.pieceFileUrl(slug, path, a)}?v=${Date.now()}`} target="_blank" rel="noreferrer" className="text-primary-ink hover:underline">{a}</a>)}
                  <button className="text-muted-foreground hover:text-foreground" onClick={() => void api.pieceDesktop(slug, path, 'reveal', resultado.arquivos[0])}>abrir a pasta</button>
                  <Link to={`../conteudos?peca=${encodeURIComponent(path)}`} relative="path" className="text-muted-foreground hover:text-foreground">ficha na central</Link>
                </div>
              )}
              {resultado && resultado.qa.map((q) => <div key={'e' + q} className="text-warning">⚠ {q}</div>)}
            </div>
          )}
        </div>

        {/* direita: propriedades */}
        <aside className="w-72 shrink-0 border-l border-border bg-card overflow-y-auto">
          {selC ? (
            <PainelCamada c={selC} doc={doc} fmt={fmt} cat={catalogo} capturas={caps.data ?? []}
              onProps={(p) => setDoc((d) => props(d, selC.id, p))}
              onGeo={(p) => setDoc((d) => comGeo(d, selC.id, fmt, p))}
              onSemAjuste={() => setDoc((d) => semAjuste(d, selC.id, fmt))} />
          ) : (
            <>
              <PainelFundo f={doc.fundo as any} cat={catalogo} capturas={caps.data ?? []} onChange={(f) => setDoc((d) => ({ ...d, fundo: f }))} />
              <Secao titulo="Dica">
                <p className="text-xs text-muted-foreground leading-relaxed">Monte no formato <b>principal</b> ({doc.formatos[0]}); os outros se adaptam sozinhos. Ajuste fino num formato fica só nele. Alt desliga o encaixe ao arrastar; Shift solta a proporção da forma.</p>
              </Secao>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
