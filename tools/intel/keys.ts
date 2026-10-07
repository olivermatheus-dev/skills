// Chaves estáveis (pasta do snapshot e chave da marcação). Puro: usado pelo coletor e pelo app.
import { slugify } from '../../core/platform';

export interface ProfileLike { platform: string; url: string; handle?: string | null; externalId?: string | null }

/** mesmo formato de `profileKey` do store: `<platform>-<handle|id|url>` */
export function keyFor(p: ProfileLike): string {
  let id = p.handle || p.externalId || '';
  if (!id) { try { const u = new URL(p.url); id = `${u.hostname}${u.pathname}`; } catch { id = p.url; } }
  return `${p.platform}-${slugify(id)}`;
}

/** chave de marks.json: `<platform>:<itemId>` */
export const itemKey = (platform: string, itemId: string) => `${platform}:${itemId}`;
