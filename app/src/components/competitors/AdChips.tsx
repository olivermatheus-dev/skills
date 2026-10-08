// Chips da classificação dos anúncios (037 C): funil, tipo, objetivo, oferta, destino e o status do sinal de resultado.
// Cada chip mostra o motivo no tooltip (as linhas de `motivos[]` que decidiram o valor) e a confiança; confiança baixa leva a marca "incerto".
// O sinal de resultado (0–100) é indireto: sem gasto nem alcance, só tempo no ar, versões e persistência (fórmula em `sinalResultado`).
import type { ReactNode } from 'react';
import { CircleHelp, FileText, Globe, Link2Off, MessageCircle, Smartphone, Tag, Trophy } from 'lucide-react';
import type { Classificacao } from '../../api';
import { Tip } from './toolbar';
import { cx } from '../kit';

export type Campo = 'funil' | 'tipo' | 'objetivo';

export const FUNIL = { topo: 'Topo', meio: 'Meio', fundo: 'Fundo' } as const;
export const TIPO = { oferta: 'Oferta', conteudo: 'Conteúdo', 'prova-social': 'Prova social', demonstracao: 'Demonstração', institucional: 'Institucional', isca: 'Isca', remarketing: 'Remarketing', indefinido: 'Indefinido' } as const;
export const OBJETIVO = { trafego: 'Tráfego', cadastro: 'Cadastro', 'mensagem-whatsapp': 'WhatsApp', lead: 'Lead', 'instalacao-app': 'Instalar app', engajamento: 'Engajamento', indefinido: 'Indefinido' } as const;
export const OFERTA_TIPO = { preco: 'Preço', desconto: 'Desconto', 'teste-gratis': 'Teste grátis', 'plano-gratuito': 'Plano gratuito', 'sem-cartao': 'Sem cartão', cupom: 'Cupom', prazo: 'Prazo', garantia: 'Garantia' } as const;
export const DESTINO = { nenhum: 'Sem link', whatsapp: 'WhatsApp', instagram: 'Instagram', facebook: 'Facebook', 'loja-app': 'Loja de apps', formulario: 'Formulário', planos: 'Planos', cadastro: 'Cadastro', lp: 'Landing page', site: 'Site', outro: 'Outro' } as const;
const DESTINO_ICON: Record<string, ReactNode> = { nenhum: <Link2Off />, whatsapp: <MessageCircle />, 'loja-app': <Smartphone />, formulario: <FileText />, lp: <FileText />, site: <Globe />, planos: <Tag /> };

/** abaixo disso o chip leva "incerto" (a confiança vai de 0 a 1; as regras raramente passam de 0,8) */
export const INCERTO = 0.5;

const FUNIL_COR = {
  topo: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
  meio: 'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300',
  fundo: 'bg-success/15 text-success-ink',
} as const;

const clean = (m: string) => m.replace(/ \(\+[\d.]+\)/, '');
/** linhas de `motivos` que falam do valor escolhido ("tipo→oferta (+2): preço no texto" vira "preço no texto") */
function motivosDe(c: Classificacao, campo: Campo): string[] {
  const valor = c[campo];
  return c.motivos.filter((m) => m.startsWith(`${campo}→${valor}`)).map((m) => `• ${clean(m).replace(/^[^:]*:\s*/, '')}`);
}
function motivoTip(titulo: string, c: Classificacao, campo: Campo): ReactNode {
  const conf = c.confiancaCampos[campo], linhas = motivosDe(c, campo);
  return <>
    <b>{titulo}</b> · confiança {Math.round(conf * 100)}%{conf < INCERTO ? ' (incerto)' : ''}
    {'\n'}{linhas.length ? linhas.join('\n') : '• nenhum sinal forte: valor padrão das regras'}
  </>;
}

const BASE = 'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] leading-none font-medium whitespace-nowrap cursor-default outline-none focus-visible:ring-2 focus-visible:ring-ring';
const NEUTRO = 'bg-muted text-foreground';

function Incerto({ on }: { on: boolean }) {
  return on ? <CircleHelp className="size-3 opacity-70" aria-label="incerto" /> : null;
}

export function ChipFunil({ c }: { c: Classificacao }) {
  return <Tip content={motivoTip('Funil', c, 'funil')}><span tabIndex={0} className={cx(BASE, FUNIL_COR[c.funil])}>{FUNIL[c.funil]}<Incerto on={c.confiancaCampos.funil < INCERTO} /></span></Tip>;
}
export function ChipTipo({ c }: { c: Classificacao }) {
  return <Tip content={motivoTip('Tipo', c, 'tipo')}><span tabIndex={0} className={cx(BASE, NEUTRO)}>{TIPO[c.tipo]}<Incerto on={c.confiancaCampos.tipo < INCERTO} /></span></Tip>;
}
export function ChipObjetivo({ c }: { c: Classificacao }) {
  return <Tip content={motivoTip('Objetivo provável', c, 'objetivo')}><span tabIndex={0} className={cx(BASE, NEUTRO)}>{OBJETIVO[c.objetivo]}<Incerto on={c.confiancaCampos.objetivo < INCERTO} /></span></Tip>;
}

const brl = (n: number) => `R$ ${n.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`;
/** texto curto da oferta: "Teste grátis 15d · R$ 89/mês" (só os dois tipos mais fortes) */
export function ofertaTexto(c: Classificacao): string {
  const o = c.oferta;
  if (!o.tem) return '';
  const partes = o.tipos.filter((t) => t !== 'preco').slice(0, 2).map((t) => (t === 'teste-gratis' && o.diasTeste ? `Teste grátis ${o.diasTeste}d` : OFERTA_TIPO[t]));
  if (o.precoBRL != null && o.tipos.includes('preco')) partes.push(`${brl(o.precoBRL)}${o.precoPor ? `/${o.precoPor}` : ''}`);
  return partes.join(' · ') || 'Oferta';
}
export function ChipOferta({ c }: { c: Classificacao }) {
  const o = c.oferta;
  if (!o.tem) return null;
  const tip = <><b>Oferta explícita</b>{'\n'}Tipos: {o.tipos.map((t) => OFERTA_TIPO[t]).join(', ')}{o.precos.length > 1 ? `\nPreços citados: ${o.precos.map(brl).join(', ')}` : ''}{o.trecho ? `\nTrecho: “…${o.trecho}…”` : ''}{o.precoBRL != null ? '\nO primeiro preço pode ser o da sessão do paciente, não o do produto.' : ''}</>;
  return <Tip content={tip}><span tabIndex={0} className={cx(BASE, 'bg-primary/10 text-primary-ink')}>{ofertaTexto(c)}</span></Tip>;
}
export function ChipDestino({ c }: { c: Classificacao }) {
  const d = c.destino;
  const tip = <><b>Destino do clique</b>{'\n'}{DESTINO[d.kind]}{d.dominio ? `\n${d.dominio}${d.caminho && d.caminho !== '/' ? d.caminho : ''}` : ''}{c.sinais.utm?.campaign ? `\nCampanha (UTM): ${c.sinais.utm.campaign}` : ''}{c.sinais.utm?.medium ? `\nPúblico (UTM medium): ${c.sinais.utm.medium}` : ''}</>;
  return <Tip content={tip}><span tabIndex={0} className={cx(BASE, NEUTRO, '[&_svg]:size-3')}>{DESTINO_ICON[d.kind]}{DESTINO[d.kind]}</span></Tip>;
}

// ---------- sinal de resultado e status (037 §7) ----------

export const PROVADO_DIAS = 30, VETERANO_DIAS = 90, PROMISSOR_DIAS = 14;
export type StatusAd = 'em-teste' | 'promissor' | 'provado' | 'veterano' | 'perdeu' | 'encerrado';
export const STATUS: Record<StatusAd, { label: string; hint: string; cls: string }> = {
  'em-teste': { label: 'Em teste', hint: 'no ar há menos de 14 dias', cls: 'bg-muted text-muted-foreground' },
  promissor: { label: 'Promissor', hint: 'no ar há 14 a 29 dias', cls: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300' },
  provado: { label: 'Provado', hint: 'no ar há 30+ dias: sinal indireto de que dá resultado', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300' },
  veterano: { label: 'Veterano', hint: 'no ar há 90+ dias', cls: 'bg-amber-200 text-amber-900 dark:bg-amber-500/30 dark:text-amber-200' },
  perdeu: { label: 'Perdeu', hint: 'saiu do ar com menos de 30 dias de vida: provavelmente não funcionou', cls: 'bg-destructive/10 text-destructive' },
  encerrado: { label: 'Encerrado', hint: 'saiu do ar depois de 30+ dias: rodou o suficiente para ter dado resultado', cls: 'bg-muted text-foreground' },
};
export function statusDe(dias: number | undefined | null, saiu: boolean): StatusAd {
  const d = dias ?? 0;
  if (saiu) return d >= PROVADO_DIAS ? 'encerrado' : 'perdeu';
  return d >= VETERANO_DIAS ? 'veterano' : d >= PROVADO_DIAS ? 'provado' : d >= PROMISSOR_DIAS ? 'promissor' : 'em-teste';
}

export interface SinalIn { dias?: number | null; irmaos: number; variacoes?: number | null; coletas?: number; reapareceu?: boolean }
/**
 * Sinal de resultado 0–100 (indireto): tempo no ar 50 (min(dias,120)/120) · escala do conceito 20 (irmãos−1 + variações−1, teto 5)
 * · persistência 10 (coletas seguidas além da 1ª, teto 4) · reaparecimento 10 (o criativo saiu e voltou) · peso do anunciante 10
 * (conceito com 3+ anúncios ativos do mesmo concorrente).
 */
export function sinalResultado(s: SinalIn): number {
  const tempo = 50 * Math.min(s.dias ?? 0, 120) / 120;
  const escala = 20 * Math.min(Math.max(s.irmaos - 1, 0) + Math.max((s.variacoes ?? 1) - 1, 0), 5) / 5;
  const persist = 10 * Math.min(Math.max((s.coletas ?? 1) - 1, 0), 4) / 4;
  return Math.round(tempo + escala + persist + (s.reapareceu ? 10 : 0) + (s.irmaos >= 3 ? 10 : 0));
}

export function StatusBadge({ status, sinal, extra, className }: { status: StatusAd; sinal?: number; extra?: string; className?: string }) {
  const s = STATUS[status];
  const tip = <><b>{s.label}</b>: {s.hint}{sinal != null ? `\nSinal de resultado: ${sinal}/100 (indireto)` : ''}{extra ? `\n${extra}` : ''}{'\nSem gasto nem alcance: longevidade pode ser anúncio barato ou institucional.'}</>;
  return <Tip content={tip}><span tabIndex={0} className={cx(BASE, s.cls, '[&_svg]:size-3', className)}>{(status === 'provado' || status === 'veterano') && <Trophy />}{s.label}</span></Tip>;
}
