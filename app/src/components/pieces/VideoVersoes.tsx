// Versões do vídeo na Edição do vídeo (tarefa 050 D): de que versão da fonte é o MP4 no player (versoes/vNN), se a fonte
// atual ainda é ela, "Restaurar esta versão" (a fonte volta a ser a dela; a de antes fica em versoes/_backup-…) e
// "Comparar" (um segundo vídeo lado a lado, preso ao tempo do player principal).
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, type VersoesVideo, type VersaoVista } from '../../api';
import { qk } from '../../queries';
import { toast } from '../toast';
import { Badge, Button, Select } from '../kit';

/** versão (da fonte) de um arquivo de exports/ */
export const versaoDoArquivo = (vs: VersoesVideo | null, file: string): VersaoVista | undefined =>
  vs?.versoes.find((x) => Object.values(x.arquivos).includes(file));

export function useVersoes(slug: string, path: string, deps: unknown) {
  const [vs, setVs] = useState<VersoesVideo | null>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    let vivo = true;
    if (!path) { setVs(null); return; }
    api.versoesVideo(slug, path).then((r) => vivo && setVs(r)).catch(() => vivo && setVs(null));
    return () => { vivo = false; };
  }, [slug, path, deps, n]);
  return { vs, recarregar: () => setN((x) => x + 1), setVs };
}

/** selo + restaurar + escolher o vídeo para comparar */
export function BarraVersao({ slug, path, vs, file, videos, comparar, setComparar, onRestaurado }: {
  slug: string; path: string; vs: VersoesVideo | null; file: string; videos: string[];
  comparar: string; setComparar: (f: string) => void; onRestaurado: (r: VersoesVideo) => void;
}) {
  const qc = useQueryClient();
  const [restaurando, setRestaurando] = useState(false);
  const v = versaoDoArquivo(vs, file);
  const rotulo = (f: string) => { const x = versaoDoArquivo(vs, f); const fmt = f.match(/-(4x5|9x16|16x9|1x1)-/)?.[1]; return x ? `${x.versao}${fmt ? ` · ${fmt}` : ''}` : f; };

  const restaurar = async () => {
    if (!v) return;
    if (!window.confirm(`Voltar a fonte do vídeo para a ${v.versao}?\n\nA timeline e os blocos de agora vão para versoes/_backup-… (nada se perde). O próximo export sai como versão nova a partir da ${v.versao}.`)) return;
    setRestaurando(true);
    try {
      const r = await api.restaurarVersao(slug, path, v.versao);
      onRestaurado(r);
      await qc.invalidateQueries({ queryKey: qk.piece(slug, path) });
      toast.ok(`Fonte de volta à ${r.versao}${r.avisos.length ? ` · ${r.avisos.length} bloco(s) da biblioteca copiados para a peça` : ''}`);
    } catch (e) { toast.error(e, 'Não consegui restaurar a versão'); }
    finally { setRestaurando(false); }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap text-xs" data-testid="barra-versao">
      {file.endsWith('-rascunho.mp4') ? <Badge>prévia (rascunho)</Badge>
        : !v ? <span title="MP4 exportado antes das versões (050): a fonte dele não foi guardada"><Badge>sem fonte guardada</Badge></span>
        : v.atual ? <span title="A timeline e os blocos de agora são os desta versão"><Badge color="#16a34a">fonte: {v.versao} · é a atual</Badge></span>
        : <>
            <span title="A timeline ou os blocos mudaram depois desta versão"><Badge color="#d97706">fonte: {v.versao} · mudou depois</Badge></span>
            <Button variant="soft" disabled={restaurando} onClick={restaurar} data-testid="restaurar-versao">{restaurando ? 'Restaurando…' : 'Restaurar esta versão'}</Button>
          </>}
      {videos.length > 1 && (
        <Select aria-label="Comparar com" value={comparar} onChange={(e) => setComparar(e.target.value)} data-testid="comparar">
          <option value="">comparar com…</option>
          {videos.filter((f) => f !== file).map((f) => <option key={f} value={f}>{rotulo(f)}</option>)}
        </Select>
      )}
    </div>
  );
}

/** segundo player, mudo, preso ao principal (play/pausa/tempo) */
export function PlayerComparar({ src, rotulo, principal }: { src: string; rotulo: string; principal: React.RefObject<HTMLVideoElement | null> }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const a = principal.current;
    if (!a) return;
    const b = () => ref.current;
    const alinha = () => { const x = b(); if (x && Math.abs(x.currentTime - a.currentTime) > 0.12) x.currentTime = a.currentTime; };
    const play = () => { alinha(); void b()?.play().catch(() => {}); };
    const pause = () => { b()?.pause(); alinha(); };
    a.addEventListener('play', play); a.addEventListener('pause', pause); a.addEventListener('seeked', alinha); a.addEventListener('timeupdate', alinha);
    return () => { a.removeEventListener('play', play); a.removeEventListener('pause', pause); a.removeEventListener('seeked', alinha); a.removeEventListener('timeupdate', alinha); };
  }, [principal, src]);
  return (
    <div className="space-y-1">
      <video ref={ref} key={src} src={src} muted preload="metadata" className="rounded-lg bg-black max-h-[60vh] w-auto max-w-full" data-testid="player-comparar"
        onLoadedMetadata={() => { const a = principal.current, x = ref.current; if (a && x) x.currentTime = a.currentTime; }} />
      <div className="text-xs text-muted-foreground text-center">{rotulo} <span className="opacity-70">(sem som, segue o player)</span></div>
    </div>
  );
}
