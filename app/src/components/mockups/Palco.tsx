// Palco do editor de mockups (tarefa 030): o runtime real (library/mockups/runtime/cena.html) num iframe em escala,
// e por cima a camada de interação (seleção, mover, redimensionar, encaixe, guias). O iframe desenha exatamente o que o
// export do Playwright vai gerar; aqui só se calcula geometria e se manda o documento por postMessage.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FORMATOS, geo, type Caixa, type Camada, type Doc, type Fmt, type Geo } from './doc';
import type { CapturaRuntime } from '../../api';
import { cx } from '../kit';

export interface Init { brandCss: string; aparelhos: Record<string, unknown>; capturas: Record<string, CapturaRuntime>; qualidade: number }
type Alca = 'nw' | 'ne' | 'sw' | 'se' | 'e' | 'w' | 'n' | 's';
interface Gesto { tipo: 'mover' | 'redim'; id: string; alca?: Alca; x0: number; y0: number; g0: ReturnType<typeof geo>; box0: Caixa & { cx: number; cy: number } }

export default function Palco({ doc, fmt, init, sel, guias, zoom, onSel, onGeo, onGestoInicio, onTexto, onQa, onSoltarCaptura, onSoltarArquivos }: {
  doc: Doc; fmt: Fmt; init: Init | null; sel: string | null; guias: boolean;
  /** null = cabe na tela; 1 = 100% (1 px do design = 1 px da tela) */
  zoom: number | null;
  onSel: (id: string | null) => void;
  onGeo: (id: string, patch: Geo) => void;
  onGestoInicio: () => void;
  onTexto: (id: string, texto: string) => void;
  onQa: (qa: string[]) => void;
  onSoltarCaptura: (ref: string, x: number, y: number) => void;
  onSoltarArquivos: (files: File[], x: number, y: number) => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const area = useRef<HTMLDivElement>(null);
  const [carregado, setCarregado] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [caixas, setCaixas] = useState<Record<string, Caixa>>({});
  const [seguro, setSeguro] = useState<Caixa | null>(null);
  const [erro, setErro] = useState('');
  const [editando, setEditando] = useState<string | null>(null);
  const [encaixe, setEncaixe] = useState<{ v?: number; h?: number }>({});
  const [hover, setHover] = useState<string | null>(null);
  const [s, setS] = useState(0.4);
  const gesto = useRef<Gesto | null>(null);
  const seq = useRef(0);
  const [W, H] = FORMATOS[fmt];
  const u = Math.min(W, H);
  const cb = useRef({ onTexto, onQa });
  cb.current = { onTexto, onQa };

  // cabe na área disponível
  useLayoutEffect(() => {
    const el = area.current;
    if (!el) return;
    const fit = () => setS(zoom ?? Math.max(0.1, Math.min((el.clientWidth - 64) / W, (el.clientHeight - 64) / H)));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [W, H, zoom]);

  // mensagens do runtime
  useEffect(() => {
    const on = (ev: MessageEvent) => {
      const m = ev.data;
      if (!m || m.origem !== 'cena' || ev.source !== frame.current?.contentWindow) return;
      if (m.tipo === 'carregado') setCarregado(true);
      else if (m.tipo === 'pronto') setPronto(true);
      else if (m.tipo === 'renderizado' && m.seq === seq.current) { setCaixas(m.caixas); setSeguro(m.seguro); setErro(''); cb.current.onQa(m.qa ?? []); }
      else if (m.tipo === 'erro') setErro(m.erro);
      else if (m.tipo === 'texto') cb.current.onTexto(m.id, m.texto);
      else if (m.tipo === 'textoFim') setEditando(null);
    };
    addEventListener('message', on);
    return () => removeEventListener('message', on);
  }, []);
  const post = (m: unknown) => frame.current?.contentWindow?.postMessage(m, '*');
  useEffect(() => { if (carregado && init) post({ tipo: 'iniciar', init }); }, [carregado, init]);
  // re-render a cada mudança (o runtime descarta pedidos intermediários); parado enquanto o texto é editado no quadro
  useEffect(() => { if (pronto && !editando) post({ tipo: 'render', doc, formato: fmt, seq: ++seq.current }); }, [pronto, doc, fmt, editando]);

  const camadas = doc.camadas as Camada[];
  /** caixa ao vivo: centro e largura vêm do documento (resposta imediata ao arrastar); altura da última medição do runtime */
  const box = (c: Camada) => {
    const g = geo(c, fmt), m = caixas[c.id];
    const w = g.w * u;
    const h = c.tipo === 'forma' ? (c.forma === 'circulo' ? w : (g.h ?? c.h ?? 0.2) * u) : m ? (c.tipo === 'texto' ? m.h : m.h * (w / m.w)) : w * 0.6;
    return { cx: g.x * W, cy: g.y * H, w, h, x: g.x * W - w / 2, y: g.y * H - h / 2, rot: g.rot || 0 };
  };
  const ponto = (e: { clientX: number; clientY: number }) => {
    const r = frame.current!.parentElement!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / s, y: (e.clientY - r.top) / s };
  };
  /** camada mais de cima sob o ponto (considera a rotação) */
  const acertar = (p: { x: number; y: number }) => {
    for (let i = camadas.length - 1; i >= 0; i--) {
      const c = camadas[i];
      if (c.visivel === false || !caixas[c.id]) continue;
      const b = box(c), a = (-b.rot * Math.PI) / 180;
      const dx = p.x - b.cx, dy = p.y - b.cy;
      const lx = dx * Math.cos(a) - dy * Math.sin(a), ly = dx * Math.sin(a) + dy * Math.cos(a);
      if (Math.abs(lx) <= b.w / 2 && Math.abs(ly) <= b.h / 2) return c;
    }
    return null;
  };

  const iniciar = (e: React.PointerEvent, id: string, tipo: Gesto['tipo'], alca?: Alca) => {
    const c = camadas.find((k) => k.id === id);
    if (!c || c.travada) return;
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const p = ponto(e);
    gesto.current = { tipo, id, alca, x0: p.x, y0: p.y, g0: geo(c, fmt), box0: box(c) };
    onGestoInicio();
  };
  const SNAP = 8 / s;
  const mover = (e: React.PointerEvent) => {
    const g = gesto.current;
    const p = ponto(e);
    if (!g) { const c = acertar(p); setHover(c?.id ?? null); return; }
    const c = camadas.find((k) => k.id === g.id)!;
    const dx = p.x - g.x0, dy = p.y - g.y0;
    if (g.tipo === 'mover') {
      let cx = g.box0.cx + dx, cy = g.box0.cy + dy;
      const enc: { v?: number; h?: number } = {};
      if (!e.altKey) {
        // encaixe: centro do quadro e bordas da área segura
        const sg = seguro ?? { x: 0, y: 0, w: W, h: H };
        const xs: [number, number][] = [[W / 2, W / 2 - cx], [sg.x, sg.x - (cx - g.box0.w / 2)], [sg.x + sg.w, sg.x + sg.w - (cx + g.box0.w / 2)]];
        const ys: [number, number][] = [[H / 2, H / 2 - cy], [sg.y, sg.y - (cy - g.box0.h / 2)], [sg.y + sg.h, sg.y + sg.h - (cy + g.box0.h / 2)]];
        const bx = xs.filter(([, d]) => Math.abs(d) < SNAP).sort((a, b) => Math.abs(a[1]) - Math.abs(b[1]))[0];
        const by = ys.filter(([, d]) => Math.abs(d) < SNAP).sort((a, b) => Math.abs(a[1]) - Math.abs(b[1]))[0];
        if (bx) { cx += bx[1]; enc.v = bx[0]; }
        if (by) { cy += by[1]; enc.h = by[0]; }
      }
      setEncaixe(enc);
      onGeo(g.id, { x: +(cx / W).toFixed(4), y: +(cy / H).toFixed(4) });
      return;
    }
    // redimensionar: o lado/canto oposto fica parado; aparelho, imagem e texto (cantos) mantêm a proporção
    const b = g.box0, al = g.alca!;
    const sx = al.includes('e') ? 1 : al.includes('w') ? -1 : 0, sy = al.includes('s') ? 1 : al.includes('n') ? -1 : 0;
    const fixoX = b.cx - (sx * b.w) / 2, fixoY = b.cy - (sy * b.h) / 2;
    let w = sx ? Math.max(20, sx * (b.cx + (sx * b.w) / 2 + dx - fixoX)) : b.w;
    let h = sy ? Math.max(12, sy * (b.cy + (sy * b.h) / 2 + dy - fixoY)) : b.h;
    const livre = c.tipo === 'forma' && c.forma !== 'circulo' && !e.shiftKey;
    const lados = al.length === 1;
    if (!livre && !lados) { const k = Math.max(w / b.w, h / b.h); w = b.w * k; h = b.h * k; }
    const cx = sx ? fixoX + (sx * w) / 2 : b.cx, cy = sy ? fixoY + (sy * h) / 2 : b.cy;
    const patch: Geo = { x: +(cx / W).toFixed(4), y: +(cy / H).toFixed(4), w: +(w / u).toFixed(4) };
    if (c.tipo === 'forma' && c.forma !== 'circulo') patch.h = +(h / u).toFixed(4);
    if (c.tipo === 'texto' && !lados) patch.tamanho = +(((g.g0.tamanho ?? c.tamanho ?? 0.07) * w) / b.w).toFixed(4);
    if (c.tipo === 'texto' && lados) delete patch.y;
    onGeo(g.id, patch);
  };
  const soltar = () => { gesto.current = null; setEncaixe({}); };

  const editarTexto = (e: React.MouseEvent) => {
    const c = acertar(ponto(e));
    if (!c || c.tipo !== 'texto' || c.travada) return;
    onSel(c.id);
    setEditando(c.id);
    post({ tipo: 'editarTexto', id: c.id, texto: c.texto ?? '' });
  };

  const selC = camadas.find((c) => c.id === sel && c.visivel !== false);
  const selB = selC && caixas[selC.id] ? box(selC) : null;
  const hovC = hover && hover !== sel ? camadas.find((c) => c.id === hover) : null;
  const hovB = hovC && caixas[hovC.id] ? box(hovC) : null;
  const alcas: Alca[] = !selC ? [] : selC.tipo === 'texto' ? ['nw', 'ne', 'sw', 'se', 'e', 'w'] : selC.tipo === 'forma' && selC.forma !== 'circulo' ? ['nw', 'ne', 'sw', 'se', 'e', 'w', 'n', 's'] : ['nw', 'ne', 'sw', 'se'];
  const quadro = (b: ReturnType<typeof box>) => ({ left: b.x * s, top: b.y * s, width: b.w * s, height: b.h * s, transform: `rotate(${b.rot}deg)` });
  const iframeStyle = useMemo(() => ({ width: W, height: H, transform: `scale(${s})`, transformOrigin: '0 0' }), [W, H, s]);

  return (
    <div ref={area} className={cx('relative flex-1 min-w-0 min-h-0 flex', zoom ? 'overflow-auto p-8' : 'overflow-hidden items-center justify-center')}
      style={{ background: 'repeating-conic-gradient(#ececef 0 25%, #f6f6f7 0 50%) 0 0/16px 16px' }}
      onPointerDown={(e) => { if (e.target === e.currentTarget) onSel(null); }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const r = frame.current!.parentElement!.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
        const ref = e.dataTransfer.getData('text/x-captura');
        if (ref) onSoltarCaptura(ref, x, y);
        else if (e.dataTransfer.files.length) onSoltarArquivos([...e.dataTransfer.files].filter((f) => f.type.startsWith('image/')), x, y);
      }}>
      <div className="relative shrink-0 m-auto shadow-[0_1px_3px_rgb(0_0_0/.12),0_8px_30px_rgb(0_0_0/.10)]" style={{ width: W * s, height: H * s }}>
        <iframe ref={frame} src="/mk/lib/runtime/cena.html" title="mockup" className="absolute left-0 top-0 border-0" style={{ ...iframeStyle, pointerEvents: editando ? 'auto' : 'none' }} />
        {/* camada de interação */}
        <div className="absolute inset-0" style={{ pointerEvents: editando ? 'none' : 'auto', cursor: hover ? 'move' : 'default' }}
          onPointerDown={(e) => { const c = acertar(ponto(e)); onSel(c?.id ?? null); if (c) iniciar(e, c.id, 'mover'); }}
          onPointerMove={mover} onPointerUp={soltar} onPointerCancel={soltar} onPointerLeave={() => !gesto.current && setHover(null)}
          onDoubleClick={editarTexto}>
          {guias && seguro && <div className="absolute border border-dashed border-sky-500/60 pointer-events-none" style={{ left: seguro.x * s, top: seguro.y * s, width: seguro.w * s, height: seguro.h * s }} title="área segura" />}
          {encaixe.v != null && <div className="absolute top-0 bottom-0 w-px bg-pink-500 pointer-events-none" style={{ left: encaixe.v * s }} />}
          {encaixe.h != null && <div className="absolute left-0 right-0 h-px bg-pink-500 pointer-events-none" style={{ top: encaixe.h * s }} />}
          {hovB && <div className="absolute border border-primary/50 pointer-events-none" style={quadro(hovB)} />}
          {selB && selC && (
            <div className="absolute pointer-events-none" style={{ ...quadro(selB), outline: `1.5px solid ${selC.travada ? '#a1a1aa' : '#4f46e5'}` }}>
              {!selC.travada && !editando && alcas.map((a) => (
                <span key={a} onPointerDown={(e) => iniciar(e, selC.id, 'redim', a)}
                  className="absolute w-2.5 h-2.5 bg-white border-[1.5px] border-primary rounded-[2px] pointer-events-auto"
                  style={{ left: a.includes('w') ? -5 : a.includes('e') ? 'calc(100% - 5px)' : 'calc(50% - 5px)', top: a.includes('n') ? -5 : a.includes('s') ? 'calc(100% - 5px)' : 'calc(50% - 5px)', cursor: `${a}-resize` }} />
              ))}
            </div>
          )}
        </div>
        {!pronto && <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground bg-white/70">carregando o estúdio…</div>}
      </div>
      {erro && <div className="absolute bottom-3 left-3 right-3 text-xs text-destructive bg-white border border-border rounded-md px-3 py-2">{erro}</div>}
      {editando && <div className="absolute top-3 left-1/2 -translate-x-1/2 text-xs bg-foreground text-white rounded-full px-3 py-1">editando o texto · Esc ou clique fora para sair · *ênfase* _serifa_</div>}
    </div>
  );
}
