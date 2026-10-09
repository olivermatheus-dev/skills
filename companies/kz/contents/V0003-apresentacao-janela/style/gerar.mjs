// Style frames dos 5 blocos novos do plano "Uma janela só" (047 B): HTML estático com o brand.css real e ícones Lucide do kit.
// Pose assentada (a mesma que o storyboard mostra) nos 2 formatos: slide-01..05 = 4:5 (s2 s3 s4 s6 s7), slide-06..10 = 9:16.
// Uso: node companies/kz/contents/V0003-apresentacao-janela/style/gerar.mjs
//      node .claude/skills/carousel/scripts/render.mjs companies/kz/contents/V0003-apresentacao-janela/style/style-frames.html
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const HUB = join(AQUI, '..', '..', '..', '..', '..');
const P = JSON.parse(readFileSync(join(AQUI, '..', 'cenas.json'), 'utf8'));
const S = (id) => P.scenes.find((s) => s.id === id);
const parts = (id) => S(id).on_screen.split('|');
const em = (t) => t.replace(/\*(.+?)\*/g, '<span class="e">$1</span>');
const cache = {};
const ic = (n) => (cache[n] ??= execFileSync(process.execPath, [join(HUB, 'tools', 'icon.mjs'), n, '--brand', 'kz'], { encoding: 'utf8' }).trim());
const LOGO = '<svg viewBox="2.5 7 43 34"><path fill-rule="evenodd" d="M2.5 7H9.5V24.5L18 16H45.5V21.5L31.5 35.5H45.5V41H18.6L11.2 31H9.5V41H2.5Z M22.8 18.7H24V21.5H37.5L23.7 35.3L16.5 25Z"/></svg>';
const CURSOR = '<svg viewBox="0 0 24 24" width="48" height="48"><path d="M4 2 L4 20 L9 15 L12.5 22 L15.5 20.6 L12 13.8 L19 13.8 Z" fill="#2b2b2b" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';

const css = `
@import url("../../../brand/brand.css");
@import url("../../../video-templates/base.css");
body { margin: 0; background: #ddd; display: flex; flex-wrap: wrap; gap: 40px; align-items: flex-start; padding: 20px; }
.slide { position: relative; width: 1080px; height: 1350px; overflow: hidden; background: var(--bg); font-family: var(--font-body); color: var(--text); }
.slide.v { height: 1920px; }
.blob { position: absolute; border-radius: 50%; filter: blur(90px); opacity: .5; }
.hl { position: absolute; left: 70px; right: 70px; text-align: center; font-weight: 700; letter-spacing: -0.01em; line-height: 1.15; text-wrap: balance; font-size: 68px; z-index: 20; }
.e { color: var(--accent); }
.win { position: absolute; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; box-shadow: var(--shadow-md); overflow: hidden; transform: rotate(var(--r, 0deg)); }
.wbar { height: 58px; display: flex; align-items: center; gap: 12px; padding: 0 18px; background: var(--surface-2); border-bottom: 1px solid var(--border); font-size: 26px; font-weight: 700; color: var(--text); white-space: nowrap; }
.dots { display: flex; gap: 7px; margin-right: 6px; } .dots i { width: 12px; height: 12px; border-radius: 50%; background: #e3d8cf; }
.wbar svg { width: 30px; height: 30px; display: block; }
.wb { padding: 18px; box-sizing: border-box; }
.grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.grid i { height: 30px; border-radius: 6px; background: var(--surface-2); }
.grid i.a { background: var(--pastel-sage); } .grid i.b { background: var(--pastel-lavender); } .grid i.c { background: var(--pastel-sky); }
.mc { white-space: nowrap; font-size: 17px !important; background: var(--accent-soft) !important; box-shadow: 0 0 0 3px var(--accent); color: var(--ink); font-weight: 700; font-size: 20px; display: flex; align-items: center; justify-content: center; }
.dias { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; font-size: 18px; font-weight: 700; color: var(--ui-muted); margin-bottom: 8px; text-align: center; }
.av { width: 76px; height: 76px; border-radius: 50%; background: var(--ui-avatar); color: var(--primary); font-weight: 700; font-size: 28px; display: grid; place-items: center; flex: none; }
.av.mcr { box-shadow: 0 0 0 4px var(--surface), 0 0 0 7px var(--accent); }
.ln { height: 14px; border-radius: 7px; background: var(--surface-2); margin: 12px 0; }
.postit { position: absolute; background: var(--pastel-butter); border-radius: 6px; box-shadow: var(--shadow-sm); padding: 14px 16px; box-sizing: border-box; transform: rotate(var(--r, 0deg)); font-size: 22px; font-weight: 700; color: var(--ink); }
.postit .ln { background: rgba(43,43,43,.10); height: 10px; margin: 10px 0; }
.tag { display: inline-block; border-radius: 8px; padding: 4px 10px; background: var(--accent-soft); box-shadow: 0 0 0 3px var(--accent); }
.badge { margin-left: auto; background: var(--accent-soft); color: var(--ink); font-size: 20px; font-weight: 700; border-radius: 999px; padding: 2px 12px; }
.ses .wb { display: flex; gap: 16px; align-items: center; }
.ring { box-shadow: 0 0 0 6px var(--surface), 0 0 0 12px var(--primary), var(--shadow-md); }
.heart { position: absolute; width: 64px; height: 64px; border-radius: 50%; background: var(--surface); box-shadow: 0 0 0 8px var(--accent-soft), var(--shadow-md); display: grid; place-items: center; --icon-color: var(--accent); z-index: 30; }
.heart svg { width: 36px; height: 36px; }
.logo svg { width: 100%; display: block; } .logo path { fill: var(--logo); }
.glow { position: absolute; inset: 0; background: radial-gradient(ellipse at 80% 0%, var(--accent-soft) 0, var(--ui-glow) 38%, transparent 70%); }
.ass { text-align: center; font-size: 46px; font-weight: 700; position: relative; }
.div { height: 1px; background: var(--border); margin: 0 40px; position: relative; }
.frase { text-align: center; font-size: 40px; font-weight: 600; position: relative; }
.chips { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; position: relative; }
.chip { display: flex; align-items: center; gap: 12px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 14px 22px; font-size: 32px; font-weight: 600; box-shadow: var(--shadow-sm); }
.chip svg { width: 34px; height: 34px; display: block; }
.side { position: absolute; display: flex; flex-direction: column; gap: 14px; }
.side span { width: 64px; height: 64px; border-radius: 14px; display: grid; place-items: center; } .side svg { width: 32px; height: 32px; }
.tabs { display: flex; gap: 8px; border-bottom: 1px solid var(--ui-divider); padding: 0 24px; }
.tabs b { font-size: 26px; padding: 16px 18px; color: var(--muted); font-weight: 600; } .tabs b.on { color: var(--text); box-shadow: inset 0 -4px 0 var(--primary); }
.caderno { padding: 10px 34px; } .caderno i { display: block; height: 58px; border-bottom: 1px solid var(--ui-divider); }
.caret { display: inline-block; width: 3px; height: 40px; background: var(--text); vertical-align: middle; }
.btn { background: var(--primary); color: #fff; font-weight: 700; border-radius: 10px; padding: 12px 22px; font-size: 24px; white-space: nowrap; }
.pill { border-radius: 999px; background: var(--surface-2); border: 1px solid var(--border); padding: 8px 18px; font-size: 22px; font-weight: 600; display: flex; gap: 8px; align-items: center; } .pill svg { width: 24px; height: 24px; }
.endb { display: flex; align-items: center; gap: 22px; background: var(--ui-input); border: 2px solid var(--border); border-radius: 999px; padding: 0 40px; --icon-color: var(--muted); }
.endb svg { width: 52px; height: 52px; display: block; }
.url { font-size: 84px; font-weight: 600; color: var(--ink); } .url .sel { background: var(--accent-soft); box-shadow: 0 0 0 4px var(--accent-soft); border-radius: 8px; }
.rodape { position: absolute; bottom: 30px; left: 0; right: 0; text-align: center; font-size: 22px; color: var(--muted); font-weight: 500; z-index: 30; }
.v .rodape { bottom: auto; top: 1500px; }
.stage { position: absolute; inset: 0; transform-origin: 50% 0; }
.v .stage.big { transform: scale(1.1); }
`;
const blobs = `<div class="blob" style="left:-220px;top:-160px;width:640px;height:640px;background:var(--accent-soft)"></div>
<div class="blob" style="right:-240px;bottom:-200px;width:700px;height:700px;background:var(--pastel-sage)"></div>`;
const bar = (icone, titulo, extra = '') => `<div class="wbar"><span class="dots"><i></i><i></i><i></i></span>${icone ? ic(icone) : ''}<span>${titulo}</span>${extra}</div>`;
const sessaoWin = (x, y, w, cls = '', r = 0, label) => `<div class="win ses ${cls}" style="left:${x}px;top:${y}px;width:${w}px;--r:${r}deg">${bar('armchair', label)}<div class="wb"><div class="av">M.C.</div><div style="flex:1"><div class="ln"></div><div class="ln" style="width:70%"></div></div></div></div>`;
const agenda = (x, y, w, r) => `<div class="win" style="left:${x}px;top:${y}px;width:${w}px;--r:${r}deg">${bar('calendar-days', 'Agenda')}<div class="wb"><div class="dias"><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span></div><div class="grid">
<i class="a"></i><i></i><i class="b"></i><i></i><i class="c"></i><i></i><i class="a"></i><i></i><i class="b"></i><i></i>
<i class="c"></i><i></i><i class="mc">M.C. 14h</i><i class="a"></i><i></i><i></i><i class="b"></i><i></i><i></i><i class="a"></i></div></div></div>`;
const pacientes = (x, y, w, r) => `<div class="win" style="left:${x}px;top:${y}px;width:${w}px;--r:${r}deg">${bar('contact-round', 'Pacientes')}<div class="wb" style="display:flex;gap:18px"><div class="av mcr">M.C.</div><div style="flex:1"><div class="ln" style="width:60%;height:18px;background:var(--border)"></div><div class="ln"></div><div class="ln" style="width:80%"></div><div class="ln" style="width:55%"></div></div></div></div>`;
const anotacoes = (x, y, w, r) => `<div class="win" style="left:${x}px;top:${y}px;width:${w}px;height:250px;--r:${r}deg">${bar('notebook-pen', 'Anotações')}
<div class="postit" style="left:24px;top:82px;width:150px;height:140px;--r:-4deg"><span class="tag">M.C.</span><div class="ln"></div><div class="ln"></div></div>
<div class="postit" style="left:200px;top:90px;width:140px;height:130px;--r:3deg;background:var(--pastel-rose)"><div class="ln"></div><div class="ln"></div><div class="ln"></div></div>
<div class="postit" style="left:365px;top:80px;width:140px;height:130px;--r:-2deg;background:var(--pastel-sky)"><div class="ln"></div><div class="ln"></div></div></div>`;
const mensagens = (x, y, w, r) => `<div class="win" style="left:${x}px;top:${y}px;width:${w}px;--r:${r}deg">${bar('message-circle', 'Mensagens', '<span class="badge">3</span>')}</div>`;
const rodape = '<div class="rodape">dados ilustrativos</div>';

// L = deslocamento vertical por formato (9:16: conteúdo no alto, nada abaixo de y 1350)
const L = { '4x5': { cls: '', hl: 80, dy: 0 }, '9x16': { cls: 'v', hl: 290, dy: 200 } };

function s2(fmt) {
  const { cls, hl, dy } = L[fmt];
  return `<section class="slide ${cls}">${blobs}<div class="hl" style="top:${hl}px">${em(parts('s2')[0])}</div>
<div class="stage big">${sessaoWin(330, 560 + dy, 420, '', 0, 'Sessão · 14h')}
${agenda(60, 250 + dy, 540, -4)}${pacientes(520, 410 + dy, 500, 5)}${anotacoes(120, 860 + dy, 600, -2)}${mensagens(700, 240 + dy, 320, 6)}
<div class="postit" style="left:760px;top:${880 + dy}px;width:190px;height:170px;--r:7deg;background:var(--pastel-lavender)"><div class="ln"></div><div class="ln"></div><div class="ln" style="width:60%"></div></div></div>${rodape}</section>`;
}
function s3(fmt) {
  const { cls, hl, dy } = L[fmt];
  return `<section class="slide ${cls}">${blobs}<div class="hl" style="top:${hl}px">${em(parts('s3')[0])}</div>
<div class="stage">${agenda(40, 280 + dy + (fmt === '9x16' ? 60 : 0), 600, -3)}${pacientes(460, 400 + dy + (fmt === '9x16' ? 60 : 0), 580, 4)}${anotacoes(80, 790 + dy, 660, -1)}${mensagens(640, 270 + dy + (fmt === '9x16' ? 60 : 0), 370, 5)}
${sessaoWin(730, 1020 + dy, 290, 'ring', 0, 'Sessão')}
<div class="heart" style="left:${990}px;top:${995 + dy}px">${ic('heart')}</div></div>${rodape}</section>`;
}
function s4(fmt) {
  const { cls, dy } = L[fmt];
  const [ass, frase, p1, p2, p3] = parts('s4');
  const icons = S('s4').params.icones;
  const top = fmt === '4x5' ? 200 : 380;
  return `<section class="slide ${cls}">${blobs}
<div class="win" style="left:110px;top:${top}px;width:860px;height:${fmt === '4x5' ? 900 : 1000}px;box-shadow:var(--shadow-lg)">
<div class="glow"></div>${bar('', '')}
<div class="logo" style="width:300px;margin:${fmt === '4x5' ? 70 : 110}px auto 40px;position:relative">${LOGO}</div>
<div class="ass">${em(ass)}</div>
<div style="height:${fmt === '4x5' ? 60 : 110}px"></div><div class="div"></div><div style="height:46px"></div>
<div class="frase">${frase}</div><div style="height:34px"></div>
<div class="chips">${[p1, p2, p3].map((p, k) => `<span class="chip">${ic(icons[k])}${p}</span>`).join('')}</div></div></section>`;
}
function s6(fmt) {
  const { cls, hl, dy } = L[fmt];
  const [, depois, cliente] = parts('s6');
  return `<section class="slide ${cls}">${blobs}<div class="hl" style="top:${hl}px;display:flex;justify-content:center;align-items:center;gap:26px"><span>${em(depois)}</span><span class="heart" style="position:relative;flex:none">${ic('heart')}</span></div>
<div class="side" style="left:40px;top:${360 + dy}px"><span class="t-teal">${ic('calendar-days')}</span><span class="t-coral">${ic('zap')}</span></div>
<div class="win" style="left:130px;top:${250 + dy}px;width:910px;height:${fmt === '4x5' ? 1000 : 1040}px;box-shadow:var(--shadow-lg)">
${bar('armchair', 'Sessão · 14h')}
<div style="display:flex;align-items:center;gap:18px;padding:22px 24px"><div class="av">M.C.</div><div style="font-size:30px;font-weight:700">M.C.</div>
<span class="pill">${ic('armchair')}Presencial</span><span style="margin-left:auto;font-size:32px;font-weight:700;font-variant-numeric:tabular-nums">00:16</span></div>
<div class="tabs"><b class="on">Anotações</b><b>Histórico</b><b>Cliente</b></div>
<div class="caderno"><i></i><i style="position:relative"><span class="caret" style="position:absolute;left:0;top:10px"></span></i><i></i><i></i><i></i><i></i><i></i>${fmt === '9x16' ? '' : ''}</div>
<div style="position:absolute;right:24px;bottom:24px"><span class="btn">Finalizar sessão</span></div></div>${rodape}</section>`;
}
function s7(fmt) {
  const { cls, hl, dy } = L[fmt];
  const [titulo, url] = parts('s7');
  const yb = fmt === '4x5' ? 560 : 820;
  return `<section class="slide ${cls}">${blobs}
<div class="hl" style="top:${fmt === '4x5' ? 150 : 340}px;display:flex;align-items:center;justify-content:center;gap:28px;font-size:84px">${titulo}<span class="logo" style="width:150px">${LOGO}</span></div>
<div class="win" style="left:-80px;top:${yb - 150}px;width:1240px;height:${fmt === '4x5' ? 820 : 760}px;border-radius:28px;box-shadow:var(--shadow-lg)">
<div style="height:110px;background:var(--surface-2);border-bottom:1px solid var(--border);display:flex;align-items:flex-end;padding:0 150px;gap:16px">
<span style="background:var(--surface);border-radius:18px 18px 0 0;padding:18px 34px;font-size:34px;font-weight:600;display:flex;gap:14px;align-items:center"><span class="logo" style="width:40px">${LOGO}</span>kz</span></div>
<div style="padding:34px 120px"><div class="endb" style="height:150px">${ic('lock')}<span class="url"><span class="sel">${url}</span><span class="caret" style="height:76px;margin-left:6px"></span></span></div></div>
<div style="padding:10px 160px;opacity:.55"><div class="tabs" style="padding:0"><b class="on">Anotações</b><b>Histórico</b><b>Cliente</b></div><div class="caderno" style="padding:0"><i></i><i></i><i></i></div></div></div></section>`;
}


function s1(fmt) {
  const { cls, dy } = L[fmt];
  const [perg, comp] = parts('s1');
  const t = fmt === '4x5' ? 70 : 280;
  return `<section class="slide ${cls}">${blobs}
<div class="hl" style="top:${t}px;font-size:40px;display:flex;justify-content:center;align-items:center;gap:14px;--icon-color:var(--accent)"><span class="heart" style="position:relative;width:56px;height:56px">${ic('armchair')}</span><span>${em(perg)}</span></div>
<div class="hl" style="top:${t + 80}px;font-size:72px">${em(comp)}</div>
<div class="stage">${sessaoWin(250, 520 + dy, 580, '', 0, 'Sessão · 14h')}
${agenda(60, 430 + dy, 420, -7)}${pacientes(600, 470 + dy, 420, 6)}${anotacoes(120, 800 + dy, 540, 4)}${mensagens(640, 860 + dy, 340, -5)}</div>${rodape}</section>`;
}
function s5(fmt) {
  const { cls, hl, dy } = L[fmt];
  const o = parts('s5');
  const lin = (h, ini, cls2 = '') => `<div style="display:flex;align-items:center;gap:14px;padding:12px 14px;border-radius:12px;${cls2}"><b style="font-size:22px;width:70px">${h}</b><span class="av" style="width:46px;height:46px;font-size:18px">${ini}</span><span style="font-size:22px;font-weight:600">Presencial</span>${cls2 ? `<span style="margin-left:auto;--icon-color:var(--accent)">${ic('check')}</span>` : ''}</div>`;
  const AT = [['zap', 'Sessão rápida', 't-coral'], ['calendar', 'Agendar', 't-teal'], ['user-plus', 'Novo cliente', 't-amber'], ['notebook-pen', 'Nova anotação', 't-lilac']];
  return `<section class="slide ${cls}">${blobs}<div class="hl" style="top:${hl}px">${em(o[3])}</div>
<div class="win" style="left:50px;top:${220 + dy}px;width:980px;height:${fmt === '4x5' ? 820 : 900}px;box-shadow:var(--shadow-lg)">
<div style="display:flex;height:100%"><div style="width:110px;border-right:1px solid var(--ui-divider);padding-top:28px;display:flex;flex-direction:column;align-items:center;gap:30px;--icon-color:var(--ui-muted)"><span class="logo" style="width:56px">${LOGO}</span>${ic('layout-dashboard')}${ic('calendar-days')}${ic('users')}</div>
<div style="flex:1;padding:30px">
<div style="font-size:40px;font-weight:600">${o[0]} <span style="font-family:var(--font-accent);font-style:italic;color:var(--accent)">${o[1]}</span></div>
<div style="margin:22px 0;border:1px solid var(--border);border-radius:16px;padding:22px;background:radial-gradient(circle at 100% 0, var(--ui-glow), var(--surface) 55%)"><small style="font-size:18px;font-weight:700;color:var(--ui-muted);letter-spacing:.06em">PRÓXIMA SESSÃO</small>
<div style="display:flex;gap:16px;align-items:center;margin:12px 0"><span class="av">M.C.</span><div style="font-size:30px;font-weight:700">M.C. · 14h</div></div>
<span class="btn">Iniciar sessão</span> <span class="pill" style="display:inline-flex">${ic('file-text')}Ver prontuário</span></div>
<div style="display:flex;gap:20px">
<div style="flex:1.2;border:1px solid var(--border);border-radius:16px;padding:18px"><div style="font-size:24px;font-weight:700;margin-bottom:10px">Sessões de hoje</div>
${lin('14:00', 'M.C.', 'background:var(--accent-soft);box-shadow:0 0 0 3px var(--accent)')}${lin('16:00', 'L.P.')}${lin('17:30', 'H.R.')}</div>
<div style="flex:1;border:1px solid var(--border);border-radius:16px;padding:18px"><div style="font-size:24px;font-weight:700;margin-bottom:10px">Atalhos</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${AT.map(([i, r, t]) => `<div style="border:1px solid var(--border);border-radius:14px;padding:12px;height:120px;display:flex;flex-direction:column;justify-content:space-between;font-size:19px;font-weight:600"><span class="aic ${t}" style="width:46px;height:46px;border-radius:12px;display:grid;place-items:center;--icon-color:currentColor">${ic(i)}</span>${r}</div>`).join('')}</div></div></div>
</div></div></div>${rodape}</section>`;
}

const ordem = [s2, s3, s4, s6, s7, s1, s5];
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Style frames · Uma janela só</title><style>${css}</style></head><body>
${['4x5', '9x16'].flatMap((f) => ordem.map((fn) => fn(f))).join('\n')}
</body></html>`;
writeFileSync(join(AQUI, 'style-frames.html'), html);
console.log('style-frames.html: 14 quadros (01–07 = 4:5 s2 s3 s4 s6 s7 s1 s5 · 08–14 = 9:16)');
