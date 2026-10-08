/**
 * Runtime de blocos (tarefa 045). A composição gerada pelo compor.mjs registra cada bloco com BLOCO(id, fn) e, no fim,
 * chama BLOCOS.montar(tl, plano): para cada instância (cena ou camada) cria o ctx e roda o bloco.
 *
 *   BLOCO('cena/caos-cards', function (ctx) { ... })
 *
 * ctx (tudo que o bloco precisa; nada de tempo, texto ou cor fixos dentro do bloco):
 *   ctx.tl                timeline do GSAP          ctx.id     id da cena na timeline (s2) ou da camada
 *   ctx.root              elemento raiz do bloco    ctx.$ / ctx.$$  seletores só dentro do bloco
 *   ctx.cena              { start, end, dur }       ctx.params  padrões do bloco.json + params da cena
 *   ctx.cue('troca')      segundo do evento da cena com cue "troca" (ou o id do evento, para blocos antigos)
 *   ctx.texto('pergunta') parte do on_screen pela ordem dos slots do bloco.json; ctx.partes() = todas
 *   ctx.fala(i)           id da i-ésima fala da cena (f1)
 *   ctx.K                 ajudantes de texto e entrada (type, flash, out, pop, burst), já presos à tl
 *   ctx.box(el, fx, fy)   ponto fx/fy de um elemento no espaço do palco; meça antes de animar
 *   ctx.cursor()          cria cursor + eco no palco (acima de todas as cenas) e devolve M.cursor (move, click, press) + el
 *
 * Sem tag de fechamento de script neste arquivo (o HyperFrames embute o JS na página).
 */
;(function () {
  const REG = {}
  window.BLOCO = (id, fn) => (REG[id] = fn)

  const fold = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^\w]/g, '')
  const LEAD = 0.14 // a palavra começa a entrar ~4 quadros antes de ser dita

  /** Ajudantes de texto e entrada, os mesmos da v03 da apresentação da kz. */
  function ajudantes(tl) {
    const mark = (text) => text.replace(/\*([^*]+)\*/g, (_, x) => x.split(' ').map((w) => `\u0001${w}`).join(' ')).split(' ')
    const span = (w) => `<span class="w${w.startsWith('\u0001') ? ' acc' : ''}">${w.replace('\u0001', '')}</span>`
    /** Escreve o texto palavra a palavra (*x* = ênfase) e devolve [{node, t}] com o tempo de cada palavra na fala. */
    function words(el, text, vo, from) {
      const said = T.vo(vo).words || []
      let j = 0, prev = from - 0.1
      const ws = mark(text)
      const times = ws.map((w) => {
        const clean = w.replace('\u0001', '')
        const k = said.findIndex((x, i) => i >= j && fold(x.w) === fold(clean))
        const t = k >= 0 ? said[k].s : prev + 0.1
        if (k >= 0) j = k + 1
        prev = t
        return Math.max(from, t - LEAD)
      })
      el.innerHTML = ws.map(span).join(' ')
      return [...el.querySelectorAll('.w')].map((node, i) => ({ node, t: times[i] }))
    }
    return {
      mark, span, words,
      /** Palavras entram subindo e saindo do desfoque, cada uma no seu tempo na fala. */
      type: (el, text, vo, from, dy = 40, firstAtFrom = false) =>
        words(el, text, vo, from).forEach(({ node, t }, i) => (t = firstAtFrom && i === 0 ? from : t, tl.fromTo(node, { opacity: 0, y: dy, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', ...M.FAST, duration: 0.45 }, t))),
      /** Headline curta inteira, em cascata rápida a partir de `at`. */
      flash: (el, text, at, dy = 34) => {
        el.innerHTML = mark(text).map(span).join(' ')
        el.querySelectorAll('.w').forEach((n, i) => tl.fromTo(n, { opacity: 0, y: dy, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', ...M.FAST, duration: 0.42 }, at + i * 0.05))
      },
      out: (sel, at, d = 0.28, y = -36) => tl.to(sel, { opacity: 0, y, filter: 'blur(8px)', duration: d, ease: 'power2.in' }, at),
      pop: (sel, at, from = 0.4) => tl.fromTo(sel, { opacity: 0, scale: from }, { opacity: 1, scale: 1, ...M.SOFT, duration: 0.6 }, at),
      burst: (sel, at, to = 1.35) => tl.fromTo(sel, { opacity: 0.7, scale: 0.85 }, { opacity: 0, scale: to, duration: 0.8, ease: 'power2.out', immediateRender: false }, at),
    }
  }

  function ctxDe(tl, K, item) {
    const root = document.querySelector(`[data-inst="${item.inst}"]`)
    if (!root) throw new Error(`bloco ${item.use}: raiz da instância ${item.inst} não encontrada`)
    const stage = document.getElementById('stage') || document.getElementById('root')
    const sc = item.cena ? T.scene(item.cena) : { start: 0, end: T.duration, dur: T.duration, on_screen: '', params: {} }
    const evs = (T.tl.events || []).filter((e) => e.scene === item.cena)
    const partes = () => String(sc.on_screen || '').split('|')
    const $ = (s) => (typeof s === 'string' ? root.querySelector(s) : s)
    return {
      tl, K, root, id: item.cena || item.inst, use: item.use,
      $, $$: (s) => [...root.querySelectorAll(s)],
      cena: { start: sc.start, end: sc.end, dur: sc.dur },
      params: { ...(item.padroes || {}), ...(sc.params || {}), ...(item.params || {}) },
      partes,
      texto(nome) {
        const i = (item.slots || []).indexOf(nome)
        if (i < 0) throw new Error(`bloco ${item.use}: slot "${nome}" não declarado no bloco.json`)
        return partes()[i] ?? ''
      },
      fala(i = 0) {
        const id = (T.tl.scenes.find((s) => s.id === item.cena)?.vo || [])[i]
        if (!id) throw new Error(`bloco ${item.use} (cena ${item.cena}): sem a fala ${i}`)
        return id
      },
      cue(nome, padrao) {
        const e = evs.find((x) => x.cue === nome) || evs.find((x) => x.id === nome)
        if (e) return e.t
        if (padrao != null) return padrao
        throw new Error(`bloco ${item.use} (cena ${item.cena}): falta o evento com cue "${nome}" na timeline`)
      },
      box(sel, fx = 0.5, fy = 0.5) {
        const s = stage.getBoundingClientRect(), r = $(sel).getBoundingClientRect()
        return { x: r.left - s.left + r.width * fx, y: r.top - s.top + r.height * fy }
      },
      cursor() {
        // no palco, não no bloco: o zoom lento da cena não pode arrastar o cursor (coordenadas = espaço do palco, como o box)
        stage.insertAdjacentHTML('beforeend', `<svg class="k-cursor" data-de="${item.inst}" viewBox="0 0 24 24"><path d="M4 2l16 9-7 2-3 7z" fill="var(--ink)" stroke="var(--surface)" stroke-width="1.5" stroke-linejoin="round" /></svg><div class="k-ripple" data-de="${item.inst}"></div>`)
        const c = stage.querySelector(`.k-cursor[data-de="${item.inst}"]`), r = stage.querySelector(`.k-ripple[data-de="${item.inst}"]`)
        return { el: c, ...M.cursor(tl, c, r) }
      },
    }
  }

  window.BLOCOS = {
    montar(tl, plano) {
      const K = ajudantes(tl)
      for (const item of plano) {
        const fn = REG[item.use]
        if (!fn) throw new Error(`bloco não registrado: ${item.use}`)
        fn(ctxDe(tl, K, item))
      }
    },
  }
})()
