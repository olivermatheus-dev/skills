#!/usr/bin/env node
// Molduras realistas do estúdio de mockups (tarefa 028): baixa os pacotes oficiais (Apple Product Bezels, Android Studio device art),
// separa por modelo/cor/orientação e CALIBRA a tela de cada uma (área transparente → retângulo + máscara com os cantos exatos).
//   node tools/mockup/aparelhos.mjs baixar            # ~1 GB em _inbox/visual/aparelhos/ (fora do git); precisa do 7-Zip para os .dmg
//   node tools/mockup/aparelhos.mjs preparar [--so id1,id2]   # → library/mockups/aparelhos/<id>/{aparelho.json, <orientação>-<cor>.png, <orientação>-mascara.png}
//   node tools/mockup/aparelhos.mjs listar
// Molduras e máscaras vão para o git (repositório privado, uso próprio); estes 2 comandos só servem para atualizar/adicionar modelos.
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, copyFileSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = join(ROOT, 'library', 'mockups', 'aparelhos');
const BRUTO = join(ROOT, '_inbox', 'visual', 'aparelhos');
const fontes = JSON.parse(readFileSync(join(DIR, 'fontes.json'), 'utf8'));
const [cmd = 'listar', ...resto] = process.argv.slice(2);
const flag = (n) => { const i = resto.indexOf('--' + n); return i < 0 ? undefined : resto[i + 1]; };
const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const ORIENT = { Portrait: 'vertical', Landscape: 'horizontal', 'Inner Open Portrait': 'aberto-vertical', 'Inner Open Landscape': 'aberto-horizontal', 'Outer Closed Portrait': 'fechado-vertical' };

function seteZip() {
  for (const p of ['C:/Program Files/7-Zip/7z.exe', 'C:/Program Files (x86)/7-Zip/7z.exe', '7z']) {
    try { execFileSync(p, ['i'], { stdio: 'ignore' }); return p; } catch { /* tenta o próximo */ }
  }
  console.error('✗ 7-Zip não encontrado (winget install 7zip.7zip)'); process.exit(1);
}

async function baixar() {
  const apple = join(BRUTO, 'apple'), android = join(BRUTO, 'android');
  mkdirSync(apple, { recursive: true }); mkdirSync(android, { recursive: true });
  const z = seteZip();
  for (const a of fontes.pacotes.apple.arquivos) {
    const dmg = join(apple, a + '.dmg');
    if (!existsSync(dmg)) {
      console.log('↓ ' + a + '.dmg');
      const r = await fetch(fontes.pacotes.apple.base + a + '.dmg');
      if (!r.ok) { console.log(`  ✗ HTTP ${r.status}`); continue; }
      writeFileSync(dmg, Buffer.from(await r.arrayBuffer()));
    }
    execFileSync(z, ['x', '-y', '-o' + join(apple, 'x'), dmg, '*/PNG/*', '-r'], { stdio: 'ignore' });
    console.log(`✓ ${a} (${(statSync(dmg).size / 1e6).toFixed(0)} MB)`);
  }
  for (const p of fontes.pacotes.android.pastas) {
    mkdirSync(join(android, p), { recursive: true });
    for (const f of ['back.webp', 'mask.webp', 'layout']) {
      const r = await fetch(`${fontes.pacotes.android.base}${p}/${f}?format=TEXT`); // gitiles devolve base64
      if (r.ok) writeFileSync(join(android, p, f), Buffer.from(await r.text(), 'base64'));
    }
    console.log('✓ android/' + p);
  }
}

/** layout do Android Studio → { display: {w,h,raio}, x, y } */
function layoutAndroid(txt) {
  const n = (re) => Number((txt.match(re) || [])[1]);
  return { w: n(/display\s*\{[^}]*?width\s+(\d+)/s), h: n(/display\s*\{[^}]*?height\s+(\d+)/s), raio: n(/corner_radius\s+(\d+)/) || 0, x: n(/part2\s*\{[^}]*?x\s+(\d+)/s), y: n(/part2\s*\{[^}]*?y\s+(\d+)/s) };
}

/** tela = maior região transparente fechada (não encosta na borda). Inunda a partir do centro (ou de uma grade, se o centro for opaco). */
async function calibrar(png) {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, N = W * H;
  const transp = (i) => data[i * 4 + 3] < 128;
  let melhor = null;
  const visit = new Uint8Array(N);
  const sementes = [[0.5, 0.5], [0.5, 0.4], [0.5, 0.3], [0.5, 0.6], [0.4, 0.5], [0.6, 0.5]];
  for (const [fx, fy] of sementes) {
    const s = Math.floor(fy * H) * W + Math.floor(fx * W);
    if (!transp(s) || visit[s]) continue;
    const pilha = new Int32Array(N); let topo = 0; pilha[topo++] = s; visit[s] = 1;
    let x0 = W, y0 = H, x1 = 0, y1 = 0, area = 0, vaza = false;
    const reg = new Uint8Array(N);
    while (topo) {
      const i = pilha[--topo]; reg[i] = 1; area++;
      const x = i % W, y = (i / W) | 0;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      if (x === 0 || y === 0 || x === W - 1 || y === H - 1) vaza = true;
      for (const j of [i - 1, i + 1, i - W, i + W]) if (j >= 0 && j < N && !visit[j] && transp(j) && Math.abs((j % W) - x) <= 1) { visit[j] = 1; pilha[topo++] = j; }
    }
    if (!vaza && (!melhor || area > melhor.area)) melhor = { area, x0, y0, x1, y1, reg };
  }
  if (!melhor) throw new Error('não achei a tela (região transparente fechada)');
  // máscara: região + 3 px de folga (a borda serrilhada da moldura fica por cima e esconde)
  const F = 3;
  const x = Math.max(0, melhor.x0 - F), y = Math.max(0, melhor.y0 - F);
  const w = Math.min(W, melhor.x1 + F + 1) - x, h = Math.min(H, melhor.y1 + F + 1) - y;
  const m = Buffer.alloc(w * h * 4, 255); // branco com alfa = tela (mask-image usa o alfa)
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
    let on = 0;
    for (let dy = -F; dy <= F && !on; dy++) for (let dx = -F; dx <= F && !on; dx++) {
      const X = x + xx + dx, Y = y + yy + dy;
      if (X >= 0 && Y >= 0 && X < W && Y < H && melhor.reg[Y * W + X]) on = 1;
    }
    m[(yy * w + xx) * 4 + 3] = on ? 255 : 0;
  }
  // raio aproximado: quanto a 1ª linha da tela começa para dentro
  const linha = melhor.y0, ini = (() => { for (let xx = melhor.x0; xx <= melhor.x1; xx++) if (melhor.reg[linha * W + xx]) return xx; return melhor.x0; })();
  return { largura: W, altura: H, tela: { x, y, w, h }, raio: Math.max(0, ini - melhor.x0), mascara: await sharp(m, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 9 }).toBuffer() };
}

async function preparar() {
  const so = flag('so')?.split(',');
  for (const mod of fontes.modelos) {
    if (so && !so.includes(mod.id)) continue;
    const out = join(DIR, mod.id);
    mkdirSync(out, { recursive: true });
    const variantes = {}, cores = [];
    try {
      if (mod.android) {
        const src = join(BRUTO, 'android', mod.android);
        const lay = layoutAndroid(readFileSync(join(src, 'layout'), 'utf8'));
        const back = sharp(join(src, 'back.webp'));
        const frame = await back.composite([{ input: join(src, 'mask.webp'), left: lay.x, top: lay.y }]).png().toBuffer();
        const ori = mod.orientacao ?? 'vertical';
        const arq = `${ori}-padrao.png`;
        writeFileSync(join(out, arq), frame);
        const c = await calibrar(join(out, arq));
        writeFileSync(join(out, `${ori}-mascara.png`), c.mascara);
        variantes[ori] = { largura: c.largura, altura: c.altura, tela: c.tela, raio: c.raio, mascara: `${ori}-mascara.png`, arquivos: { padrao: arq }, nativo: { w: lay.w, h: lay.h } };
        cores.push({ id: 'padrao', nome: 'Obsidiana' });
      } else {
        const pasta = join(BRUTO, 'apple', 'x', mod.pasta);
        const nomes = readdirSync(pasta).filter((f) => f.endsWith('.png'));
        const prefixo = mod.prefixo ?? mod.nome.replace(/"/g, '');
        const oris = mod.orientacoes ?? [null];
        for (const o of oris) {
          const ori = o ? ORIENT[o] : 'horizontal';
          const arquivos = {};
          for (const cor of mod.cores) {
            const alvo = nomes.find((f) => o ? (f === `${prefixo} - ${cor} - ${o}.png`) : (f === `${prefixo} ${cor}.png`));
            if (!alvo) { console.log(`  ⚠ ${mod.id}: falta ${cor}${o ? ' ' + o : ''}`); continue; }
            const arq = `${ori}-${slug(cor)}.png`;
            copyFileSync(join(pasta, alvo), join(out, arq));
            arquivos[slug(cor)] = arq;
            if (!cores.find((c) => c.id === slug(cor))) cores.push({ id: slug(cor), nome: cor });
          }
          const ref = arquivos[slug(mod.padrao)] ?? Object.values(arquivos)[0];
          if (!ref) continue;
          const c = await calibrar(join(out, ref));
          writeFileSync(join(out, `${ori}-mascara.png`), c.mascara);
          variantes[ori] = { largura: c.largura, altura: c.altura, tela: c.tela, raio: c.raio, mascara: `${ori}-mascara.png`, arquivos };
          // as outras cores precisam ter a mesma geometria (senão a tela desalinha)
          for (const [cor, arq] of Object.entries(arquivos)) {
            if (arq === ref) continue;
            const m = await sharp(join(out, arq)).metadata();
            if (m.width !== c.largura || m.height !== c.altura) console.log(`  ⚠ ${mod.id} ${cor}: tamanho diferente (${m.width}×${m.height}) — conferir`);
          }
        }
      }
    } catch (e) { console.log(`✗ ${mod.id}: ${e.message}`); continue; }
    const meta = {
      id: mod.id, nome: mod.nome, marca: mod.marca, tipo: mod.tipo,
      padrao: { cor: mod.android ? 'padrao' : slug(mod.padrao), orientacao: Object.keys(variantes)[0] },
      cores, variantes, apelidos: mod.padrao_de ?? [],
      licenca: fontes.pacotes[mod.marca === 'google' ? 'android' : 'apple'].licenca,
    };
    writeFileSync(join(out, 'aparelho.json'), JSON.stringify(meta, null, 2) + '\n');
    console.log(`✓ ${mod.id.padEnd(20)} ${Object.entries(variantes).map(([o, v]) => `${o} ${v.largura}×${v.altura} tela ${v.tela.w}×${v.tela.h} (${(v.tela.w / v.tela.h).toFixed(3)}) r${v.raio}`).join(' · ')} · ${cores.length} cor(es)`);
  }
}

function listar() {
  for (const d of readdirSync(DIR)) {
    const f = join(DIR, d, 'aparelho.json');
    if (!existsSync(f)) continue;
    const a = JSON.parse(readFileSync(f, 'utf8'));
    const ok = Object.values(a.variantes).every((v) => Object.values(v.arquivos).every((x) => existsSync(join(DIR, d, x))));
    console.log(`${a.id.padEnd(20)} ${a.tipo.padEnd(9)} ${Object.keys(a.variantes).join('/')} · cores: ${a.cores.map((c) => c.id).join(', ')}${a.apelidos.length ? ' · apelidos: ' + a.apelidos.join(', ') : ''}${ok ? '' : '  ⚠ imagens faltando: node tools/mockup/aparelhos.mjs baixar && … preparar'}`);
  }
}

if (cmd === 'baixar') await baixar();
else if (cmd === 'preparar') await preparar();
else listar();
