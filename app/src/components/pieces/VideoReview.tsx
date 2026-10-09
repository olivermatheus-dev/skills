// Vídeo da peça (tarefa 022, v1 enxuta): player do MP4 mais recente + faixas somente leitura desenhadas da timeline.json
// (cenas, falas, eventos, trilha) + anotações ancoradas gravadas em <peça>/revisao.json. A IA lê com `node tools/review.mjs <pasta>`.
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api, type PieceFull, type PieceTimeline, type ReviewComment } from '../../api';
import { Badge, Button, Card, Empty, Select, Textarea, Input, cx } from '../kit';
import VideoAdjust from './VideoAdjust';
import { CommentCard, TipoPicker, nextCommentId, nowLocal, tipoOf, type Anchor, type Tipo } from './shared';

type VideoAnchor = Exclude<Anchor, { kind: 'roteiro' | 'slide' }>;
const EVENT_COLOR: Record<string, string> = { reveal: '#4f46e5', swap: '#0891b2', press: '#d97706', click: '#d97706', cut: '#71717a', impact: '#dc2626', type: '#16a34a' };

const fmtT = (t: number) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;
const evT = (e: PieceTimeline['events'][number]) => e.t ?? e.at ?? 0;

/** tempo (s) em que a anotação aparece, resolvido pelos ids da timeline */
function anchorTime(a: VideoAnchor, tl: PieceTimeline | null): number {
  if ('t' in a && a.t != null) return a.t;
  if (a.kind === 'cena') return tl?.scenes.find((s) => s.id === a.scene)?.start ?? 0;
  if (a.kind === 'fala') return tl?.vo.find((v) => v.id === a.vo)?.start ?? 0;
  if (a.kind === 'evento') { const e = tl?.events.find((x) => x.id === a.event); return e ? evT(e) : 0; }
  return 0;
}
function describe(a: VideoAnchor, tl: PieceTimeline | null): string {
  switch (a.kind) {
    case 'cena': { const s = tl?.scenes.find((x) => x.id === a.scene); return `cena ${a.scene}${s?.block ? ` (${s.block})` : ''}`; }
    case 'fala': return `fala ${a.vo}${a.word ? ` · "${a.word}"` : ''}`;
    case 'evento': { const e = tl?.events.find((x) => x.id === a.event); return `evento ${a.event}${e ? ` (${e.type} ${e.target ?? ''})` : ''}`; }
    case 'tempo': return a.end != null ? `${fmtT(a.t)} → ${fmtT(a.end)}` : `tempo ${fmtT(a.t)}`;
    case 'elemento': return `elemento ${a.selector} · ${fmtT(a.t)}`;
  }
}
const isVideo = (c: ReviewComment): c is ReviewComment & { anchor: VideoAnchor } => c.anchor.kind !== 'roteiro' && c.anchor.kind !== 'slide';

/** linha vertical do cursor: segue o <video> direto no DOM (sem re-render a 60 fps) */
function Cursor({ video, duration }: { video: React.RefObject<HTMLVideoElement | null>; duration: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const tick = () => { const v = video.current; if (v && ref.current) ref.current.style.left = `${Math.min(100, (v.currentTime / duration) * 100)}%`; raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [video, duration]);
  return <div ref={ref} className="absolute top-0 bottom-0 w-px bg-destructive pointer-events-none z-20" style={{ left: 0 }}><div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-destructive" /></div>;
}
function Clock({ video }: { video: React.RefObject<HTMLVideoElement | null> }) {
  const [t, setT] = useState(0);
  useEffect(() => { const id = setInterval(() => setT(video.current?.currentTime ?? 0), 100); return () => clearInterval(id); }, [video]);
  return <span className="font-mono text-sm tabular-nums">{fmtT(t)}</span>;
}

/** seletor estável do elemento clicado: #id ou [data-bloco] dele ou de um ancestral; sem isso, caminho CSS (stable=false) */
function stableSelector(el: Element): { sel: string; stable: boolean } {
  for (let n: Element | null = el; n && n.id !== 'root' && n.tagName !== 'BODY'; n = n.parentElement) {
    if (n.id) return { sel: `#${n.id}`, stable: true };
    const b = n.getAttribute('data-bloco');
    if (b) return { sel: `[data-bloco="${b}"]`, stable: true };
  }
  const parts: string[] = [];
  for (let n: Element | null = el; n && n.id !== 'root' && n.tagName !== 'BODY'; n = n.parentElement) {
    const same = n.parentElement ? [...n.parentElement.children].filter((x) => x.tagName === n!.tagName) : [];
    parts.unshift(same.length > 1 ? `${n.tagName.toLowerCase()}:nth-of-type(${same.indexOf(n) + 1})` : n.tagName.toLowerCase());
  }
  return { sel: ['#root', ...parts].join(' > '), stable: false };
}
/** elemento visível no ponto: o de cima com opacidade efetiva > 0 (os estados escondidos do GSAP ficam empilhados) */
function visibleAt(doc: Document, x: number, y: number): Element | null {
  const win = doc.defaultView!;
  return doc.elementsFromPoint(x, y).find((el) => {
    if (el.id === 'root' || el === doc.body || el === doc.documentElement) return false;
    let op = 1;
    for (let n: Element | null = el; n; n = n.parentElement) {
      const cs = win.getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden') return false;
      op *= parseFloat(cs.opacity);
    }
    return op > 0.05;
  }) ?? null;
}

type Hover = { sel: string; stable: boolean; box: { x: number; y: number; w: number; h: number } };

/** composição renderizada ao vivo (render/<fmt>/index.html) num iframe escalado; a timeline GSAP segue o <video> oculto */
function LivePreview({ src, video, onPick }: { src: string; video: React.RefObject<HTMLVideoElement | null>; onPick: (sel: string, stable: boolean) => void }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [size, setSize] = useState({ w: 1080, h: 1920 });
  const [hover, setHover] = useState<Hover | null>(null);
  const [error, setError] = useState('');
  const boxH = Math.round(window.innerHeight * 0.6);
  const scale = boxH / size.h;
  const pickRef = useRef(onPick); pickRef.current = onPick;

  useEffect(() => {
    let raf = 0; let last = -1;
    const sync = () => {
      const tl = (frame.current?.contentWindow as (Window & { __timelines?: Record<string, { time: (t: number) => void }> }) | null)?.__timelines?.main;
      const t = video.current?.currentTime ?? 0;
      if (tl && t !== last) { tl.time(t); last = t; }
    };
    const tick = () => { sync(); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    // seek pausado também pelos eventos: o rAF para quando a janela fica em segundo plano
    const v = video.current;
    v?.addEventListener('seeked', sync); v?.addEventListener('timeupdate', sync);
    frame.current?.addEventListener('load', sync);
    return () => { cancelAnimationFrame(raf); v?.removeEventListener('seeked', sync); v?.removeEventListener('timeupdate', sync); };
  }, [video, src]);

  const onLoad = () => {
    const win = frame.current?.contentWindow as (Window & { __timelines?: Record<string, { pause: () => void }> }) | null;
    const doc = frame.current?.contentDocument;
    if (!win || !doc) return;
    const root = doc.getElementById('root');
    if (!win.__timelines?.main || !root) { setError('A composição não registrou window.__timelines.main.'); return; }
    win.__timelines.main.pause();
    setSize({ w: Number(root.dataset.width) || 1080, h: Number(root.dataset.height) || 1920 });
    doc.querySelectorAll('audio,video').forEach((m) => { (m as HTMLMediaElement).muted = true; (m as HTMLMediaElement).pause(); });
    const st = doc.createElement('style'); st.textContent = '*{pointer-events:auto!important;cursor:crosshair!important}'; doc.head.appendChild(st);
    doc.addEventListener('mousemove', (e) => {
      const el = visibleAt(doc, e.clientX, e.clientY);
      if (!el) { setHover(null); return; }
      const r = el.getBoundingClientRect();
      setHover({ ...stableSelector(el), box: { x: r.left, y: r.top, w: r.width, h: r.height } });
    });
    doc.addEventListener('mouseleave', () => setHover(null));
    doc.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const el = visibleAt(doc, e.clientX, e.clientY);
      if (el) { const s = stableSelector(el); pickRef.current(s.sel, s.stable); }
    }, true);
  };

  if (error) return <Card className="text-sm text-destructive">{error}</Card>;
  return (
    <div className="relative rounded-lg overflow-hidden bg-black" style={{ width: size.w * scale, height: boxH }} data-testid="live-preview">
      <iframe ref={frame} key={src} src={src} onLoad={onLoad} title="Composição ao vivo" className="absolute top-0 left-0 border-0 origin-top-left"
        style={{ width: size.w, height: size.h, transform: `scale(${scale})` }} />
      {hover && (
        <div className="absolute pointer-events-none border-2 border-primary bg-primary/10 z-10"
          style={{ left: hover.box.x * scale, top: hover.box.y * scale, width: hover.box.w * scale, height: hover.box.h * scale }}>
          <span className={cx('absolute -top-5 left-0 text-[10px] font-mono px-1 rounded whitespace-nowrap', hover.stable ? 'bg-primary text-primary-foreground' : 'bg-warning text-white')}>{hover.sel}</span>
        </div>
      )}
    </div>
  );
}

function Track({ label, children, h = 'h-9' }: { label: string; children: ReactNode; h?: string }) {
  return (
    <div className="flex items-stretch gap-2 mb-1">
      <div className="w-20 shrink-0 text-[11px] text-muted-foreground flex items-center">{label}</div>
      <div className={cx('relative flex-1 rounded bg-muted/60', h)} data-track>{children}</div>
    </div>
  );
}

export default function VideoReview({ slug, path, piece, comments, setComments, saving }: {
  slug: string; path: string; piece: PieceFull; comments: ReviewComment[]; setComments: (next: ReviewComment[]) => void; saving: boolean;
}) {
  const tl = piece.timeline;
  const videos = piece.videos;
  const [version, setVersion] = useState('');
  const video = version && videos.includes(version) ? version : videos[videos.length - 1] ?? '';
  const videoRef = useRef<HTMLVideoElement>(null);
  const duration = tl?.duration ?? 1;
  const mine = comments.filter(isVideo);

  const [draft, setDraft] = useState<VideoAnchor | null>(null);
  const [tipo, setTipo] = useState<Tipo>('corrigir');
  const [text, setText] = useState('');
  const [selector, setSelector] = useState('');
  const [filter, setFilter] = useState<'abertas' | 'todas'>('abertas');
  // v1.1: clicar no elemento na composição ao vivo (só quando há render/<fmt>/index.html montado)
  const previews = piece.previews ?? [];
  const [mode, setMode] = useState<'video' | 'elemento'>('video');
  const [previewSel, setPreviewSel] = useState('');
  const preview = previews.includes(previewSel) ? previewSel
    : [...previews].sort((a, b) => b.length - a.length).find((p) => video.includes(p)) ?? previews[0] ?? '';
  const live = mode === 'elemento' && !!preview && !!video;
  const [unstable, setUnstable] = useState(false);

  // prévia pronta (Ajustes → Gerar prévia): o player passa para o -rascunho.mp4
  const onPreview = useCallback((file: string) => { setVersion(file); setMode('video'); }, []);
  const seek = (t: number, pause = true) => { const v = videoRef.current; if (!v) return; v.currentTime = Math.max(0, Math.min(t, duration)); if (pause) v.pause(); };
  const pick = (a: VideoAnchor, t: number, sel = '') => { setDraft(a); setSelector(sel); setUnstable(false); seek(t); };
  const nowT = () => Math.round((videoRef.current?.currentTime ?? 0) * 100) / 100;
  const pickElement = (sel: string, stable: boolean) => {
    videoRef.current?.pause();
    const t = nowT();
    setDraft({ kind: 'elemento', selector: sel, t, scene: tl?.scenes.find((s) => t >= s.start && t < s.end)?.id });
    setSelector(sel); setUnstable(!stable);
  };
  const areaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    seek(((e.clientX - r.left) / r.width) * duration);
  };

  // âncora final: se há seletor de elemento, vira "elemento" com o tempo e o contexto da âncora escolhida
  const finalAnchor = (): VideoAnchor | null => {
    if (!draft) return null;
    const sel = selector.trim();
    if (!sel) return draft;
    const t = anchorTime(draft, tl);
    return { kind: 'elemento', selector: sel, t: draft.kind === 'tempo' || draft.kind === 'elemento' ? draft.t : (draft.kind === 'evento' ? t : nowT()),
      scene: draft.kind === 'cena' ? draft.scene : draft.kind === 'elemento' ? draft.scene : tl?.scenes.find((s) => nowT() >= s.start && nowT() < s.end)?.id,
      event: draft.kind === 'evento' ? draft.event : undefined };
  };
  const submit = () => {
    const anchor = finalAnchor();
    if (!anchor || !text.trim()) return;
    const c: ReviewComment = { id: nextCommentId(comments), at: nowLocal(), author: 'oliver', tipo, status: 'aberto', video: video || undefined, anchor, text: text.trim() };
    setComments([...comments, c]);
    setText(''); setSelector(''); setDraft(null);
  };

  const markers = useMemo(() => mine.map((c) => ({ c, t: anchorTime(c.anchor, tl) })), [mine, tl]);
  const shown = mine.filter((c) => filter === 'todas' || c.status === 'aberto');
  const pct = (t: number) => `${(Math.max(0, Math.min(t, duration)) / duration) * 100}%`;
  const draftT = draft ? anchorTime(draft, tl) : null;

  return (
    <div>
      {!tl && <Card className="mb-4 text-sm text-muted-foreground">Esta peça não tem <code>timeline.json</code>: só dá para anotar por tempo.</Card>}

      <div className="grid gap-6 lg:grid-cols-[auto_1fr] items-start">
        <div className="space-y-2">
          {video ? (
            <>
              <video ref={videoRef} key={video} src={api.pieceFileUrl(slug, path, `exports/${video}`)} controls={!live} preload="metadata"
                className={cx('rounded-lg bg-black max-h-[60vh] w-auto max-w-full', live && 'hidden')} data-testid="player" />
              {live && <LivePreview src={api.pieceFileUrl(slug, path, `render/${preview}/index.html`)} video={videoRef} onPick={pickElement} />}
            </>
          ) : <Empty title="Sem MP4 em exports/" hint="Renderize o vídeo para poder anotar sobre ele." />}
          <div className="flex items-center gap-2 flex-wrap">
            {live && <Button variant="soft" aria-label="Tocar/pausar" onClick={() => { const v = videoRef.current; if (v) void (v.paused ? v.play() : v.pause()); }}>⏯</Button>}
            <Clock video={videoRef} />
            <span className="text-xs text-muted-foreground">/ {fmtT(duration)}</span>
            <Button variant="soft" onClick={() => { videoRef.current?.pause(); setDraft({ kind: 'tempo', t: nowT() }); setSelector(''); }}>Anotar neste tempo</Button>
            {previews.length > 0 && video && (
              <Button variant={live ? 'primary' : 'soft'} data-testid="modo-elemento" title="Renderiza a composição ao vivo: passe o mouse e clique no elemento para anotar"
                onClick={() => setMode(live ? 'video' : 'elemento')}>{live ? 'Voltar ao MP4' : 'Clicar no elemento'}</Button>
            )}
            {live && previews.length > 1 && <Select aria-label="Composição" value={preview} onChange={(e) => setPreviewSel(e.target.value)}>{previews.map((p) => <option key={p}>{p}</option>)}</Select>}
            {videos.length > 1 && <Select className="ml-auto" aria-label="Versão do vídeo" value={video} onChange={(e) => setVersion(e.target.value)}>{videos.map((v) => <option key={v}>{v}</option>)}</Select>}
          </div>
        </div>

        <div className="space-y-4">
        <Card>
          <div className="text-sm font-medium mb-2">Nova anotação</div>
          {!draft ? (
            <p className="text-sm text-muted-foreground">Clique numa cena, fala ou evento nas faixas abaixo — ou pause o vídeo e use “Anotar neste tempo”{previews.length > 0 ? ', ou “Clicar no elemento” e clique no quadro' : ''}.</p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Badge>{describe(draft, tl)}</Badge>
                {draftT != null && <button className="text-xs text-primary-ink" onClick={() => seek(draftT)}>ir para {fmtT(draftT)}</button>}
                <button className="ml-auto text-xs text-muted-foreground" onClick={() => setDraft(null)}>limpar</button>
              </div>
              <TipoPicker value={tipo} onChange={setTipo} />
              <Textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder={tipo === 'template' ? 'O que virar componente? (ex.: este card de agenda)' : 'O que está errado / o que mudar?'} />
              <Input className="w-full font-mono text-xs" value={selector} onChange={(e) => setSelector(e.target.value)} placeholder="Elemento (opcional): #id ou [data-bloco=nome]" />
              {unstable && selector && <p className="text-xs text-warning">Sem id estável: gravei o caminho CSS. Peça à IA para dar um <code>id</code> a esse elemento.</p>}
              <div className="flex justify-end"><Button disabled={!text.trim() || saving} onClick={submit}>Salvar anotação</Button></div>
            </div>
          )}
        </Card>
        {/* variante (045): a timeline é gerada pelo projeto.json; ajuste direto nela se perderia na próxima geração */}
        {tl && !piece.variante && <VideoAdjust slug={slug} path={path} tl={tl} sel={draft?.kind === 'cena' || draft?.kind === 'evento' ? draft : null} onPreview={onPreview} />}
        </div>
      </div>

      {tl && (
        <Card className="mt-6 overflow-hidden">
          <div className="text-sm font-medium mb-2">Faixas <span className="text-xs text-muted-foreground font-normal">(vêm da timeline.json · clique numa cena ou evento para anotar ou ajustar)</span></div>
          <div className="flex gap-2">
            <div className="w-20 shrink-0" />
            <div className="flex-1 relative h-4 text-[10px] text-muted-foreground">
              {Array.from({ length: Math.floor(duration / 5) + 1 }, (_, i) => i * 5).map((s) => <span key={s} className="absolute -translate-x-1/2" style={{ left: pct(s) }}>{s}s</span>)}
            </div>
          </div>
          {/* área com cursor: sobrepõe as faixas; clicar no vazio busca o tempo */}
          <div className="relative">
            <div className="absolute left-[88px] right-0 top-0 bottom-0 pointer-events-none z-10"><Cursor video={videoRef} duration={duration} /></div>
            <Track label="Anotações" h="h-6">
              <div className="absolute inset-0 cursor-pointer" onClick={areaClick} />
              {markers.map(({ c, t }) => (
                <button key={c.id} title={`${c.id} · ${tipoOf(c.tipo).label} · ${c.text}`} onClick={() => seek(t)} data-marker={c.id}
                  className={cx('absolute top-1 w-3.5 h-3.5 -ml-[7px] rounded-full border-2 border-white shadow z-10', c.status === 'resolvido' && 'opacity-40')}
                  style={{ left: pct(t), background: tipoOf(c.tipo).color }} />
              ))}
            </Track>
            <Track label="Cenas">
              <div className="absolute inset-0 cursor-pointer" onClick={areaClick} />
              {tl.scenes.map((s) => {
                const hit = markers.some((m) => m.c.status === 'aberto' && m.c.anchor.kind === 'cena' && m.c.anchor.scene === s.id);
                const sel = draft?.kind === 'cena' && draft.scene === s.id;
                return (
                  <button key={s.id} data-scene={s.id} title={s.on_screen?.replace(/\|/g, ' / ').replace(/\*/g, '')} onClick={() => pick({ kind: 'cena', scene: s.id }, s.start)}
                    className={cx('absolute top-0 bottom-0 border-r border-white text-left px-1.5 overflow-hidden whitespace-nowrap text-[11px] bg-primary-soft hover:bg-primary/25 text-primary-ink font-medium', sel && 'ring-2 ring-primary z-10', hit && 'underline decoration-destructive')}
                    style={{ left: pct(s.start), width: `${((s.end - s.start) / duration) * 100}%` }}>
                    {s.id} · {s.block}
                  </button>
                );
              })}
            </Track>
            <Track label="Falas">
              <div className="absolute inset-0 cursor-pointer" onClick={areaClick} />
              {tl.vo.map((v) => {
                const end = v.end ?? v.words?.[v.words.length - 1]?.e ?? v.start + 2;
                const sel = draft?.kind === 'fala' && draft.vo === v.id;
                return (
                  <button key={v.id} data-vo={v.id} title={v.text}
                    onClick={(e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      const t = v.start + ((e.clientX - r.left) / r.width) * (end - v.start);
                      const w = v.words?.find((x) => t >= x.s && t < x.e) ?? undefined;
                      pick({ kind: 'fala', vo: v.id, ...(w ? { word: w.w.replace(/[.,!?;:]/g, '') } : {}), t: Math.round((w?.s ?? v.start) * 100) / 100 }, w?.s ?? v.start);
                    }}
                    className={cx('absolute top-1 bottom-1 rounded px-1.5 overflow-hidden whitespace-nowrap text-[11px] text-left bg-emerald-100 text-emerald-800 hover:bg-emerald-200', sel && 'ring-2 ring-success z-10')}
                    style={{ left: pct(v.start), width: `${((end - v.start) / duration) * 100}%` }}>{v.id} · {v.text}</button>
                );
              })}
            </Track>
            <Track label="Eventos">
              <div className="absolute inset-0 cursor-pointer" onClick={areaClick} />
              {tl.events.map((e) => {
                const sel = draft?.kind === 'evento' && draft.event === e.id;
                return (
                  <button key={e.id} data-event={e.id} title={`${e.id} · ${e.type} ${e.target ?? ''} · ${fmtT(evT(e))}`}
                    onClick={() => pick({ kind: 'evento', event: e.id }, evT(e), e.target ?? '')}
                    className={cx('absolute top-1 bottom-1 w-[5px] -ml-[2px] rounded-sm hover:scale-x-150', sel && 'ring-2 ring-foreground z-10')}
                    style={{ left: pct(evT(e)), background: EVENT_COLOR[e.type] ?? '#71717a' }} />
                );
              })}
            </Track>
            <Track label="Trilha" h="h-7">
              <div className="absolute inset-0 cursor-pointer flex items-center px-2 text-[11px] text-ai-ink bg-ai-muted rounded" onClick={areaClick}>
                ♪ {tl.music?.file ?? 'sem trilha'}{tl.music?.bpm ? ` · ${tl.music.bpm} bpm` : ''}{tl.music?.gain_db != null ? ` · ${tl.music.gain_db} dB` : ''}{tl.sfx?.length ? ` · ${tl.sfx.length} efeitos` : ''}
              </div>
            </Track>
          </div>
          <div className="flex gap-3 mt-2 text-[11px] text-muted-foreground flex-wrap">
            {Object.entries(EVENT_COLOR).map(([k, c]) => <span key={k}><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: c }} />{k}</span>)}
          </div>
        </Card>
      )}

      <div className="mt-6">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="font-medium">Anotações do vídeo</h2>
          <Badge>{mine.filter((c) => c.status === 'aberto').length} abertas</Badge>
          <Select className="ml-auto" value={filter} onChange={(e) => setFilter(e.target.value as 'abertas' | 'todas')}><option value="abertas">só abertas</option><option value="todas">todas</option></Select>
        </div>
        {!shown.length && <p className="text-sm text-muted-foreground">Nada por aqui. Depois de anotar, use <b>Pedir ajustes ao Claude</b> (acima): a IA corrige e responde em cada anotação.</p>}
        <div className="space-y-2">
          {shown.map((c) => (
            <CommentCard key={c.id} c={c} anchor={describe(c.anchor, tl)} onJump={() => seek(anchorTime(c.anchor, tl))}
              extra={c.video ? <span className="text-muted-foreground">{c.video}</span> : undefined}
              onToggle={() => setComments(comments.map((x) => (x.id === c.id ? { ...x, status: x.status === 'aberto' ? 'resolvido' : 'aberto' } : x)))}
              onDelete={() => setComments(comments.filter((x) => x.id !== c.id))} />
          ))}
        </div>
      </div>
    </div>
  );
}
