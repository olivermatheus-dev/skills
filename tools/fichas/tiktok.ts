// Plano B do download do TikTok: o extrator do yt-dlp (Python 3.9 trava na versão 2025.10) deixou de achar os dados da página,
// mas a página pública ainda traz o vídeo em __UNIVERSAL_DATA_FOR_REHYDRATION__. Só leitura pública, sem login e sem cookie do usuário.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';

/** baixa o MP4 de um vídeo público do TikTok em `destino`; lança erro com o motivo se não der */
export async function baixarTiktokDireto(url: string, destino: string): Promise<number> {
  const pagina = await fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'pt-BR,pt;q=0.9' }, redirect: 'follow', signal: AbortSignal.timeout(30_000) });
  if (!pagina.ok) throw new Error(`página do TikTok respondeu ${pagina.status}`);
  const cookie = pagina.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');
  const html = await pagina.text();
  const m = html.match(/__UNIVERSAL_DATA_FOR_REHYDRATION__[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('a página do TikTok não trouxe os dados do vídeo (bloqueio ou mudança de layout)');
  const v = JSON.parse(m[1])?.__DEFAULT_SCOPE__?.['webapp.video-detail']?.itemInfo?.itemStruct?.video as { playAddr?: string; downloadAddr?: string; PlayAddrStruct?: { UrlList?: string[] } } | undefined;
  const alvo = v?.playAddr || v?.PlayAddrStruct?.UrlList?.[0] || v?.downloadAddr;
  if (!alvo) throw new Error('os dados do TikTok não trazem o endereço do vídeo (vídeo privado ou removido?)');
  const r = await fetch(alvo, { headers: { 'user-agent': UA, referer: 'https://www.tiktok.com/', cookie }, signal: AbortSignal.timeout(120_000) });
  if (!r.ok) throw new Error(`download do TikTok respondeu ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, buf);
  return buf.length;
}
