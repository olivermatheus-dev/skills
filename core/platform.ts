// Detecta a plataforma e o perfil a partir de um link colado.
import type { Platform } from '../schema';

export interface DetectedLink { platform: Platform; url: string; handle?: string; externalId?: string; kind: 'perfil' | 'conteudo' }

export function detectLink(raw: string): DetectedLink | null {
  let u: URL;
  try { u = new URL(raw.trim().startsWith('http') ? raw.trim() : `https://${raw.trim()}`); } catch { return null; }
  const host = u.hostname.replace(/^(www\.|m\.)/, '');
  const parts = u.pathname.split('/').filter(Boolean);
  const clean = (path: string) => `https://${host}${path}`;

  if (host === 'youtube.com' || host === 'youtu.be') {
    if (host === 'youtu.be' || parts[0] === 'watch' || parts[0] === 'shorts')
      return { platform: 'youtube', url: u.href, kind: 'conteudo', externalId: host === 'youtu.be' ? parts[0] : parts[0] === 'shorts' ? parts[1] : u.searchParams.get('v') ?? undefined };
    if (parts[0]?.startsWith('@')) return { platform: 'youtube', url: clean(`/${parts[0]}`), handle: parts[0].slice(1), kind: 'perfil' };
    if (parts[0] === 'channel') return { platform: 'youtube', url: clean(`/channel/${parts[1]}`), externalId: parts[1], kind: 'perfil' };
    if (parts[0] === 'c' || parts[0] === 'user') return { platform: 'youtube', url: clean(`/${parts[0]}/${parts[1]}`), handle: parts[1], kind: 'perfil' };
  }
  if (host === 'instagram.com') {
    if (['p', 'reel', 'reels', 'tv'].includes(parts[0])) return { platform: 'instagram', url: u.href, externalId: parts[1], kind: 'conteudo' };
    if (parts[0]) return { platform: 'instagram', url: clean(`/${parts[0]}/`), handle: parts[0], kind: 'perfil' };
  }
  if (host === 'tiktok.com' || host === 'vm.tiktok.com') {
    if (parts[0]?.startsWith('@')) {
      if (parts[1] === 'video') return { platform: 'tiktok', url: u.href, handle: parts[0].slice(1), externalId: parts[2], kind: 'conteudo' };
      return { platform: 'tiktok', url: clean(`/${parts[0]}`), handle: parts[0].slice(1), kind: 'perfil' };
    }
  }
  if (host === 'facebook.com') return { platform: 'facebook', url: u.href, handle: parts[0], kind: 'perfil' };
  if (host === 'linkedin.com') return { platform: 'linkedin', url: u.href, handle: parts[1], kind: 'perfil' };
  if (host === 'x.com' || host === 'twitter.com') return { platform: 'x', url: clean(`/${parts[0] ?? ''}`), handle: parts[0], kind: 'perfil' };
  return { platform: 'site', url: `${u.protocol}//${u.host}`, handle: host, kind: 'perfil' };
}

export const slugify = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'item';
