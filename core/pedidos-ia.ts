// Botões que faltavam para falar com a IA pelo app (046 D), todos pelo mesmo caminho do Rodar IA (runPedido → heartbeat
// --pedido: lock, dock com passos, Parar): "Pedir ajustes ao Claude" nas anotações (vídeo, slides, roteiro), "Rodar agora"
// na fila de análise dos concorrentes e o relatório em segundo plano (core/relatorios.ts). Aqui ficam os prompts e o estado
// que a tela acompanha (o pedido mais novo dela, pelo `ref`).
import * as S from './store';
import { ValidationError } from './store';
import { runPedido } from './runner';
import * as PI from '../tools/lib/pedidos-ia.mjs';
import * as AT from '../tools/lib/atividade.mjs';
import type { PedidoIa } from '../tools/lib/pedidos-ia.mjs';

const okSlug = (s: string) => /^[a-z0-9][a-z0-9-]*$/.test(s);
const modoDe = (m: unknown) => (m === 'terminal' ? 'terminal' : 'background') as 'background' | 'terminal';
const NAO_INICIOU_MS = 2 * 60e3;

/** estado do pedido para a tela: o do arquivo, corrigido pelo registro de atividade (processo morto) e pelo "nunca começou" */
export function estadoPedido(p: PedidoIa | null) {
  if (!p) return null;
  if (p.status === 'fila' && Date.now() - Date.parse(p.criado) > NAO_INICIOU_MS) return { ...p, status: 'erro' as const, erro: 'A IA não começou (o heartbeat não abriu). Tente de novo.' };
  if (p.status === 'rodando' && p.atividade) {
    const a = AT.listar({ slug: p.slug, limite: 60 }).find((x) => x.id === p.atividade); // listar marca como erro o processo que morreu
    if (a && a.status !== 'rodando') return { ...p, status: a.status === 'parado' ? 'parado' as const : 'erro' as const, erro: a.erro ?? p.erro, passo: null };
    return { ...p, passo: a?.passo ?? null, agenteAtivo: a?.agente ?? null };
  }
  return p;
}

export function pedidoView(slug: string, ref: string) {
  if (!okSlug(slug)) throw new ValidationError('pedido', ['empresa inválida']);
  const p = PI.ultimoPor(slug, ref);
  // concorrente: vale também a fila inteira (analise:*) que o incluiu, se for mais nova
  const m = /^analise:(?!\*$)(.+)$/.exec(ref);
  const todos = m ? PI.ultimoPor(slug, 'analise:*') : null;
  const doComp = todos && (todos.extra.comps ?? []).includes(m![1]) && (!p || todos.criado > p.criado) ? todos : p;
  return estadoPedido(doComp);
}
const ativo = (slug: string, ref: string) => { const e = pedidoView(slug, ref); return e && (e.status === 'fila' || e.status === 'rodando') ? e : null; };

// ---------- Pedir ajustes ao Claude (anotações da peça) ----------
const ABAS = {
  video: { nome: 'Edição do vídeo', agente: 'agent:editor-de-video', skill: 'video', depois: 're-renderize numa versão nova (vNN, nunca sobrescreva o MP4)', ancoras: (k: string) => !['roteiro', 'slide'].includes(k) },
  slides: { nome: 'Slides', agente: 'agent:designer', skill: 'carousel', depois: 'reexporte o PNG com o mesmo nome de arquivo', ancoras: (k: string) => k === 'slide' },
  roteiro: { nome: 'Roteiro', agente: 'agent:roteirista', skill: 'ig-post', depois: 'mantenha o sentido do texto do Oliver (ajuste a forma)', ancoras: (k: string) => k === 'roteiro' },
} as const;
type Aba = keyof typeof ABAS;

export function pedirAjustes(slug: string, path: string, body: { aba?: string; ids?: string[]; instrucoes?: string; modo?: string }) {
  if (!okSlug(slug) || !path || /(^|\/)\.\.(\/|$)|^\/|[\\:]/.test(path)) throw new ValidationError('ajustes', ['peça inválida']);
  const aba = body?.aba as Aba;
  const cfg = ABAS[aba];
  if (!cfg) throw new ValidationError('ajustes', ['aba inválida (video, slides ou roteiro)']);
  const piece = S.getPiece(slug, path);
  const ref = `peca:${path}`;
  if (ativo(slug, ref)) throw new ValidationError('ajustes', ['o Claude já está ajustando esta peça']);
  const abertas = piece.review.comments.filter((c) => c.status === 'aberto' && c.tipo !== 'ok' && cfg.ancoras(c.anchor.kind));
  const ids = Array.isArray(body?.ids) && body.ids.length ? abertas.filter((c) => body.ids!.includes(c.id)).map((c) => c.id) : abertas.map((c) => c.id);
  if (!ids.length) throw new ValidationError('ajustes', [`nenhuma anotação aberta em ${cfg.nome}`]);
  const pasta = `companies/${slug}/contents/${path}`;
  const instr = String(body?.instrucoes ?? '').trim();
  const prompt = [
    `Pedido do Oliver pelo app (Conteúdos → ${cfg.nome}): resolva as anotações abertas ${ids.join(', ')} da peça ${pasta}.`,
    `Comece por \`node tools/review.mjs "${pasta}"\` (traz o contexto e os quadros ou imagens marcadas: abra com Read) e siga a seção de anotações da skill ${cfg.skill}. Mexa só no que as anotações pedem.`,
    'Nunca edite o revisao.json à mão (está bloqueado): status e resposta só pelo review.mjs, que é o que o Oliver lê no app.',
    `Para cada uma: corrija na fonte, ${cfg.depois} e rode \`node tools/review.mjs "${pasta}" resolve <id> "o que mudou"\` (uma frase para o Oliver).`,
    `O Oliver não está na conversa. Se uma anotação depender de decisão dele ou de algo pago (voz final, ElevenLabs), não resolva: rode \`node tools/review.mjs "${pasta}" responde <id> "a pergunta"\` e siga com as outras.`,
    ...(instr ? [`Instruções do Oliver para esta rodada: ${instr}`] : []),
    'Termine com uma linha: o que mudou e onde ver.',
  ].join('\n');
  const r = runPedido({
    slug, tipo: 'ajustes', ref, agente: cfg.agente, prompt,
    titulo: `Ajustes · ${piece.title} (${ids.length})`,
    link: `/p/${slug}/conteudos?peca=${encodeURIComponent(path)}&aba=${aba}`,
    disallowed: ['Edit(**/revisao.json)', 'Write(**/revisao.json)'],
    extra: { pasta: path, aba, ids },
  }, modoDe(body?.modo));
  return { ...r, ids, pedido: estadoPedido(r.pedido) };
}

// ---------- Rodar agora a fila de análise dos concorrentes ----------
export function rodarAnalise(slug: string, body: { comp?: string; modo?: string }) {
  if (!okSlug(slug)) throw new ValidationError('analise', ['empresa inválida']);
  const comp = body?.comp ? String(body.comp) : null;
  const fila = S.listAnalysisQueue(slug).filter((q) => !comp || q.id === comp);
  if (!fila.length) throw new ValidationError('analise', [comp ? 'este concorrente não tem pedido na fila' : 'a fila de análise está vazia']);
  if (ativo(slug, 'analise:*') || (comp && ativo(slug, `analise:${comp}`))) throw new ValidationError('analise', ['a fila de análise já está rodando']);
  const modulos = fila.reduce((n, q) => n + q.request.modules.length, 0);
  const alvo = comp ? `só o concorrente ${comp} (${fila[0].request.modules.join(', ')})` : `a fila inteira (${fila.map((q) => `${q.id}: ${q.request.modules.join(', ')}`).join(' · ')})`;
  const prompt = [
    `Pedido do Oliver pelo app (Concorrentes → Análise → Rodar agora): use a skill analise-concorrentes e rode a fila de concorrentes da empresa ${slug}, ${alvo}.`,
    `Siga o passo a passo da skill (npm run analise -- fila ${slug}; script no mecânico, subagente Sonnet por concorrente no que exige leitura; gravar com npm run analise -- salvar). O status "rodando" nos pedidos foi marcado pelo app para esta rodada: rode-os normalmente.${comp ? ` Rode o script só para ele (npm run analise -- site ${slug} ${comp}), nunca com --fila.` : ''}`,
    'O Oliver não está na conversa: o que falhar (site bloqueado, timeout), anote e siga com o resto. Termine com npm run validate e uma linha por concorrente com o que ficou pronto.',
  ].join('\n');
  const nome = comp ? fila[0].name : null;
  const r = runPedido({
    slug, tipo: 'analise', ref: comp ? `analise:${comp}` : 'analise:*', agente: 'agent:pesquisador', prompt,
    titulo: comp ? `Análise · ${nome} (${modulos} módulo(s))` : `Fila de análise · ${fila.length} concorrente(s)`,
    link: comp ? `/p/${slug}/concorrentes/${comp}` : `/p/${slug}/concorrentes/coletas`,
    allowed: ['Bash(npm run analise *)', 'Bash(npm run collect *)', 'Bash(npm run validate)', 'WebFetch', 'WebSearch'],
    extra: { comps: fila.map((q) => q.id), modulos },
  }, modoDe(body?.modo), () => { for (const q of fila) S.setAnalysisRequestStatus(slug, q.id, 'rodando'); });
  return { ...r, pedido: estadoPedido(r.pedido) };
}
