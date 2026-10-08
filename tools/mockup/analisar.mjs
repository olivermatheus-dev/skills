#!/usr/bin/env node
// Analisa um print registrado (tarefa 028) e SUGERE onde cortar — sem a IA olhar a imagem inteira:
//   fio/borda de outra janela na beirada · barra do sistema (Windows/macOS) · barra do navegador · barra de rolagem ·
//   elemento cortado pela borda (texto/card atravessando a beirada → recua até a linha vazia mais próxima) · sobra vazia grande · resolução baixa.
// Grava captura.json → sugestoes { recorte, cortes[], avisos[] } e analise.png (vermelho = sai, verde = fica) para conferir num olhar.
//   node tools/mockup/analisar.mjs <pasta da captura> [--sem-imagem]
// Usar no render: --recorte auto
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
const BR = String.fromCharCode(10);
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

export async function analisar(dir, { imagem = true } = {}) {
  const capF = join(dir, 'captura.json');
  const cap = JSON.parse(readFileSync(capF, 'utf8'));
  const { data, info } = await sharp(join(dir, cap.arquivo || 'original.png')).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, C = info.channels;
  const dpr = cap.dpr || 1, u = (v) => Math.round(v * dpr); // medidas de UI em px do print
  const L = new Float32Array(W * H);
  for (let i = 0, j = 0; i < W * H; i++, j += C) L[i] = 0.2126 * data[j] + 0.7152 * data[j + 1] + 0.0722 * data[j + 2];
  const rgb = (x, y) => { const j = (y * W + x) * C; return [data[j], data[j + 1], data[j + 2]]; };
  const dist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
  const media = (x0, y0, x1, y1) => { let r = 0, g = 0, b = 0, n = 0; const sx = Math.max(1, ((x1 - x0) / 64) | 0), sy = Math.max(1, ((y1 - y0) / 64) | 0); for (let y = y0; y < y1; y += sy) for (let x = x0; x < x1; x += sx) { const c = rgb(x, y); r += c[0]; g += c[1]; b += c[2]; n++; } return [r / n, g / n, b / n]; };
  const sat = (c) => Math.max(...c) - Math.min(...c);
  // transições (gradiente forte) — prefixos por linha (horizontal) e por coluna (vertical)
  const LIM = 8; // baixo: card branco sobre cinza-claro (salto ~10) também conta
  const ph = new Int32Array(W * H), pv = new Int32Array(W * H);
  for (let y = 0; y < H; y++) { let s = 0; for (let x = 0; x < W; x++) { if (x && Math.abs(L[y * W + x] - L[y * W + x - 1]) > LIM) s++; ph[y * W + x] = s; } }
  for (let x = 0; x < W; x++) { let s = 0; for (let y = 0; y < H; y++) { if (y && Math.abs(L[y * W + x] - L[(y - 1) * W + x]) > LIM) s++; pv[y * W + x] = s; } }
  const Tlin = (y, x0, x1) => ph[y * W + x1 - 1] - ph[y * W + x0];            // transições ao longo da linha y
  const Tcol = (x, y0, y1) => pv[(y1 - 1) * W + x] - pv[y0 * W + x];          // ao longo da coluna x
  // cobertura de uma borda horizontal entre y-1 e y (fração da largura com salto de luminância)
  const cobH = (y, x0, x1) => { let n = 0; for (let x = x0; x < x1; x += 2) if (Math.abs(L[y * W + x] - L[(y - 1) * W + x]) > 10) n++; return n / ((x1 - x0) / 2); };
  const cobV = (x, y0, y1) => { let n = 0; for (let y = y0; y < y1; y += 2) if (Math.abs(L[y * W + x] - L[y * W + x - 1]) > 10) n++; return n / ((y1 - y0) / 2); };

  const R = { x0: 0, y0: 0, x1: W, y1: H };
  const cortes = [], avisos = [];
  const corte = (lado, valor, motivo, confianca = 'alta') => {
    const antes = { topo: R.y0, base: H - R.y1, esquerda: R.x0, direita: W - R.x1 }[lado];
    if (lado === 'topo') R.y0 = Math.max(R.y0, valor); else if (lado === 'base') R.y1 = Math.min(R.y1, valor);
    else if (lado === 'esquerda') R.x0 = Math.max(R.x0, valor); else R.x1 = Math.min(R.x1, valor);
    const depois = { topo: R.y0, base: H - R.y1, esquerda: R.x0, direita: W - R.x1 }[lado];
    if (depois > antes) cortes.push({ lado, px: depois - antes, motivo, confianca });
  };

  // 1) fio na beirada (borda de outra janela, sombra de print): até 6 px de cor diferente do miolo
  const fio = (lado) => {
    const max = u(6);
    for (let k = 1; k <= max; k++) {
      const dentro = lado === 'topo' ? media(0, k, W, k + 1) : lado === 'base' ? media(0, H - 1 - k, W, H - k) : lado === 'esquerda' ? media(k, 0, k + 1, H) : media(W - 1 - k, 0, W - k, H);
      const borda = lado === 'topo' ? media(0, 0, W, 1) : lado === 'base' ? media(0, H - 1, W, H) : lado === 'esquerda' ? media(0, 0, 1, H) : media(W - 1, 0, W, H);
      if (dist(dentro, borda) > 30) { // achou a transição: confere que o resto do miolo segue como "dentro"
        const prox = lado === 'topo' ? media(0, k + 2, W, k + 3) : lado === 'base' ? media(0, H - 3 - k, W, H - 2 - k) : lado === 'esquerda' ? media(k + 2, 0, k + 3, H) : media(W - 3 - k, 0, W - 2 - k, H);
        if (dist(prox, dentro) < 12) return k;
        return 0;
      }
    }
    return 0;
  };
  for (const lado of ['topo', 'base', 'esquerda', 'direita']) { const k = fio(lado); if (k) corte(lado, lado === 'topo' || lado === 'esquerda' ? k : (lado === 'base' ? H - k : W - k), `fio de ${k} px na beirada (borda de janela/print)`); }

  // 2) barra do sistema embaixo (barra de tarefas do Windows ~48 px, Dock não ocupa a largura toda)
  {
    let melhor = null;
    for (let y = H - u(72); y <= H - u(28); y++) {
      if (y <= R.y0 + 10) continue;
      const c = cobH(y, R.x0, R.x1);
      if (c > 0.9 && (!melhor || c > melhor.c)) melhor = { y, c };
    }
    if (melhor) {
      const banda = media(R.x0, melhor.y + 2, R.x0 + (R.x1 - R.x0) * 0.25, R.y1);
      const acima = media(R.x0, melhor.y - u(20), R.x1, melhor.y - 2);
      const quietaEsq = Tlin(Math.round((melhor.y + R.y1) / 2), R.x0, R.x0 + Math.round((R.x1 - R.x0) * 0.2)) <= 4;
      while (melhor.y > R.y0 + 10 && cobH(melhor.y - 1, R.x0, R.x1) > 0.9) melhor.y--; // fio de borda da barra fica junto com ela
      if (dist(banda, acima) > 12 && quietaEsq) corte('base', melhor.y, `barra do sistema (${R.y1 - melhor.y} px) no rodapé`, 'media');
    }
  }
  // 3) barra do navegador em cima: 2+ bordas de largura inteira em até 150 px, faixa cinza (pouca saturação)
  {
    const bordas = [];
    for (let y = R.y0 + u(20); y < Math.min(R.y0 + u(150), H * 0.25); y++) { const c = cobH(y, R.x0, R.x1); if (c > 0.75) { if (!bordas.length || y - bordas[bordas.length - 1].y > u(6)) bordas.push({ y, c }); } }
    // abas (aba ativa interrompe a borda) + barra de endereço (borda inteira)
    if (bordas.length >= 2 && bordas.some((b) => b.c > 0.95)) {
      const ult = bordas[bordas.length - 1].y;
      const faixa = media(R.x0, R.y0, R.x1, ult);
      if (sat(faixa) < 18 && ult - R.y0 >= u(56)) corte('topo', ult, `provável barra do navegador/abas (${ult - R.y0} px) — confira se não é o cabeçalho do app`, 'media');
    }
  }
  // 4) barra de rolagem na direita (6–20 px, coluna lisa com borda vertical inteira)
  {
    for (let x = R.x1 - u(6); x >= R.x1 - u(20); x--) {
      if (cobV(x, R.y0, R.y1) > 0.85) {
        const faixa = media(x + 1, R.y0, R.x1, R.y1), miolo = media(x - u(30), R.y0, x - 2, R.y1);
        let ativ = 0; for (let xx = x + 1; xx < R.x1; xx++) ativ += Tcol(xx, R.y0, R.y1);
        if (dist(faixa, miolo) > 6 && ativ / (R.x1 - x) < (R.y1 - R.y0) * 0.02) { corte('direita', x, `barra de rolagem (${R.x1 - x} px)`); break; }
      }
    }
  }
  // 5) elemento cortado pela beirada: a última linha atravessa texto/card que a linha vazia mais próxima não atravessa → recua até ela
  const janelaH = Math.round((R.y1 - R.y0) * 0.15), janelaW = Math.round((R.x1 - R.x0) * 0.12);
  const recuar = (lado) => {
    const vert = lado === 'topo' || lado === 'base';
    const n = vert ? janelaH : janelaW;
    const total = vert ? R.y1 - R.y0 : R.x1 - R.x0;
    const linha = (k) => vert ? Tlin(lado === 'topo' ? R.y0 + k : R.y1 - 1 - k, R.x0, R.x1) : Tcol(lado === 'esquerda' ? R.x0 + k : R.x1 - 1 - k, R.y0, R.y1);
    // "vão de verdade" = tão vazio quanto a linha mais vazia do print inteiro (só as linhas que atravessam tudo, ex. borda da barra lateral)
    let vazio = Infinity; for (let k = 0; k < total; k += 2) vazio = Math.min(vazio, linha(k));
    const borda = linha(0);
    if (borda <= vazio + 2) return; // a beirada já passa num vão
    let kMin = -1, min = Infinity;
    for (let k = 0; k < n; k++) { const t = linha(k); if (t <= vazio + 1) { kMin = k; min = t; break; } }
    if (kMin < 0) { // não há vão perto: avisa (dentro de aparelho, lista cortada na base é natural — a tela "continua")
      let k = n; while (k < total * 0.5 && linha(k) > vazio + 1) k++;
      avisos.push(`${lado}: um elemento atravessa a beirada (card/lista cortado). Vão mais próximo a ${k} px — no aparelho tudo bem (a tela continua); em recorte/sem moldura, use --recorte ou corte manual`);
      return;
    }
    // corta no MEIO do vão mais próximo (fica um respiro antes do conteúdo)
    let a = kMin, b = kMin;
    while (a > 0 && linha(a - 1) <= min + 1) a--;
    while (b < n - 1 && linha(b + 1) <= min + 1) b++;
    const k = Math.round((a + b) / 2);
    const desc = vert ? (borda > (R.x1 - R.x0) * 0.02 ? 'texto' : 'card/elemento') : 'elemento';
    const valor = lado === 'topo' ? R.y0 + k : lado === 'base' ? R.y1 - k : lado === 'esquerda' ? R.x0 + k : R.x1 - k;
    corte(lado, valor, `${desc} cortado pela beirada (${lado}): recuei até o vão vazio mais próximo`, 'alta');
  };
  for (const lado of ['base', 'topo', 'direita', 'esquerda']) recuar(lado);
  // 6) sobra vazia grande na base/direita (> 22%): deixa um respiro de 4%
  {
    let vH = Infinity; for (let y = R.y0; y < R.y1; y += 2) vH = Math.min(vH, Tlin(y, R.x0, R.x1));
    let vV = Infinity; for (let x = R.x0; x < R.x1; x += 2) vV = Math.min(vV, Tcol(x, R.y0, R.y1));
    const vazioBase = (() => { let k = 0; while (R.y1 - 1 - k > R.y0 && Tlin(R.y1 - 1 - k, R.x0, R.x1) <= vH + 1) k++; return k; })();
    if (vazioBase > (R.y1 - R.y0) * 0.22) corte('base', R.y1 - vazioBase + Math.round((R.y1 - R.y0) * 0.04), `sobra vazia de ${vazioBase} px no rodapé`, 'media');
    const vazioDir = (() => { let k = 0; while (R.x1 - 1 - k > R.x0 && Tcol(R.x1 - 1 - k, R.y0, R.y1) <= vV + 1) k++; return k; })();
    if (vazioDir > (R.x1 - R.x0) * 0.22) corte('direita', R.x1 - vazioDir + Math.round((R.x1 - R.x0) * 0.04), `sobra vazia de ${vazioDir} px à direita`, 'media');
  }
  // 7) avisos
  const larguraCss = W / dpr;
  if (dpr < 2) avisos.push(`print em ${dpr}× (${W}×${H}): fica macio em zoom/cards e acima de ~${Math.round(W * 1.35)} px na peça — capture com zoom 200% (ou dpr 2–3)`);
  if (cap.aparelho === 'desktop' && larguraCss < 1100) avisos.push(`largura de ${Math.round(larguraCss)} px CSS: layout de desktop estreito; o notebook vai estender a sobra`);

  const recorte = { x: R.x0, y: R.y0, w: R.x1 - R.x0, h: R.y1 - R.y0 };
  // recorte seguro = só os cortes de confiança alta (fio, rolagem, elemento cortado com vão perto): o render aplica sozinho
  const alta = (lado) => cortes.filter((c) => c.lado === lado && c.confianca === 'alta').reduce((n, c) => n + c.px, 0);
  const seguro = { x: alta('esquerda'), y: alta('topo') }; seguro.w = W - seguro.x - alta('direita'); seguro.h = H - seguro.y - alta('base');
  cap.sugestoes = { recorte, ...(cortes.some((c) => c.confianca === 'alta') ? { recorteSeguro: seguro } : {}), cortes, avisos, analisadoEm: new Date().toISOString().replace(/\.\d+Z$/, 'Z') };
  writeFileSync(capF, JSON.stringify(cap, null, 2) + '\n');

  if (imagem) {
    const k = Math.min(1, 1400 / W), w = Math.round(W * k), h = Math.round(H * k);
    const sv = (v) => Math.round(v * k);
    const fora = [
      [0, 0, w, sv(R.y0)], [0, sv(R.y1), w, h - sv(R.y1)], [0, sv(R.y0), sv(R.x0), sv(R.y1 - R.y0)], [sv(R.x1), sv(R.y0), w - sv(R.x1), sv(R.y1 - R.y0)],
    ].filter((r) => r[2] > 0 && r[3] > 0);
    const txt = cortes.map((c, i) => `${i + 1}. ${c.lado}: −${c.px}px · ${c.motivo} [${c.confianca}]`).concat(avisos.map((a) => '⚠ ' + a));
    const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const linhas = Math.max(1, txt.length);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h + 26 * linhas + 16}">
      ${fora.map((r) => `<rect x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}" fill="rgb(255,40,60)" fill-opacity=".38"/>`).join('')}
      <rect x="${sv(R.x0) + 1}" y="${sv(R.y0) + 1}" width="${sv(R.x1 - R.x0) - 2}" height="${sv(R.y1 - R.y0) - 2}" fill="none" stroke="rgb(30,200,90)" stroke-width="3"/>
      <rect x="0" y="${h}" width="${w}" height="${26 * linhas + 16}" fill="#111"/>
      ${(txt.length ? txt : ['sem cortes sugeridos: o print já está limpo']).map((t, i) => `<text x="12" y="${h + 26 + i * 26}" font-family="Segoe UI, sans-serif" font-size="17" fill="#fff">${esc(t)}</text>`).join('')}
    </svg>`;
    const base = await sharp(join(dir, cap.arquivo || 'original.png')).resize(w, h).extend({ bottom: 26 * linhas + 16, background: '#111' }).png().toBuffer();
    await sharp(base).composite([{ input: Buffer.from(svg), left: 0, top: 0 }]).png().toFile(join(dir, 'analise.png'));
  }
  return cap.sugestoes;
}

/** resumo para o terminal (também usado pelo captura.mjs) */
export function resumo(s, pasta, imagem = true) {
  const { recorte: r } = s;
  return [
    ...(s.cortes.length ? s.cortes.map((c) => `✂ ${c.lado.padEnd(8)} −${String(c.px).padStart(4)} px  ${c.motivo} [${c.confianca}]`) : ['✓ sem cortes sugeridos (bordas limpas)']),
    ...s.avisos.map((a) => '⚠ ' + a),
    ...(s.cortes.length ? [`→ recorte sugerido ${r.x},${r.y},${r.w},${r.h}: use --recorte auto${imagem ? ' · conferir num olhar: ' + join(pasta, 'analise.png') : ''}`] : []),
  ].join(BR);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const pasta = args.find((a) => !a.startsWith('--'));
  if (!pasta || !existsSync(join(pasta, 'captura.json'))) { console.error('Uso: node tools/mockup/analisar.mjs <pasta da captura com captura.json> [--sem-imagem]'); process.exit(1); }
  const s = await analisar(resolve(pasta), { imagem: !args.includes('--sem-imagem') });
  console.log(resumo(s, pasta, !args.includes('--sem-imagem')));
}
