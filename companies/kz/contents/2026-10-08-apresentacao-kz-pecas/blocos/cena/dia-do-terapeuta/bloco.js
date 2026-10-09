BLOCO('cena/dia-do-terapeuta', function ({ tl, K, root, $, $$, box, cena, cue, texto, params }) {
  const devolve = params.modo === 'devolve'
  root.classList.add(devolve ? 'devolve' : 'aperta')

  // ---- geometria: escala única de px/hora (8h a 22h), a mesma nos dois modos; cada coisa no y da sua hora ----
  const v = T.is('9x16')
  const G = v
    ? { cx: 150, cy: 120, cw: 780, pph: 55, tit: 52, ttop: -20, gfont: 110, gtop: 1022 }
    : { cx: 190, cy: 124, cw: 700, pph: 58, tit: devolve ? 54 : 60, ttop: -10, gfont: 120, gtop: 1075 }
  const DE = 8, ATE = 22, CAB = 97, AL = 96, AR = 22, AW = G.cw - AL - AR
  const pph = G.pph
  const hora = (s) => { const [h, m] = String(s).split(':').map(Number); return h + (m || 0) / 60 }
  const Y = (h) => (h - DE) * pph
  const viewH = (ate) => (ate - DE) * pph + 29
  const NOITE = hora(params.noite_a || '20:00')
  const SH = pph * 0.83, TH = pph * 0.46

  const sess = params.sessoes || []
  const tars = params.tarefas || []
  const ds = Math.min(params.destaque ?? 0, Math.max(0, sess.length - 1))
  const ysDest = sess.length ? Y(hora(sess[ds][0])) + SH / 2 : Y(14)
  const ic = (n) => { const p = $('.pool [data-ic="' + n + '"]') || $('.pool [data-ic="check-check"]'); return p.outerHTML }

  // ---- montagem do DOM ----
  const tit = $('.t-tit'), apo = $('.t-apo'), card = $('.card'), cam = $('.cam'), area = $('.area')
  ;[tit, apo].forEach((el) => { el.style.top = G.ttop + 'px'; el.style.fontSize = G.tit + 'px' })
  apo.style.fontSize = (v ? 50 : 52) + 'px'
  Object.assign(card.style, { left: G.cx + 'px', top: G.cy + 'px', width: G.cw + 'px', height: CAB + viewH(devolve ? ATE : NOITE) + 'px' })
  $('.cab-n').textContent = (params.dia || 'Quarta-feira') + ' · ' + sess.length + ' sessões'
  $('.aviso').textContent = $('.aviso-r').textContent = params.aviso || 'dados ilustrativos'
  $('.chip-t').textContent = params.chip || 'tudo na kz'

  $('.horas').innerHTML = Array.from({ length: (ATE - DE) / 2 + 1 }, (_, i) => DE + 2 * i).map((h) => `<i class="h-${h}" style="top:${Y(h) - 12}px">${h}h</i>`).join('')
  $('.sessoes').innerHTML = sess.map(([h, nome]) => `<div class="sessao" style="top:${Y(hora(h))}px;height:${SH}px"><b>${h}</b><span>${nome}</span></div>`).join('')
  $('.tarefas').innerHTML = tars.map(([i, r, t, h]) => `<div class="tarefa ${t}" style="top:${Y(hora(h)) + 2}px;height:${TH}px"><span class="tic">${ic(i)}</span>${r}</div>`).join('')
  const sEls = $$('.sessao'), tEls = $$('.tarefa')
  const rot = (k) => (k % 2 ? 0.8 : -0.8)
  tEls.forEach((el, k) => gsap.set(el, { rotation: rot(k) }))
  const dia = [], noite = []
  tars.forEach((t, k) => (hora(t[3]) < NOITE ? dia : noite).push(k))

  // faixa da noite (20h até o fim): altura final = até o rodapé da coluna de 22h
  const nEl = $('.noite'), nD = $('.noite-d'), nL = $('.noite-l')
  const nTop = Y(NOITE), nH = viewH(ATE) - nTop
  nEl.style.top = nTop + 'px'
  if (devolve) { nEl.style.height = nH + 'px'; gsap.set(nD, { opacity: 1 }); gsap.set(nL, { opacity: 1 }) }

  // anel + coração na sessão destacada
  const anel = $('.anel'), cor = $('.coracao'), bur = $('.burst')
  Object.assign(anel.style, { left: '0px', right: '0px', top: Y(hora(sess[ds][0])) + 'px', height: SH + 'px' })
  cor.innerHTML = ic('heart')
  const zoom = +params.zoom || 1.3
  // câmera (só aperta): a sessão destacada vai para vy; a última tarefa fica cortada pela base
  const lastTop = tars.length ? Math.max(...tars.map((t) => Y(hora(t[3])) + 2)) : ysDest
  const vH22 = viewH(ATE)
  const vy = Math.min(vH22 * 0.5, Math.max(vH22 * 0.28, vH22 - 20 - (lastTop - ysDest) * zoom))
  const camT = { x: 16 - zoom * AL, y: vy - zoom * ysDest, scale: zoom }
  const hx = devolve ? AW - 70 : Math.min(AW - 70, (G.cw - 84 - camT.x) / zoom - AL)
  Object.assign(cor.style, { left: hx - 48 + 'px', top: ysDest - 48 + 'px' })
  Object.assign(bur.style, { left: hx - 48 + 'px', top: ysDest - 48 + 'px' })
  gsap.set(cam, { transformOrigin: '0 0' })

  // palavra grande (slot palavra; vazio no devolve)
  const palavra = String(texto('palavra') || '').replace(/\*/g, '').trim()
  const gEl = $('.grande')
  gEl.textContent = palavra
  Object.assign(gEl.style, { top: G.gtop + 'px', fontSize: G.gfont + 'px' })

  // chip do cabeçalho: um ícone por tom (1º de cada)
  const tons = []
  tars.forEach((t) => { if (!tons.find((x) => x[2] === t[2])) tons.push(t) })
  $('.ci-box').innerHTML = tons.map(([i, , t]) => `<span class="ci ${t}" style="background:none">${ic(i)}</span>`).join('')
  const ciEls = $$('.ci')

  // ---- tempo ----
  const t0 = cena.start
  const cEntra = cue('entra', t0 + 0.02), cMuda = cue('muda'), cApoio = cue('apoio'), cTrans = cue('transborda'), cFecho = cue('fecho'), cSai = cue('sai')
  tl.set(root, { opacity: 1 }, t0 - 0.001)
  tl.set(root, { opacity: 0 }, cena.end)
  tl.fromTo(root, { scale: 1 }, { scale: 1.035, duration: cena.dur, ease: 'sine.inOut' }, t0)

  // headline inteira de uma vez (cascata curta)
  K.flash(tit, texto('titulo'), cEntra)

  // vive o tempo todo: a faixa da noite muda de tom devagar; no devolve, ela clareia no `muda`
  if (!devolve) {
    // ===== APERTA =====
    tl.fromTo(card, { opacity: 0, y: 46, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, ...M.SOFT }, t0 + 0.02)
    tl.fromTo(sEls, { opacity: 0, y: 26, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, ...M.FAST, stagger: 0.08 }, t0 + 0.12)
    gsap.set(tEls, { opacity: 0 })

    // muda: as tarefas do dia caem em cascata nos vãos; a coluna estica até 22h e a noite começa a crescer e escurecer
    dia.forEach((k, i) => tl.fromTo(tEls[k], { opacity: 0, y: -44, scale: 0.92, rotation: rot(k) * 5 }, { opacity: 1, y: 0, scale: 1, rotation: rot(k), ...M.FAST }, cMuda + i * 0.065))
    const dEnd = Math.max(cFecho + 0.6, cMuda + 1.8)
    tl.to(card, { height: CAB + viewH(ATE), duration: 1.0, ease: M.GENTLE.ease }, cMuda)
    tl.to(nEl, { height: nH, duration: 1.0, ease: M.GENTLE.ease }, cMuda)
    tl.to(nD, { opacity: 1, duration: dEnd - cMuda, ease: 'sine.inOut' }, cMuda)

    // apoio: a headline troca; as horas somem; a câmera fecha na sessão destacada
    K.out(tit, cApoio - 0.02, 0.26, -30)
    K.flash(apo, texto('apoio'), cApoio + 0.12)
    tl.to($('.horas'), { opacity: 0, duration: 0.3, ease: 'power2.in' }, cApoio)
    tl.to(cam, { x: camT.x, y: camT.y, scale: camT.scale, duration: 1.15, ease: M.GENTLE.ease }, cApoio)

    // transborda: as tarefas da noite descem para depois das 20h; o rótulo da noite aparece
    noite.forEach((k, i) => tl.fromTo(tEls[k], { opacity: 0, y: -150, scale: 0.94, rotation: rot(k) * 4 }, { opacity: 1, y: 0, scale: 1, rotation: rot(k), ...M.FAST }, cTrans + i * 0.1))
    tl.to(nL, { opacity: 1, duration: 0.4, ease: 'power2.out' }, cTrans + 0.15)

    // fecho: anel + coração na sessão e a palavra grande fora da coluna
    tl.fromTo(anel, { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, ...M.SOFT }, cFecho)
    K.pop(cor, cFecho + 0.08, 0.2)
    K.burst(bur, cFecho + 0.14, 2.1)
    tl.to(cor, { scale: 1.12, duration: 0.25, ease: 'sine.inOut', yoyo: true, repeat: 1 }, cFecho + 0.9)
    if (palavra) {
      tl.fromTo(gEl, { opacity: 0, y: 50, scale: 0.9, filter: 'blur(8px)' }, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', ...M.SOFT }, cFecho)
    }

    // sai: 1 tarefa de cada tom se solta e sobe para o centro (as 4 peças da cena seguinte)
    const voos = $('.voos')
    const V0 = { x: G.cx, y: G.cy + CAB }
    const [px, py] = params.centro || [540, 585]
    const alvo = [[-66, -66], [66, -66], [-66, 66], [66, 66]] // teal · coral · âmbar · lilás (ordem de leitura)
    const ordem = ['t-teal', 't-coral', 't-amber', 't-lilac']
    const D = Math.min(0.8, Math.max(0.3, cena.end - cSai))
    const quatro = tons.slice(0, 4)
    quatro.forEach((t, i) => {
      const k = tars.indexOf(t)
      const pos = Math.max(0, ordem.indexOf(t[2]))
      const cxm = AL + AW / 2, cym = Y(hora(t[3])) + 2 + TH / 2
      const sx = V0.x + zoom * cxm + camT.x, sy = V0.y + zoom * cym + camT.y
      const tw = AW
      const el = document.createElement('div')
      el.className = 'voa'
      el.innerHTML = `<div class="v-rect ${t[2]}" style="width:${tw}px;height:${TH}px;margin-left:${-tw / 2}px;margin-top:${-TH / 2}px">${ic(t[0])}${t[1]}</div><div class="v-tile ${t[2]}" style="margin-left:-48px;margin-top:-48px">${ic(t[0])}</div>`
      voos.appendChild(el)
      const rect = el.querySelector('.v-rect'), tile = el.querySelector('.v-tile')
      gsap.set(el, { x: sx, y: sy, scale: zoom, rotation: rot(k) })
      const d = D - i * 0.03, at = cSai + i * 0.03
      tl.set(el, { opacity: 1 }, at)
      tl.set(tEls[k], { opacity: 0 }, at)
      tl.to(el, { x: px + alvo[pos][0], y: py + alvo[pos][1], scale: 1, rotation: 0, duration: d, ease: 'power3.inOut' }, at)
      tl.to(rect, { opacity: 0, scaleX: 0.22, duration: d * 0.6, ease: 'power2.in' }, at)
      tl.fromTo(tile, { opacity: 0, scale: 0.35 }, { opacity: 1, scale: 1, duration: d * 0.7, ease: M.SOFT.ease }, at + d * 0.3)
    })
    // o resto da cena sai de baixo das tarefas
    tl.to([card, apo, gEl], { opacity: 0, duration: Math.min(0.25, D), ease: 'power2.in' }, cSai)
  } else {
    // ===== DEVOLVE ===== (hard cut: a coluna já está como no meio da aperta; só o chip e a headline entram)
    gsap.set(sEls, { opacity: 1 })
    K.pop($('.chip-kz'), cEntra + 0.06, 0.6)
    const dd = Math.max(0.2, (cMuda - t0) / 2)
    tEls.forEach((el, k) => tl.to(el, { y: k % 2 ? 3 : -3, duration: dd, ease: 'sine.inOut', yoyo: true, repeat: 1 }, t0))

    // muda: as tarefas voam para o chip no cabeçalho; a noite clareia junto (um movimento só). As sessões não se mexem.
    const chip = box('.chip-kz', 0.5, 0.5)
    const V0 = { x: G.cx, y: G.cy + CAB }
    const vistos = new Set()
    tars.forEach((t, k) => {
      const cxm = AL + AW / 2, cym = Y(hora(t[3])) + 2 + TH / 2
      const dx = chip.x - (V0.x + cxm), dy = chip.y - (V0.y + cym)
      const at = cMuda + k * 0.045, d = 0.55
      tl.fromTo(tEls[k], { x: 0, y: 0 }, { x: dx, y: dy, scale: 0.28, rotation: rot(k) * 6, duration: d, ease: 'power3.inOut', immediateRender: false }, at)
      tl.to(tEls[k], { opacity: 0, duration: 0.14, ease: 'power1.in' }, at + d - 0.12)
      const ti = tons.findIndex((x) => x[2] === t[2])
      if (!vistos.has(t[2]) && ciEls[ti]) {
        vistos.add(t[2])
        tl.to(ciEls[ti], { opacity: 1, duration: 0.2 }, at + d - 0.1)
        tl.fromTo(ciEls[ti], { scale: 1.5 }, { scale: 1, ...M.FAST, immediateRender: false }, at + d - 0.1)
      }
    })
    tl.to($('.chip-kz'), { scale: 1.06, duration: 0.2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, cMuda + 0.25)
    tl.to($('.chip-kz'), { scale: 1.06, duration: 0.2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, cMuda + 0.6)
    tl.to(nD, { opacity: 0, duration: 0.9, ease: 'power2.inOut' }, cMuda)
    tl.to(nEl, { opacity: 0, duration: 0.9, ease: 'power2.inOut' }, cMuda)
    tl.to(nL, { opacity: 0, duration: 0.5, ease: 'power2.in' }, cMuda)
    tl.to($('.h-22'), { opacity: 0, duration: 0.5, ease: 'power2.in' }, cMuda)

    // apoio: a headline troca
    K.out(tit, cApoio - 0.02, 0.26, -30)
    K.flash(apo, texto('apoio'), cApoio + 0.12)

    // transborda: a coluna volta a terminar às 20h
    tl.to(card, { height: CAB + viewH(NOITE), duration: 0.9, ease: M.GENTLE.ease }, cTrans)

    // fecho: anel + coração pousam na sessão destacada
    tl.fromTo(anel, { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, ...M.SOFT }, cFecho)
    K.pop(cor, cFecho + 0.08, 0.2)
    K.burst(bur, cFecho + 0.14, 2.1)
    tl.to(cor, { scale: 1.12, duration: 0.25, ease: 'sine.inOut', yoyo: true, repeat: 1 }, cFecho + 0.9)
    // sai: corte seco (o set no fim da cena esconde o bloco)
  }
})
