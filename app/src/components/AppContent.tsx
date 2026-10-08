// Envoltório único do conteúdo de cada página: largura máxima, centralizado e com o respiro lateral padrão.
// Em monitor grande o conteúdo não gruda à esquerda. `wide` = telas cheias (Quadro, Mockups); `narrow` = formulários.
import type { HTMLAttributes } from 'react';
import { cx } from './kit';

export const CONTENT_MAX = 'max-w-[1440px]';
export const CONTENT_MAX_WIDE = 'max-w-[2200px]';

export function AppContent({ wide, narrow, flush, className, ...p }: HTMLAttributes<HTMLDivElement> & { wide?: boolean; narrow?: boolean; flush?: boolean }) {
  return <div {...p} className={cx('mx-auto w-full', narrow ? 'max-w-4xl' : wide ? CONTENT_MAX_WIDE : CONTENT_MAX, !flush && 'px-8 py-8', className)} />;
}
