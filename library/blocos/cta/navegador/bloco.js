BLOCO('cta/navegador', function ({ tl, K, $, $$, cena, cue, texto, box, cursor, params }) {
  // formato do palco e valores por formato ({ "4x5": …, "9x16": … } ou valor único)
  const fmt = document.getElementById('root').classList.contains('f-9x16') ? '9x16' : '4x5'
  const pf = (v) => (v && typeof v === 'object' ? v[fmt] : v)
  const cor = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() // cor do token, resolvida (o GSAP não anima var())
  const PRIMARY = cor('--primary') || '#888', BORDER = cor('--border') || '#ddd'
  const E = cue('entra'), D = cue('digita'), C = cue('clique'), L = cue('carregando'), R = cue('carrega')
  const F = cue('fecha', cena.end - 1.2)

  // ── montagem (texto, página, geometria) ──
  const win = $('.nav-win'), w = pf(params.largura), h = pf(params.altura)
  Object.assign(win.style, { left: `${(1080 - w) / 2}px`, top: `${pf(params.y)}px`, width: `${w}px`, height: `${h}px` })
  const tit = $('.nav-titulo'), fra = $('.nav-frase')
  tit.style.top = `${pf(params.titulo_y)}px`; tit.style.fontSize = `${params.titulo_tam}px`
  fra.style.top = `${pf(params.frase_y)}px`; fra.style.fontSize = `${params.frase_tam}px`
  const url = texto('url')
  $('.nav-text').innerHTML = [...url].map((c) => `<span class="nav-ch">${c.replace('&', '&amp;').replace('<', '&lt;')}</span>`).join('')
  $('.nav-go').textContent = params.ir
  $('.nav-t0').textContent = params.aba_vazia
  $('.nav-t1').textContent = params.aba || url
  $('.nav-cam').innerHTML = params.pagina || ''
  $('.nav-cam').style.transformOrigin = params.camera_origem
  // favicon: o do param, o logo da página (.marca) ou um quadrado na cor primária
  const marca = $('.nav-cam .marca')
  $('.nav-fico').innerHTML = params.favicon || (marca ? marca.innerHTML : `<i style="display:block;width:100%;height:100%;border-radius:6px;background:var(--primary)"></i>`)
  const rod = $('.nav-rodape')
  if (params.rodape) { rod.textContent = params.rodape; rod.style.top = `${pf(params.rodape_y)}px` } else rod.remove()

  // ── medir antes de qualquer transform (o fromTo aplica o "de" na hora) ──
  const TIP = { x: 10, y: 5 } // ponta do cursor dentro do SVG de 60 px
  const ir = box('.nav-go', 0.86, 0.8) // ponta na borda do botão, sem cobrir "Ir"
  const naBarra = box('.nav-field', 0.52, 0.55)
  const aim = (p) => ({ x: p.x - TIP.x, y: p.y - TIP.y })

  // ── 1. entra: título inteiro e a aba abre vazia ──
  K.flash(tit, texto('titulo'), E)
  tl.fromTo(win, { opacity: 0, y: 60, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, ...M.GENTLE, duration: 0.8 }, E)
  const C0 = cursor()
  tl.set(C0.el, { ...aim(naBarra) }, cena.start)
  tl.to(C0.el, { opacity: 1, duration: 0.25 }, E + 0.35)

  // ── 2. digita: campo em foco, caret piscando, URL letra a letra ──
  const chars = $$('.nav-ch')
  tl.to($('.nav-field'), { borderColor: PRIMARY, duration: 0.2 }, D - 0.2)
  tl.set($('.nav-caret'), { opacity: 1 }, D - 0.2)
  const per = Math.min(0.09, Math.max(0.03, (C - 0.7 - D) / chars.length))
  chars.forEach((c, i) => tl.set(c, { display: 'inline' }, D + i * per))
  const typeEnd = D + chars.length * per
  const blinks = Math.max(0, Math.floor((C - typeEnd) / 0.25) - 1)
  if (blinks > 0) tl.fromTo($('.nav-caret'), { opacity: 1 }, { opacity: 0, duration: 0.25, ease: 'steps(1)', repeat: blinks, yoyo: true, immediateRender: false }, typeEnd)

  // ── 3. clique: o cursor vai ao Ir e clica (eco só no instante do clique: immediateRender false no M.cursor) ──
  const go = aim(ir)
  C0.move(go, Math.max(E + 0.3, C - 0.7), 0.6)
  C0.click(ir, C)
  tl.to($('.nav-go'), { scale: 0.94, duration: 0.07, yoyo: true, repeat: 1, ease: 'power2.out' }, C)
  tl.set($('.nav-caret'), { opacity: 0 }, C + 0.02)
  tl.to($('.nav-field'), { borderColor: BORDER, duration: 0.2 }, C + 0.05)
  tl.to($('.nav-ic0'), { opacity: 0, duration: 0.15 }, C + 0.3)
  tl.to($('.nav-ic1'), { opacity: 1, duration: 0.2 }, C + 0.35)
  // a aba começa a carregar: o favicon vira um anel girando e a barra dá o primeiro passo
  tl.fromTo($('.nav-spin'), { opacity: 0 }, { opacity: 1, duration: 0.15 }, C + 0.05)
  tl.fromTo($('.nav-spin'), { rotation: 0 }, { rotation: 360 * Math.max(1, Math.round((R - C) / 0.6)), duration: R - C, ease: 'none', immediateRender: false }, C + 0.05)
  tl.fromTo($('.nav-prog'), { scaleX: 0, opacity: 1 }, { scaleX: 0.18, duration: 0.35, ease: 'power2.out', immediateRender: false }, C + 0.05)

  // ── 4. carregando: barra corre, esqueleto da página com brilho, a frase entra embaixo ──
  const prog = $('.nav-prog'), sk = $('.nav-sk')
  const t1 = Math.max(L, C + 0.45), d1 = Math.max(0.3, R - 0.3 - t1)
  tl.fromTo(prog, { scaleX: 0.18 }, { scaleX: 0.82, duration: d1, ease: 'power2.out', immediateRender: false }, t1)
  tl.fromTo(prog, { scaleX: 0.82 }, { scaleX: 1, duration: 0.3, ease: 'power2.in', immediateRender: false }, t1 + d1)
  tl.to(prog, { opacity: 0, duration: 0.2 }, Math.max(R + 0.05, t1 + d1 + 0.3))
  tl.to($('.nav-blank'), { opacity: 0, duration: 0.25 }, L)
  tl.fromTo(sk, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.3, ease: M.GENTLE.ease }, L)
  const passes = Math.max(1, Math.floor((R - L) / 0.9))
  tl.fromTo($('.nav-shine'), { x: '-120%' }, { x: '420%', duration: 0.75, ease: 'power1.inOut', repeat: passes - 1, repeatDelay: 0.15 }, L + 0.1)
  K.flash(fra, texto('frase'), L, 30)

  // ── 5. carrega: a aba ganha título e favicon, a página aparece por cima do esqueleto ──
  tl.to($('.nav-spin'), { opacity: 0, duration: 0.15 }, R)
  tl.to($('.nav-t0'), { opacity: 0, duration: 0.15 }, R)
  tl.to($('.nav-t1'), { opacity: 1, duration: 0.2 }, R + 0.05)
  tl.fromTo($('.nav-fico'), { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, ...M.SOFT, duration: 0.5 }, R + 0.05)
  const content = $('.nav-content'), cam = $('.nav-cam')
  tl.fromTo(content, { opacity: 0, y: 24, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, ease: M.GENTLE.ease, duration: 0.6 }, R)
  tl.to(sk, { opacity: 0, duration: 0.3 }, R + 0.1)
  // os blocos da página entram em cascata curta (o 1º filho da raiz da página, ou ela mesma)
  const raiz = cam.children.length === 1 ? cam.firstElementChild : cam
  const filhos = [...raiz.children].filter((e) => e.tagName !== 'STYLE')
  if (filhos.length) tl.fromTo(filhos, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ...M.FAST, stagger: 0.09 }, R + 0.05)
  if (params.rodape) tl.to(rod, { opacity: 1, duration: 0.4 }, R)

  // ── 6. vivo até o fim da cena (cauda sem fala): cursor respira no Ir e some antes da câmera; página em drift ──
  const bob = [[5, 4], [-3, -2], [4, 3], [-2, -3], [3, 2]]
  let tb = R + 0.3
  for (const [dx, dy] of bob) {
    if (tb + 0.7 > F - 0.15) break
    tl.to(C0.el, { x: go.x + dx, y: go.y + dy, duration: 0.7, ease: 'sine.inOut' }, tb)
    tb += 0.7
  }
  tl.to(C0.el, { opacity: 0, duration: 0.25 }, Math.max(tb, F - 0.25))

  // ── 7. fecha: câmera na página (a janela não muda) e pulso leve na marca ──
  const cz = params.camera
  tl.fromTo(cam, { scale: 1 }, { scale: 1.03, duration: Math.max(0.1, F - R), ease: 'none' }, R)
  tl.fromTo(cam, { scale: 1.03 }, { scale: cz, duration: 0.9, ease: M.GENTLE.ease, immediateRender: false }, F)
  const resto = cena.end - (F + 0.9)
  if (resto > 0.2) tl.fromTo(cam, { scale: cz }, { scale: cz * 1.005, duration: resto, ease: 'none', immediateRender: false }, F + 0.9)
  if (marca) {
    const logo = $('.nav-cam .marca')
    tl.fromTo(logo, { scale: 1 }, { scale: 1.16, duration: 0.24, yoyo: true, repeat: 1, ease: 'power2.inOut' }, F + 0.2)
    if (cena.end - (F + 0.2) > 1.7) tl.fromTo(logo, { scale: 1 }, { scale: 1.1, duration: 0.24, yoyo: true, repeat: 1, ease: 'power2.inOut', immediateRender: false }, F + 1.5)
  }
})
