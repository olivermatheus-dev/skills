// Gera UMA fala com voz grátis de rascunho (edge-* ou win-*) e devolve o tempo de cada palavra. Usado pelo tts.mjs
// (todas as falas de um vídeo) e pelo variantes.mjs (cache por texto + voz, tarefa 045).
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { KIT, prepVoice, closeWords, r3, python } from './lib.mjs';

/** Áudio cru + palavras com o início de cada uma (s, relativo ao arquivo). */
function synth(voice, text, out) {
  if (voice.engine === 'windows') {
    const res = execFileSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', join(KIT, 'scripts', 'tts-windows.ps1'),
      '-Text', text, '-Voice', voice.voice, '-Out', out, '-Rate', String(voice.settings?.rate ?? 1)], { encoding: 'utf8' });
    return JSON.parse(res.trim().split('\n').at(-1)).map((w) => ({ w: w.w, s: w.s }));
  }
  if (voice.engine === 'edge') {
    const py = `
import asyncio, json, sys, edge_tts
async def main():
    c = edge_tts.Communicate(sys.argv[1], sys.argv[2], rate=sys.argv[3], pitch=sys.argv[4], boundary='WordBoundary')
    words = []
    with open(sys.argv[5], 'wb') as f:
        async for ch in c.stream():
            if ch['type'] == 'audio': f.write(ch['data'])
            elif ch['type'] == 'WordBoundary': words.append({'w': ch['text'], 's': round(ch['offset'] / 1e7, 3)})
    print(json.dumps(words))
asyncio.run(main())`;
    const res = execFileSync(python(), ['-c', py, text, voice.voice, voice.settings?.rate ?? '+0%', voice.settings?.pitch ?? '+0Hz', out], { encoding: 'utf8' });
    return JSON.parse(res.trim().split('\n').at(-1));
  }
  throw new Error(`motor de voz "${voice.engine}" não é de rascunho (ElevenLabs entra com elevenlabs.mjs/fit-vo.mjs)`);
}

export const extCru = (voice) => (voice.engine === 'edge' ? 'mp3' : 'wav');

/**
 * Gera a fala em `cru` (formato do motor), prepara em `pronto` (wav cortado nas pontas) e devolve
 * { length, words } com as palavras relativas ao arquivo pronto (0 = começo do arquivo), já com fim.
 */
export function falar(voice, text, cru, pronto) {
  const words = synth(voice, text, cru);
  const { offset, length } = prepVoice(cru, pronto);
  // palavras no tempo do arquivo cortado: o corte tirou (início da fala − respiro)
  const begin = words[0]?.s ?? 0;
  const rel = words.map((w) => ({ w: w.w, s: r3(Math.max(0, w.s - begin + offset)) }));
  return { length, words: closeWords(rel, length) };
}
