BLOCO('pagina/hero-aluno', function ({ tl, root, $, $$, cena, cue, texto, params, box }) {
  if (cena.start <= 0.001) root.style.opacity = 1; else tl.set(root, { opacity: 1 }, cena.start)
  const md = (s) => s.replace(/\*([^*]+)\*/g, '<b>$1</b>')
  $('.tag').innerHTML = md(texto('tag'))
  $('.titulo .l1').textContent = texto('titulo1').replace(/\*/g, '')
  $('.titulo .l2').textContent = texto('titulo2').replace(/\*/g, '')
  $('.aula .quando').textContent = texto('aula')
  $('.aula .fala').textContent = '“' + texto('fala_prof') + '”'
  $('.rodape-ilustr').textContent = params.rodape
  const chips = $$('.chip')
  chips.forEach((c, i) => {
    const ic = params.icones[i]
    const lucide = /^[a-z0-9-]+$/.test(ic) ? $('.lucide-' + ic) : null
    const icHtml = /\.svg$/.test(ic) ? `<img src="${ic}" alt="" />` : `<span class="ic">${lucide ? lucide.innerHTML : ''}</span>`
    c.innerHTML = icHtml + `<span>${texto('chip' + (i + 1))}</span>`
  })
  const tE = cue('entra'), tA = cue('aula'), tEnc = cue('encolhe'), tS = cue('sai')
  const destinos = params.destinos
  const centros = chips.map((c) => box(c, 0.5, 0.5))

  // 1º quadro: tag + título inteiro grande (cascata curta)
  tl.fromTo($('.tag'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, ...M.FAST, duration: 0.35 }, tE)
  tl.fromTo($$('.titulo > div'), { opacity: 0, y: 34 }, { opacity: 1, y: 0, ...M.FAST, duration: 0.45, stagger: 0.08 }, tE)
  tl.fromTo($('.ast'), { opacity: 0, scale: 0.3, rotation: -60 }, { opacity: 1, scale: 1, rotation: 0, ...M.SOFT, duration: 0.7 }, tE + 0.1)
  tl.to($('.ast'), { rotation: 40, duration: cena.dur, ease: 'none' }, tE + 0.8)
  // cartão de aula
  tl.fromTo($('.arco'), { opacity: 0, y: 70 }, { opacity: 1, y: 0, ...M.SOFT, duration: 0.6 }, tA)
  tl.fromTo($('.arco .masc'), { y: 40, scale: 0.85 }, { y: 0, scale: 1, ...M.SOFT, duration: 0.6 }, tA + 0.08)
  tl.fromTo($('.aula'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, ...M.SOFT, duration: 0.55 }, tA + 0.12)
  tl.fromTo($('.prog'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, ...M.SOFT, duration: 0.55 }, tA + 0.2)
  tl.fromTo($('.balao'), { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, ...M.SOFT, duration: 0.5 }, tA + 0.25)
  tl.fromTo($('.enche'), { scaleX: params.progresso[0] }, { scaleX: params.progresso[1], duration: Math.max(0.5, tS - tA - 0.3), ease: 'power1.inOut' }, tA + 0.3)
  tl.fromTo($('.rodape-ilustr'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, tA)
  // vivo: mascote pisca, balão balança
  ;[tA + 0.9, tA + 2.6].forEach((t) => { if (t < tS) tl.to($('.arco .masc'), { scaleY: 0.88, duration: 0.05, yoyo: true, repeat: 1 }, t) })
  tl.to($('.balao'), { y: -10, duration: 0.9, yoyo: true, repeat: 3, ease: 'sine.inOut' }, tA + 0.8)
  // título encolhe e sobe
  tl.to($('.titulo'), { scale: 0.62, y: -45, ...M.GENTLE, duration: 0.7 }, tEnc)
  tl.to($('.tag'), { y: -10, duration: 0.5, ease: 'power2.out' }, tEnc)
  // chips, um por frase
  chips.forEach((c, i) => tl.fromTo(c, { opacity: 0, x: -30, scale: 0.9 }, { opacity: 1, x: 0, scale: 1, ...M.SOFT, duration: 0.5 }, cue('chip' + (i + 1))))
  // saída: o resto sai; os chips voam para os cards de plano da cena seguinte
  tl.to([$('.tag'), $('.titulo'), $('.arco'), $('.aula'), $('.prog'), $('.balao'), $('.ast'), $('.rodape-ilustr')], { opacity: 0, y: -24, duration: 0.2, stagger: 0.015, ease: 'power2.in' }, tS)
  chips.forEach((c, i) => tl.to(c, { x: destinos[i][0] - centros[i].x, y: destinos[i][1] - centros[i].y, scale: 0.75, duration: Math.max(0.25, cena.end - tS), ease: 'power3.inOut' }, tS))
  tl.to(chips, { opacity: 0, duration: 0.1 }, cena.end - 0.08)
  tl.set(root, { opacity: 0 }, cena.end)
})
