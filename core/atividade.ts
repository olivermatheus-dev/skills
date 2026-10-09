// Registro de atividade (tarefa 046 A) do lado do app: lista para o dock e embrulha o que roda dentro do servidor
// (coletas, site, Reclame Aqui, coleta semanal, export de mockup) para aparecer no dock mesmo se a pessoa sair da tela.
// O formato e a gravação ficam em tools/lib/atividade.mjs (o heartbeat usa o mesmo).
import * as AT from '../tools/lib/atividade.mjs';
import { ValidationError } from './store';
import { stopAi, readLock } from './runner';
export type { Atividade } from '../tools/lib/atividade.mjs';

const okSlug = (s: string) => /^[a-z0-9][a-z0-9-]*$/.test(s);

/** o que o dock mostra: rodando, terminados que pedem atenção (IA ou erro não vistos) e os recém-terminados (10 s) */
export function atividadeView(slug: string) {
  if (!okSlug(slug)) throw new ValidationError('atividade', ['empresa inválida']);
  const todos = AT.listar({ slug, limite: 60 });
  const agora = Date.now();
  const lock = readLock()?.atividade;
  const dock = todos.filter((a) => a.status === 'rodando'
    || (!a.visto && (a.tipo === 'ia' || a.status === 'erro'))
    || (a.fim && agora - Date.parse(a.fim) < 10_000))
    .sort((a, b) => Number(b.status === 'rodando') - Number(a.status === 'rodando')) // rodando primeiro, depois o mais novo
    .map((a) => ({ ...a, link: a.link ?? `/p/${slug}/agentes?h=${a.id}`, podeParar: a.status === 'rodando' && a.id === lock })); // sem link = o histórico na página Agentes
  return { dock, historico: todos };
}

export function marcarVisto(slug: string, ids: unknown) {
  if (!okSlug(slug)) throw new ValidationError('atividade', ['empresa inválida']);
  AT.marcarVisto(Array.isArray(ids) ? ids.map(String) : []);
  return atividadeView(slug);
}

/** Parar pelo dock: só o que roda no heartbeat (IA) dá para parar; coleta no servidor termina sozinha */
export function pararAtividade(slug: string, id: string) {
  const a = AT.lerAtividade(id);
  if (!a || a.slug !== slug) throw new ValidationError('atividade', ['trabalho não encontrado']);
  if (a.status !== 'rodando') return atividadeView(slug);
  if (readLock()?.atividade !== id) throw new ValidationError('atividade', ['este trabalho não pode ser parado daqui: espere terminar']);
  stopAi(slug);
  return atividadeView(slug);
}

/** roda `fn` registrando o trabalho; o resumo sai do resultado (`resumir`) e o erro vira status erro */
export async function comAtividade<T>(meta: Parameters<typeof AT.iniciar>[0], fn: (passo: (t: string) => void) => Promise<T>, resumir?: (r: T) => { resumo?: string; erro?: string | null }) {
  const a = AT.iniciar(meta);
  try {
    const r = await fn((t) => AT.passo(a.id, t));
    const s = resumir?.(r) ?? {};
    AT.terminar(a.id, s.erro ? 'erro' : 'feito', { resumo: s.resumo ?? null, erro: s.erro ?? null });
    return r;
  } catch (e) {
    AT.terminar(a.id, 'erro', { erro: (e as Error).message });
    throw e;
  }
}

/**
 * Coleta como trabalho (046 C): responde na hora com o id e roda `fn` no fundo, no processo do app. A tela que disparou
 * acompanha pelo registro (`GET …/atividade/:id`) e lê o `resultado` no fim; sair da tela não perde nada.
 * O mesmo trabalho (empresa + fonte + ref) já rodando não roda duas vezes: devolve o id dele.
 */
export function emSegundoPlano<T>(meta: Parameters<typeof AT.iniciar>[0], fn: (passo: (t: string) => void) => Promise<T>, resumir?: (r: T) => { resumo?: string; erro?: string | null }) {
  const igual = AT.listar({ slug: meta.slug, limite: 60 }).find((a) => a.status === 'rodando' && a.fonte === meta.fonte && a.ref === (meta.ref ?? null) && a.pid === process.pid);
  if (igual) return { atividade: igual.id, jaRodando: true };
  const a = AT.iniciar(meta);
  void (async () => {
    try {
      const r = await fn((t) => AT.passo(a.id, t));
      const s = resumir?.(r) ?? {};
      AT.terminar(a.id, s.erro ? 'erro' : 'feito', { resumo: s.resumo ?? null, erro: s.erro ?? null, resultado: r ?? null });
    } catch (e) {
      console.error(`[${meta.fonte}] ${meta.slug}/${meta.ref ?? ''}: ${(e as Error).message}`);
      AT.terminar(a.id, 'erro', { erro: (e as Error).message });
    }
  })();
  return { atividade: a.id, jaRodando: false };
}

/** um trabalho (para a tela que disparou acompanhar até o fim) */
export function lerTrabalho(slug: string, id: string) {
  const a = AT.lerAtividade(id);
  if (!a || (a.slug !== slug && a.slug !== '*')) throw new ValidationError('atividade', ['trabalho não encontrado']);
  if (a.status === 'rodando' && a.pid && a.pid !== process.pid) AT.listar({ slug, limite: 60 }); // confere se o processo dele ainda vive
  return AT.lerAtividade(id);
}

export const iniciar = AT.iniciar;
export const passo = AT.passo;
export const terminar = AT.terminar;
