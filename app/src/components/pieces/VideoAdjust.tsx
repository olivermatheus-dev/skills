// Ajustes diretos no vídeo (tarefa 022 fase C), sem passar pelo Claude: volume por faixa e do som de um evento,
// duração e texto da cena selecionada → timeline.json (core/videoedit.ts → tools/video/timeline.mjs), e
// "Gerar prévia" (sfx → mix → produce --draft) que vira o -rascunho.mp4 no player.
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, type PieceFull, type PieceTimeline, type PreviewJob, type VideoAdjust } from '../../api';
import { qk } from '../../queries';
import { toast } from '../toast';
import { Button, Card, Input, Select, cx } from '../kit';

type Sel = { kind: 'cena'; scene: string } | { kind: 'evento'; event: string } | null;
const r1 = (x: number) => Math.round(x * 10) / 10;

/** controle de dB: arrasta à vontade, grava 400 ms depois de soltar (sem um POST por pixel) */
function Db({ label, value, min, max, onCommit, disabled, hint }: { label: string; value: number; min: number; max: number; onCommit: (db: number) => void; disabled?: boolean; hint?: string }) {
  const [v, setV] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => setV(value), [value]);
  const change = (x: number) => { setV(x); clearTimeout(timer.current); timer.current = setTimeout(() => { if (x !== value) onCommit(x); }, 400); };
  return (
    <label className="flex items-center gap-2 text-sm" title={hint}>
      <span className="w-16 shrink-0 text-muted-foreground">{label}</span>
      <input type="range" min={min} max={max} step={0.5} value={v} disabled={disabled} onChange={(e) => change(+e.target.value)} className="flex-1 accent-[var(--primary)]" aria-label={`Volume ${label}`} />
      <span className="w-16 text-right font-mono text-xs tabular-nums">{v > 0 ? '+' : ''}{v.toFixed(1)} dB</span>
    </label>
  );
}

export default function VideoAdjust({ slug, path, tl, sel, onPreview }: { slug: string; path: string; tl: PieceTimeline; sel: Sel; onPreview: (file: string) => void }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [aviso, setAviso] = useState('');
  const [job, setJob] = useState<PreviewJob | null>(null);
  const [fmt, setFmt] = useState(tl.formats?.[0] ?? '9x16');
  const [showLog, setShowLog] = useState(false);

  const scene = sel?.kind === 'cena' ? tl.scenes.find((s) => s.id === sel.scene) : undefined;
  const event = sel?.kind === 'evento' ? tl.events.find((e) => e.id === sel.event) : undefined;
  const cues = event ? (tl.sfx ?? []).filter((c) => c.event === event.id) : [];
  const [dur, setDur] = useState('');
  const [txt, setTxt] = useState('');
  useEffect(() => { setDur(scene ? String(r1(scene.end - scene.start)) : ''); setTxt(scene?.on_screen ?? ''); }, [scene?.id, scene?.start, scene?.end, scene?.on_screen]); // eslint-disable-line react-hooks/exhaustive-deps

  const apply = async (a: VideoAdjust) => {
    setBusy(true);
    try {
      const r = await api.adjustVideo(slug, path, a);
      qc.setQueryData(qk.piece(slug, path), (old: PieceFull | undefined) => (old ? { ...old, timeline: r.timeline } : old));
      setDirty(true);
      // a última linha útil do comando: aviso de leitura, silêncio, fala que não deixa encurtar…
      const warn = r.saida.split('\n').filter((l) => /✗|não dá|aumente|⚠/.test(l));
      setAviso(warn.join(' · '));
      if (!warn.length) toast.ok('Ajuste gravado na timeline');
    } catch (e) { toast.error(e, 'Não foi possível ajustar'); } finally { setBusy(false); }
  };

  // acompanha a prévia (também se ela já estava rodando ao abrir a peça)
  useEffect(() => { void api.previewStatus(slug, path).then(setJob).catch(() => {}); }, [slug, path]);
  const running = job?.estado === 'rodando';
  useEffect(() => {
    if (!running) return;
    const id = setInterval(async () => {
      const j = await api.previewStatus(slug, path).catch(() => null);
      setJob(j);
      if (j?.estado === 'ok' && j.arquivo) {
        await qc.invalidateQueries({ queryKey: qk.piece(slug, path) });
        setDirty(false); onPreview(j.arquivo); toast.ok('Prévia pronta');
      } else if (j?.estado === 'erro') toast.error(new Error(j.erro ?? 'a prévia falhou'), 'A prévia falhou');
    }, 1500);
    return () => clearInterval(id);
  }, [running, slug, path, qc, onPreview]);
  const start = async () => { try { setShowLog(false); setJob(await api.generatePreview(slug, path, fmt)); } catch (e) { toast.error(e, 'Não foi possível gerar a prévia'); } };

  const voDb = tl.mix?.vo_db ?? 0, sfxDb = tl.mix?.sfx_db ?? 0;
  const musicDb = tl.music?.gain_db ?? (tl.vo.length ? -9 : -3);
  const cueDb = cues[0]?.gain_db ?? (cues[0]?.asset ? -14 : 0);
  const lock = busy || running;
  const step = job ? Math.max(1, job.passos.indexOf(job.passo) + 1) : 0;

  return (
    <Card data-testid="ajustes">
      <div className="text-sm font-medium mb-2">Ajustes diretos <span className="text-xs text-muted-foreground font-normal">(gravam na timeline.json · aparecem no vídeo depois de “Gerar prévia”)</span></div>
      <div className="space-y-1.5">
        <Db label="Voz" value={voDb} min={-20} max={10} disabled={lock || !tl.vo.length} onCommit={(db) => void apply({ op: 'volume', alvo: 'voz', db })} hint="Sobre o nível padrão da voz (0 dB)" />
        <Db label="Trilha" value={musicDb} min={-30} max={0} disabled={lock || !tl.music} onCommit={(db) => void apply({ op: 'volume', alvo: 'trilha', db })} hint="Nível da trilha antes de abaixar sob a voz (padrão −9 dB com voz)" />
        <Db label="Efeitos" value={sfxDb} min={-20} max={10} disabled={lock || !tl.sfx?.length} onCommit={(db) => void apply({ op: 'volume', alvo: 'efeitos', db })} hint="Todos os efeitos juntos, sobre o nível de cada um" />
      </div>

      {scene && (
        <div className="mt-3 pt-3 border-t space-y-2" data-testid="ajuste-cena">
          <div className="text-xs font-medium">Cena {scene.id}{scene.block ? ` · ${scene.block}` : ''}</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-16 shrink-0 text-muted-foreground">Duração</span>
            <Input type="number" min={0.5} max={120} step={0.1} className="w-24" value={dur} onChange={(e) => setDur(e.target.value)} aria-label="Duração da cena" />
            <span className="text-xs text-muted-foreground">s</span>
            <Button variant="soft" disabled={lock || !(+dur > 0) || r1(+dur) === r1(scene.end - scene.start)} onClick={() => void apply({ op: 'duracao', cena: scene.id, s: +dur })}>Aplicar</Button>
          </div>
          {scene.vo?.length ? <p className="text-[11px] text-muted-foreground">Com fala, a cena não fica mais curta que a voz; mais longa abre respiro no fim.</p> : null}
          {scene.on_screen != null && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-16 shrink-0 text-muted-foreground">Texto</span>
                <Input className="flex-1" value={txt} onChange={(e) => setTxt(e.target.value)} aria-label="Texto na tela da cena" />
                <Button variant="soft" disabled={lock || txt === scene.on_screen} onClick={() => void apply({ op: 'texto', cena: scene.id, texto: txt })}>Aplicar</Button>
              </div>
              <p className="text-[11px] text-muted-foreground"><code>|</code> separa linhas/itens, <code>*palavra*</code> destaca. Só muda no vídeo se a cena usa <code>T.text('{scene.id}')</code>.</p>
            </div>
          )}
        </div>
      )}
      {event && (
        <div className="mt-3 pt-3 border-t space-y-1.5" data-testid="ajuste-evento">
          <div className="text-xs font-medium">Evento {event.id} · {event.type}{event.target ? ` ${event.target}` : ''}</div>
          {cues.length
            ? <Db label="Som" value={cueDb} min={-40} max={6} disabled={lock} onCommit={(db) => void apply({ op: 'volume', alvo: event.id, db })} hint={cues.map((c) => c.asset ?? c.synth).join(', ')} />
            : <p className="text-xs text-muted-foreground">Este evento não tem som.</p>}
        </div>
      )}
      {!scene && !event && <p className="mt-2 text-[11px] text-muted-foreground">Clique numa cena ou evento nas faixas para mudar duração, texto ou o volume do som dele.</p>}
      {aviso && <p className="mt-2 text-xs text-warning">{aviso}</p>}

      <div className="mt-3 pt-3 border-t flex items-center gap-2 flex-wrap">
        <Button disabled={lock} onClick={() => void start()} data-testid="gerar-previa">{running ? `Gerando… ${job!.passo} (${step}/${job!.passos.length})` : 'Gerar prévia'}</Button>
        {(tl.formats?.length ?? 0) > 1 && <Select aria-label="Formato da prévia" value={fmt} disabled={lock} onChange={(e) => setFmt(e.target.value)}>{tl.formats!.map((f) => <option key={f}>{f}</option>)}</Select>}
        {dirty && !running && <span className="text-xs text-warning">Há ajustes que ainda não estão no vídeo.</span>}
        {job?.estado === 'erro' && <span className="text-xs text-destructive">{job.erro}</span>}
        {job && <button className="ml-auto text-xs text-muted-foreground" onClick={() => setShowLog(!showLog)}>{showLog ? 'ocultar log' : 'log'}</button>}
      </div>
      {showLog && job && <pre className={cx('mt-2 max-h-48 overflow-auto rounded bg-muted p-2 text-[10px] leading-tight')}>{job.log.slice(-60).join('\n')}</pre>}
    </Card>
  );
}
