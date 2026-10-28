BLOCO('cta/fecho-ola', function ({ tl, root, $, $$, cena, cue, texto, params, box, cursor }) {
  if (cena.start <= 0.001) root.style.opacity = 1; else tl.set(root, { opacity: 1 }, cena.start)
  $('.f1').textContent = texto('frase1').replace(/\*/g, '')
  // frase2: cada palavra num span; a palavra "olá" é a que vira o logo
  const f2 = texto('frase2')
  $('.f2').innerHTML = f2.split(' ').map((w) => {
    const acc = /^\*.*\*/.test(w) || w.includes('*')
    const limpo = w.replace(/\*/g, '')
    return `<span class="w2${acc ? ' acc' : ''}">${limpo}</span>`
  }).join(' ')
  const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^\w]/g, '')
  const ws = $$('.f2 .w2')
  const wOla = ws.find((w) => fold(w.textContent) === fold(params.palavra)) || ws[ws.length - 1]
  $('.barra .tx').textContent = texto('url')
  $('.urlp').textContent = texto('url')
  $('.logo').src = params.logo
  $('.olo').src = params.olo
  // medir antes de transform
  const pOla = box(wOla, 0.5, 0.5), pLogo = box($('.logo'), 0.5, 0.5), pUrl = box($('.urlp'), 0.62, 0.62)
  const tE = cue('entra'), tJ = cue('junta'), tF = cue('frase'), tO = cue('ola'), tC = cue('clique'), tP = cue('pisca')

  // 1º quadro: os dois cards no lugar da abertura + a frase inteira
  tl.fromTo($('.f1'), { opacity: 0, y: 26 }, { opacity: 1, y: 0, ...M.FAST, duration: 0.4 }, tE)
  tl.fromTo($('.brilho'), { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, ...M.SOFT, duration: 0.5 }, tE + 0.1)
  tl.fromTo($$('.kc'), { y: 30 }, { y: 0, ...M.FAST, duration: 0.3, stagger: 0.05 }, tE)
  tl.fromTo($('.blob'), { x: 160, y: 120, rotation: -10 }, { x: 0, y: 0, rotation: 0, ...M.GENTLE, duration: 0.9 }, tE)
  tl.to($('.blob'), { rotation: 6, y: -10, duration: Math.max(1, cena.dur - 1), ease: 'sine.inOut' }, tE + 0.9)
  // junta: os dois cards voltam a ser a barra do navegador (o inverso da abertura)
  const bar = { x: 90, y: 470, w: 900, h: 190 }
  $$('.kc').forEach((k, i) => {
    const c = [i ? 560 : 80, 305, 440, 560]
    tl.to(k.querySelector('img'), { opacity: 0, duration: 0.12 }, tJ)
    tl.to(k.querySelector('.b'), { opacity: 0, duration: 0.12 }, tJ)
    tl.to(k, { x: bar.x + i * bar.w / 2 - c[0], y: bar.y - c[1], scaleX: (bar.w / 2) / c[2], scaleY: bar.h / c[3], transformOrigin: '0 0', duration: 0.32, ease: 'power3.inOut' }, tJ + 0.05)
  })
  tl.set($$('.kc'), { opacity: 0 }, tJ + 0.37)
  tl.set($('.barra'), { opacity: 1 }, tJ + 0.37)
  tl.fromTo($('.barra .url'), { opacity: 0, scaleX: 0.8 }, { opacity: 1, scaleX: 1, ...M.FAST, duration: 0.3, immediateRender: false }, tJ + 0.37)
  // frase 2 inteira
  M.swap(tl, $('.f1'), null, tF - 0.05)
  tl.to($('.brilho'), { opacity: 0, duration: 0.15 }, tF - 0.05)
  tl.fromTo($('.f2'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, ...M.FAST, duration: 0.35 }, tF)
  // "olá" vira o logo; a barra recolhe na pílula da URL
  tl.to(ws.filter((w) => w !== wOla), { opacity: 0, y: -20, duration: 0.2, ease: 'power2.in' }, tO)
  tl.to(wOla, { x: pLogo.x - pOla.x, y: pLogo.y - pOla.y, scale: 2.2, opacity: 0, duration: 0.4, ease: 'power3.inOut' }, tO)
  tl.set($('.logo'), { opacity: 1 }, tO + 0.18)
  tl.fromTo($('.logo'), { clipPath: 'inset(0% 100% 0% 0%)', scale: 0.92 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 0.6, ease: 'power2.out', immediateRender: false }, tO + 0.18)
  tl.to($('.barra'), { y: 150 + 3, scaleX: 640 / 900, scaleY: 116 / 190, opacity: 0, duration: 0.35, ease: 'power3.inOut' }, tO + 0.1)
  tl.fromTo($('.urlp'), { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, ...M.SOFT, duration: 0.5, immediateRender: false }, tO + 0.3)
  tl.fromTo($('.olo'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, ...M.SOFT, duration: 0.5, immediateRender: false }, tO + 0.45)
  // o cursor clica na URL
  const C = cursor()
  tl.set(C.el, { x: 1000, y: 1150 }, cena.start)
  tl.to(C.el, { opacity: 1, duration: 0.12 }, tC - 0.5)
  C.move(pUrl, tC - 0.5, 0.45)
  C.click(pUrl, tC)
  tl.to($('.urlp'), { scale: 0.97, duration: 0.07, yoyo: true, repeat: 1 }, tC)
  tl.to($('.urlp'), { scale: 1.04, duration: 0.25, yoyo: true, repeat: 1, ease: 'sine.inOut' }, tC + 0.2)
  // oló pisca para a câmera
  tl.to($('.olo'), { scaleY: 0.82, duration: 0.06, yoyo: true, repeat: 1 }, tP)
  tl.to($('.olo'), { rotation: -6, duration: 0.25, yoyo: true, repeat: 1, ease: 'sine.inOut' }, tP + 0.15)
})
