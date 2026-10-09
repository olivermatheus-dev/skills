// Seções de lista da persona (dores, desejos…): ícone, tom e como aparecem. Usadas no card e no painel.
import { Frown, Megaphone, MessageSquareQuote, ShieldQuestion, Sparkles, Zap, type LucideIcon } from 'lucide-react';

export type ListKey = 'pains' | 'desires' | 'objections' | 'triggers' | 'channels' | 'quotes';
export interface SectionDef {
  key: ListKey; label: string; short: string; icon: LucideIcon;
  /** tile do ícone (fundo + cor) e marcador dos itens */
  tile: string; dot: string;
  placeholder: string; hint?: string;
  view: 'bullets' | 'chips' | 'quotes';
}

export const SECTIONS: SectionDef[] = [
  { key: 'pains', label: 'Dores', short: 'dores', icon: Frown, tile: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500', placeholder: 'Uma dor por linha', view: 'bullets' },
  { key: 'desires', label: 'Desejos', short: 'desejos', icon: Sparkles, tile: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', placeholder: 'Um desejo por linha', view: 'bullets' },
  { key: 'objections', label: 'Objeções', short: 'objeções', icon: ShieldQuestion, tile: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500', placeholder: 'Uma objeção por linha', view: 'bullets' },
  { key: 'triggers', label: 'Gatilhos de compra', short: 'gatilhos', icon: Zap, tile: 'bg-ai-soft text-ai-ink', dot: 'bg-ai', placeholder: 'O que faz agir agora', view: 'bullets' },
  { key: 'channels', label: 'Onde encontrar', short: 'canais', icon: Megaphone, tile: 'bg-sky-50 text-sky-700', dot: 'bg-sky-500', placeholder: 'Onde está (Instagram, grupos de WhatsApp…)', view: 'chips' },
  { key: 'quotes', label: 'Frases reais', short: 'frases', icon: MessageSquareQuote, tile: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400', placeholder: 'Como ela fala, uma frase por linha', hint: 'Só frases ouvidas de verdade, nunca inventadas.', view: 'quotes' },
];
export const LISTS = SECTIONS.map((s) => s.key);
