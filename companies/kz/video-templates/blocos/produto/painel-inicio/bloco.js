BLOCO('produto/painel-inicio', function ({ tl, K, root, $, $$, cena, cue, texto, fala, box, cursor, params }) {
  const f = fala(0)
  const app = $('.app')
  // params novos, todos opcionais: sem eles o bloco é o original (Marina 15:00, "3 sessões hoje", toast "Sessão agendada · lembrete enviado", entrada pelo painel)
  const E = params.elenco && typeof params.elenco === 'object' ? params.elenco : null // "P.elenco" (texto solto) = ainda não resolvido: ignora
  let alvoLista = 2 // linha da lista que o cursor clica (original: a 2ª)
  if (E) {
    const iniciais = (n) => n.replace(/\./g, '').split(/\s+/).map((p) => p[0]).join('').toUpperCase()
    const hhmm = (h, mais) => { const [a, b] = h.split(':').map(Number), m = a * 60 + b + mais; return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}` }
    const ses = E.sessoes || []
    const [hProx, nProx, quando] = String(E.proxima || '').split(' · ')
    if (E.dia) $('.sub').textContent = E.dia.charAt(0).toUpperCase() + E.dia.slice(1).replace(', ', ' · ')
    if (nProx) {
      $('.lbl b').textContent = String(quando || '').toUpperCase()
      $('.who .av').textContent = iniciais(nProx)
      $('.who b').textContent = nProx
      $('.who small').textContent = `${hProx} — ${hhmm(hProx, 50)} · Online`
    }
    const iProx = ses.findIndex(([h]) => h === hProx)
    if (iProx >= 0) alvoLista = iProx + 1
    // a lista do dia: as que já passaram ganham o visto
    $$('.list .sess').forEach((el) => el.remove())
    ses.forEach(([h, n], i) => $('.list').insertAdjacentHTML('beforeend',
      `<div class="sess"><span class="t">${h}</span><div class="av">${iniciais(n)}</div><div>${n}<small>${i % 2 ? 'Presencial' : 'Online'}</small></div>${iProx >= 0 && i < iProx ? '<span class="ok">{{i:check}}</span>' : ''}</div>`))
  }
  if (params.toast) {
    const tn = [...$('.done').childNodes].find((n) => n.nodeType === 3 && n.textContent.trim())
    tn.textContent = params.toast
  }

  // medir antes de qualquer transform; a "câmera" (scale do painel em torno de O) é aplicada à mão nos alvos do cursor
  const a = box(app, 0.5, 0.4), O = { x: a.x, y: a.y }
  const cam = (p, s, dx, dy) => ({ x: O.x + (p.x - O.x) * s + dx, y: O.y + (p.y - O.y) * s + dy })
  const pIniciar = cam(box($('.next .btn.pri'), 0.55, 0.6), 1.05, 0, 30)
  const pList = cam(box($(`.list .sess:nth-of-type(${alvoLista})`), 0.8, 0.6), 1.05, 0, -15)
  // de_atalhos: onde a câmera começa (dentro do card Atalhos, ampliada) — mede agora, antes de qualquer transform
  let zoom0 = null
  if (params.de_atalhos) {
    // o card Atalhos ampliado fica no centro do palco (1080×1170: dentro da área segura nos dois formatos), um pouco abaixo para deixar a headline livre
    const s = params.zoom_atalhos, A = box($('.short'), 0.5, 0.5), st = document.getElementById('stage') || document.getElementById('root')
    zoom0 = { scale: s, x: st.offsetWidth / 2 - O.x - s * (A.x - O.x), y: st.offsetHeight / 2 + params.desloc_atalhos - O.y - s * (A.y - O.y) }
    // a headline fica por cima do painel ampliado (na ordem normal o painel cobriria o topo)
    $$('.hl').forEach((h) => (h.style.zIndex = 6))
  }

  $('.hello').innerHTML = `${texto('saudacao')} <span class="acc">${texto('nome')}</span>`
  params.inteira ? K.flash($('.h5a'), texto('h1'), cue('entra') + 0.05) : K.type($('.h5a'), texto('h1'), f, cue('entra') + 0.05, 34, true)
  K.out($('.h5a'), cue('destaque') - 0.2, 0.2, -30)
  params.inteira ? K.flash($('.h5b'), texto('h2'), cue('destaque')) : K.type($('.h5b'), texto('h2'), f, cue('destaque'), 34, true)
  K.out($('.h5b'), cue('lista') - 0.2, 0.2, -30)
  params.inteira ? K.flash($('.h5c'), texto('h3'), cue('lista')) : K.type($('.h5c'), texto('h3'), f, cue('lista'), 34, true)
  if (zoom0) {
    // a cena nasce com o card Atalhos enchendo o quadro (1º quadro já com conteúdo); a câmera recua até o painel inteiro e o resto aparece na periferia
    const e = cue('entra')
    tl.set(app, { opacity: 1 }, cena.start)
    tl.set($$('.tile'), { opacity: 1, scale: 1 }, cena.start)
    tl.fromTo(app, zoom0, { x: 0, y: 0, scale: 1, ...M.GENTLE, duration: params.recuo_atalhos }, e + params.espera_atalhos)
    // saudação, subtítulo e rodapé só aparecem quando a câmera já recuou (não ficam cortados na borda durante o zoom)
    tl.fromTo([$('.hello'), $('.sub'), $('.illus')], { opacity: 0, y: 16 }, { opacity: 1, y: 0, ...M.FAST, stagger: 0.06 }, e + 0.4)
    tl.fromTo($('.next'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, ...M.FAST }, e + 0.45)
    tl.fromTo($('.list'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, ...M.FAST }, e + 0.55)
    $$('.list .sess').forEach((el, i) => tl.fromTo(el, { opacity: 0, x: -24 }, { opacity: 1, x: 0, ...M.FAST }, e + 0.7 + i * 0.07))
  } else {
    tl.fromTo(app, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power1.out' }, cue('entra') - 0.18)
    tl.fromTo(app, { y: 140, scale: 0.92 }, { y: 0, scale: 1, ...M.GENTLE, duration: 0.9 }, cue('entra') - 0.18)
    tl.fromTo($('.next'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, ...M.FAST }, cue('entra') + 0.15)
    tl.fromTo([$('.list'), $('.short')], { opacity: 0, y: 40 }, { opacity: 1, y: 0, ...M.FAST, stagger: 0.08 }, cue('entra') + 0.25)
    $$('.list .sess').forEach((el, i) => tl.fromTo(el, { opacity: 0, x: -24 }, { opacity: 1, x: 0, ...M.FAST }, cue('entra') + 0.4 + i * 0.07))
    $$('.tile').forEach((el, i) => tl.fromTo(el, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, ...M.SOFT }, cue('entra') + 0.45 + i * 0.07))
  }
  tl.to(app, { scale: 1.05, y: 30, duration: 1.1, ease: M.GENTLE.ease }, cue('destaque') - 0.2)
  tl.fromTo($('.ring5'), { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, ...M.FAST }, cue('destaque'))
  const C = cursor()
  tl.set(C.el, { x: pIniciar.x + 300, y: pIniciar.y + 260 }, cena.start)
  tl.to(C.el, { opacity: 1, duration: 0.2 }, cue('destaque') - 0.1)
  C.move(pIniciar, cue('destaque') - 0.1, 0.65)
  tl.to($('.ring5'), { opacity: 0, duration: 0.25 }, cue('lista') - 0.2)
  tl.to(app, { scale: 1.05, y: -15, duration: 1.1, ease: M.GENTLE.ease }, cue('lista') - 0.2)
  C.move(pList, cue('lista') - 0.15, 0.6)
  tl.to($(`.list .sess:nth-of-type(${alvoLista})`), { backgroundColor: 'var(--ui-glow)', borderColor: 'var(--accent-soft)', duration: 0.25 }, cue('lista') + 0.4)
  C.click(pList, cue('lista') + 0.45)
  if (params.toast && params.toast_de_mensagens) {
    // a peça Mensagens (coral) desce do canto do painel, pousa na ponta do toast e ele se abre a partir dela
    const d = $('.done'), ts = d.offsetHeight, W = d.offsetWidth, pf = cue('feito') - 0.3 // a peça já está caindo quando a palavra chega: sobra pouco entre feito e sai
    app.insertAdjacentHTML('beforeend', `<div class="mpc"><span class="mpi t-coral">{{i:message-circle}}</span></div>`)
    const pc = $('.mpc')
    Object.assign(pc.style, { left: `${d.offsetLeft}px`, top: `${d.offsetTop}px`, width: `${ts}px`, height: `${ts}px`, fontSize: `${Math.round(ts * 0.42)}px` })
    const dx = app.offsetWidth - 70 - ts - d.offsetLeft, dy = -ts - 30 - d.offsetTop
    tl.fromTo(pc, { opacity: 1, x: dx, rotation: -16, scale: 0.9 }, { x: 0, rotation: 0, scale: 1, duration: 0.4, ease: 'power2.out', immediateRender: false }, pf)
    tl.fromTo(pc, { y: dy }, { y: 0, duration: 0.4, ease: 'power3.in', immediateRender: false }, pf)
    tl.fromTo(pc, { scaleY: 1 }, { scaleY: 0.86, duration: 0.07, ease: 'power1.out', yoyo: true, repeat: 1, immediateRender: false }, pf + 0.4)
    tl.set(d, { opacity: 1 }, pf + 0.43)
    tl.fromTo(d, { clipPath: `inset(0px ${W - ts}px 0px 0px round 18px)` }, { clipPath: 'inset(-90px -90px -110px -90px round 18px)', ...M.SOFT, duration: 0.5, immediateRender: false }, pf + 0.43)
    tl.to(pc, { opacity: 0, duration: 0.2, ease: 'power1.in' }, pf + 0.55)
    K.pop($('.done .icon'), pf + 0.62, 0.2)
  } else {
    tl.fromTo($('.done'), { opacity: 0, y: 40, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, ...M.SOFT }, cue('feito'))
    K.pop($('.done .icon'), cue('feito') + 0.12, 0.2)
  }
  tl.to(C.el, { opacity: 0, duration: 0.2 }, cue('sai') - 0.15)
  tl.to(app, { opacity: 0, scale: 0.9, filter: 'blur(10px)', duration: 0.3, ease: 'power2.in' }, cue('sai'))
  K.out($('.h5c'), cue('sai'), 0.28)
})
