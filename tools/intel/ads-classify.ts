// Classificador determinístico de anúncios (camada A da tarefa 037): regras grátis, sem IA, sem rede.
// Função pura: recebe um Ad do schema atual (schema/ads.ts) e devolve etapa de funil, tipo, objetivo provável,
// destino do link, oferta explícita, sinais e uma confiança com os motivos legíveis.
// Nunca inventa: só olha o que está no snapshot (texto, título, descrição, CTA, link, formato, plataformas, datas, variações).
import type { Ad } from '../../schema/ads';

export type Funil = 'topo' | 'meio' | 'fundo';
export type Tipo = 'oferta' | 'conteudo' | 'prova-social' | 'demonstracao' | 'institucional' | 'isca' | 'remarketing' | 'indefinido';
export type Objetivo = 'trafego' | 'cadastro' | 'mensagem-whatsapp' | 'lead' | 'instalacao-app' | 'engajamento' | 'indefinido';
export type DestinoKind = 'nenhum' | 'whatsapp' | 'instagram' | 'facebook' | 'loja-app' | 'formulario' | 'planos' | 'cadastro' | 'lp' | 'site' | 'outro';

export interface Destino { kind: DestinoKind; dominio: string | null; caminho: string | null }
export interface Oferta {
  tem: boolean;
  tipos: ('preco' | 'desconto' | 'teste-gratis' | 'plano-gratuito' | 'sem-cartao' | 'cupom' | 'prazo' | 'garantia')[];
  /** primeiro preço em R$ citado (pode ser o preço da sessão do paciente, não do produto: veja `precos`) */
  precoBRL: number | null;
  precos: number[];
  /** o que vem logo depois do primeiro preço: mês, dia, sessão, ano… */
  precoPor: string | null;
  diasTeste: number | null;
  trecho: string | null;
}
export interface Utm { source?: string; medium?: string; campaign?: string; content?: string; term?: string }
export interface Sinais {
  diasNoAr: number | null;
  variacoes: number | null;
  /** quantos anúncios do mesmo concorrente têm o mesmo texto+título (versões do mesmo criativo) */
  irmaos: number;
  formato: Ad['media']['type'];
  plataformas: string[];
  utm: Utm | null;
  catalogoDinamico: boolean;
  gancho: string | null;
  caracteres: number;
  /** palavras de funcionalidade do produto citadas no texto (agenda, prontuário…) */
  funcionalidades: string[];
}
export interface Classificacao {
  funil: Funil;
  tipo: Tipo;
  objetivo: Objetivo;
  temLink: boolean;
  destino: Destino;
  oferta: Oferta;
  sinais: Sinais;
  /** 0..1: média da confiança de funil, tipo e objetivo */
  confianca: number;
  confiancaCampos: { funil: number; tipo: number; objetivo: number };
  motivos: string[];
}
export interface ClassifyOpts { hoje?: Date; irmaos?: number }

// ───────────────────────── utilidades ─────────────────────────

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const DAY = 86_400_000;
const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const r2 = (n: number) => Math.round(n * 100) / 100;

function parseUrl(u?: string | null): URL | null {
  if (!u) return null;
  try { return new URL(/^[a-z]+:\/\//i.test(u) ? u : `https://${u}`); } catch { return null; }
}

export function parseUtm(u?: string | null): Utm | null {
  const url = parseUrl(u);
  if (!url) return null;
  const g = (k: string) => url.searchParams.get(k) ?? undefined;
  const utm = { source: g('utm_source'), medium: g('utm_medium'), campaign: g('utm_campaign'), content: g('utm_content'), term: g('utm_term') };
  return Object.values(utm).some(Boolean) ? utm : null;
}

export function classificarDestino(linkUrl?: string | null): Destino {
  const url = parseUrl(linkUrl);
  if (!url) return { kind: 'nenhum', dominio: null, caminho: null };
  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  const path = url.pathname === '/' ? '/' : url.pathname.replace(/\/$/, '');
  const base = { dominio: host, caminho: path };
  if (/(^|\.)wa\.me$|whatsapp\.com$/.test(host)) return { kind: 'whatsapp', ...base };
  if (/(^|\.)instagram\.com$/.test(host)) return { kind: 'instagram', ...base };
  if (/(^|\.)(facebook|fb)\.(com|me)$/.test(host)) return { kind: 'facebook', ...base };
  if (/play\.google\.com$|apps\.apple\.com$|itunes\.apple\.com$/.test(host)) return { kind: 'loja-app', ...base };
  if (/typeform\.com$|forms\.gle$|docs\.google\.com$|tally\.so$|jotform/.test(host)) return { kind: 'formulario', ...base };
  if (/\/(planos?|precos?|pricing|assine|assinatura|checkout)(\/|$)/.test(path)) return { kind: 'planos', ...base };
  if (/\/(cadastro|cadastre|signup|sign-up|registro|registrar|trial|teste)([-/]|$)/.test(path)) return { kind: 'cadastro', ...base };
  if (/\.(lovable\.app|vercel\.app|netlify\.app|carrd\.co|webflow\.io)$/.test(host) || /^(lp|landing|pages?|go|promo)\./.test(host)) return { kind: 'lp', ...base };
  if (path === '/') return { kind: 'site', ...base };
  return { kind: 'lp', ...base };
}

// ───────────────────────── oferta explícita ─────────────────────────

const FUNCIONALIDADES: [string, RegExp][] = [
  ['agenda', /\bagenda/], ['prontuario', /prontuari/], ['financeiro', /financ|cobranc|pagament/], ['lembretes', /lembret|confirmac/],
  ['ia', /\bia\b|inteligencia artificial|smart notes|resumo de sessao/], ['whatsapp', /whatsapp/], ['relatorios', /relatorio/],
  ['documentos', /documento|laudo|recibo|declaracao/], ['teleconsulta', /teleconsulta|video ?chamada|atendimento online/], ['evolucao', /evolucao/],
];

export function extrairOferta(texto: string): Oferta {
  const t = norm(texto);
  const tipos: Oferta['tipos'] = [];
  const add = (x: Oferta['tipos'][number]) => { if (!tipos.includes(x)) tipos.push(x); };
  let trecho: string | null = null;
  const pega = (m: RegExpMatchArray | null) => { if (m && !trecho) { const i = m.index ?? 0; trecho = texto.slice(Math.max(0, i - 25), i + m[0].length + 35).replace(/\s+/g, ' ').trim(); } };

  // preço: "R$ 89", "R$89,00", "por 97 reais"
  let precoBRL: number | null = null;
  let precoPor: string | null = null;
  const precos: number[] = [];
  for (const m of t.matchAll(/r\$\s?(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+(?:,\d{2})?)/g)) {
    const v = Number(m[1].replace(/\./g, '').replace(',', '.'));
    precos.push(v);
    if (precoBRL == null) {
      precoBRL = v; add('preco'); pega(m);
      precoPor = t.slice((m.index ?? 0) + m[0].length, (m.index ?? 0) + m[0].length + 14).match(/^\s*(?:\/|por |ao |a )?\s*(mes|dia|ano|sessao|semana|paciente|profissional)/)?.[1] ?? null;
    }
  }
  const md = t.match(/\d{1,2}\s?% (?:de )?(?:desconto|off)|desconto|\boff\b|promocao|black friday|oferta especial|condicao especial/);
  if (md) { add('desconto'); pega(md); }
  const mt = t.match(/(?:teste|experimente|use|trial)[^.\n]{0,25}(?:gratis|gratuit)|(?:\d+|sete|catorze|quatorze|trinta) dias[^.\n]{0,20}(?:gratis|gratuit|sem custo|sem pagar)|(?:gratis|gratuito)[^.\n]{0,20}(?:\d+|sete|catorze|trinta) dias|plano pro por (?:sete|\d+) dias|teste (?:o )?plano|demonstracao gratuita|aula experimental/);
  if (mt) { add('teste-gratis'); pega(mt); }
  const mg = t.match(/plano (?:gratuito|gratis|free)|(?:sistema|app|aplicativo|agenda)[^.\n]{0,25}gratuit|\bgratuit[oa]\b|\bgratis\b/);
  if (mg && !tipos.includes('teste-gratis')) { add('plano-gratuito'); pega(mg); }
  else if (mg && /plano (?:gratuito|gratis|free)|sem prazo/.test(t)) add('plano-gratuito');
  const mc = t.match(/sem cartao/);
  if (mc) { add('sem-cartao'); pega(mc); }
  const mk = t.match(/cupom|codigo promocional|use o codigo/);
  if (mk) { add('cupom'); pega(mk); }
  const mz = t.match(/so hoje|ultimas vagas|ultimas horas|por tempo limitado|ate (?:o )?dia \d|ate \d{1,2}\/\d{1,2}|termina (?:hoje|amanha)|encerra|vagas limitadas|garanta (?:o )?seu/);
  if (mz) { add('prazo'); pega(mz); }
  const mgar = t.match(/garantia de \d+ dias|7 dias de garantia|devolvemos|satisfeito ou/);
  if (mgar) { add('garantia'); pega(mgar); }

  let diasTeste: number | null = null;
  const NUM: Record<string, number> = { sete: 7, catorze: 14, quatorze: 14, trinta: 30, tres: 3, cinco: 5, dez: 10, quinze: 15 };
  const md2 = t.match(/(\d+|sete|catorze|quatorze|trinta|tres|cinco|dez|quinze) dias/);
  if (md2 && (tipos.includes('teste-gratis') || tipos.includes('garantia'))) diasTeste = Number(md2[1]) || NUM[md2[1]] || null;

  return { tem: tipos.length > 0, tipos, precoBRL, precos, precoPor, diasTeste, trecho };
}

// ───────────────────────── núcleo ─────────────────────────

type Votos<K extends string> = Partial<Record<K, number>>;
interface Eleicao<K extends string> { vencedor: K; conf: number }

function eleger<K extends string>(v: Votos<K>, padrao: K, n: Partial<Record<K, number>> = {}): Eleicao<K> {
  const e = Object.entries(v) as [K, number][];
  const total = e.reduce((s, [, n]) => s + n, 0);
  if (!e.length || total <= 0) return { vencedor: padrao, conf: 0.2 };
  e.sort((a, b) => b[1] - a[1]);
  const [k, top] = e[0];
  const segundo = e[1]?.[1] ?? 0;
  // confiança = quanto o 1º lugar domina (margem) × quanta evidência houve (total)
  const margem = top <= 0 ? 0 : (top - segundo) / top;
  const sinais = Math.min(n[k] ?? 1, 4); // quantas regras independentes apontaram para o vencedor
  return { vencedor: k, conf: r2(clamp(0.15 + 0.4 * margem + 0.12 * sinais, 0.2, 0.95)) };
}

const CTA_CONVERSAO = /^(cadastre-se|assinar|obter oferta|comprar|compre agora|garantir|inscreva-se|baixar|instalar|experimentar|testar|solicitar)/;
const CTA_GENERICO = /^(saiba mais|ver detalhes|saber mais|learn more|ver mais)/;
const CTA_PERFIL = /perfil do instagram|visitar o perfil|seguir/;
const CTA_MENSAGEM = /enviar mensagem|mensagem pelo whatsapp|fale conosco|whatsapp/;

export function classificarAnuncio(ad: Ad, opts: ClassifyOpts = {}): Classificacao {
  const motivos: string[] = [];
  const hoje = opts.hoje ?? new Date();
  const textoBruto = [ad.text, ad.title, ad.description].filter(Boolean).join('\n');
  const catalogoDinamico = /\{\{[^}]+\}\}/.test(textoBruto);
  const limpo = textoBruto.replace(/\{\{[^}]+\}\}/g, ' ').trim();
  const t = norm(limpo);
  const cta = norm(ad.cta ?? '');
  const destino = classificarDestino(ad.linkUrl);
  const temLink = destino.kind !== 'nenhum';
  const utm = parseUtm(ad.linkUrl);
  const oferta = extrairOferta(limpo);
  const funcionalidades = FUNCIONALIDADES.filter(([, re]) => re.test(t)).map(([n]) => n);
  const dias = ad.startedAt ? Math.max(0, Math.floor((hoje.getTime() - Date.parse(ad.startedAt)) / DAY)) : null;
  const gancho = (ad.text ?? '').replace(/\{\{[^}]+\}\}/g, '').trim().split(/(?<=[.!?…])\s|\n/)[0]?.slice(0, 140) || null;
  const utmTxt = norm([utm?.medium, utm?.campaign, utm?.term, utm?.content].filter(Boolean).join(' '));

  // ───── objetivo ─────
  const ob: Votos<Exclude<Objetivo, 'indefinido'>> = {};
  const no: Record<string, number> = {};
  const vo = (k: keyof typeof ob, n: number, why: string) => { ob[k] = (ob[k] ?? 0) + n; no[k] = (no[k] ?? 0) + 1; motivos.push(`objetivo→${k} (+${n}): ${why}`); };
  if (destino.kind === 'whatsapp') vo('mensagem-whatsapp', 3, `link vai para o WhatsApp (${destino.dominio})`);
  if (CTA_MENSAGEM.test(cta)) vo('mensagem-whatsapp', 1.5, `CTA "${ad.cta}"`);
  if (destino.kind === 'instagram' || destino.kind === 'facebook') vo('engajamento', 2.5, `link vai para o perfil (${destino.dominio}${destino.caminho})`);
  if (CTA_PERFIL.test(cta)) vo('engajamento', 1.5, `CTA "${ad.cta}"`);
  if (!temLink && !ad.cta) vo('engajamento', 2, 'sem link e sem botão (impulsionamento ou conteúdo de parceria)');
  if (destino.kind === 'loja-app') vo('instalacao-app', 3, 'link para a loja de apps');
  if (destino.kind === 'formulario') vo('lead', 3, 'link para formulário');
  if (destino.kind === 'planos' || destino.kind === 'cadastro') vo('cadastro', 2.5, `destino ${destino.kind} (${destino.caminho})`);
  if (CTA_CONVERSAO.test(cta)) vo('cadastro', 1.5, `CTA de conversão "${ad.cta}"`);
  if (oferta.tipos.includes('teste-gratis')) vo('cadastro', 1, 'oferta de teste grátis');
  if (CTA_GENERICO.test(cta) && (destino.kind === 'site' || destino.kind === 'lp')) vo('trafego', 2, `CTA genérico "${ad.cta}" para ${destino.kind}`);
  const objE = eleger(ob, 'trafego', no);
  const objetivo: Objetivo = Object.keys(ob).length ? objE.vencedor : 'indefinido';

  // ───── tipo ─────
  const tp: Votos<Exclude<Tipo, 'indefinido'>> = {};
  const nt: Record<string, number> = {};
  const vt = (k: keyof typeof tp, n: number, why: string) => { tp[k] = (tp[k] ?? 0) + n; nt[k] = (nt[k] ?? 0) + 1; motivos.push(`tipo→${k} (+${n}): ${why}`); };
  if (/retarget|remarket|retargeting/.test(utmTxt)) vt('remarketing', 4, `UTM fala em remarketing ("${utm?.medium ?? utm?.term}")`);
  if (oferta.precoBRL != null) vt('oferta', 2, `preço no texto (R$ ${oferta.precoBRL})`);
  if (oferta.tipos.includes('desconto')) vt('oferta', 2, 'desconto/promoção no texto');
  if (oferta.tipos.includes('teste-gratis')) vt('oferta', 2, 'teste grátis');
  if (oferta.tipos.includes('plano-gratuito')) vt('oferta', 1.5, 'plano/sistema gratuito');
  if (oferta.tipos.includes('prazo') || oferta.tipos.includes('cupom')) vt('oferta', 1.5, 'prazo/cupom');
  if (/obter oferta/.test(cta)) vt('oferta', 2, 'CTA "Obter oferta"');
  if (/\bassine\b|\bassinatura\b|\bassinar\b/.test(t)) vt('oferta', 1.5, 'texto manda assinar o plano');
  if (/assinar|comprar/.test(cta)) vt('oferta', 0.5, `CTA "${ad.cta}" pede compra`);
  if (/\be-?book\b|material (?:gratuito|exclusivo)|checklist gratuit|planilha gratuit|guia (?:gratuito|completo|pratico)|masterclass|webinar|aula (?:gratuita|ao vivo)|\bworkshop\b|\bbaixe\b|\bbaixar\b|\bquiz\b|diagnostico gratuito/.test(t)) vt('isca', 3, 'palavras de isca (ebook, guia, aula, checklist…)');
  if (/baixar|download/.test(cta) && destino.kind !== 'loja-app') vt('isca', 1.5, `CTA "${ad.cta}"`);
  if (/\(@\w+|@\w+\)|\bdepoimento|\buso (?:a |o )?(?:\w+ )?(?:ha|desde)|\busam\b|\bme ajudou|todas as ferramentas que eu uso|advogad[ao]|especialista|\bpsis? (?:foda|top)|mais de \d+ (?:psic|profission|clinic|terapeut)|clientes? (?:dizem|falam)|contar pras? (?:todas )?(?:as )?amig|uma descoberta|recomend[oae]/.test(t)) vt('prova-social', 2.5, 'depoimento/creator/"usam"/especialista falando');
  if (funcionalidades.length >= 3) vt('demonstracao', 2.5, `cita ${funcionalidades.length} funcionalidades (${funcionalidades.join(', ')})`);
  else if (funcionalidades.length === 2) vt('demonstracao', 1.5, `cita 2 funcionalidades (${funcionalidades.join(', ')})`);
  else if (funcionalidades.length === 1) vt('demonstracao', 0.5, `cita funcionalidade (${funcionalidades[0]})`);
  if (/✅|✔|🔹|•/.test(limpo) && funcionalidades.length) vt('demonstracao', 0.5, 'lista de benefícios com marcadores');
  if (/veja como|como funciona|na pratica|passo a passo|conheca o|conheca a/.test(t)) vt('demonstracao', 1, 'convite a ver como funciona');
  const perguntasComo = (limpo.match(/como [^?\n]{3,60}\?/gi) ?? []).length;
  if (perguntasComo >= 2) vt('conteudo', 2.5, `lista de ${perguntasComo} perguntas "Como…?" (assunto/educativo, não demonstração)`);
  if (/\?\s*(?:\n|$)|\bdicas?\b|\bpor que\b|\bvoce sabia\b|\bmito\b|\bnao precisa\b|\bcomo (?:\w+ ){0,3}(?:organizar|atrair|se posicionar|cuidar)|\bhoje mudou|antigamente/.test(t)) vt('conteudo', 1.5, 'texto educativo/provocativo (pergunta, dica, "por que", "hoje mudou")');
  if (CTA_PERFIL.test(cta) && !oferta.tem) vt('conteudo', 1.5, 'CTA para o perfil sem oferta: conteúdo de perfil');
  if (/\bnasceu\b|nossa (?:historia|missao)|\bmissao\b|\bmanifesto\b|\bquem somos\b|cuidar de quem cuida|\bsomos\b/.test(t)) vt('institucional', 2.5, 'fala da marca/missão');
  if (!temLink && !ad.cta) vt('institucional', 1.5, 'sem link nem botão: anúncio de marca/alcance');
  if (limpo.length < 25 && !oferta.tem && !funcionalidades.length) vt('institucional', 0.5, 'texto mínimo, sem oferta');
  const tipE = eleger(tp, 'institucional', nt);
  let tipo = (Object.keys(tp).length ? tipE.vencedor : "indefinido") as Tipo;
  let confTipo = tipE.conf;
  if (catalogoDinamico && limpo.length < 20) { tipo = 'indefinido'; confTipo = 0.2; motivos.push('tipo→indefinido: texto de catálogo dinâmico ({{product.*}}), o snapshot não traz o texto real'); }
  if (tipo === 'indefinido' && confTipo > 0.2) confTipo = 0.2;

  // ───── funil ─────
  const fv: Votos<Funil> = {};
  const nf: Record<string, number> = {};
  const vf = (k: Funil, n: number, why: string) => { fv[k] = (fv[k] ?? 0) + n; nf[k] = (nf[k] ?? 0) + 1; motivos.push(`funil→${k} (+${n}): ${why}`); };
  if (/retarget|remarket/.test(utmTxt)) vf('fundo', 3.5, `UTM de público quente ("${utm?.medium}", "${utm?.term}")`);
  if (/prospect|broad|aberto|frio|topo|awareness|alcance/.test(utmTxt)) vf('topo', 3.5, `UTM de público frio ("${utm?.medium}", "${utm?.term}")`);
  if (/mofu|consideracao|\bmeio\b/.test(utmTxt)) vf('meio', 3, 'UTM de meio de funil');
  if (destino.kind === 'planos') vf('fundo', 2, 'destino é página de planos/preços');
  if (destino.kind === 'cadastro') vf('fundo', 1.5, 'destino é página de cadastro');
  if (destino.kind === 'whatsapp') vf('fundo', 1.5, 'conversa direta no WhatsApp');
  if (CTA_CONVERSAO.test(cta)) vf('fundo', 1, `CTA de conversão "${ad.cta}"`);
  if (CTA_GENERICO.test(cta)) vf('meio', 1, `CTA genérico "${ad.cta}" (pede para conhecer)`);
  if (CTA_PERFIL.test(cta) || destino.kind === 'instagram' || destino.kind === 'facebook') vf('topo', 2, 'leva ao perfil (descoberta/seguir)');
  if (!temLink) vf('topo', 2, 'sem link: alcance/marca');
  if (tipo === 'oferta') vf('fundo', 1.5, 'tipo oferta');
  if (tipo === 'remarketing') vf('fundo', 2, 'tipo remarketing');
  if (tipo === 'demonstracao') vf('meio', 1.5, 'tipo demonstração (apresenta a solução)');
  if (tipo === 'prova-social') vf('meio', 1, 'tipo prova social');
  if (tipo === 'isca') vf('meio', 1, 'tipo isca (captura contato antes da venda)');
  if (tipo === 'conteudo') vf('topo', 1.5, 'tipo conteúdo');
  if (tipo === 'institucional') vf('topo', 1, 'tipo institucional');
  const funE = eleger(fv, 'meio', nf);

  const confianca = r2((funE.conf + confTipo + objE.conf) / 3);
  return {
    funil: funE.vencedor, tipo, objetivo, temLink, destino, oferta,
    sinais: {
      diasNoAr: dias, variacoes: ad.variations ?? null, irmaos: opts.irmaos ?? 1, formato: ad.media.type, plataformas: ad.platforms, utm,
      catalogoDinamico, gancho, caracteres: limpo.length, funcionalidades,
    },
    confianca,
    confiancaCampos: { funil: funE.conf, tipo: confTipo, objetivo: objetivo === 'indefinido' ? 0.2 : objE.conf },
    motivos,
  };
}

/** conta quantos anúncios de um mesmo concorrente repetem o mesmo criativo (texto + título): versões do mesmo conceito */
export function contarIrmaos(ads: Ad[]): Map<string, number> {
  const chave = (a: Ad) => norm(`${a.text ?? ''}|${a.title ?? ''}`).replace(/\s+/g, ' ').trim();
  const cont = new Map<string, number>();
  for (const a of ads) cont.set(chave(a), (cont.get(chave(a)) ?? 0) + 1);
  return new Map(ads.map((a) => [a.id, cont.get(chave(a)) ?? 1]));
}
