// Caixa que ocupa o resto da tela e rola por dentro: tabelas e grades longas ficam com filtros, números e legendas
// sempre à vista e a página não rola. Usada nas abas de Concorrentes, em Conteúdos, Ideias e Formatos.
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from './kit';

/**
 * Altura para uma caixa ocupar o resto da área que rola (o <main>): mede onde ela começa e quanto conteúdo vem
 * depois dela até o fim da página (avisos, legendas, o respiro do fim da página é descontado e sobra ~12 px), então nada embaixo fica escondido
 * e a página não rola. Recalcula a cada render e quando a página muda de tamanho.
 */
export function useFillHeight() {
  const ref = useRef<HTMLDivElement>(null);
  const [h, setH] = useState<number>();
  useLayoutEffect(() => {
    let ro: ResizeObserver | undefined, raf = 0;
    const fit = () => {
      const el = ref.current;
      const scroller = el?.closest('main');
      if (!el || !scroller) return;
      el.style.marginBottom = '0px'; // mede sem a compensação do respiro (abaixo)
      let page: HTMLElement = el;
      while (page.parentElement && page.parentElement !== scroller) page = page.parentElement;
      const box = el.getBoundingClientRect(), sc = scroller.getBoundingClientRect();
      const top = box.top - sc.top + scroller.scrollTop;
      // o respiro do fim da página (padding de baixo de quem envolve a caixa) não conta: a caixa vai até ~12 px do fim
      let pad = 0;
      for (let p: HTMLElement | null = el.parentElement; p && p !== scroller; p = p.parentElement) {
        const cs = getComputedStyle(p);
        pad += parseFloat(cs.paddingBottom) + parseFloat(cs.borderBottomWidth);
        if (p === page) break;
      }
      const below = Math.max(0, page.getBoundingClientRect().bottom - box.bottom - pad);
      // a caixa invade o respiro do fim da página (margem negativa): termina a ~12 px do fim e a página não rola
      el.style.marginBottom = `${-Math.max(0, pad - 12)}px`;
      setH(Math.max(320, Math.floor(scroller.clientHeight - top - below - 12)));
    };
    // o que carrega depois (painéis acima ou avisos abaixo) muda a página sem renderizar a tabela de novo;
    // na 1ª montagem (rota carregando no Suspense) a caixa ainda pode estar fora do <main>: tenta no quadro seguinte
    const watch = () => {
      const scroller = ref.current?.closest('main');
      if (!scroller) { raf = requestAnimationFrame(watch); return; }
      ro = new ResizeObserver(fit);
      ro.observe(scroller);
      for (const c of scroller.children) ro.observe(c);
      fit();
    };
    watch();
    window.addEventListener('resize', fit);
    return () => { cancelAnimationFrame(raf); ro?.disconnect(); window.removeEventListener('resize', fit); };
  });
  return [ref, h] as const;
}

/** caixa que ocupa o resto da tela e rola por dentro (grades de cards: filtros e números ficam à vista) */
export function FillBox({ children, className }: { children: ReactNode; className?: string }) {
  const [ref, h] = useFillHeight();
  // o respiro lateral evita cortar a borda e a sombra dos cards
  return <div ref={ref} style={{ height: h }} className={cx('overflow-y-auto -mx-1 px-1 pb-1', className)}>{children}</div>;
}
