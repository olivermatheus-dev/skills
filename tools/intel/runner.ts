// Runner real: yt-dlp (processo), fetch (rede) e download de imagens. Os adaptadores só falam com esta interface.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import type { FetchedText, Runner } from './types';
import { env } from './env';

export const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';

export const YTDLP_MISSING =
  'yt-dlp não encontrado. Instale com `pip install -U yt-dlp` (ou `winget install yt-dlp`), reabra o terminal e rode `npm run app` de novo. ' +
  'Se já estiver instalado em outro lugar, coloque o caminho em YTDLP_PATH no .env.';

class Missing extends Error {}

function run(cmd: string, args: string[], timeoutMs: number): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    let child;
    try { child = spawn(cmd, args, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] }); } catch (e) { return reject(e); }
    let stdout = '', stderr = '';
    const t = setTimeout(() => { child.kill(); reject(new Error(`yt-dlp passou de ${Math.round(timeoutMs / 1000)} s e foi interrompido`)); }, timeoutMs);
    child.stdout.setEncoding('utf8').on('data', (d: string) => (stdout += d));
    child.stderr.setEncoding('utf8').on('data', (d: string) => (stderr += d));
    child.on('error', (e: NodeJS.ErrnoException) => { clearTimeout(t); reject(e.code === 'ENOENT' ? new Missing(cmd) : e); });
    child.on('close', (code) => { clearTimeout(t); resolve({ code: code ?? 1, stdout, stderr }); });
  });
}

/** candidatos, na ordem: YTDLP_PATH, yt-dlp no PATH, `python -m yt_dlp` (pip instala o módulo mesmo quando Scripts/ não está no PATH). */
function candidates(): string[][] {
  const custom = env('YTDLP_PATH');
  if (custom) return [[custom]];
  const py = process.platform === 'win32' ? [['py', '-m', 'yt_dlp'], ['python', '-m', 'yt_dlp']] : [['python3', '-m', 'yt_dlp'], ['python', '-m', 'yt_dlp']];
  return [['yt-dlp'], ...py];
}
let resolved: string[] | null = null;

function cookieArgs(): string[] {
  const browser = env('YTDLP_COOKIES_FROM_BROWSER'), file = env('YTDLP_COOKIES');
  return browser ? ['--cookies-from-browser', browser] : file ? ['--cookies', file] : [];
}

/** mensagem útil a partir do stderr do yt-dlp */
export function ytdlpError(stderr: string): string {
  const lines = stderr.split(/\r?\n/).filter((l) => /ERROR:/.test(l));
  const last = (lines.at(-1) ?? stderr.trim().split(/\r?\n/).at(-1) ?? 'erro desconhecido').replace(/^.*?ERROR:\s*/, '');
  if (/sign in|login|cookies|rate-limit|not a bot/i.test(last)) return `${last} → defina YTDLP_COOKIES_FROM_BROWSER=chrome (ou firefox/edge) no .env`;
  if (/unable to download|getaddrinfo|timed out|network|connection/i.test(last)) return `sem conexão com a plataforma: ${last}`;
  return last.slice(0, 400);
}

export const realRunner: Runner = {
  async ytdlp(args, opt = {}) {
    const timeoutMs = opt.timeoutMs ?? 180_000;
    const full = ['--no-warnings', '--ignore-config', ...cookieArgs(), ...args];
    for (const c of resolved ? [resolved] : candidates()) {
      try {
        const r = await run(c[0], [...c.slice(1), ...full], timeoutMs);
        if (c.length > 1 && /No module named/.test(r.stderr)) continue; // python sem yt_dlp
        resolved = c;
        if (r.code !== 0 && !(opt.allowFail && r.stdout.trim())) throw new Error(ytdlpError(r.stderr));
        return r.stdout;
      } catch (e) {
        if (e instanceof Missing) continue;
        throw e;
      }
    }
    throw new Error(YTDLP_MISSING);
  },

  async fetchText(url, init = {}): Promise<FetchedText> {
    let r: Response;
    try {
      r = await fetch(url, {
        method: init.method ?? 'GET', body: init.body, redirect: init.redirect ?? 'follow',
        headers: { 'user-agent': UA, 'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8', ...(init.headers ?? {}) },
        signal: AbortSignal.timeout(init.timeoutMs ?? 30_000),
      });
    } catch (e) {
      const cause = (e as { cause?: { code?: string } }).cause?.code;
      throw new Error(`sem conexão com ${new URL(url).hostname}${cause ? ` (${cause})` : ''}: ${(e as Error).message}`);
    }
    return { status: r.status, url: r.url || url, text: await r.text(), contentType: r.headers.get('content-type') ?? '' };
  },

  async download(url, absBase) {
    try {
      const r = await fetch(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(20_000) });
      if (!r.ok) return null;
      const ext = extFromType(r.headers.get('content-type') ?? '', url);
      if (!ext) return null;
      const buf = Buffer.from(await r.arrayBuffer());
      if (!buf.length || buf.length > 15 * 1024 * 1024) return null;
      mkdirSync(dirname(absBase), { recursive: true });
      writeFileSync(`${absBase}.${ext}`, buf);
      return ext;
    } catch { return null; }
  },
};

/** só formatos que o navegador mostra e o servidor de mídia conhece; SVG fica remoto (evita script embutido). */
export function extFromType(ct: string, url = ''): string | null {
  const t = ct.toLowerCase();
  if (t.includes('jpeg') || t.includes('jpg')) return 'jpg';
  if (t.includes('png')) return 'png';
  if (t.includes('webp')) return 'webp';
  if (t.includes('gif')) return 'gif';
  if (t.includes('icon')) return 'ico';
  if (t.includes('svg')) return null;
  const m = url.split('?')[0].match(/\.(jpe?g|png|webp|gif|ico)$/i);
  return m ? m[1].toLowerCase().replace('jpeg', 'jpg') : t.startsWith('image/') ? 'jpg' : null;
}
