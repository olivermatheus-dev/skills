BLOCO('revelacao/grade-estados', function ({ tl, K, root, $, $$, cena, cue, texto, params, box }) {
  const v = document.getElementById('root').classList.contains('f-9x16')
  // card Atalhos final: tamanho nativo do painel-inicio (432×445) só com escala k; posição do style frame (coordenadas do palco)
  const k = v ? 1.7 : 1.4
  const CARD = v ? { x: 173, y: 340 } : { x: 238, y: 350 }
  const CORNER = v ? { x: 790, y: 20 } : { x: 880, y: 6 } // Mensagens no canto (96 px)
  const H = { fim: v ? 120 : 110, titulo: 140, font: v ? 70 : 62 }
  const PS = 68 / 52 // a peça é o ícone do atalho (52) a 68; no p3 volta a 52
  const clean = (s) => String(s).replace(/\*/g, '').trim()
  const tS = cena.start, tEnc = cue('encaixe'), tM = cue('marca'), tA = cue('assinatura')
  const tAp = cue('aproxima'), tT = cue('titulo'), tP1 = cue('p1'), tP2 = cue('p2'), tP3 = cue('p3')
  cue('entra')

  // ---------- textos e parâmetros ----------
  const g = $('.grade'), cam = $('.cam'), msg = $('.msg'), logo = $('.logo'), glow = $('.glow4'), tag = $('.tag'), h4 = $('.h4')
  const tiles = $$('.tile'), ics = tiles.map((t) => t.querySelector('.ic')), lbs = tiles.map((t) => t.querySelector('.lb'))
  const rot = params.rotulos || []
  const lab = [rot[3], rot[0], rot[1], rot[2]] // ordem dos tiles: Sessão rápida · Agendar / Novo cliente · Nova anotação
  lbs.forEach((l, i) => (l.textContent = lab[i] ?? ''))
  const tom = (el, t) => { el.className = el.className.replace(/\bt-\w+/g, '').trim() + ' ' + t }
  ;(params.pecas || []).slice(0, 3).forEach((p, i) => { if (p && p[2]) tom(ics[i + 1], p[2]) })
  if (params.pecas && params.pecas[3] && params.pecas[3][2]) tom(msg, params.pecas[3][2])
  $('.badge').textContent = String(params.mensagens ?? 3)
  $('.tag .tx').textContent = clean(texto('assinatura'))

  const tw = clean(texto('titulo')).split(/\s+/)
  const lead = tw.pop()
  const pals = [texto('p1'), texto('p2'), texto('p3')].map(clean)
  h4.innerHTML = `<span class="ln l1">${tw.map((w) => `<span class="w">${w}</span>`).join(' ')}</span><span class="ln l2"><span class="w">${lead}</span><span class="pal">${pals.map((p) => `<span class="pw">${p}</span>`).join('')}</span></span>`
  h4.style.fontSize = H.font + 'px'
  h4.style.top = H.titulo + 'px'
  const pal = $('.pal'), pws = $$('.pw')

  // ---------- medir (antes de qualquer animação) ----------
  gsap.set(g, { x: CARD.x, y: CARD.y, scale: k, transformOrigin: '0 0' })
  const nat = (el, fx = 0, fy = 0) => { const b = box(el, fx, fy); return { x: (b.x - CARD.x) / k, y: (b.y - CARD.y) / k } }
  const icC = ics.map((e) => nat(e, 0.5, 0.5)) // centro do ícone no card nativo
  const tileO = tiles.map((e) => nat(e))
  const N = icC.map((c) => ({ x: c.x + 8, y: c.y + 8 })) // centro da peça (68 px alinhada ao canto do ícone)
  const Gn = { x: N.reduce((a, p) => a + p.x, 0) / 4, y: N.reduce((a, p) => a + p.y, 0) / 4 }
  const cc = { x: 216, y: 222.5 } // centro do card
  // quanto o rótulo sobe para ficar logo abaixo da peça (topo do rótulo = base da peça + 10)
  const dUp = lbs.map((l, i) => Math.max(0, nat(l).y - tileO[i].y - (51 + 34 + 10)))
  const palW = pws.map((e) => e.getBoundingClientRect().width)
  gsap.set(pal, { width: palW[0] })
  // estado do tile i: grade com fator f em torno do centro do card (+ jitter j e giro r)
  const S = (i, f, j = [0, 0], r = 0) => ({ x: cc.x - Gn.x + (N[i].x - Gn.x) * (f - 1) + j[0], y: cc.y - Gn.y + (N[i].y - Gn.y) * (f - 1) + j[1], rotation: r })
  const JIT = [[0, 0], [14, -12], [-16, 14], [10, 16]]
  const R1 = [0, -6, 5, -4]
  const R1b = [0, -3.4, 3.2, -2.2] // giro lento ±2° na espera
  const J1b = [[0, 0], [6, -4], [-6, 5], [4, 6]]
  gsap.set(tiles, { transformOrigin: '43px 43px' })
  gsap.set(ics, { scale: PS, x: 8, y: 8 })

  // pose inicial = último quadro da s3 (cena/dia-do-terapeuta): 4 peças de 96 px em grade 2×2, centros em 540±66 / 585±66
  const START = [null, { x: 474, y: 519 }, { x: 474, y: 651 }, { x: 606, y: 651 }, { x: 606, y: 519 }] // tiles 1..3 = teal, âmbar, lilás; [3]→ usado só se índice 4; coral = START[4]
  const stageOf = (p) => ({ x: CARD.x + p.x * k, y: CARD.y + p.y * k })
  const ringC = stageOf(cc)
  gsap.set(cam, { transformOrigin: `${CARD.x + cc.x * k}px ${CARD.y + cc.y * k}px` })
  gsap.set(msg, { x: START[4].x - 48, y: START[4].y - 48, scale: 1, rotation: 0 })
  gsap.set($('.ring'), { x: ringC.x - 540, y: ringC.y })

  // ---------- logo e assinatura ----------
  tl.fromTo(glow, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1.0, ease: 'power2.out' }, tS)
  // a logo começa no 1º quadro (já com uma fatia visível) e termina no "marca"
  tl.fromTo(logo, { clipPath: 'inset(0 93% 0 0)', scale: 0.94 }, { clipPath: 'inset(0 0% 0 0)', scale: 1, duration: Math.max(0.6, tM - tS), ease: 'power1.out', immediateRender: false }, tS)
  tl.to(logo, { scale: 1.05, duration: 0.18, ease: 'power2.out', yoyo: true, repeat: 1 }, tM)
  K.burst($('.rl'), tM, 1.2)
  tl.to(glow, { scale: 1.12, duration: 0.9, ease: 'sine.inOut', yoyo: true, repeat: 1 }, tM + 0.3)
  tl.fromTo(tag, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ...M.FAST }, tA)
  K.pop($('.tag .tile-ic'), tA + 0.05, 0.3)

  // ---------- Mensagens: já no cluster no 1º quadro, se desprende para o canto ANTES da grade ----------
  tl.set(msg, { opacity: 1 }, tS)
  tl.to(msg, { x: CORNER.x, y: CORNER.y, scale: 1, rotation: 0, duration: 0.85, ease: 'power3.inOut' }, tS + 0.03)

  // ---------- as 3 peças: entram, encaixam, vivem, se aproximam, alinham ----------
  const pick = (s) => ({ x: s.x, y: s.y, rotation: s.rotation })
  const dEnt = Math.max(0.2, tEnc - tS)
  const tEncV = tS + dEnt
  for (let i = 1; i <= 3; i++) {
    const t = tiles[i]
    const c0 = { x: (START[i].x - CARD.x) / k, y: (START[i].y - CARD.y) / k }
    const s0 = { x: c0.x - N[i].x, y: c0.y - N[i].y, rotation: 0 } // pose do último quadro da s3
    const s1 = S(i, 1.2, JIT[i], R1[i])
    const s1b = S(i, 1.2, [JIT[i][0] + J1b[i][0], JIT[i][1] + J1b[i][1]], R1b[i])
    const s2 = S(i, 1.05, [0, 0], 0)
    const s3 = S(i, 1, [0, 0], 0)
    tl.set(t, { opacity: 1, ...pick(s0) }, tS)
    tl.set(ics[i], { scale: PS * 96 / (68 * k) }, tS)
    tl.fromTo(ics[i], { scale: PS * 96 / (68 * k) }, { scale: PS, ...M.SOFT, duration: 0.85 }, tEncV)
    tl.fromTo(t, pick(s0), { ...pick(s1), ...M.SOFT, duration: 0.85 }, tEncV)
    const tv = tEncV + 0.85
    tl.fromTo(t, pick(s1), { ...pick(s1b), duration: Math.max(0.3, tAp - tv - 0.02), ease: 'sine.inOut' }, tv)
    tl.fromTo(t, pick(s1b), { ...pick(s2), ...M.GENTLE, duration: 0.85 }, tAp)
    tl.fromTo(t, pick(s2), { ...pick(s3), ...M.FAST }, tP1)
  }
  // impacto do encaixe: anel discreto no ponto onde as peças se tocam
  K.burst($('.ring'), tEncV, 1.5)
  // câmera respirando durante a espera
  tl.fromTo(cam, { scale: 1 }, { scale: 1.03, duration: Math.max(1, tP3 - tS), ease: 'sine.inOut' }, tS)

  // ---------- título: logo sobe e encolhe, headline inteira (a palavra em ênfase já é a de p1) ----------
  tl.to(logo, { y: -63, scale: 0.46, duration: 0.7, ease: M.GENTLE.ease }, tT)
  tl.to(glow, { y: -120, scale: 0.55, duration: 0.7, ease: M.GENTLE.ease }, tT)
  const ws = [...$$('.h4 .w'), pws[0]]
  ws.forEach((n, i) => tl.fromTo(n, { opacity: 0, y: 34, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', ...M.FAST, duration: 0.42 }, tT + 0.15 + i * 0.05))

  // ---------- p2: Sessão rápida entra por baixo na vaga; rótulos reais; ênfase troca ----------
  const t0 = tiles[0], a0 = S(0, 1)
  tl.fromTo(t0, { x: a0.x, y: a0.y + 380, rotation: 0, opacity: 0 }, { x: a0.x, y: a0.y, rotation: 0, opacity: 1, ...M.SOFT }, tP2)
  ;[1, 2, 3, 0].forEach((i, n) => {
    const at = tP2 + 0.08 + n * 0.06 + (i === 0 ? 0.1 : 0)
    tl.fromTo(lbs[i], { opacity: 0, y: -dUp[i] + 16 }, { opacity: 1, y: -dUp[i], ...M.FAST }, at)
  })
  const swapPal = (a, b, at) => {
    tl.to(pws[a], { opacity: 0, y: -22, filter: 'blur(8px)', duration: 0.2, ease: 'power2.in' }, at)
    tl.fromTo(pws[b], { opacity: 0, y: 26, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', ...M.FAST, duration: 0.45 }, at + 0.1)
    tl.to(pal, { width: palW[b], ...M.GENTLE, duration: 0.6 }, at)
  }
  swapPal(0, 1, tP2)

  // ---------- p3: logo e tagline saem; o card fecha em volta e centraliza; ênfase troca ----------
  swapPal(1, 2, tP3)
  const sai = (el, d = 0) => tl.to(el, { opacity: 0, y: '-=40', filter: 'blur(8px)', duration: 0.3, ease: 'power2.in' }, tP3 + d)
  sai(logo)
  sai(tag, 0.03)
  tl.to(glow, { opacity: 0, duration: 0.4 }, tP3)
  tl.to(h4, { y: H.fim - H.titulo, ...M.GENTLE, duration: 0.9 }, tP3 + 0.1)
  tl.fromTo($('.cardbg'), { opacity: 0, scale: 1.2 }, { opacity: 1, scale: 1, ...M.SOFT, duration: 0.9 }, tP3 + 0.05)
  tl.fromTo($('.cab'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, ...M.FAST }, tP3 + 0.3)
  K.pop($('.cab .icon'), tP3 + 0.38, 0.4)
  const tls = $$('.tl'), shs = $$('.sh')
  tiles.forEach((t, i) => {
    const s3 = S(i, 1)
    tl.fromTo(t, { x: s3.x, y: s3.y, rotation: 0 }, { x: 0, y: 0, rotation: 0, ...M.SOFT, duration: 0.9 }, tP3 + 0.05)
    tl.fromTo(ics[i], { scale: PS, x: 8, y: 8 }, { scale: 1, x: 0, y: 0, ...M.SOFT, duration: 0.9 }, tP3 + 0.05)
    tl.fromTo(lbs[i], { y: -dUp[i] }, { y: 0, ...M.SOFT, duration: 0.9 }, tP3 + 0.05)
    tl.fromTo(tls[i], { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power1.out' }, tP3 + 0.3 + i * 0.05)
    tl.to(shs[i], { opacity: 0, duration: 0.4, ease: 'power1.out' }, tP3 + 0.15)
  })

  // ---------- câmera contínua para a s5: zoom em torno do centro do card nos últimos instantes ----------
  const zf = Number(params.zoom_fim ?? 1.05)
  const tZ = Math.min(tP3 + 0.55, cena.end - 0.45)
  tl.fromTo(cam, { scale: 1.03 }, { scale: 1.03 * zf, duration: Math.max(0.3, cena.end - tZ), ease: 'power2.inOut' }, tZ)
  tl.set(root, { opacity: 0 }, cena.end)
})
