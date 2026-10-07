// Baixa avatar, capa e thumbnails para companies/<slug>/competitors/<id>/media/<perfil>/ (fora do git).
// Arquivo já baixado não é baixado de novo; falha de download nunca derruba a coleta.
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import type { Runner, SnapshotDraft } from './types';

const EXTS = ['jpg', 'png', 'webp', 'gif', 'ico'];
const short = (s: string) => createHash('sha1').update(s).digest('hex').slice(0, 8);
/** nome de arquivo seguro e estável para um id (o hash evita colisão de maiúsculas no Windows) */
export const safeName = (id: string) => `${id.replace(/[^A-Za-z0-9_-]+/g, '_').slice(0, 60)}-${short(id).slice(0, 4)}`;

export function mediaPlan(key: string, kind: 'avatar' | 'banner' | 'thumb', idOrUrl: string) {
  const name = kind === 'thumb' ? `thumbs/${safeName(idOrUrl)}` : `${kind}-${short(idOrUrl.split('?')[0])}`;
  return `media/${key}/${name}`; // relativo à pasta do concorrente, sem extensão
}
const existing = (compDir: string, relBase: string) => EXTS.map((e) => `${relBase}.${e}`).find((r) => existsSync(join(compDir, r)));

/** preenche avatarLocal/bannerLocal/thumbnailLocal; devolve quantos falharam */
export async function attachMedia(snap: SnapshotDraft, key: string, compDir: string, runner: Runner): Promise<{ failed: number; downloaded: number }> {
  let failed = 0, downloaded = 0;
  const get = async (url: string | null | undefined, kind: 'avatar' | 'banner' | 'thumb', id: string) => {
    if (!url || !/^https?:/.test(url)) return undefined;
    const rel = mediaPlan(key, kind, id);
    const have = existing(compDir, rel);
    if (have) return have;
    const ext = await runner.download(url, join(compDir, rel), kind);
    if (!ext) { failed++; return undefined; }
    downloaded++;
    return `${rel}.${ext}`;
  };
  const prof = snap.profile ?? (snap.profile = { links: [] });
  const [a, b] = await Promise.all([get(prof.avatar, 'avatar', prof.avatar ?? ''), get(prof.banner, 'banner', prof.banner ?? '')]);
  if (a) prof.avatarLocal = a;
  if (b) prof.bannerLocal = b;
  const items = snap.items ?? [];
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(6, items.length) }, async () => {
    while (i < items.length) {
      const it = items[i++];
      const local = await get(it.thumbnail, 'thumb', it.id);
      if (local) it.thumbnailLocal = local;
    }
  }));
  return { failed, downloaded };
}
