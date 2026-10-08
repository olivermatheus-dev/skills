import { z } from 'zod';
import { IsoDate, Slug } from './common';

/**
 * Estúdio de mockups (tarefa 028). Três arquivos:
 * - companies/<slug>/capturas/<AAAA-MM-DD>-<tela>/captura.json — o print bruto e o que se sabe dele (medido pelo script)
 * - companies/<slug>/contents/<pasta>/mockup.json — composições editáveis (template + telas + parâmetros), uma por imagem em png/
 * - companies/<slug>/brand/mockups.json — o que a marca permite (fundos) e padrões
 * Região: x, y, w, h em fração da imagem (0–1) ou em px da imagem original (qualquer valor > 1).
 */
export const MockupRegion = z.object({ x: z.number().min(0), y: z.number().min(0), w: z.number().positive(), h: z.number().positive() });
export const NamedRegion = MockupRegion.extend({ rotulo: z.string().trim().min(1).optional() });
/** região nomeada da captura (slug) ou coordenadas diretas */
export const RegionRef = z.union([Slug, MockupRegion]);

export const MOCKUP_DEVICES = ['celular', 'tablet', 'desktop'] as const;
export const Capture = z.object({
  origem: z.enum(['arraste', 'print', 'link']),
  arquivo: z.string().regex(/^[\w.-]+\.(png|jpe?g|webp)$/i).default('original.png'),
  url: z.string().optional(),
  largura: z.number().int().positive(),
  altura: z.number().int().positive(),
  /** densidade do print (1 = tela comum; 2–3 = retina/captura em alta). Abaixo de 2, zoom e cards ficam macios */
  dpr: z.number().min(1).max(4).default(1),
  aparelho: z.enum(MOCKUP_DEVICES),
  corDominante: z.string().regex(/^#[0-9a-f]{6}$/i).optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  /** sim = só dados fictícios na tela (pode publicar). Não = peça sai marcada "nao-publicar" */
  dadosFicticios: z.boolean().default(false),
  /** áreas borradas antes de compor (nomes, e-mails, telefones) */
  ocultar: z.array(MockupRegion).default([]),
  /** áreas nomeadas para zoom, cards e anotações (o rótulo vira o texto da anotação) */
  regioes: z.record(Slug, NamedRegion).default({}),
  data: IsoDate,
  notas: z.string().optional(),
  /** gerado por tools/mockup/analisar.mjs: onde cortar (barra do navegador/sistema, rolagem, fio, elemento cortado). Usar com --recorte auto */
  sugestoes: z.object({
    recorte: MockupRegion,
    /** só os cortes de confiança alta: o render aplica sozinho quando a composição não pede outro recorte (--sem-corte desliga) */
    recorteSeguro: MockupRegion.optional(),
    cortes: z.array(z.object({ lado: z.enum(['topo', 'base', 'esquerda', 'direita']), px: z.number(), motivo: z.string(), confianca: z.enum(['alta', 'media']) })).default([]),
    avisos: z.array(z.string()).default([]),
    analisadoEm: z.string().optional(),
  }).optional(),
});
export type Capture = z.infer<typeof Capture>;

export const MOCKUP_FORMATS = ['1:1', '4:5', '9:16', '16:9', 'livre'] as const;
export const MockupComposition = z.object({
  id: Slug,
  template: Slug,
  formato: z.enum(MOCKUP_FORMATS).default('4:5'),
  fundo: Slug.default('liso'),
  transparente: z.boolean().default(false),
  /** parâmetros do template (aparelho, angulo, reflexo, tema…): ver meta.json do template */
  params: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
  /** slots de tela: captura = pasta relativa a companies/<slug>/ (ex.: "capturas/2026-10-07-painel-inicio") */
  telas: z.record(z.string(), z.object({ captura: z.string().min(1), recorte: RegionRef.optional() })),
  textos: z.object({ titulo: z.string().optional(), subtitulo: z.string().optional() }).default({}),
  zoom: RegionRef.optional(),
  destaques: z.array(z.object({ regiao: RegionRef, rotulo: z.string().optional() })).default([]),
  /** imagem gerada, relativa à pasta da peça */
  arquivo: z.string().regex(/^png\/[\w.-]+\.(png|webp)$/).optional(),
});
export type MockupComposition = z.infer<typeof MockupComposition>;

const MockupV1 = z.object({
  empresa: Slug,
  objetivo: z.string().optional(),
  /** densidade do render (3 = padrão: 4:5 sai 3240×4050; 4 = impressão/LP retina grande) */
  escala: z.number().min(0.25).max(4).default(3),
  composicoes: z.array(MockupComposition).min(1),
  /** ids que o Oliver (ou a IA) escolheu entre as alternativas */
  escolhidas: z.array(Slug).default([]),
});

/**
 * Versão 2 (tarefa 030, editor de mockups): uma peça = 1 composição em CAMADAS, exportada em vários formatos.
 * Geometria relativa: x, y = centro em fração do formato; w (e h, tamanho) em u = menor lado do formato.
 * `formatos` da camada guarda o ajuste fino por proporção. Renderizada por library/mockups/runtime/cena.js
 * (o mesmo no editor do app e no export: node tools/mockup/cena.mjs <pasta>). Contrato completo no cabeçalho do cena.js.
 */
export const SCENE_FORMATS = ['1:1', '4:5', '9:16', '16:9'] as const;
const Cor = z.string().min(1);
const Geo = z.object({ x: z.number(), y: z.number(), w: z.number().positive(), h: z.number().positive(), rot: z.number(), tamanho: z.number().positive() }).partial();
const Sombra = z.object({ preset: z.string(), forca: z.number().min(0).max(3), distancia: z.number().min(0).max(4), desfoque: z.number().min(0).max(4), cor: Cor }).partial();
export const SceneLayer = Geo.extend({
  id: z.string().regex(/^[\w-]+$/),
  tipo: z.enum(['aparelho', 'imagem', 'texto', 'forma']),
  nome: z.string().optional(),
  visivel: z.boolean().optional(),
  travada: z.boolean().optional(),
  opacidade: z.number().min(0).max(1).optional(),
  formatos: z.partialRecord(z.enum(SCENE_FORMATS), Geo).optional(),
  captura: z.string().regex(/^capturas\/[^/\\]+$/).optional(),
  recorte: z.union([z.literal('nenhum'), MockupRegion]).optional(),
  sombra: Sombra.optional(),
  texto: z.string().optional(),
}).passthrough();
export const SceneBackground = z.object({
  tipo: z.enum(['cor', 'linear', 'radial', 'malha', 'imagem', 'transparente']),
  escuro: z.boolean().optional(),
  cor: Cor.optional(), base: Cor.optional(), angulo: z.number().optional(),
  centro: z.object({ x: z.number(), y: z.number() }).optional(),
  paradas: z.array(z.object({ cor: Cor, pos: z.number().min(0).max(1) })).optional(),
  pontos: z.array(z.object({ x: z.number(), y: z.number(), r: z.number().positive(), cor: Cor })).optional(),
  desfoque: z.number().min(0).optional(),
  captura: z.string().optional(),
  padrao: z.object({ tipo: z.string(), escala: z.number().positive().optional(), opacidade: z.number().min(0).max(1).optional(), cor: Cor.optional(), esmaecer: z.boolean().optional() }).optional(),
  grao: z.number().min(0).max(0.5).optional(),
  vinheta: z.number().min(0).max(1).optional(),
}).passthrough();
export const MockupScene = z.object({
  versao: z.literal(2),
  empresa: Slug,
  escala: z.number().min(0.25).max(4).default(3),
  /** proporções exportadas juntas (o editor mostra uma de cada vez) */
  formatos: z.array(z.enum(SCENE_FORMATS)).min(1),
  fundo: SceneBackground,
  /** de baixo para cima */
  camadas: z.array(SceneLayer),
});
export type MockupScene = z.infer<typeof MockupScene>;

export const Mockup = z.union([MockupScene, MockupV1]);
export type Mockup = z.infer<typeof Mockup>;

export const MockupBrand = z.object({
  /** fundos permitidos pela marca, na ordem de preferência (o gerador de alternativas só usa estes) */
  fundos: z.array(Slug).min(1),
  /** template/aparelho preferidos, sobrepõem os defaults */
  padrao: z.object({ aparelho: z.string().optional(), formato: z.enum(MOCKUP_FORMATS).optional() }).default({}),
  notas: z.string().optional(),
});
export type MockupBrand = z.infer<typeof MockupBrand>;
