#!/usr/bin/env node
// Galeria do estúdio de mockups (tarefa 028): renderiza 1 amostra de cada aparelho, fundo, sombra, canto, ângulo e template
// com as telas de exemplo (library/mockups/exemplos) e monta library/mockups/galeria/index.html (abre no navegador).
//   node tools/mockup/galeria.mjs [--escala 1] [--so aparelhos,fundos,sombras,cantos,angulos,templates] [--empresa kz]
// Cada card mostra o comando que reproduz a peça. Imagens fora do git (refaça com este comando).
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const LIB = join(ROOT, 'library', 'mockups');
const OUT = join(LIB, 'galeria');
const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf('--' + n); return i < 0 ? d : args[i + 1]; };
const so = flag('so')?.split(',');
const escala = Number(flag('escala', 1));
const empresa = flag('empresa');
const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));
const EX = 'library/mockups/exemplos';
const tela = (n) => ({ captura: `${EX}/${n}` });
const cat = readJson(join(LIB, 'catalogo.json'));
const aparelhos = readdirSync(join(LIB, 'aparelhos')).filter((d) => existsSync(join(LIB, 'aparelhos', d, 'aparelho.json'))).map((d) => readJson(join(LIB, 'aparelhos', d, 'aparelho.json')));

const secoes = [];
const sec = (id, titulo, nota, itens) => { if (!so || so.includes(id)) secoes.push({ id, titulo, nota, itens }); };
const telaDe = (a, o = '') => (a.tipo === 'dobravel' && o.startsWith('aberto') ? 'tablet' : a.tipo === 'celular' || a.tipo === 'dobravel' ? 'celular' : a.tipo === 'tablet' ? 'tablet' : 'desktop');

sec('aparelhos', 'Aparelhos realistas', 'Molduras oficiais (Apple Product Bezels, Android Studio) com a tela calibrada ao pixel. --aparelho <id> [--cor <cor>] [--orientacao <o>]',
  aparelhos.flatMap((a) => {
    const oris = Object.keys(a.variantes).filter((o) => !o.startsWith('fechado'));
    return oris.slice(0, a.tipo === 'tablet' || a.tipo === 'dobravel' ? 2 : 1).map((o) => ({
      id: `ap-${a.id}-${o}`, legenda: `${a.nome}${oris.length > 1 ? ' · ' + o : ''}`, sub: `cores: ${a.cores.map((c) => c.id).join(', ')}`,
      comp: { template: 'heroi', formato: '1:1', fundo: 'estudio', params: { aparelho: a.id, orientacao: o }, telas: { tela: tela(o.includes('horizontal') && (a.tipo === 'celular' || a.tipo === 'tablet') ? 'desktop' : telaDe(a, o)) } },
      cmd: `--template heroi --aparelho ${a.id}${oris.length > 1 ? ' --orientacao ' + o : ''} --fundo estudio --formato 1:1`,
    }));
  }));
sec('cores', 'Cores', 'Mesma moldura, cor trocada: --cor <id>.',
  ['iphone-18-pro', 'iphone-17', 'iphone-air', 'macbook-air-13', 'imac-24'].map((id) => aparelhos.find((a) => a.id === id)).filter(Boolean).flatMap((a) => a.cores.slice(0, a.id === 'imac-24' ? 7 : 5).map((c) => ({
    id: `cor-${a.id}-${c.id}`, legenda: `${a.nome} · ${c.nome}`, comp: { template: 'heroi', formato: '1:1', fundo: 'neutro', params: { aparelho: a.id, cor: c.id, sombra: 'suave' }, telas: { tela: tela(telaDe(a)) } },
    cmd: `--aparelho ${a.id} --cor ${c.id}`,
  }))));
sec('fundos', 'Fundos', 'Da marca (usam os tokens do brand.css) e premium (paleta própria; a marca libera em brand/mockups.json). Grão automático nos gradientes; --sem-grao tira.',
  cat.fundos.filter((f) => f.id !== 'transparente').map((f) => ({
    id: `fundo-${f.id}`, legenda: f.id, sub: f.descricao, comp: { template: 'heroi', formato: '4:5', fundo: f.id, params: { aparelho: 'iphone-18-pro' }, telas: { tela: tela(['aurora', 'grafite', 'estudio-escuro', 'vinho', 'macos'].includes(f.id) ? 'celular-escuro' : 'celular') }, textos: { titulo: 'Seu dia, *organizado*' } },
    cmd: `--fundo ${f.id}`,
  })));
sec('sombras', 'Sombras', 'Camadas suaves tingidas (nunca preto puro); no aparelho real seguem o contorno. --sombra <id>.',
  Object.keys({ nenhuma: 1, contato: 1, suave: 1, flutuante: 1, produto: 1, dramatica: 1 }).map((s) => ({
    id: `sombra-${s}`, legenda: s, comp: { template: 'recorte', formato: '1:1', fundo: 'neutro', params: { sombra: s, cantos: 'grande' }, telas: { tela: tela('desktop') } },
    cmd: `--template recorte --sombra ${s}`,
  })));
sec('cantos', 'Cantos', 'Arredondamento do print (fração da largura). --cantos <id>.',
  Object.keys({ nenhum: 1, sutil: 1, medio: 1, grande: 1, ios: 1, macos: 1 }).map((c) => ({
    id: `canto-${c}`, legenda: c, comp: { template: 'recorte', formato: '1:1', fundo: 'estudio', params: { cantos: c, sombra: 'flutuante' }, zoom: 'agenda', telas: { tela: tela('desktop') } },
    cmd: `--template recorte --cantos ${c}`,
  })));
sec('angulos', 'Ângulos', 'CSS 3D. --angulo <id>.',
  ['frente', 'esquerda', 'direita', 'inclinado', 'heroi', 'heroi-esq', 'isometrico'].map((g) => ({
    id: `ang-${g}`, legenda: g, comp: { template: 'heroi', formato: '1:1', fundo: 'gelo', params: { aparelho: g === 'isometrico' ? 'sem-moldura' : 'iphone-18-pro', angulo: g }, telas: { tela: tela(g === 'isometrico' ? 'desktop' : 'celular') } },
    cmd: `--angulo ${g}`,
  })));
const T = (id, legenda, comp, cmd) => ({ id, legenda, comp, cmd });
sec('templates', 'Templates', 'Composições prontas. --template <id> (as que pedem mais de 1 tela: --tela2/--tela3; zoom/cards/anotações usam as regiões da captura).', [
  T('tpl-heroi-mac', 'heroi · MacBook', { template: 'heroi', formato: '4:5', fundo: 'estudio', params: { aparelho: 'macbook' }, telas: { tela: tela('desktop') }, textos: { titulo: 'Tudo do consultório *num lugar só*' } }, '--template heroi --aparelho macbook'),
  T('tpl-heroi-janela', 'heroi · janela', { template: 'heroi', formato: '4:5', fundo: 'gelo', params: { aparelho: 'navegador', bolinhas: 'cores' }, telas: { tela: tela('desktop') }, textos: { titulo: 'Abra no navegador, *sem instalar*' } }, '--template heroi --aparelho navegador --bolinhas cores'),
  T('tpl-duo', 'duo', { template: 'duo', formato: '4:5', fundo: 'estudio', telas: { tela: tela('desktop'), tela2: tela('celular') }, textos: { titulo: 'No computador e *no celular*' } }, '--template duo --tela2 <celular>'),
  T('tpl-duo-169', 'duo 16:9', { template: 'duo', formato: '16:9', fundo: 'pessego', telas: { tela: tela('desktop'), tela2: tela('celular') } }, '--template duo --formato 16:9'),
  T('tpl-trio', 'trio', { template: 'trio', formato: '16:9', fundo: 'estudio', telas: { tela: tela('desktop'), tela2: tela('celular'), tela3: tela('tablet') }, textos: { titulo: 'Funciona *em tudo*' } }, '--template trio --tela2 <celular> --tela3 <tablet>'),
  T('tpl-trio-45', 'trio 4:5', { template: 'trio', formato: '4:5', fundo: 'gelo', telas: { tela: tela('desktop'), tela2: tela('celular'), tela3: tela('tablet') }, textos: { titulo: 'Funciona *em tudo*' } }, '--template trio --formato 4:5'),
  T('tpl-perspectiva', 'perspectiva', { template: 'perspectiva', formato: '4:5', fundo: 'aurora', telas: { tela: tela('desktop') }, textos: { titulo: 'A rotina inteira, *em ordem*' } }, '--template perspectiva --fundo aurora'),
  T('tpl-perspectiva-cel', 'perspectiva · celular', { template: 'perspectiva', formato: '4:5', fundo: 'pessego', telas: { tela: tela('celular') }, textos: { titulo: 'Sua agenda *no bolso*' } }, '--template perspectiva (print de celular)'),
  T('tpl-perspectiva-169', 'perspectiva 16:9', { template: 'perspectiva', formato: '16:9', fundo: 'grafite', telas: { tela: tela('desktop') }, textos: { titulo: 'A rotina inteira, *em ordem*', subtitulo: 'Agenda, clientes e financeiro.' } }, '--template perspectiva --formato 16:9'),
  T('tpl-pilha', 'pilha', { template: 'pilha', formato: '4:5', fundo: 'ametista', telas: { tela: tela('desktop'), tela2: tela('desktop-escuro'), tela3: tela('tablet') }, textos: { titulo: 'Tudo *num lugar só*' } }, '--template pilha --tela2 … --tela3 …'),
  T('tpl-pilha-destaques', 'pilha · destaques', { template: 'pilha', formato: '1:1', fundo: 'gelo', telas: { tela: tela('desktop') }, destaques: [{ regiao: 'agenda' }, { regiao: 'grafico' }] }, '--template pilha --destaques agenda,grafico'),
  T('tpl-pilha-cel', 'pilha · celulares', { template: 'pilha', formato: '4:5', fundo: 'menta', telas: { tela: tela('celular'), tela2: tela('celular-rolado'), tela3: tela('celular-escuro') } }, '--template pilha --tela2 … --tela3 …'),
  T('tpl-leque', 'leque', { template: 'leque', formato: '4:5', fundo: 'por-do-sol', telas: { tela: tela('celular'), tela2: tela('celular-rolado'), tela3: tela('celular-escuro') }, textos: { titulo: 'Feito para *o seu dia*' } }, '--template leque --tela2 … --tela3 …'),
  T('tpl-leque-169', 'leque 16:9', { template: 'leque', formato: '16:9', fundo: 'estudio', telas: { tela: tela('celular'), tela2: tela('celular-rolado'), tela3: tela('celular-escuro') } }, '--template leque --formato 16:9'),
  T('tpl-vidro', 'vidro', { template: 'vidro', formato: '4:5', fundo: 'aurora', telas: { tela: tela('desktop') }, destaques: [{ regiao: 'agenda' }], textos: { titulo: 'Clareza *em cada detalhe*' } }, '--template vidro --fundo aurora --destaques agenda'),
  T('tpl-vidro-cel', 'vidro · celular', { template: 'vidro', formato: '4:5', fundo: 'macos', telas: { tela: tela('celular') }, destaques: [{ regiao: 'resumo' }, { regiao: 'semana' }] }, '--template vidro --destaques resumo,semana'),
  T('tpl-vidro-169', 'vidro 16:9', { template: 'vidro', formato: '16:9', fundo: 'gelo', telas: { tela: tela('desktop') }, destaques: [{ regiao: 'agenda' }, { regiao: 'resumo' }] }, '--template vidro --formato 16:9'),
  T('tpl-zoom', 'zoom', { template: 'zoom', formato: '4:5', fundo: 'estudio', params: { aparelho: 'macbook' }, zoom: 'agenda', telas: { tela: tela('desktop') } }, '--template zoom --zoom agenda'),
  T('tpl-cards', 'cards', { template: 'cards', formato: '4:5', fundo: 'gelo', destaques: [{ regiao: 'agenda' }, { regiao: 'resumo' }], telas: { tela: tela('desktop') } }, '--template cards --destaques agenda,resumo'),
  T('tpl-anotacoes', 'anotacoes', { template: 'anotacoes', formato: '4:5', fundo: 'neutro', destaques: [{ regiao: 'resumo' }, { regiao: 'agenda' }, { regiao: 'grafico' }], telas: { tela: tela('desktop') } }, '--template anotacoes --destaques resumo,agenda,grafico'),
  T('tpl-recorte', 'recorte transparente', { template: 'recorte', formato: 'livre', transparente: true, params: { cantos: 'grande', sombra: 'flutuante' }, telas: { tela: tela('desktop') } }, '--template recorte --transparente --formato livre'),
  T('tpl-heroi-transp', 'herói transparente', { template: 'heroi', formato: '4:5', transparente: true, params: { aparelho: 'iphone-18-pro', angulo: 'esquerda' }, telas: { tela: tela('celular') } }, '--transparente'),
]);

// ---------- render: 1 mockup.json por seção, pelo render.mjs ----------
mkdirSync(OUT, { recursive: true });
const t0 = Date.now();
const lerJson = (f) => (existsSync(f) ? readJson(f) : null);
for (const s of secoes) {
  const pasta = join(OUT, s.id);
  if (existsSync(join(pasta, 'png'))) for (const f of readdirSync(join(pasta, 'png'))) rmSync(join(pasta, 'png', f), { force: true }); // só os arquivos: no Windows a pasta pode estar aberta
  mkdirSync(pasta, { recursive: true });
  const comps = s.itens.map((it) => ({ id: it.id, transparente: false, params: {}, destaques: [], textos: {}, fundo: 'liso', ...it.comp }));
  writeFileSync(join(pasta, 'mockup.json'), JSON.stringify({ empresa: empresa ?? null, escala, composicoes: comps, escolhidas: [] }, null, 2));
  try {
    const out = execFileSync(process.execPath, [join(ROOT, 'tools', 'mockup', 'render.mjs'), pasta, '--sem-folha'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    const ruins = out.split('\n').filter((l) => l.startsWith('✗') || l.includes('⚠'));
    console.log(`▦ ${s.id}: ${s.itens.length} peça(s)${ruins.length ? '\n  ' + ruins.join('\n  ') : ''}`);
  } catch (e) { console.log(`✗ ${s.id}: ${(e.stdout || '') + (e.stderr || e.message)}`); }
  const mj = lerJson(join(pasta, 'mockup.json'));
  s.ok = new Set((mj?.composicoes || []).filter((c) => c.arquivo).map((c) => c.id));
}

// ---------- preview.png dos templates (tela fictícia, 540 px): o 1º item "tpl-<id>" de cada template ----------
const tpl = secoes.find((x) => x.id === 'templates');
if (tpl) for (const d of readdirSync(join(LIB, 'templates'))) {
  const it = tpl.itens.find((i) => i.comp.template === d && !i.comp.transparente && tpl.ok?.has(i.id)) ?? tpl.itens.find((i) => i.comp.template === d && tpl.ok?.has(i.id));
  if (!it) continue;
  await sharp(join(OUT, 'templates', 'png', it.id + '.png')).resize(540).png({ compressionLevel: 9, palette: false }).toFile(join(LIB, 'templates', d, 'preview.png'));
}

// ---------- index.html ----------
const esc = (x) => String(x ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Galeria de mockups</title><style>
:root{--bg:#f5f5f7;--card:#fff;--tx:#1d1d1f;--mu:#6e6e73;--ln:#e5e5ea}
@media (prefers-color-scheme:dark){:root{--bg:#000;--card:#1c1c1e;--tx:#f5f5f7;--mu:#98989d;--ln:#2c2c2e}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--tx);font:15px/1.45 -apple-system,"SF Pro Text","Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}
header{padding:56px 24px 8px;max-width:1440px;margin:auto}h1{font-size:40px;letter-spacing:-.03em;margin:0}header p{color:var(--mu);margin:6px 0 0;max-width:760px}
nav{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--bg) 80%,transparent);backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid var(--ln)}
nav div{max-width:1440px;margin:auto;padding:12px 24px;display:flex;gap:8px;flex-wrap:wrap}nav a{color:var(--tx);text-decoration:none;padding:6px 12px;border-radius:999px;background:var(--card);font-size:13px;font-weight:600}
section{max-width:1440px;margin:auto;padding:36px 24px 8px}h2{font-size:26px;letter-spacing:-.02em;margin:0}section>p{color:var(--mu);margin:4px 0 18px}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px}
figure{margin:0;background:var(--card);border-radius:18px;overflow:hidden;box-shadow:0 1px 2px rgb(0 0 0/.04)}
figure .img{aspect-ratio:1;display:flex;align-items:center;justify-content:center;background:repeating-conic-gradient(#e9e9ee 0 25%,#fff 0 50%) 0 0/16px 16px}
figure img{width:100%;height:100%;object-fit:contain;display:block}figure a{display:contents}
figcaption{padding:10px 14px 14px}figcaption b{display:block;font-size:14px}figcaption small{display:block;color:var(--mu);font-size:12px}
code{display:block;margin-top:6px;font:11.5px/1.35 ui-monospace,Consolas,monospace;color:var(--mu);word-break:break-word}
.falha{color:#d70015;padding:20px;font-size:13px}
</style></head><body>
<header><h1>Galeria de mockups</h1><p>Tudo o que o estúdio monta, com a tela de exemplo (app fictício). Cada card mostra a flag que reproduz o resultado: <code style="display:inline">node tools/mockup/render.mjs --captura &lt;sua captura&gt; …</code>. Refazer esta página: <code style="display:inline">node tools/mockup/galeria.mjs</code></p></header>
<nav><div>${secoes.map((s) => `<a href="#${s.id}">${esc(s.titulo)} · ${s.itens.length}</a>`).join('')}</div></nav>
${secoes.map((s) => `<section id="${s.id}"><h2>${esc(s.titulo)}</h2><p>${esc(s.nota)}</p><div class="g">${s.itens.map((it) => `<figure><div class="img">${s.ok?.has(it.id) ? `<a href="${s.id}/png/${it.id}.png"><img loading="lazy" src="${s.id}/png/${it.id}.png" alt="${esc(it.legenda)}"></a>` : '<p class="falha">não renderizou</p>'}</div><figcaption><b>${esc(it.legenda)}</b>${it.sub ? `<small>${esc(it.sub)}</small>` : ''}<code>${esc(it.cmd)}</code></figcaption></figure>`).join('')}</div></section>`).join('\n')}
<section><p>Molduras: Apple Product Bezels (uso em marketing do seu produto, sem alterar o aparelho) e Android Studio device art (Apache 2.0). Fundos premium inspirados em shots.so/apple.com; sombras em camadas (Josh Comeau, Tobias Ahlin).</p></section>
</body></html>`;
writeFileSync(join(OUT, 'index.html'), html);
console.log(`✓ library/mockups/galeria/index.html · ${secoes.reduce((n, s) => n + s.itens.length, 0)} peças em ${((Date.now() - t0) / 1000).toFixed(0)} s`);
