/**
 * CTA "navegador": janela de navegador que aparece, digita a URL no campo, o cursor clica em "Ir",
 * a barra carrega e a página abre (logo, frase). Serve de cartão final para qualquer marca e pode
 * passar do fim da locução (o cartão final não precisa durar só o áudio).
 *
 *   No composition.html: link para lib/motion/cta/navegador/navegador.css e script src lib/motion/cta/navegador/navegador.js
 *   (o produce.mjs copia library/motion para lib/motion). Nunca escreva a tag de fechar script neste arquivo: o HyperFrames embute o JS.
 *
 *   KitNavegador.mount(host, { url: 'kz.app.br', tab: 'kz · Plataforma para terapeutas', page: '<div>…</div>' })
 *   // medir o botão "Ir" ANTES de qualquer transform (para o cursor): host.querySelector('.nav-go')
 *   const t = KitNavegador.play(tl, host, { at: T.ev('e27'), typeAt: T.ev('e38'), clickAt: T.ev('e28'), cursor: C, go: {x, y} })
 *   // t = { typeEnd, loaded }   (eventos sugeridos: entrada · digitação · clique; SFX: pop · teclado · clique · ding)
 *
 * Cores e fontes só por tokens (--surface, --border, --text, --primary…), com fallback neutro.
 * Determinístico: tudo é função do tempo da timeline (nada de timers).
 */
;(function () {
  const ICON = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

  window.KitNavegador = {
    mount(host, { url, tab = url, blankTab = 'Nova aba', go = 'Ir', page = '' }) {
      host.classList.add('nav-host')
      host.innerHTML = `
        <div class="nav-win">
          <div class="nav-top">
            <span class="nav-dots"><i></i><i></i><i></i></span>
            <div class="nav-tab"><span class="nav-fav"></span><span class="nav-tt"><b class="nav-t0">${esc(blankTab)}</b><b class="nav-t1">${esc(tab)}</b></span></div>
          </div>
          <div class="nav-bar">
            <div class="nav-field">
              <span class="nav-ic nav-ic0">${ICON.search}</span><span class="nav-ic nav-ic1">${ICON.lock}</span>
              <span class="nav-text">${[...url].map((c) => `<span class="nav-ch">${esc(c)}</span>`).join('')}</span><span class="nav-caret"></span>
            </div>
            <div class="nav-go">${esc(go)}${ICON.arrow}</div>
            <div class="nav-prog"></div>
          </div>
          <div class="nav-page">
            <div class="nav-blank"><i style="width: 46%"></i><i style="width: 70%"></i><i style="width: 58%"></i></div>
            <div class="nav-content">${page}</div>
          </div>
        </div>`
      return host
    },

    play(tl, host, { at, typeAt = at + 0.45, clickAt, cursor, go, ease = 'power3.out' }) {
      const q = (s) => host.querySelector(s)
      const chars = [...host.querySelectorAll('.nav-ch')]
      // entrada da janela
      tl.fromTo(q('.nav-win'), { opacity: 0, y: 60, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease }, at)
      // campo em foco + cursor de texto piscando até o clique
      tl.to(q('.nav-field'), { borderColor: 'var(--primary, #888)', duration: 0.2 }, typeAt - 0.2)
      tl.set(q('.nav-caret'), { opacity: 1 }, typeAt - 0.2)
      // digitação: tempo por letra cabe entre o início e o clique (máx. 0,09 s/letra)
      const per = Math.min(0.09, Math.max(0.03, (clickAt - 0.45 - typeAt) / chars.length))
      chars.forEach((c, i) => tl.set(c, { display: 'inline' }, typeAt + i * per))
      const typeEnd = typeAt + chars.length * per
      // o piscar termina antes do clique (nunca sobra cursor de texto depois)
      const blinks = Math.max(0, Math.floor((clickAt - typeEnd) / 0.25) - 1)
      tl.fromTo(q('.nav-caret'), { opacity: 1 }, { opacity: 0, duration: 0.25, ease: 'steps(1)', repeat: blinks, yoyo: true }, typeEnd)
      // cursor vai ao botão e clica
      if (cursor && go) {
        cursor.move(go, Math.max(at + 0.3, clickAt - 0.7), 0.6)
        cursor.click(go, clickAt)
      }
      tl.to(q('.nav-go'), { scale: 0.94, duration: 0.07, yoyo: true, repeat: 1, ease: 'power2.out' }, clickAt)
      tl.set(q('.nav-caret'), { opacity: 0 }, clickAt + 0.02)
      tl.to(q('.nav-field'), { borderColor: 'var(--border, #ddd)', duration: 0.2 }, clickAt + 0.05)
      // carrega
      tl.fromTo(q('.nav-prog'), { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 0.55, ease: 'power2.inOut' }, clickAt + 0.05)
      tl.to(q('.nav-prog'), { opacity: 0, duration: 0.2 }, clickAt + 0.6)
      tl.to([q('.nav-ic0'), q('.nav-t0')], { opacity: 0, duration: 0.15 }, clickAt + 0.35)
      tl.to([q('.nav-ic1'), q('.nav-t1')], { opacity: 1, duration: 0.2 }, clickAt + 0.4)
      tl.to(q('.nav-fav'), { backgroundColor: 'var(--primary, #888)', duration: 0.2 }, clickAt + 0.4)
      // página abre
      const loaded = clickAt + 0.45
      tl.to(q('.nav-blank'), { opacity: 0, duration: 0.2 }, loaded - 0.05)
      tl.fromTo(q('.nav-content'), { opacity: 0, y: 24, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease }, loaded)
      return { typeEnd, loaded }
    },
  }
})()
