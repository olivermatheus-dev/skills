// Tipos dos coletores de concorrentes. Sem imports de Node: o app (navegador) também importa daqui.
import type { z } from 'zod';
import type { Profile, Snapshot } from '../../schema';

/** Snapshot ainda não validado (o store valida ao salvar). */
export type SnapshotDraft = z.input<typeof Snapshot>;
export type ItemDraft = NonNullable<SnapshotDraft['items']>[number];

/** Resumo de 1 perfil numa coleta (o que a API devolve para a tela). */
export interface CollectResult {
  key: string;
  platform: string;
  url: string;
  ok: boolean;
  items: number;
  followers?: number;
  source?: string;
  /** arquivo do snapshot gravado (relativo à raiz do hub) */
  file?: string;
  errors: string[];
  /** avisos que não impedem a coleta (ex.: thumbnails não baixadas) */
  warnings: string[];
}

export interface FetchedText { status: number; url: string; text: string; contentType: string }

/** Tudo que toca rede ou processo passa por aqui — nos testes é trocado por fixtures. */
export interface Runner {
  /** roda o yt-dlp e devolve o stdout (lança Error com mensagem clara se faltar o binário) */
  ytdlp(args: string[], opt?: { timeoutMs?: number; allowFail?: boolean }): Promise<string>;
  fetchText(url: string, init?: { method?: string; headers?: Record<string, string>; body?: string; timeoutMs?: number; redirect?: 'follow' | 'manual' }): Promise<FetchedText>;
  /** baixa uma imagem para `absBase` + extensão; devolve a extensão usada ou null se não deu */
  download(url: string, absBase: string, kind: 'avatar' | 'banner' | 'thumb'): Promise<string | null>;
}

export interface AdapterCtx {
  runner: Runner;
  maxItems: number;
  /** lê só a chave pedida do process.env / .env */
  env: (key: string) => string | undefined;
  now: Date;
}

export interface Adapter {
  platform: string;
  collect(profile: Profile, ctx: AdapterCtx): Promise<SnapshotDraft>;
}

/** resumo leve de um perfil para os cards da lista (sem os itens) */
export interface ProfileSummary {
  key: string;
  platform: string;
  url: string;
  handle?: string;
  snapshots: number;
  latest?: { collectedAt: string; source: string; items: number; profile: Snapshot['profile']; errors: string[] };
  /** seguidores na coleta anterior (para o delta) */
  prevFollowers?: number;
}
export interface CompetitorSummary { id: string; profiles: ProfileSummary[]; lastCollected?: string }

/** Linha da tabela comparativa / do card: o essencial de cada módulo, sem carregar os textos. */
export interface AnalysisOverview {
  id: string;
  market?: string;
  oneLiner?: string;
  fromMonthly?: number; currency?: string; publicPrice?: boolean; priceModel?: string; trial?: string; plans?: number;
  features?: number; sections?: number; raScore?: number; raFound?: boolean; storeRating?: number;
  strengths?: number; weaknesses?: number;
  request?: { modules: string[]; status: string; requestedAt: string };
  updated: Record<string, string>;
  hasNotes: boolean;
}
/** resultado do módulo `site` (script) */
export interface SiteRunResult { id: string; ok: boolean; url?: string; pages: number; sitemap: number; contacts: number; ra?: string; errors: string[]; ms: number }
