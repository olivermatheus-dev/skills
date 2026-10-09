// Style frames dos blocos novos do plano "As peças da rotina" (047 B, v3): HTML estático com o brand.css real e ícones Lucide do kit,
// nos 2 formatos (4:5 = slide-01..04, 9:16 = slide-05..08). Dia e elenco únicos, lidos do cenas.json (P.elenco + params da s3).
// Uso: node companies/kz/contents/V0002-apresentacao-pecas-da-rotina/style/gerar.mjs
//      node .claude/skills/carousel/scripts/render.mjs companies/kz/contents/V0002-apresentacao-pecas-da-rotina/style/style-frames.html
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const HUB = join(AQUI, '..', '..', '..', '..', '..');
const P = JSON.parse(readFileSync(join(AQUI, '..', 'cenas.json'), 'utf8'));
const S3 = P.scenes.find((s) => s.id === 's3');
const SESSOES = P.elenco.sessoes;
const TAREFAS = S3.params.tarefas;
const cache = {};
const ic = (n) => (cache[n] ??= execFileSync(process.execPath, [join(HUB, 'tools', 'icon.mjs'), n, '--brand', 'kz'], { encoding: 'utf8' }).trim());
const LOGO = '<svg viewBox="2.5 7 43 34"><path fill-rule="evenodd" d="M2.5 7H9.5V24.5L18 16H45.5V21.5L31.5 35.5H45.5V41H18.6L11.2 31H9.5V41H2.5Z M22.8 18.7H24V21.5H37.5L23.7 35.3L16.5 25Z"/></svg>';
const CURSOR = '<svg viewBox="0 0 24 24" width="44" height="44"><path d="M4 2 L4 20 L9 15 L12.5 22 L15.5 20.6 L12 13.8 L19 13.8 Z" fill="#2b2b2b" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const hora = (hh) => { const [h, m] = hh.split(':').map(Number); return h + m / 60; };
// card Atalhos: a mesma geometria do painel-inicio (ícone em cima, ordem Sessão rápida · Agendar / Novo cliente · Nova anotação)
const ATALHOS = [['zap', 'Sessão rápida', 't-coral'], ['calendar', 'Agendar', 't-teal'], ['user-plus', 'Novo cliente', 't-amber'], ['notebook-pen', 'Nova anotação', 't-lilac']];
const cardAtalhos = (k, pos) => `<div style="position:absolute;${pos};width:${432 * k}px;height:${445 * k}px"><div class="card-atalhos" style="transform:scale(${k})"><div class="rot">Atalhos <span class="tic" style="--icon-color:var(--accent)">${ic('sparkles')}</span></div><div class="tiles">${ATALHOS.map(([i, r, t]) => `<div class="tile"><span class="aic ${t}">${ic(i)}</span>${r}</div>`).join('')}</div></div></div>`;

// coluna do dia com px/hora fixo de 8h a 22h: cada sessão e tarefa no y da sua hora
function coluna({ x, y, w, h, modo }) {
  const de = 8, ate = modo === 'aperta' ? 22 : 20, pph = h / (22 - 8);
  const alt = (ate - de) * pph;
  const Y = (hh) => (hora(hh) - de) * pph;
  const horas = Array.from({ length: (ate - de) / 2 + 1 }, (_, i) => de + 2 * i).map((hh) => `<i style="top:${(hh - de) * pph - 12}px">${hh}h</i>`).join('');
  const ses = SESSOES.map(([hh, nome], i) => `<div class="sessao ${i === 2 ? 'alta' : ''}" style="top:${Y(hh)}px;height:${pph * 0.83}px"><b>${hh}</b><span>${nome}</span></div>`).join('');
  const tar = modo === 'aperta' ? TAREFAS.map(([i, r, t, hh], k) => `<div class="tarefa ${t}" style="top:${Y(hh) + 2}px;height:${pph * 0.46}px;--r:${k % 2 ? 0.8 : -0.8}deg"><span class="tic">${ic(i)}</span>${r}</div>`).join('') : '';
  const noite = modo === 'aperta' ? `<div class="noite" style="top:${Y('20:00')}px;height:${2 * pph + 20}px"><span>noite</span></div>` : '';
  const cab = modo === 'devolve'
    ? `<div class="cab"><span>Quarta-feira · 4 sessões<small>dados ilustrativos</small></span><div class="chip-kz"><span class="mini">${LOGO}</span>tudo na kz ${['check-check', 'message-circle', 'wallet', 'notebook-pen'].map((n, k) => `<span class="tic ${['t-teal', 't-coral', 't-amber', 't-lilac'][k]}">${ic(n)}</span>`).join('')}</div></div>`
    : `<div class="cab">Quarta-feira · 4 sessões<small>dados ilustrativos</small></div>`;
  return `<div class="coluna" style="left:${x}px;top:${y}px;width:${w}px;height:${alt + 126}px">${cab}<div class="area" style="height:${alt + 30}px">${noite}<div class="horas">${horas}</div>${ses}${tar}</div></div>`;
}

const css = `
@import url("../../../brand/brand.css");
@import url("../../../video-templates/base.css");
body { margin: 0; background: #ddd; display: flex; flex-wrap: wrap; gap: 40px; align-items: flex-start; padding: 20px; }
.slide { position: relative; width: 1080px; height: 1350px; overflow: hidden; background: var(--bg); font-family: var(--font-body); color: var(--text); }
.slide.v { height: 1920px; }
.blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .55; }
.hl { position: absolute; left: 60px; right: 60px; text-align: center; font-weight: 700; letter-spacing: -0.01em; line-height: 1.15; text-wrap: balance; }
.e { color: var(--accent); }
.acc { font-family: var(--font-accent); font-style: italic; font-weight: 500; color: var(--accent); }
.coluna { position: absolute; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; box-shadow: var(--shadow-md); overflow: hidden; }
.coluna .cab { height: 72px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0 22px; font-size: 24px; font-weight: 700; color: var(--muted); border-bottom: 1px solid var(--border); margin-bottom: 24px; }
.coluna .cab small { display: block; font-size: 18px; font-weight: 500; color: var(--muted); }
.coluna .area { position: relative; margin-left: 96px; margin-right: 22px; }
.coluna .horas { position: absolute; left: -82px; top: 0; bottom: 0; }
.coluna .horas i { position: absolute; font-style: normal; font-size: 24px; font-weight: 600; color: var(--muted); }
.noite { position: absolute; left: -96px; right: -22px; background: linear-gradient(180deg, #eadfd3, #d9c9b9); border-top: 1px dashed #c4b3a2; }
.noite span { position: absolute; left: 12px; top: 34px; font-size: 20px; font-weight: 700; color: #5a4d42; }
.sessao { position: absolute; left: 0; right: 0; z-index: 1; background: var(--pastel-sage); border-radius: 12px; padding: 0 20px; display: flex; align-items: center; gap: 14px; font-size: 28px; color: var(--ink); box-sizing: border-box; }
.sessao b { font-weight: 700; } .sessao span { font-weight: 500; }
.sessao.alta { box-shadow: 0 0 0 4px var(--surface), 0 0 0 8px var(--accent-soft), var(--shadow-md); }
.tarefa { position: absolute; left: 0; right: 0; z-index: 2; border-radius: 8px; padding: 0 14px; display: flex; align-items: center; gap: 10px; font-size: 22px; font-weight: 700; box-sizing: border-box; transform: rotate(var(--r, 0deg)); box-shadow: var(--shadow-sm); }
.tarefa .tic svg { width: 24px; height: 24px; }
.tic svg { width: 30px; height: 30px; display: block; }
.t-coral { --icon-color: var(--tile-coral-ink); color: var(--tile-coral-ink); } .t-teal { --icon-color: var(--tile-teal-ink); color: var(--tile-teal-ink); }
.t-amber { --icon-color: var(--tile-amber-ink); color: var(--tile-amber-ink); } .t-lilac { --icon-color: var(--tile-lilac-ink); color: var(--tile-lilac-ink); }
.tarefa.t-coral, .aic.t-coral, .peca.t-coral { background: var(--tile-coral); } .tarefa.t-teal, .aic.t-teal, .peca.t-teal { background: var(--tile-teal); }
.tarefa.t-amber, .aic.t-amber, .peca.t-amber { background: var(--tile-amber); } .tarefa.t-lilac, .aic.t-lilac, .peca.t-lilac { background: var(--tile-lilac); }
.grande { position: absolute; left: 0; right: 0; text-align: center; font-size: 132px; line-height: 1; }
.coracao { position: absolute; width: 96px; height: 96px; border-radius: 50%; background: var(--surface); box-shadow: 0 0 0 10px var(--accent-soft), var(--shadow-md); display: grid; place-items: center; --icon-color: var(--accent); z-index: 3; }
.coracao svg { width: 54px; height: 54px; }
.rodape { position: absolute; bottom: 28px; left: 0; right: 0; text-align: center; font-size: 22px; color: var(--muted); font-weight: 500; }
.logo svg { width: 100%; display: block; } .logo path, .mini path, .m path { fill: var(--logo); }
.card-atalhos { position: absolute; left: 0; top: 0; width: 432px; height: 445px; transform-origin: 0 0; background: var(--surface); border: 1px solid var(--border); border-radius: 22px; box-shadow: var(--shadow-md); padding: 26px; box-sizing: border-box; }
.card-atalhos .rot { font-size: 24px; font-weight: 700; color: var(--text); margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
.tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.tile { border: 1px solid var(--border); border-radius: 18px; padding: 16px; height: 168px; display: flex; flex-direction: column; justify-content: space-between; font-size: 21px; font-weight: 600; color: var(--text); box-sizing: border-box; }
.aic { width: 52px; height: 52px; border-radius: 14px; display: grid; place-items: center; } .aic svg { width: 28px; height: 28px; }
.peca { position: absolute; width: 96px; height: 96px; border-radius: 22px; display: grid; place-items: center; box-shadow: var(--shadow-md); } .peca svg { width: 48px; height: 48px; }
.badge { position: absolute; top: -10px; right: -10px; background: var(--primary); color: #2b2b2b; font-size: 20px; font-weight: 700; border-radius: 999px; padding: 4px 10px; }
.chip-kz { height: 52px; border-radius: 10px; background: var(--surface-2); border: 1px solid var(--border); display: flex; align-items: center; gap: 10px; padding: 0 14px; font-size: 22px; font-weight: 700; color: var(--text); }
.chip-kz .mini { width: 40px; } .chip-kz .tic svg { width: 24px; height: 24px; }
.janela { position: absolute; background: var(--surface); border: 1px solid var(--border); border-radius: 18px; box-shadow: var(--shadow-lg); overflow: hidden; }
.barra { height: 60px; background: var(--surface-2); display: flex; align-items: flex-end; padding: 0 16px; gap: 10px; border-bottom: 1px solid var(--border); }
.dots { display: flex; gap: 8px; align-self: center; margin-right: 10px; } .dots i { width: 14px; height: 14px; border-radius: 50%; background: #e3d8cf; }
.aba { background: var(--surface); border-radius: 12px 12px 0 0; padding: 12px 22px; font-size: 22px; font-weight: 600; display: flex; gap: 10px; align-items: center; } .aba .m { width: 26px; }
.end { margin: 14px 16px; height: 58px; border-radius: 999px; background: var(--ui-input); border: 1px solid var(--border); display: flex; align-items: center; padding: 0 10px 0 24px; font-size: 26px; font-weight: 600; gap: 12px; --icon-color: var(--muted); }
.end .ir { margin-left: auto; background: var(--primary); color: var(--on-primary); font-weight: 700; font-size: 24px; border-radius: 999px; padding: 10px 26px; }
.end .tic svg { width: 24px; height: 24px; }
.pag { padding: 8px 34px 30px; } .pag .topo { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; } .pag .topo .m { width: 64px; }
.saud { font-size: 38px; font-weight: 600; } .saud .acc { font-size: 44px; } .sub { font-size: 20px; color: var(--muted); margin-top: 4px; }
.prox { margin: 16px 0; border: 1px solid var(--border); border-radius: 16px; padding: 20px; background: radial-gradient(circle at 100% 0, var(--ui-glow), var(--surface) 55%); }
.prox small { font-size: 18px; font-weight: 700; color: var(--muted); letter-spacing: .06em; } .prox div { font-size: 30px; font-weight: 700; margin-top: 6px; }
.prox .btn { display: inline-block; margin-top: 10px; background: var(--primary); color: var(--on-primary); font-size: 20px; font-weight: 700; border-radius: 10px; padding: 8px 18px; }
.anot { position: absolute; left: 20px; top: 20px; font: 600 20px var(--font-body); color: var(--muted); background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 6px 12px; z-index: 9; }
`;

const blobs = `<div class="blob" style="left:-200px;top:-150px;width:620px;height:620px;background:var(--accent-soft)"></div>
<div class="blob" style="right:-220px;bottom:-180px;width:680px;height:680px;background:var(--pastel-sage)"></div>`;
const anot = (t) => `<div class="anot">${t}</div>`;

// L = layout por formato
const L = {
  '4x5': { cls: '', hTop: 70, colX: 190, colW: 700, colY: 214, colH: 840, grandeY: 1170 },
  '9x16': { cls: 'v', hTop: 290, colX: 150, colW: 780, colY: 420, colH: 770, grandeY: 1322, grande: 110 },
};

function s3(fmt) {
  const l = L[fmt];
  const pph = l.colH / 14;
  return `<section class="slide ${l.cls}">${blobs}${anot(`s3 · cena/dia-do-terapeuta · aperta · meio→fim · ${fmt}`)}
<div class="hl" style="top:${l.hTop}px;font-size:62px;white-space:nowrap;left:0;right:0">E no fim, sobra <span class="e">menos</span> tempo</div>
${coluna({ x: l.colX, y: l.colY, w: l.colW, h: l.colH, modo: 'aperta' })}
<div class="coracao" style="left:${l.colX + l.colW - 140}px;top:${l.colY + 96 + (14 - 8) * pph - 6}px">${ic('heart')}</div>
<div class="grande acc" style="top:${l.grandeY}px;font-size:${l.grande || 132}px">atender.</div>
</section>`;
}
function s6(fmt) {
  const l = L[fmt];
  const pph = l.colH / 14;
  return `<section class="slide ${l.cls}">${blobs}${anot(`s6 · cena/dia-do-terapeuta · devolve · fim · ${fmt}`)}
<div class="hl" style="top:${l.hTop - 20}px;font-size:${fmt === '9x16' ? 52 : 54}px">Mais tempo <span class="acc">cuidando</span> dos seus pacientes.</div>
${coluna({ x: l.colX, y: l.colY, w: l.colW, h: l.colH, modo: 'devolve' })}
<div class="coracao" style="left:${l.colX + l.colW - 140}px;top:${l.colY + 96 + (14 - 8) * pph - 6}px">${ic('heart')}</div>
</section>`;
}
function s4(fmt) {
  const v = fmt === '9x16';
  return `<section class="slide ${v ? 'v' : ''}">${blobs}${anot(`s4 · revelacao/grade-estados · em "profissional" (logo e tagline já saíram) · ${fmt}`)}
<div class="hl" style="top:${v ? 420 : 200}px;font-size:${v ? 70 : 62}px">A gestão da sua rotina mais <span class="e">profissional</span></div>
${cardAtalhos(v ? 1.7 : 1.4, `left:${v ? 173 : 238}px;top:${v ? 640 : 440}px`)}
<div class="peca t-coral" style="left:${v ? 790 : 880}px;top:${v ? 320 : 96}px">${ic('message-circle')}<span class="badge">3</span></div>
</section>`;
}
function s7(fmt) {
  const v = fmt === '9x16';
  const W = v ? 780 : 900, X = v ? 150 : 90, Y = v ? 400 : 240;
  return `<section class="slide ${v ? 'v' : ''}">${blobs}${anot(`s7 · cta/navegador · página carregada · ${fmt}`)}
<div class="hl" style="top:${v ? 290 : 100}px;font-size:66px">Conheça a kz</div>
<div class="janela" style="left:${X}px;top:${Y}px;width:${W}px">
  <div class="barra"><div class="dots"><i></i><i></i><i></i></div><div class="aba"><span class="m">${LOGO}</span>kz · Plataforma para terapeutas</div></div>
  <div class="end"><span class="tic">${ic('lock')}</span>kz.app.br<span class="ir">Ir</span></div>
  <div class="pag">
    <div class="topo"><div><div class="saud">Boa tarde, <span class="acc">${P.elenco.terapeuta}</span></div><div class="sub">Quarta-feira · 4 sessões hoje</div></div><span class="m">${LOGO}</span></div>
    <div class="prox"><small>PRÓXIMA SESSÃO · EM 15 MIN</small><div>14:00 · Helena R.</div><span class="btn">Iniciar sessão</span></div>
    <div style="position:relative;height:445px">${cardAtalhos(1, 'left:0;top:0')}</div>
  </div>
</div>
<div style="position:absolute;left:${X + W - 170}px;top:${Y + 80}px">${CURSOR}</div>
<div class="hl" style="top:${v ? 1350 : 1190}px;font-size:54px">Uma forma <span class="e">mais simples</span></div>
<div class="rodape">dados ilustrativos</div></section>`;
}

const html = ['4x5', '9x16'].flatMap((f) => [s3(f), s4(f), s6(f), s7(f)]).join('\n');
writeFileSync(join(AQUI, 'style-frames.html'), `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Style frames — apresentação kz, As peças da rotina (047 B v3)</title><style>${css}</style></head><body>${html}</body></html>`);
console.log('✓ style-frames.html (4:5 = slide-01..04 · 9:16 = slide-05..08)');
