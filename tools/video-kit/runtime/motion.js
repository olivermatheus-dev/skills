/**
 * O vocabulário de movimento dos vídeos do hub (veio do kit do Ludus, que trouxe da skill `motion-broll`
 * e foi adaptado ao GSAP do HyperFrames).
 *
 * **Molas em forma fechada.** Cada curva é a resposta ao degrau de uma mola amortecida, calculada
 * em função do tempo — nada de timer, então qualquer quadro se renderiza sozinho, como o
 * HyperFrames exige. `bounce` é o quanto passa do alvo (0 = sem passar; 0,08 = passa 8 % e volta).
 *
 *   tl.to(el, { x: 200, duration: M.FAST.duration, ease: M.FAST.ease }, t)
 *   tl.to(el, { x: 200, ...M.FAST }, t)          // o mesmo, mais curto
 *
 * Carregue depois do GSAP, com uma tag script apontando para brand/motion.js. (Nada de tag de
 * script escrita neste arquivo: o HyperFrames embute o código na página, e um fecho de tag aqui
 * dentro encerra o script antes da hora — o código vira texto na tela.)
 */
;(function () {
  /**
   * Curva de mola para o GSAP. `bounce` é a ultrapassagem, em fração do percurso (0,08 = passa
   * 8 % do alvo e volta). A duração da mola é a do tween: ela é afinada para assentar (resíduo de
   * 0,1 %) exatamente em p = 1, então o último quadro não pula.
   */
  function spring(bounce = 0) {
    if (bounce <= 0) {
      const w = 9.2
      return (p) => (p >= 1 ? 1 : 1 - (1 + w * p) * Math.exp(-w * p))
    }
    const ln = Math.log(Math.min(bounce, 0.9))
    const zeta = -ln / Math.sqrt(Math.PI * Math.PI + ln * ln)
    const w = 6.9 / zeta
    const wd = w * Math.sqrt(1 - zeta * zeta)
    return (p) => {
      if (p >= 1) return 1
      const e = Math.exp(-zeta * w * p)
      return 1 - e * (Math.cos(wd * p) + ((zeta * w) / wd) * Math.sin(wd * p))
    }
  }

  const preset = (bounce, duration) => ({ ease: spring(bounce), duration })

  const M = {
    spring,

    /**
     * Atrasa o relógio da cena em `offset` segundos — é como o produce.mjs faz o segundo passe do
     * motion blur (meio quadro de 60 atrás). Desloca os filhos da linha do tempo em vez de
     * embrulhá-la: o HyperFrames só reconhece a linha registrada literalmente, e um embrulho
     * deixava a original solta, com todos os estados sobrepostos (medido no 002). E só atrasa:
     * deslocar para trás de zero faz o GSAP reposicionar a linha, e o passe sai no tempo errado.
     *   window.__timelines = window.__timelines || {}
     *   window.__timelines['main'] = M.offset(tl, __TIME_OFFSET__)
     */
    offset(tl, offset = 0) {
      if (offset > 0) tl.shiftChildren(offset, true)
      tl.seek(0)
      return tl
    },
    /** Estado que troca e some — sem passar do alvo. */
    SNAP: preset(0, 0.4),
    /** Destaque que corre por baixo de um item (a skill avisa: sem ele, a linha fica vazia um instante). */
    FAST: preset(0.04, 0.5),
    /** O padrão: cartão, painel, janela. Passa 8 % e volta. */
    SOFT: preset(0.08, 0.8),
    /** Câmera e movimentos grandes: devagar, quase sem passar. */
    GENTLE: preset(0.02, 1.2),

    /**
     * Troca de conteúdo com desfoque curto: o que sai some borrando e encolhendo um pouco, o que
     * entra chega nítido logo depois. A skill: sem saída e entrada separadas, os textos se sobrepõem.
     */
    swap(tl, out, into, at, { out: dOut = 0.18, in: dIn = 0.32, gap = 0.08 } = {}) {
      if (out) tl.to(out, { opacity: 0, filter: 'blur(8px)', scale: 0.98, duration: dOut, ease: 'power2.in' }, at)
      if (into)
        tl.fromTo(
          into,
          { opacity: 0, filter: 'blur(8px)', scale: 1.02 },
          { opacity: 1, filter: 'blur(0px)', scale: 1, duration: dIn, ease: spring(0) },
          at + gap,
        )
    },

    /**
     * Indicador que se estica ao andar: a borda da frente vai numa mola rápida, a de trás numa
     * lenta — o efeito é o `scaleX` crescendo a partir da borda de trás e voltando.
     */
    stretchTo(tl, el, to, at, { duration = 0.5, stretch = 0.22 } = {}) {
      // o eixo do estique é o do movimento; a direção não se lê na montagem (a linha do tempo
      // ainda não rodou), então estica pelo centro
      const scale = 'y' in to && !('x' in to) ? 'scaleY' : 'scaleX'
      tl.to(el, { ...to, duration, ease: spring(0.06) }, at)
      tl.to(el, { [scale]: 1 + stretch, transformOrigin: '50% 50%', duration: duration * 0.35, ease: 'power2.out' }, at)
      tl.to(el, { [scale]: 1, duration: duration * 0.65, ease: spring(0.1) }, at + duration * 0.35)
    },

    /**
     * O cursor que conduz a cena: `move` vai até um ponto, `click` aperta, solta e deixa um eco.
     * Coordenadas no espaço do pai do cursor; meça antes de aplicar qualquer transform.
     */
    cursor(tl, cursorEl, rippleEl) {
      return {
        move: (to, at, duration = 0.7) => tl.to(cursorEl, { x: to.x, y: to.y, duration, ease: 'power3.inOut' }, at),
        click: (to, at) => {
          tl.to(cursorEl, { scale: 0.82, duration: 0.07, ease: 'power2.out' }, at)
          tl.to(cursorEl, { scale: 1, duration: 0.3, ease: spring(0.3) }, at + 0.08)
          if (rippleEl) {
            tl.set(rippleEl, { x: to.x, y: to.y }, at)
            tl.fromTo(rippleEl, { scale: 0.2, opacity: 0.9 }, { scale: 1.3, opacity: 0, duration: 0.55, ease: 'power2.out', immediateRender: false }, at) // senão o anel aparece desde o quadro 0
          }
        },
        press: (el, at) => tl.to(el, { scale: 0.95, duration: 0.07, yoyo: true, repeat: 1, ease: 'power2.out' }, at),
      }
    },
  }

  window.M = M
})()
