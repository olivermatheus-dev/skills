BLOCO('cena/caos-cards', function ({ tl, K, root, $, $$, cena, cue, texto, fala, params }) {
  const f = fala(0)
  const names = params.cards || []
  $$('.card .nm').forEach((n, i) => (n.textContent = names[i] || ''))
  // params novos, todos opcionais: sem eles o bloco é o original (cards sem texto de conteúdo, alerta em --danger, sem linha nem Mensagens)
  const cont = params.conteudo
  if (cont) {
    // 1 linha por card: Agenda e Pacientes ganham uma etiqueta sob o título; no caderno a linha é o bilhete à mão
    ;[0, 1].forEach((i) => cont[i] && $(`.c${i + 1} h3`).insertAdjacentHTML('afterend', `<div class="cont">${cont[i]}</div>`))
    if (cont[2]) $('.c3 .hand').textContent = cont[2]
  }
  if (params.alerta === 'ink') $$('.warn').forEach((w) => (w.style.color = 'var(--ink)'))
  if (params.mensagens) {
    root.insertAdjacentHTML('beforeend', `<div class="msg"><div class="mic"><span class="mi t-coral">{{i:message-circle}}</span></div><span class="mbd">${params.mensagens}</span></div>`)
  }

  K.flash($('.h2a'), texto('linha1'), cena.start + 0.15)
  K.out($('.h2a'), cue('card2') - 0.2, 0.2, -30)
  params.inteira ? K.flash($('.h2b'), texto('linha2'), cue('card2')) : K.type($('.h2b'), texto('linha2'), f, cue('card2'), 34, true)
  K.out($('.h2b'), cue('card3') - 0.2, 0.2, -30)
  params.inteira ? K.flash($('.h2c'), texto('linha3'), cue('card3')) : K.type($('.h2c'), texto('linha3'), f, cue('card3'), 34, true)
  const cards = [$('.c1'), $('.c2'), $('.c3')]
  const cardIn = (c, at, rot) => tl.fromTo(c, { opacity: 0, y: 90, rotation: 0, scale: 0.86 }, { opacity: 1, y: 0, rotation: rot, scale: 1, ...M.SOFT }, at)
  cardIn(cards[0], cue('card1'), -5); cardIn(cards[1], cue('card2'), 4); cardIn(cards[2], cue('card3'), -3)
  // vida enquanto falam: cada card flutua
  ;[-1, 1, -1].forEach((s, i) => tl.to(cards[i], { y: `+=${14 * s}`, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: 1 }, cue(['card1', 'card2', 'card3'][i]) + 0.6))
  // "espalhadas": alerta em cada card, tudo se afasta
  $$('.warn').forEach((w, i) => K.pop(w, cue('espalha') + i * 0.07, 0.2))
  tl.to(cards[0], { x: -40, rotation: -9, duration: 0.9, ease: M.SOFT.ease }, cue('espalha'))
  tl.to(cards[1], { x: 24, rotation: 8, duration: 0.9, ease: M.SOFT.ease }, cue('espalha'))
  tl.to(cards[2], { x: -34, rotation: -7, duration: 0.9, ease: M.SOFT.ease }, cue('espalha'))
  tl.fromTo(root, { scale: 1 }, { scale: 1.035, duration: cena.dur, ease: 'sine.inOut' }, cena.start)
  tl.to(cards[0], { x: -700, rotation: -20, opacity: 0, duration: 0.34, ease: 'power3.in' }, cue('sai'))
  tl.to(cards[1], { x: 700, rotation: 18, opacity: 0, duration: 0.34, ease: 'power3.in' }, cue('sai') + 0.03)
  tl.to(cards[2], { y: 500, rotation: -12, opacity: 0, duration: 0.34, ease: 'power3.in' }, cue('sai') + 0.05)
  K.out($('.h2c'), cue('sai'), 0.28)

  // Mensagens: o 4º elemento, pequeno no canto, com o selo da contagem
  if (params.mensagens) {
    const m = $('.msg')
    tl.fromTo(m, { opacity: 0, scale: 0.3, rotation: -14 }, { opacity: 1, scale: 1, rotation: 6, ...M.SOFT }, cena.start + 0.1)
    tl.to(m, { y: -10, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: 1 }, cena.start + 0.9)
    tl.to(m, { rotation: 14, duration: 0.12, ease: 'power2.out', yoyo: true, repeat: 3 }, cue('espalha') + 0.1)
    tl.to(m, { x: 380, y: -260, rotation: 24, opacity: 0, duration: 0.34, ease: 'power3.in' }, cue('sai') + 0.02)
  }

  // ligação: linha tracejada entre os 3 nomes (a mesma paciente nos 3 cards) que se rompe trecho a trecho em `espalha`.
  // As pontas seguem as etiquetas a cada quadro (os cards giram, flutuam e se afastam); sem estado fora da timeline.
  if (params.ligacao) {
    const NS = 'http://www.w3.org/2000/svg'
    const svg = document.createElementNS(NS, 'svg')
    svg.setAttribute('class', 'lig')
    root.appendChild(svg)
    const lados = params.ligacao_lados
    const alvos = [$('.c1 .cont') || $('.c1 h3'), $('.c2 .cont') || $('.c2 h3'), $('.c3 .hand')]
    const trechos = [
      { de: 0, para: 1, arco: params.ligacao_arcos[0], lado: lados[0], ini: cue('card2') + 0.3, rompe: cue('espalha') },
      { de: 1, para: 2, arco: params.ligacao_arcos[1], lado: lados[1], ini: cue('card3') + 0.3, rompe: cue('espalha') + 0.14 },
      { de: 2, para: 0, arco: params.ligacao_arcos[2], lado: lados[2], ini: cue('card3') + 0.5, rompe: cue('espalha') + 0.28 },
    ]
    trechos.forEach((t) => {
      t.metades = [0, 1].map(() => {
        const p = document.createElementNS(NS, 'path')
        p.setAttribute('class', 'lig-linha')
        svg.appendChild(p)
        return p
      })
      t.pontas = [0, 1].map(() => {
        const c = document.createElementNS(NS, 'circle')
        c.setAttribute('class', 'lig-ponta')
        c.setAttribute('r', '7')
        svg.appendChild(c)
        return c
      })
    })
    const eAppear = gsap.parseEase('power2.out'), eRompe = gsap.parseEase('power4.out')
    const clamp = (v) => Math.max(0, Math.min(1, v))
    const centro = (r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height })
    // ponto onde o raio do centro de `a` em direção a `b` sai do retângulo de `a` (+ folga); com lado esq/dir/cima/baixo, o meio dessa borda
    const borda = (a, b, folga, lado) => {
      if (lado === 'esq') return { x: a.x - a.w / 2 - folga, y: a.y }
      if (lado === 'dir') return { x: a.x + a.w / 2 + folga, y: a.y }
      if (lado === 'cima') return { x: a.x, y: a.y - a.h / 2 - folga }
      if (lado === 'baixo') return { x: a.x, y: a.y + a.h / 2 + folga }
      const dx = b.x - a.x, dy = b.y - a.y, k = Math.min((a.w / 2) / Math.abs(dx || 1e-6), (a.h / 2) / Math.abs(dy || 1e-6))
      const len = Math.hypot(dx, dy) || 1
      return { x: a.x + dx * k + (dx / len) * folga, y: a.y + dy * k + (dy / len) * folga }
    }
    const draw = (time) => {
      const rr = root.getBoundingClientRect()
      const sx = rr.width / root.offsetWidth || 1
      const loc = (p) => ({ x: (p.x - rr.left) / sx, y: (p.y - rr.top) / sx })
      const cs = alvos.map((el) => centro(el.getBoundingClientRect()))
      trechos.forEach((t) => {
        const a = loc(borda(cs[t.de], cs[t.para], 10, t.lado[0])), b = loc(borda(cs[t.para], cs[t.de], 10, t.lado[1]))
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1
        const c = { x: mx - (dy / len) * t.arco, y: my + (dx / len) * t.arco }
        const pt = (u) => ({ x: (1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * c.x + u * u * b.x, y: (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * c.y + u * u * b.y })
        const p = eAppear(clamp((time - t.ini) / 0.45)), r = eRompe(clamp((time - t.rompe) / 0.22))
        // metade A cresce de a até o meio e metade B de b até o meio; ao romper, as duas voltam para as pontas (sobra um toco em cada)
        const fa = Math.max(0, Math.min(p, 0.5) - 0.36 * r), fb = Math.max(0, Math.max(p - 0.5, 0) - 0.36 * r)
        const trecho = (u0, u1, n = 18) => Array.from({ length: n + 1 }, (_, k) => pt(u0 + (u1 - u0) * (k / n)))
        const d = (pts) => 'M' + pts.map((q) => `${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join('L')
        t.metades[0].setAttribute('d', fa > 0.002 ? d(trecho(0, fa)) : '')
        // a metade B é desenhada a partir de b (o tracejado nasce na ponta e acompanha a retração)
        t.metades[1].setAttribute('d', fb > 0.002 ? d(trecho(1, 1 - fb)) : '')
        t.pontas[0].setAttribute('cx', a.x.toFixed(1)); t.pontas[0].setAttribute('cy', a.y.toFixed(1))
        t.pontas[1].setAttribute('cx', b.x.toFixed(1)); t.pontas[1].setAttribute('cy', b.y.toFixed(1))
        t.pontas[0].style.opacity = p > 0 ? 1 : 0
        t.pontas[1].style.opacity = p >= 1 ? 1 : 0
      })
    }
    const t0 = trechos[0].ini, t1 = cue('sai') + 0.4
    const D = { t: 0 }
    tl.fromTo(D, { t: 0 }, { t: 1, duration: t1 - t0, ease: 'none', onUpdate: () => draw(t0 + D.t * (t1 - t0)) }, t0)
    tl.to(svg, { opacity: 0, duration: 0.25, ease: 'power2.in' }, cue('sai'))
  }
})
