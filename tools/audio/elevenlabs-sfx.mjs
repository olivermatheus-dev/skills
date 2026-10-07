// Gera um efeito sonoro por texto com a API da ElevenLabs (Sound Effects).
// Uso: node tools/audio/elevenlabs-sfx.mjs "soft airy cinematic whoosh, short, no music" --duration 0.8 --out library/audio/sfx/whoosh/Whoosh_Air_Soft_Short_01.mp3 [--influence 0.4]
// Lê ELEVENLABS_API_KEY do ambiente ou do .env. Depois: node tools/audio/catalog.mjs scan sfx
// ⚠ Não testado com chave real neste repo: confira o endpoint e os termos do seu plano.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const prompt = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
const out = opt('out');
if (!prompt || !out) { console.log('Uso: node tools/audio/elevenlabs-sfx.mjs "<prompt>" --duration 0.8 --out <arquivo.mp3>'); process.exit(1); }

const env = existsSync('.env') ? Object.fromEntries(readFileSync('.env', 'utf8').split('\n').map((l) => l.match(/^\s*([\w]+)\s*=\s*(.*)\s*$/)).filter(Boolean).map((m) => [m[1], m[2].replace(/^["']|["']$/g, '')])) : {};
const key = process.env.ELEVENLABS_API_KEY || env.ELEVENLABS_API_KEY;
if (!key) { console.log('Falta ELEVENLABS_API_KEY no .env (copie de .env.example).'); process.exit(1); }

const body = { text: prompt, prompt_influence: +opt('influence', '0.4') };
if (opt('duration')) body.duration_seconds = +opt('duration');
const res = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
  method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' }, body: JSON.stringify(body),
});
if (!res.ok) { console.log(`Erro ${res.status}: ${await res.text()}`); process.exit(1); }
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, Buffer.from(await res.arrayBuffer()));
console.log(`✓ ${out}\nAgora: node tools/audio/catalog.mjs scan sfx  (e preencha a ficha: source.type=generated, origin="ElevenLabs: ${prompt}", license=ElevenLabs-<plano>)`);
