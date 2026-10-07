// Runner de fixtures: responde às chamadas do yt-dlp/fetch com os arquivos de tools/intel/fixtures/.
// Usado nos testes (sem rede) e para popular uma cópia do hub com dados de demonstração.
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FetchedText, Runner } from './types';

export const FIXTURES = fileURLToPath(new URL('./fixtures/', import.meta.url));

const hash = (s: string) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0) / 0xffffffff; };

/** multiplica contadores (views, curtidas, seguidores…) simulando crescimento entre coletas; cada número cresce um pouco diferente */
export function grow(txt: string, growth: number, salt = 'x') {
  if (growth === 1) return txt;
  let i = 0;
  return txt.replace(/"(\w*_count|\w*Count)"(\s*:\s*)("?)(\d+)\3/g, (_m, k: string, sep: string, q: string, n: string) => {
    const w = 0.4 + 1.2 * hash(`${salt}:${k}:${i++}`);
    return `"${k}"${sep}${q}${Math.round(+n * (1 + (growth - 1) * w))}${q}`;
  });
}

export interface FixtureOpts { dir?: string; growth?: number; salt?: string; images?: boolean; offline?: string[] }

export function fixtureRunner(o: FixtureOpts = {}): Runner & { calls: string[] } {
  const dir = o.dir ?? FIXTURES;
  const read = (f: string) => grow(readFileSync(join(dir, f), 'utf8'), o.growth ?? 1, o.salt);
  const calls: string[] = [];
  const offline = (u: string) => o.offline?.some((h) => u.includes(h));
  return {
    calls,
    async ytdlp(args) {
      const urls = args.filter((a) => /^https?:/.test(a));
      calls.push(`yt-dlp ${urls.join(' ')}`);
      if (urls.some(offline)) throw new Error('sem conexão com a plataforma (fixture offline)');
      if (args.includes('-j')) {
        const ids = new Set(urls.map((u) => u.match(/(?:v=|shorts\/|video\/)([\w-]+)/)?.[1]));
        return read('youtube-deep.jsonl').split('\n').filter((l) => l && ids.has(JSON.parse(l).id)).join('\n');
      }
      const u = urls[0] ?? '';
      if (/youtube\.com\/.*\/videos$/.test(u)) return read('youtube-videos.json');
      if (/youtube\.com\/.*\/shorts$/.test(u)) return read('youtube-shorts.json');
      if (u.includes('tiktok.com')) return read('tiktok-user.json');
      throw new Error(`ERROR: [fixture] sem dados para ${u}`);
    },
    async fetchText(url, init): Promise<FetchedText> {
      calls.push(`fetch ${init?.method ?? 'GET'} ${url}`);
      if (offline(url)) throw new Error(`sem conexão com ${new URL(url).hostname} (fixture offline)`);
      const ok = (text: string, contentType = 'text/html; charset=utf-8'): FetchedText => ({ status: 200, url, text, contentType });
      if (url.includes('api.apify.com')) return ok(read('instagram-apify.json'), 'application/json');
      if (url.includes('googleapis.com/youtube/v3/')) {
        const api = JSON.parse(read('youtube-api.json'));
        const name = new URL(url).pathname.split('/').pop()!;
        return ok(JSON.stringify(api[name] ?? {}), 'application/json');
      }
      if (url.includes('youtube.com/shorts/')) return { status: url.endsWith('bbbbbbbbbb2') ? 200 : 303, url, text: '', contentType: 'text/html' };
      if (url.includes('tiktok.com')) return ok(read('tiktok-profile.html'));
      if (url.includes('instagram.com')) throw new Error('sem conexão com www.instagram.com (fixture)');
      return ok(read('site.html'));
    },
    /** gera uma imagem de placeholder com ffmpeg (degradê com cor derivada do link) */
    async download(url, absBase, kind) {
      calls.push(`download ${kind} ${url}`);
      if (!o.images) return null;
      const vertical = kind === 'thumb' && /frame0|tiktokcdn|cdninstagram/.test(url);
      const [w, h] = kind === 'avatar' ? [256, 256] : kind === 'banner' ? [1280, 320] : vertical ? [270, 480] : [480, 270];
      const c = (k: string) => `0x${Math.floor(hash(url + k) * 0xffffff).toString(16).padStart(6, '0')}`;
      mkdirSync(dirname(absBase), { recursive: true });
      const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i',
        `gradients=s=${w}x${h}:c0=${c('a')}:c1=${c('b')}:x0=0:y0=0:x1=${w}:y1=${h}:nb_colors=2`, '-frames:v', '1', '-q:v', '4', `${absBase}.jpg`]);
      return r.status === 0 ? 'jpg' : null;
    },
  };
}
