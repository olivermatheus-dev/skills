BLOCO('pagina/bloco-professor', function ({ tl, root, $, $$, cena, cue, texto, params }) {
  if (cena.start <= 0.001) root.style.opacity = 1; else tl.set(root, { opacity: 1 }, cena.start)
  const limpa = (s) => s.replace(/\*/g, '')
  const r1 = $('.r1'), r2 = $('.r2')
  r1.querySelector('.l1').textContent = limpa(texto('titulo1'))
  // 'tiempo libre' ganha um marca-texto quando é dito
  const t2 = limpa(texto('titulo2')), alvo = params.marca || 'tiempo libre', k = t2.indexOf(alvo)
  r1.querySelector('.l2').innerHTML = k < 0 ? t2 : `${t2.slice(0, k)}<span class="mk">${alvo}</span>${t2.slice(k + alvo.length)}`
  r2.querySelector('.l1').textContent = limpa(texto('texto1'))
  r2.querySelector('.l2').textContent = limpa(texto('texto2'))
  const tE = cue('entra'), tR1 = cue('ret1'), tL = cue('livre'), tR2 = cue('ret2'), tCo = cue('coracao'), tS = cue('sai')
  const m1 = r1.querySelector('.masc'), m2 = r2.querySelector('.masc')

  tl.fromTo(root, { scale: 1 }, { scale: 1.012, duration: cena.dur, ease: 'sine.inOut', transformOrigin: '50% 50%' }, cena.start)
  // 1º retângulo entra pela esquerda já com a frase; o professor sobe
  tl.fromTo(r1, { x: -560 }, { x: 0, duration: 0.35, ease: 'power3.out' }, cena.start)
  tl.fromTo(r1.querySelectorAll('.tx > div'), { opacity: 0.3, x: -60 }, { opacity: 1, x: 0, ...M.FAST, duration: 0.4, stagger: 0.07 }, tR1 + 0.15)
  tl.fromTo(m1, { y: 220 }, { y: 0, ...M.SOFT, duration: 0.6 }, tR1 + 0.25)
  tl.to(m1, { rotation: 2.5, duration: 0.7, yoyo: true, repeat: Math.max(1, Math.floor((cena.end - tR1 - 0.9) / 0.7)), ease: 'sine.inOut' }, tR1 + 0.9)
  tl.to(m1, { scaleY: 0.9, duration: 0.05, yoyo: true, repeat: 1 }, tR1 + 1.6)
  // tempo livre: marca-texto + relógio
  const mk = r1.querySelector('.mk')
  if (mk) tl.fromTo(mk, { '--mk': 0 }, { '--mk': 1, duration: 0.35, ease: 'power2.out' }, tL - 0.1)
  tl.fromTo(r1.querySelector('.relo'), { opacity: 0, scale: 0.4, rotation: -40 }, { opacity: 1, scale: 1, rotation: 0, ...M.SOFT, duration: 0.45 }, tL)
  tl.to(r1.querySelector('.relo .icon'), { rotation: 360, duration: 1.2, ease: 'power1.inOut' }, tL + 0.3)
  // 2º retângulo entra pela direita com a frase do aluno; o aluno sobe
  tl.fromTo(r2, { x: 1120 }, { x: 0, duration: 0.5, ease: 'power3.out' }, tR2 - 0.1)
  tl.fromTo(r2.querySelectorAll('.tx > div'), { opacity: 0.3, x: 60 }, { opacity: 1, x: 0, ...M.FAST, duration: 0.4, stagger: 0.07 }, tR2 + 0.1)
  tl.fromTo(m2, { y: 220 }, { y: 0, ...M.SOFT, duration: 0.6 }, tR2 + 0.2)
  tl.to(m2, { y: -8, duration: 0.6, yoyo: true, repeat: Math.max(1, Math.floor((cena.end - tR2 - 0.9) / 0.6)), ease: 'sine.inOut' }, tR2 + 0.85)
  // o coração: o espanhol dele vale para quem aprende
  const bo = r2.querySelector('.bolha')
  tl.fromTo(bo, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, ...M.SOFT, duration: 0.45 }, tCo)
  tl.to(bo.querySelector('.icon'), { scale: 1.2, duration: 0.18, yoyo: true, repeat: 3, ease: 'power2.out' }, tCo + 0.4)
  // saída: cada um sai pelo lado oposto ao que entrou
  const d = Math.max(0.25, cena.end - tS)
  tl.to(r1, { x: 1120, duration: d, ease: 'power3.in' }, tS)
  tl.to(r2, { x: -1120, duration: d, ease: 'power3.in' }, tS + 0.04)
  tl.set(root, { opacity: 0 }, cena.end)
})
