# Layout Spec — `/company-preview`

Especificação do CSS do layout (sidebar fixa + main + componentes). Injetar dentro do placeholder `{{CSS_LAYOUT}}` do html-template.html.

---

## CSS completo — copiar e colar

```css
/* Reset */
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font-family: var(--font-primary);
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--fg-primary);
  background: var(--bg-base);
  -webkit-font-smoothing: antialiased;
}

/* Skip link (acessibilidade) */
.skip-link {
  position: absolute; top: -40px; left: var(--space-4);
  background: var(--brand); color: white;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  text-decoration: none;
  z-index: 100;
}
.skip-link:focus { top: var(--space-4); }

/* Layout base */
body {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
}

/* Sidebar */
.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  background: var(--bg-surface);
  border-right: 1px solid var(--border-default);
  padding: var(--space-5) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.sidebar-header { padding-bottom: var(--space-4); border-bottom: 1px solid var(--border-subtle); }
.company-name {
  font-size: var(--text-xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 var(--space-1);
  color: var(--fg-primary);
}
.sidebar-meta {
  font-size: var(--text-xs);
  color: var(--fg-muted);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.sidebar-meta.small { font-size: 10px; }
.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: var(--space-1); }
.sidebar-nav a {
  display: block;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  color: var(--fg-secondary);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
}
.sidebar-nav a:hover { background: var(--brand-10); color: var(--fg-primary); }
.sidebar-nav a.active { background: var(--brand-10); color: var(--brand); font-weight: 600; }
.sidebar-footer { padding-top: var(--space-4); border-top: 1px solid var(--border-subtle); }
.sidebar-footer code {
  background: var(--bg-elevated);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 11px;
}

/* Main */
.main {
  padding: var(--space-7) var(--space-7);
  max-width: 920px;
  width: 100%;
  margin: 0;
}
.main > section { margin-bottom: var(--space-8); scroll-margin-top: var(--space-5); }

/* Typography */
h1, h2, h3, h4 { color: var(--fg-primary); margin: 0 0 var(--space-3); letter-spacing: -0.02em; line-height: 1.1; }
h1 { font-size: var(--text-4xl); font-weight: 800; margin-bottom: var(--space-4); }
h2 { font-size: var(--text-3xl); font-weight: 700; margin-top: var(--space-7); padding-bottom: var(--space-2); border-bottom: 1px solid var(--border-default); }
h3 { font-size: var(--text-xl); font-weight: 600; margin-top: var(--space-5); }
h4 { font-size: var(--text-lg); font-weight: 600; margin-top: var(--space-4); }
p { margin: 0 0 var(--space-3); }
a { color: var(--brand); text-decoration: none; border-bottom: 1px solid var(--brand-40); }
a:hover { border-bottom-color: var(--brand); }
code { font-family: var(--font-mono); background: var(--bg-surface); padding: 2px 6px; border-radius: var(--radius-sm); font-size: 0.9em; }
pre { background: var(--bg-surface); padding: var(--space-4); border-radius: var(--radius-md); overflow-x: auto; font-family: var(--font-mono); font-size: var(--text-sm); }

/* Componentes */

/* Hero (Overview section) */
.hero {
  padding: var(--space-7) 0 var(--space-6);
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: var(--space-6);
}
.hero .tagline {
  font-size: var(--text-xl);
  color: var(--fg-secondary);
  font-weight: 400;
  margin: 0 0 var(--space-4);
  max-width: 640px;
}
.hero .badge {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  background: var(--brand-10);
  color: var(--brand);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-3);
}

/* Grid layouts */
.grid { display: grid; gap: var(--space-4); }
.grid-2 { grid-template-columns: 1fr 1fr; }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
@media (max-width: 768px) {
  .grid-2, .grid-3 { grid-template-columns: 1fr; }
}

/* Card */
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  transition: border-color 0.15s;
}
.card:hover { border-color: var(--brand-40); }
.card h3, .card h4 { margin-top: 0; }
.card p:last-child { margin-bottom: 0; }

/* Key-value list (dl) */
dl.kv { margin: 0; display: grid; grid-template-columns: auto 1fr; gap: var(--space-2) var(--space-4); }
dl.kv dt { color: var(--fg-secondary); font-size: var(--text-sm); font-weight: 500; text-transform: uppercase; letter-spacing: 0.03em; }
dl.kv dd { margin: 0; color: var(--fg-primary); }

/* Big quote (Big Idea, proposta de valor) */
blockquote.hero-quote {
  font-size: var(--text-2xl);
  font-weight: 600;
  line-height: 1.3;
  color: var(--fg-primary);
  border-left: 4px solid var(--brand);
  padding: var(--space-4) var(--space-5);
  margin: var(--space-5) 0;
  background: var(--brand-05);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

/* Chips (vocabulário, tags) */
.chips { display: flex; flex-wrap: wrap; gap: var(--space-2); margin: var(--space-3) 0; }
.chip {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  background: var(--brand-10);
  color: var(--brand);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 500;
}
.chip.negative { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
.chip.neutral { background: var(--bg-surface); color: var(--fg-secondary); border: 1px solid var(--border-default); }

/* Badges (numerados, status) */
.badge {
  display: inline-block;
  padding: var(--space-1) var(--space-2);
  background: var(--brand-10);
  color: var(--brand);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.badge.success { background: rgba(16, 185, 129, 0.1); color: var(--success); }
.badge.warning { background: rgba(245, 158, 11, 0.1); color: var(--warning); }

/* Spectrum slider (Brand Voice) */
.spectrum { margin: var(--space-4) 0; }
.spectrum-label { display: flex; justify-content: space-between; font-size: var(--text-sm); color: var(--fg-secondary); margin-bottom: var(--space-2); }
.spectrum-track { position: relative; height: 6px; background: var(--bg-surface); border-radius: var(--radius-full); border: 1px solid var(--border-subtle); }
.spectrum-marker {
  position: absolute;
  top: -5px;
  width: 16px; height: 16px;
  background: var(--brand);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
  transform: translateX(-50%);
}
.spectrum-value { text-align: center; font-size: var(--text-xs); color: var(--fg-muted); margin-top: var(--space-1); }

/* Swatches (Visual Identity) */
.swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: var(--space-3); margin: var(--space-4) 0; }
.swatch {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s;
}
.swatch:hover { transform: translateY(-2px); }
.swatch-color { height: 80px; }
.swatch-meta { padding: var(--space-2) var(--space-3); }
.swatch-name { font-size: var(--text-sm); font-weight: 600; color: var(--fg-primary); display: block; }
.swatch-hex { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--fg-muted); display: block; }

/* Font sample */
.font-sample { margin: var(--space-3) 0; padding: var(--space-4); background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--border-default); }
.font-sample-name { font-size: var(--text-xs); color: var(--fg-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; margin-bottom: var(--space-2); }
.font-sample-text { font-size: var(--text-3xl); line-height: 1.1; margin: 0; }

/* Table */
table { width: 100%; border-collapse: collapse; margin: var(--space-4) 0; font-size: var(--text-sm); }
th { text-align: left; padding: var(--space-2) var(--space-3); background: var(--bg-surface); color: var(--fg-secondary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; font-size: var(--text-xs); border-bottom: 2px solid var(--border-default); }
td { padding: var(--space-3); border-bottom: 1px solid var(--border-subtle); vertical-align: top; }
tr:last-child td { border-bottom: none; }

/* Accordion (details/summary) */
details {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  margin-bottom: var(--space-3);
}
details[open] { border-color: var(--brand-40); }
summary { cursor: pointer; font-weight: 600; color: var(--fg-primary); list-style: none; display: flex; align-items: center; gap: var(--space-2); }
summary::before { content: "›"; font-size: 1.2em; color: var(--brand); transition: transform 0.15s; }
details[open] summary::before { transform: rotate(90deg); }
details > *:not(summary) { margin-top: var(--space-3); }

/* Footer */
.main-footer {
  margin-top: var(--space-8);
  padding-top: var(--space-5);
  border-top: 1px solid var(--border-default);
  color: var(--fg-muted);
  font-size: var(--text-sm);
}

/* Mobile */
.mobile-menu-toggle {
  display: none;
  position: fixed;
  top: var(--space-4); right: var(--space-4);
  width: 40px; height: 40px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--fg-primary);
  align-items: center;
  justify-content: center;
  z-index: 50;
  box-shadow: var(--shadow-md);
}

@media (max-width: 768px) {
  body { grid-template-columns: 1fr; }
  .sidebar {
    position: fixed;
    top: 0; left: 0;
    width: 260px;
    z-index: 40;
    transform: translateX(-100%);
    transition: transform 0.2s;
    box-shadow: var(--shadow-lg);
  }
  .sidebar[data-open="true"] { transform: translateX(0); }
  .main { padding: var(--space-5) var(--space-4); padding-top: var(--space-8); }
  .mobile-menu-toggle { display: flex; }
  h1 { font-size: var(--text-3xl); }
  h2 { font-size: var(--text-2xl); }
}
```

---

## JavaScript inline (placeholder `{{INLINE_SCRIPT}}`)

```javascript
// Smooth scroll + section highlighting + color copy + mobile menu
(function() {
  // Smooth scroll — já é default via scroll-behavior:smooth se quiser adicionar
  // Implementado aqui com comportamento custom para offset
  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (!id.startsWith('#')) return;
      e.preventDefault();
      const target = document.querySelector(id);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // fecha drawer em mobile
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) sidebar.setAttribute('data-open', 'false');
    });
  });

  // Section highlighting via IntersectionObserver
  const sections = document.querySelectorAll('.main > section[id]');
  const navLinks = new Map();
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    const id = a.getAttribute('href').replace('#', '');
    navLinks.set(id, a);
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
        const link = navLinks.get(id);
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  sections.forEach(s => observer.observe(s));

  // Copy color hex on swatch click
  document.querySelectorAll('.swatch').forEach(swatch => {
    swatch.addEventListener('click', async () => {
      const hex = swatch.querySelector('.swatch-hex')?.textContent?.trim();
      if (!hex) return;
      try {
        await navigator.clipboard.writeText(hex);
        const original = swatch.querySelector('.swatch-name').textContent;
        swatch.querySelector('.swatch-name').textContent = 'Copiado!';
        setTimeout(() => { swatch.querySelector('.swatch-name').textContent = original; }, 1200);
      } catch {}
    });
  });

  // Mobile menu toggle
  const toggle = document.querySelector('.mobile-menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      const open = sidebar.getAttribute('data-open') === 'true';
      sidebar.setAttribute('data-open', String(!open));
      toggle.setAttribute('aria-expanded', String(!open));
    });
  }
})();
```

---

## Notas de implementação

- Scroll behavior `smooth` está inline no JS (dá controle fino); não usar `scroll-behavior: smooth` no `html` para evitar conflito.
- `IntersectionObserver` cobre 99%+ dos browsers modernos. Sem polyfill.
- Copy-to-clipboard usa `navigator.clipboard.writeText` (HTTPS ou localhost). Em arquivos `file://` pode falhar silenciosamente — o `try/catch` ignora.
- Mobile menu usa `[data-open]` attribute para animar sidebar.
