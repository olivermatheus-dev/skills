// Vocabulário do banco de ideias (rótulos pt-BR dos enums do schema/idea.ts).
import type { Idea } from '../../api';

export type Status = Idea['status'];
export type Objective = NonNullable<Idea['objective']>;
export type Tone = NonNullable<Idea['tone']>;

export const STATUSES: { id: Status; label: string; dot: string }[] = [
  { id: 'nova', label: 'Nova', dot: 'bg-sky-500' },
  { id: 'analisada', label: 'Analisada', dot: 'bg-amber-500' },
  { id: 'aprovada', label: 'Aprovada', dot: 'bg-emerald-500' },
  { id: 'virou-tarefa', label: 'Virou tarefa', dot: 'bg-indigo-500' },
  { id: 'descartada', label: 'Descartada', dot: 'bg-zinc-400' },
];

export const OBJECTIVES: { id: Objective; label: string; color: string }[] = [
  { id: 'informar', label: 'Informar', color: '#0284c7' },
  { id: 'novidade', label: 'Novidade', color: '#7c3aed' },
  { id: 'curiosidade', label: 'Curiosidade', color: '#d97706' },
  { id: 'engajar', label: 'Engajar', color: '#db2777' },
  { id: 'converter', label: 'Converter', color: '#16a34a' },
  { id: 'polemica', label: 'Polêmica', color: '#dc2626' },
];

export const TONES: { id: Tone; label: string }[] = [
  { id: 'dramatico', label: 'Dramático' },
  { id: 'epico', label: 'Épico' },
  { id: 'animado', label: 'Animado / divertido' },
  { id: 'inspirador', label: 'Inspirador' },
  { id: 'calmo', label: 'Calmo / acolhedor' },
  { id: 'urgente', label: 'Urgente / direto' },
  { id: 'curioso', label: 'Curioso / misterioso' },
];

export const FORMATS = [
  'fmt-trailer-lancamento', 'fmt-recorte-funcionalidade', 'fmt-texto-cinetico', 'fmt-dialogo', 'fmt-3d-produto',
  'fmt-post-frase', 'fmt-meme', 'fmt-antes-depois', 'fmt-carrossel-educativo',
];

export const label = <T extends { id: string; label: string }>(list: T[], id?: string) => list.find((x) => x.id === id)?.label ?? id ?? '';

/** Ficha de pauta (tarefa 012 §5): contrato de cada peça. */
export const FICHA_TEMPLATE = `## Objetivo

_Um só: informar · novidade · curiosidade · engajar · converter · polêmica (raro, com aval)._

## Mensagem principal

_Em 1 frase: o que a pessoa leva._

## Público e consciência

_Persona e nível de consciência (1 inconsciente do problema → 5 pronto para comprar)._

## Gancho (nunca engana)

_Tipo + texto. A promessa do gancho é entregue no conteúdo, e cedo (até ~60% da duração)._

## Estrutura

_Gancho → contexto em 1 frase → loop aberto → entrega em passos → payoff → CTA coerente com o objetivo._

## Prova/fonte

_Fonte de cada afirmação; formato (fmt-…), estilo editorial e tom._

## Métrica de sucesso

_Ex.: envios (curiosidade/engajamento), comentários, cliques (conversão)._

## Observações do Oliver

`;
