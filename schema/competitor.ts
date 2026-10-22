import { z } from 'zod';
import { Slug, IsoDate, IsoDateTime, Url, TagList, Platform, nullish } from './common';
import { Market } from './analysis';

export const Profile = z.object({
  platform: Platform,
  url: Url,
  handle: nullish(z.string()),
  externalId: nullish(z.string()),
});
export type Profile = z.infer<typeof Profile>;

/** companies/<slug>/competitors/<id>/competitor.md — frontmatter + corpo (observações). */
export const Competitor = z.object({
  id: Slug,
  name: z.string().min(1),
  kind: z.enum(['concorrente', 'referencia', 'criador', 'pagina']).default('concorrente'),
  /** candidato = achado pela IA, esperando o aceite do Oliver (aceitar → ativo + análise completa) */
  status: z.enum(['candidato', 'ativo', 'arquivado']).default('ativo'),
  /** onde atua (preenchido pelo módulo `atuacao` ou à mão) */
  market: nullish(Market),
  favorite: z.boolean().default(false),
  tags: TagList,
  profiles: z.array(Profile).default([]),
  created: IsoDate,
});
export type Competitor = z.infer<typeof Competitor>;

const Count = nullish(z.number().int().nonnegative());

export const Metrics = z.object({
  views: Count,
  likes: Count,
  comments: Count,
  shares: Count,
  saves: Count,
});

export const ContentItem = z.object({
  /** id estável na plataforma (id do vídeo/post) */
  id: z.string().min(1),
  url: Url,
  type: z.enum(['video', 'short', 'reel', 'post', 'carrossel', 'live', 'outro']).default('video'),
  title: nullish(z.string()),
  caption: nullish(z.string()),
  publishedAt: nullish(z.string()),
  durationS: nullish(z.number().nonnegative()),
  /** URL remota da thumbnail */
  thumbnail: nullish(z.string()),
  /** cópia local relativa à pasta do concorrente (media/…), fora do git */
  thumbnailLocal: nullish(z.string()),
  metrics: Metrics.prefault({}),
  /** só no acervo da tela: quando o item foi visto (e medido) pela última vez; ausente = está na última coleta */
  seenAt: nullish(IsoDateTime),
});
export type ContentItem = z.infer<typeof ContentItem>;

/**
 * companies/<slug>/competitors/<id>/acervo/<platform>-<handle>.json — coleta longa em lotes (1–2 anos para trás).
 * Os posts antigos ficam aqui (não viram "coleta"), com as métricas do dia do lote; `progresso` diz onde o próximo lote continua.
 */
export const AcervoProgress = z.object({
  /** até quantos dias para trás */
  alvoDias: z.number().int().positive(),
  /** posição da grade onde o próximo lote começa (null = do começo) */
  cursor: nullish(z.string()),
  clipsCursor: nullish(z.string()),
  /** data do post mais antigo lido até agora */
  maisAntigo: nullish(z.string()),
  terminado: z.boolean().default(false),
  lotes: z.array(z.object({ at: IsoDateTime, posts: z.number().int().nonnegative(), novos: z.number().int().nonnegative(), ate: nullish(z.string()), erro: nullish(z.string()) })).default([]),
});
export const AcervoFile = z.object({
  schema: z.literal(1).default(1),
  platform: Platform,
  profileUrl: Url,
  updated: IsoDateTime,
  progresso: AcervoProgress,
  items: z.array(ContentItem).default([]),
});
export type AcervoFile = z.infer<typeof AcervoFile>;

export const ProfileInfo = z.object({
  name: nullish(z.string()),
  handle: nullish(z.string()),
  bio: nullish(z.string()),
  avatar: nullish(z.string()),
  avatarLocal: nullish(z.string()),
  banner: nullish(z.string()),
  bannerLocal: nullish(z.string()),
  followers: Count,
  following: Count,
  postsCount: Count,
  verified: nullish(z.boolean()),
  links: z.array(z.string()).default([]),
});

/**
 * companies/<slug>/competitors/<id>/snapshots/<platform>-<handle>/<AAAA-MM-DDTHH-mm-ss>.json
 * Cada coleta é um arquivo novo e imutável: o histórico nunca é apagado.
 */
export const Snapshot = z.object({
  schema: z.literal(1).default(1),
  collectedAt: IsoDateTime,
  platform: Platform,
  profileUrl: Url,
  source: z.enum(['yt-dlp', 'youtube-api', 'apify', 'instagram-public', 'instagram-login', 'graph-api', 'html', 'manual', 'fixture']),
  profile: ProfileInfo.prefault({}),
  items: z.array(ContentItem).default([]),
  errors: z.array(z.string()).default([]),
});
export type Snapshot = z.infer<typeof Snapshot>;

/** companies/<slug>/competitors/<id>/marks.json — marcações do Oliver por item (separadas das coletas). */
export const ItemMark = z.object({
  status: z.enum(['nova', 'marcada', 'analisada', 'descartada']).default('nova'),
  favorite: z.boolean().default(false),
  tags: TagList,
  note: z.string().default(''),
  ideaId: nullish(z.string()),
  updated: IsoDateTime,
});
/** chave = `<platform>:<itemId>` */
export const MarksFile = z.record(z.string().regex(/^[a-z]+:.+$/), ItemMark);
export type ItemMark = z.infer<typeof ItemMark>;
