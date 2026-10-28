BLOCO('pagina/bloco-professor', function ({ tl, root, $, $$, cena, cue, texto, params }) {
  if (cena.start <= 0.001) root.style.opacity = 1; else tl.set(root, { opacity: 1 }, cena.start)
  const limpa = (s) => s.replace(/\*/g, '')
  $('.rot').textContent = limpa(texto('rotulo'))
  $('.tit .l1').textContent = limpa(texto('titulo1'))
  $('.tit .l2').textContent = limpa(texto('titulo2'))
  const pils = $$('.pa').slice(0, params.quantos)
  $$('.pa').forEach((p, i) => { if (i >= params.quantos) p.remove(); else p.querySelector('.t').textContent = limpa(texto('pilula')) })
  const tE = cue('entra'), tP = cue('pisca'), tSo = cue('sorri'), tS = cue('sai')
  const masc = $('.masc')
  // 1º quadro: o creme do card virou a página; o bloco verde sobe já com o texto
  tl.fromTo($('.bloco'), { opacity: 0.6, scale: 0.94, y: 40 }, { opacity: 1, scale: 1, y: 0, ...M.GENTLE, duration: 0.6 }, tE)
  tl.fromTo($('.rot'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, ...M.FAST, duration: 0.35 }, tE + 0.05)
  tl.fromTo($$('.tit > div'), { opacity: 0, y: 28 }, { opacity: 1, y: 0, ...M.FAST, duration: 0.4, stagger: 0.07 }, tE + 0.08)
  tl.fromTo(masc, { opacity: 0, y: 80, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, ...M.SOFT, duration: 0.7 }, tE + 0.12)
  // vivo: o mascote balança de leve (o fone) e pisca para a câmera
  tl.to(masc, { rotation: 2.5, duration: 0.7, yoyo: true, repeat: 5, ease: 'sine.inOut' }, tE + 0.7)
  tl.to(masc, { scaleY: 0.88, duration: 0.05, yoyo: true, repeat: 1 }, tP)
  // as aulas pagas chegam sozinhas, uma por vez
  pils.forEach((p, i) => {
    const t = cue('aluno' + (i + 1))
    tl.fromTo(p, { opacity: 0, x: 900 }, { opacity: 1, x: 0, ...M.GENTLE, duration: 0.55 }, t - 0.1)
    tl.to(masc, { rotation: -4, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' }, t + 0.25)
  })
  tl.to(masc, { scale: 1.06, y: -12, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' }, tSo)
  tl.to(masc, { scaleY: 0.88, duration: 0.05, yoyo: true, repeat: 1 }, tSo + 0.3)
  // saída: o bloco encolhe e vira o 1º card da cena seguinte
  const D = params.destino
  const d = Math.max(0.2, cena.end - tS)
  const card = getComputedStyle(document.documentElement).getPropertyValue('--dobra-creme-claro-card').trim()
  tl.to($('.cont'), { opacity: 0, duration: d * 0.5, ease: 'power2.in' }, tS)
  tl.to($('.bloco'), { x: D[0] - 40, y: D[1] - 40, scaleX: D[2] / 1000, scaleY: D[3] / 1080, backgroundColor: card, borderRadius: 60, duration: d, ease: 'power3.inOut' }, tS)
  tl.set(root, { opacity: 0 }, cena.end)
})
