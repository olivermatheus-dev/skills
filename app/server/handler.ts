// API local da interface: rotas /api/* (e os arquivos de mídia) sobre core/store.ts. Quem liga no Vite é o plugin
// em api.ts, que carrega este módulo à parte (editar core/ ou tools/ não reinicia o app).
// Roda só na máquina do Oliver (npm run app). Não há banco: os arquivos do repo são o banco.
import type { Connect } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { join, normalize, extname, dirname, sep } from 'node:path';
import { spawn } from 'node:child_process';
import * as S from '../../core/store';
import { detectLink } from '../../core/platform';
import { P } from '../../schema';
import * as K from '../../core/secrets';
import * as MK from '../../core/mockups';
import * as R from '../../core/runner';
import * as VE from '../../core/videoedit';
import * as AV from '../../core/atividade';
import * as AG from '../../core/agentes';
import { resetEnvCache } from '../../tools/intel/env';

type Params = Record<string, string>;
type Handler = (p: Params, body: any, q: URLSearchParams) => unknown | Promise<unknown>;
const routes: [string, string, Handler][] = [];
const on = (method: string, path: string, h: Handler) => routes.push([method, path, h]);
/** slug/id seguros para virar nome de pasta: minúsculas, dígitos e hífen; começa com letra/dígito */
const isSlug = (v: unknown): v is string => typeof v === 'string' && /^[a-z0-9][a-z0-9-]*$/.test(v);

// Projetos e tags
on('GET', '/api/projects', () => S.listProjects());
on('POST', '/api/projects', (_, b) => S.createProject(b.slug, b.name));
on('GET', '/api/projects/:slug', (p) => S.getProject(p.slug));
on('PUT', '/api/projects/:slug', (p, b) => S.saveProject({ ...b, slug: p.slug }));
on('GET', '/api/projects/:slug/tags', (p) => S.getTags(p.slug));
on('PUT', '/api/projects/:slug/tags', (p, b) => S.saveTags(p.slug, b));

// Tarefas (Kanban)
on('GET', '/api/projects/:slug/tasks', (p) => S.listTasks(p.slug));
on('POST', '/api/projects/:slug/tasks', (p, b) => S.saveTask(p.slug, b.data, b.body));
on('PUT', '/api/projects/:slug/tasks/:id', (p, b) => S.saveTask(p.slug, { ...b.data, id: p.id }, b.body));
on('DELETE', '/api/projects/:slug/tasks/:id', (p) => S.archiveTask(p.slug, p.id));
on('POST', '/api/projects/:slug/tasks/:id/unarchive', (p) => S.unarchiveTask(p.slug, p.id));
on('POST', '/api/projects/:slug/tasks/:id/move', (p, b) => S.moveTask(p.slug, p.id, b.status, b.who ?? 'oliver'));
on('GET', '/api/agents', () => S.listAgents());
on('POST', '/api/projects/:slug/tasks/:id/comments', (p, b) => S.commentTask(p.slug, p.id, b ?? {}));
// Rodar IA: Claude Code nas tarefas prontas (segundo plano = heartbeat · terminal = janela interativa)
on('GET', '/api/projects/:slug/runner', (p) => R.runnerStatus(p.slug));
// Atividade (046 A): o que está rodando (IA, coletas, renders) para o dock e a página Agentes
on('GET', '/api/projects/:slug/atividade', (p) => AV.atividadeView(p.slug));
on('POST', '/api/projects/:slug/atividade/visto', (p, b) => AV.marcarVisto(p.slug, b?.ids));
on('POST', '/api/projects/:slug/atividade/:id/parar', (p) => AV.pararAtividade(p.slug, p.id));
on('GET', '/api/projects/:slug/atividade/:id', (p) => AV.lerTrabalho(p.slug, p.id));
// Página Agentes (046 E): equipe, estado, fila, histórico e instruções permanentes
on('GET', '/api/projects/:slug/agentes', (p) => AG.agentesView(p.slug));
on('GET', '/api/agentes/:nome/notas', (p) => AG.lerNotas(p.nome));
on('POST', '/api/agentes/:nome/notas', (p, b) => AG.salvarNotas(p.nome, b ?? {}));
on('POST', '/api/projects/:slug/runner', (p, b) => R.runAi(p.slug, b ?? {}));
on('DELETE', '/api/projects/:slug/runner', (p) => R.stopAi(p.slug));
// Pedidos avulsos de IA (046 D): estado do mais novo de uma tela (?ref=peca:<pasta> | analise:<id|*> | relatorio:<id>),
// Pedir ajustes ao Claude (anotações da peça, ?path=) e Rodar agora a fila de análise dos concorrentes
const PD = () => import('../../core/pedidos-ia');
on('GET', '/api/projects/:slug/pedido-ia', async (p, _, q) => (await PD()).pedidoView(p.slug, q.get('ref') ?? ''));
on('POST', '/api/projects/:slug/piece/ajustes', async (p, b, q) => (await PD()).pedirAjustes(p.slug, q.get('path') ?? '', b ?? {}));
on('POST', '/api/projects/:slug/analysis-queue/rodar', async (p, b) => (await PD()).rodarAnalise(p.slug, b ?? {}));

// Personas
on('GET', '/api/projects/:slug/personas', (p) => S.listPersonas(p.slug));
on('POST', '/api/projects/:slug/personas', (p, b) => S.savePersona(p.slug, { ...b.data, id: b.data.id ?? S.newPersonaId(p.slug, b.data.name) }, b.body ?? ''));
on('PUT', '/api/projects/:slug/personas/:id', (p, b) => S.savePersona(p.slug, { ...b.data, id: p.id }, b.body ?? ''));
on('DELETE', '/api/projects/:slug/personas/:id', (p) => S.deletePersona(p.slug, p.id));

// Anotações
on('GET', '/api/projects/:slug/notes', (p) => S.listNotes(p.slug));
on('POST', '/api/projects/:slug/notes', (p, b) => S.saveNote(p.slug, b.data, b.body ?? ''));
on('PUT', '/api/projects/:slug/notes/:id', (p, b) => S.saveNote(p.slug, { ...b.data, id: p.id }, b.body ?? ''));
on('DELETE', '/api/projects/:slug/notes/:id', (p) => S.deleteNote(p.slug, p.id));

// Ideias
on('GET', '/api/projects/:slug/ideas', (p) => S.listIdeas(p.slug));
on('POST', '/api/projects/:slug/ideas', (p, b) => S.saveIdea(p.slug, b.data, b.body ?? ''));
on('PUT', '/api/projects/:slug/ideas/:id', (p, b) => S.saveIdea(p.slug, { ...b.data, id: p.id }, b.body ?? ''));
// Curadoria (041 F1): fontes onde a IA procura ideias (curadoria/fontes.json). status em lote = aceitar (ativa), recusar (arquivada), pausar
const slugOk = (p: Params) => { if (!isSlug(p.slug) || (p.id !== undefined && !isSlug(p.id))) throw new S.ValidationError('curadoria', ['slug ou id inválido']); };
on('GET', '/api/projects/:slug/sources', (p) => { slugOk(p); return S.listSources(p.slug); });
on('POST', '/api/projects/:slug/sources', (p, b) => { slugOk(p); return S.saveSource(p.slug, b ?? {}); });
on('PUT', '/api/projects/:slug/sources/:id', (p, b) => { slugOk(p); return S.saveSource(p.slug, { ...b, id: p.id }); });
on('POST', '/api/projects/:slug/sources-status', (p, b) => { slugOk(p); return S.setSourcesStatus(p.slug, Array.isArray(b?.ids) ? b.ids.map(String) : [], b?.status); });
on('POST', '/api/projects/:slug/sources-suggest', async (p, b) => { slugOk(p); return (await import('../../core/curadoria')).suggestSource(p.slug, String(b?.url ?? '')); });
on('GET', '/api/projects/:slug/strategy-refs', (p) => { slugOk(p); return S.strategyRefs(p.slug); });
// Pesquisar ideias (041 F3): rodadas (aba Pesquisas), andamento lido dos arquivos, pedido (o mesmo do terminal) e Rodar/Parar (heartbeat --pesquisa)
const PS = () => import('../../core/pesquisas');
on('GET', '/api/projects/:slug/refs', (p) => { slugOk(p); return S.listRefs(p.slug); });
on('GET', '/api/projects/:slug/pesquisas', async (p) => { slugOk(p); return (await PS()).pesquisasStatus(p.slug); });
on('POST', '/api/projects/:slug/pesquisas', async (p, b) => { slugOk(p); return (await PS()).pedirPesquisa(p.slug, b ?? {}); });
on('POST', '/api/projects/:slug/pesquisas-parar', async (p) => { slugOk(p); return (await PS()).pararPesquisa(p.slug); });
on('GET', '/api/projects/:slug/pesquisas/:rodada', async (p) => { slugOk(p); return (await PS()).rodadaView(p.slug, p.rodada); });
on('POST', '/api/projects/:slug/pesquisas/:rodada/rodar', async (p, b) => { slugOk(p); return (await PS()).rodarPesquisa(p.slug, p.rodada, b?.modo === 'terminal' ? 'terminal' : 'background'); });

// Contexto (markdown livre)
on('GET', '/api/projects/:slug/context', (p) => S.listContext(p.slug));
on('GET', '/api/projects/:slug/context/:name', (p) => ({ name: p.name, text: S.getContext(p.slug, p.name) }));
on('PUT', '/api/projects/:slug/context/:name', (p, b) => S.saveContext(p.slug, p.name, b.text));

// Marca: brand.css (somente leitura; a interface mostra os tokens). Sem arquivo → text: null.
on('GET', '/api/projects/:slug/brand-css', (p) => {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(p.slug)) throw new S.ValidationError(p.slug, ['slug inválido']);
  const file = join(S.ROOT, P.brand(p.slug), 'brand.css');
  return { file: join(P.brand(p.slug), 'brand.css'), text: existsSync(file) ? readFileSync(file, 'utf8') : null };
});

// Kit de marca (tarefa 024): brand.json → brand.css + bloco do BRAND.md; fontes enviadas vão para brand/fonts/
on('GET', '/api/projects/:slug/brand', (p) => S.getBrand(p.slug));
on('PUT', '/api/projects/:slug/brand', (p, b) => S.saveBrand(p.slug, b));
on('POST', '/api/projects/:slug/brand/font', (p, b) => S.uploadBrandFont(p.slug, String(b.name ?? ''), String(b.base64 ?? '')));

// Concorrentes
on('POST', '/api/detect-link', (_, b) => detectLink(b.url));
on('GET', '/api/projects/:slug/competitors', (p) => S.listCompetitors(p.slug));
on('POST', '/api/projects/:slug/competitors', (p, b) => S.saveCompetitor(p.slug, b.data, b.body ?? ''));
on('GET', '/api/projects/:slug/competitors/:id', (p) => ({
  ...S.getCompetitor(p.slug, p.id), ...S.listSnapshotsForView(p.slug, p.id), marks: S.getMarks(p.slug, p.id),
}));
on('PUT', '/api/projects/:slug/competitors/:id', (p, b) => S.saveCompetitor(p.slug, { ...b.data, id: p.id }, b.body ?? ''));
on('DELETE', '/api/projects/:slug/competitors/:id', (p) => S.deleteCompetitor(p.slug, p.id));
on('PUT', '/api/projects/:slug/competitors/:id/marks', (p, b) => S.setMark(p.slug, p.id, b.key, b.mark));
/** nome do concorrente para o título no dock */
const nomeComp = (slug: string, id: string) => { try { return S.getCompetitor(slug, id).data.name; } catch { return id; } };
const linkComp = (slug: string, id: string) => `/p/${slug}/concorrentes/${id}`;
// Coletas (046 C): respondem na hora com { atividade } e rodam no fundo; a tela acompanha por GET …/atividade/:id
on('POST', '/api/projects/:slug/competitors/:id/collect', async (p, b) => {
  const { collectCompetitor } = await import('../../tools/intel/collect');
  slugOk(p);
  return AV.emSegundoPlano({ slug: p.slug, tipo: 'coleta', fonte: 'coleta', titulo: `Puxando ${nomeComp(p.slug, p.id)}`, passo: 'Abrindo os perfis', link: linkComp(p.slug, p.id), ref: p.id },
    (passo) => collectCompetitor(p.slug, p.id, { platforms: b?.platforms, maxItems: b?.maxItems, onPasso: passo }),
    (r) => { const ok = r.filter((x) => x.ok).length; return { resumo: `${ok}/${r.length} perfis · ${r.reduce((n, x) => n + x.items, 0)} posts`, erro: r.length && !ok ? 'nenhum perfil coletado' : null }; });
});

// Análise por módulos: resultados, anotações, pedido (fila da IA) e o módulo `site` (script, roda aqui mesmo)
on('GET', '/api/projects/:slug/competitors/:id/analysis', (p) => S.getAnalysis(p.slug, p.id));
on('PUT', '/api/projects/:slug/competitors/:id/analysis/notes/:key', (p, b) => S.setAnalysisNote(p.slug, p.id, p.key, String(b.text ?? '')));
on('PUT', '/api/projects/:slug/competitors/:id/analysis/request', (p, b) => S.requestAnalysis(p.slug, p.id, b));
on('DELETE', '/api/projects/:slug/competitors/:id/analysis/request', (p) => S.clearAnalysisRequest(p.slug, p.id));
on('POST', '/api/projects/:slug/competitors/:id/analysis/site', async (p) => {
  const { analyzeSite } = await import('../../tools/intel/site');
  slugOk(p);
  return AV.emSegundoPlano({ slug: p.slug, tipo: 'coleta', fonte: 'site', titulo: `Lendo o site de ${nomeComp(p.slug, p.id)}`, passo: 'Abrindo o site e o sitemap', link: `${linkComp(p.slug, p.id)}?aba=analise`, ref: p.id },
    () => analyzeSite(p.slug, p.id), (r) => ({ resumo: `${r.pages} página(s) · sitemap ${r.sitemap}`, erro: r.ok ? null : r.errors.join(' · ') || 'falhou' }));
});
on('POST', '/api/projects/:slug/competitors/:id/analysis/ra', async (p) => {
  const { runReclameAqui } = await import('../../tools/intel/reclameaqui');
  slugOk(p);
  return AV.emSegundoPlano({ slug: p.slug, tipo: 'coleta', fonte: 'reclameaqui', titulo: `Reclame Aqui de ${nomeComp(p.slug, p.id)}`, passo: 'Buscando a página da empresa', link: `${linkComp(p.slug, p.id)}?aba=analise`, ref: p.id },
    () => runReclameAqui(p.slug, p.id), (r) => ({ resumo: r?.found ? `${r.status ?? ''}${r.score != null ? ` ${r.score}` : ''} · ${r.complaints ?? 0} reclamações`.trim() : 'página não achada' }));
});
on('GET', '/api/projects/:slug/analysis-overview', async (p) => (await import('../../tools/intel/summary')).analysisOverview(p.slug));
// Visões da área (Panorama, Comparar, Conteúdos): análises de todos e a última coleta de cada perfil com as marcações
on('GET', '/api/projects/:slug/analysis-all', (p) => S.listCompetitors(p.slug).map((c) => ({ id: c.data.id, results: S.getAnalysisResults(p.slug, c.data.id) })));
on('GET', '/api/projects/:slug/competitors-feed', (p) => S.listCompetitors(p.slug).filter((c) => c.data.status === 'ativo').map((c) => ({
  id: c.data.id, ...S.listSnapshotsForView(p.slug, c.data.id, { full: 2, max: 2 }), marks: S.getMarks(p.slug, c.data.id),
})));
// Coleta semanal (redes + anúncios; só sob comando) e anúncios da Biblioteca da Meta (fase D da 031)
on('GET', '/api/projects/:slug/weekly', async (p) => (await import('../../tools/intel/semanal')).status(p.slug));
on('POST', '/api/projects/:slug/weekly', async (p) => {
  const W = await import('../../tools/intel/semanal');
  void AV.comAtividade({ slug: p.slug, tipo: 'coleta', fonte: 'semanal', titulo: 'Coleta semanal (redes + anúncios)', link: `/p/${p.slug}/concorrentes/coletas` },
    (passo) => W.runWeekly(p.slug, { onPasso: passo }),
    (r) => ({ resumo: r?.lastSummary ? `${r.lastSummary.ok}/${r.lastSummary.profiles} perfis${r.lastSummary.ads != null ? ` · ${r.lastSummary.ads} anúncios` : ''}` : undefined }))
    .catch((e) => console.error(`[coleta semanal] ${p.slug}: ${e.message}`));
  await new Promise((r) => setTimeout(r, 300));
  return W.status(p.slug);
});
on('GET', '/api/projects/:slug/weekly/report', async (p, _, q) => ({ text: (await import('../../tools/intel/semanal')).readReport(p.slug, q.get('week') ?? '') }));
// a própria empresa como referência no Comparar e no Panorama (companies/<slug>/intel/referencia.json; null se não houver)
on('GET', '/api/projects/:slug/referencia', async (p) => {
  const { Referencia, company } = await import('../../schema');
  const f = join(S.ROOT, company(p.slug), 'intel', 'referencia.json');
  return existsSync(f) ? Referencia.parse(JSON.parse(readFileSync(f, 'utf8'))) : null;
});
// matriz de funcionalidades × concorrentes (intel/matriz.json); célula editada aqui vira by: 'oliver'
on('GET', '/api/projects/:slug/matrix', (p) => S.getMatrix(p.slug));
on('GET', '/api/projects/:slug/gaps', (p) => S.getGaps(p.slug));
on('PUT', '/api/projects/:slug/matrix/cells/:col/:feat', (p, b) => S.setMatrixCell(p.slug, p.col, p.feat, { status: b.status ?? null, note: b.note, source: b.source }, 'oliver'));
on('POST', '/api/projects/:slug/matrix/features', (p, b) => S.saveMatrixFeature(p.slug, b));
on('PUT', '/api/projects/:slug/matrix/features/:id', (p, b) => S.saveMatrixFeature(p.slug, { ...b, id: p.id }));
on('DELETE', '/api/projects/:slug/matrix/features/:id', (p) => S.deleteMatrixFeature(p.slug, p.id));
on('POST', '/api/projects/:slug/matrix/rename-group', (p, b) => S.renameMatrixGroup(p.slug, String(b.from ?? ''), String(b.to ?? '')));
// coletor de anúncios (Playwright só carrega dentro do collectAds)
const adsMod = () => import('../../tools/intel/ads');
on('GET', '/api/projects/:slug/ads', async (p) => {
  const A = await adsMod().catch(() => null);
  return S.listCompetitors(p.slug).filter((c) => c.data.status === 'ativo').map((c) => ({ id: c.data.id, history: A ? A.listAds(p.slug, c.data.id).slice(-2) : [] }));
});
on('GET', '/api/projects/:slug/competitors/:id/ads/history', (p) => S.adsHistory(p.slug, p.id));
// classificador de regras (037 B): funil, tipo, objetivo, destino, oferta e motivos dos anúncios ativos da última coleta
on('GET', '/api/projects/:slug/ads/classified', async (p) => {
  if (!isSlug(p.slug)) throw new S.ValidationError('ads', ['slug inválido']);
  const [A, C] = await Promise.all([adsMod(), import('../../tools/intel/ads-classify')]);
  return S.listCompetitors(p.slug).filter((c) => c.data.status === 'ativo').map((c) => {
    const ads = (A.listAds(p.slug, c.data.id).at(-1)?.data.ads ?? []).filter((a) => a.active);
    const irmaos = C.contarIrmaos(ads);
    // salvos que já não estão na coleta (saíram do ar) também são classificados, a partir da cópia guardada
    const vivos = new Set(ads.map((a) => a.id));
    const congelados = Object.values(S.getAdsMarks(p.slug, c.data.id).ads).flatMap((m) => (m.saved && m.frozen && !vivos.has(m.frozen.id) ? [m.frozen] : []));
    return { id: c.data.id, ads: [...ads.map((a) => ({ adId: a.id, ...C.classificarAnuncio(a, { irmaos: irmaos.get(a.id) }) })), ...congelados.map((a) => ({ adId: a.id, ...C.classificarAnuncio(a, {}) }))] };
  });
});
// marcas do Oliver (037 D): nota, tags, salvo (cópia do anúncio) e override de funil/tipo/objetivo
on('GET', '/api/projects/:slug/ads/marks', (p) => { slugOk(p); return S.listAdsMarks(p.slug); });
on('PUT', '/api/projects/:slug/competitors/:id/ads/marks/:adId', (p, b) => { slugOk(p); return S.setAdMark(p.slug, p.id, p.adId, b ?? {}); });
on('POST', '/api/projects/:slug/competitors/:id/ads', async (p) => {
  const { collectAds } = await adsMod();
  slugOk(p);
  return AV.emSegundoPlano({ slug: p.slug, tipo: 'coleta', fonte: 'anuncios', titulo: `Anúncios de ${nomeComp(p.slug, p.id)}`, passo: 'Abrindo a Biblioteca de Anúncios da Meta', link: `${linkComp(p.slug, p.id)}?aba=anuncios`, ref: p.id },
    () => collectAds(p.slug, p.id), (r) => ({ resumo: `${r.ads} anúncio(s) ativo(s)`, erro: r.ok ? null : r.errors.join(' · ') || 'falhou' }));
});
on('GET', '/api/projects/:slug/analysis-queue', (p) => S.listAnalysisQueue(p.slug));

// Fichas de análise (040 D): resumo para o selo, vocabulário dos selects, a ficha do item, edição como override e pedido de fila
const FI = () => import('../../core/fichas');
on('GET', '/api/projects/:slug/fichas', async (p) => { slugOk(p); return (await FI()).resumoFichas(p.slug); });
on('GET', '/api/projects/:slug/fichas-vocab', async (p) => { slugOk(p); return (await FI()).vocabView(p.slug); });
on('GET', '/api/projects/:slug/competitors/:id/fichas/:key', async (p) => (await FI()).getFichaView(p.slug, p.id, p.key));
on('PUT', '/api/projects/:slug/competitors/:id/fichas/:key/override', async (p, b) => (await FI()).editarFicha(p.slug, p.id, p.key, b ?? {}));
on('POST', '/api/projects/:slug/competitors/:id/fichas/:key/pedido', async (p) => (await FI()).pedirAnalise(p.slug, p.id, p.key));
on('DELETE', '/api/projects/:slug/competitors/:id/fichas/:key/pedido', async (p) => (await FI()).cancelarPedido(p.slug, p.id, p.key));
// Fila de fichas (040 E): seleção → pedido.json por concorrente → "Rodar agora" (heartbeat --fichas, mesmo lock do Rodar IA)
const FF = () => import('../../core/fichas-fila');
on('GET', '/api/projects/:slug/fichas-fila', async (p) => { slugOk(p); return (await FF()).filaStatus(p.slug); });
on('POST', '/api/projects/:slug/fichas-fila', async (p, b) => { slugOk(p); return (await FF()).pedirLote(p.slug, b ?? {}); });
on('POST', '/api/projects/:slug/fichas-fila/rodar', async (p) => { slugOk(p); return (await FF()).rodarFila(p.slug); });
on('DELETE', '/api/projects/:slug/fichas-fila/rodar', async (p) => { slugOk(p); return (await FF()).pararFila(p.slug); });
// Relatórios por concorrente (040 F): lista, leitura, termos novos em lote e "Gerar relatório" (abre o Claude Code num terminal)
const RL = () => import('../../core/relatorios');
on('GET', '/api/projects/:slug/competitors/:id/relatorios', async (p) => (await RL()).listarRelatoriosView(p.slug, p.id));
on('GET', '/api/projects/:slug/competitors/:id/relatorios-fichas', async (p) => (await RL()).fichasParaRelatorio(p.slug, p.id));
on('POST', '/api/projects/:slug/competitors/:id/relatorios', async (p, b) => (await RL()).gerarRelatorioView(p.slug, p.id, b ?? {}));
on('GET', '/api/projects/:slug/competitors/:id/relatorios/:rid', async (p) => (await RL()).relatorioView(p.slug, p.id, p.rid));
on('POST', '/api/projects/:slug/competitors/:id/relatorios/:rid/termos', async (p, b) => (await RL()).decidirTermosView(p.slug, p.id, p.rid, b ?? {}));
// Vocabulário vivo (040 H): termos novos de uma ficha, o que o diálogo precisa para decidir e a decisão fora do relatório (mesma função do CLI e do relatório)
const TM = () => import('../../core/termos');
on('GET', '/api/projects/:slug/termos/:grupo/:valor', async (p) => { slugOk(p); return (await TM()).termoInfo(p.slug, p.grupo, p.valor); });
on('POST', '/api/projects/:slug/termos/decidir', async (p, b) => (await RL()).decidirTermosAvulsosView(p.slug, b ?? {}));

// Concorrentes: resumo leve para a lista (última coleta por perfil, sem itens)
on('GET', '/api/projects/:slug/competitors-summary', async (p) => (await import('../../tools/intel/summary')).summarizeCompetitors(p.slug));

// Chaves de API (.env do projeto e .env geral). Nunca devolve o valor inteiro.
on('GET', '/api/projects/:slug/secrets', (p) => K.listSecrets(p.slug));
on('PUT', '/api/projects/:slug/secrets/:key', (p, b) => { const r = K.setSecret(b.scope === 'geral' ? null : p.slug, p.key, String(b.value ?? '')); resetEnvCache(); return r; });
on('POST', '/api/projects/:slug/secrets/:key/test', (p) => K.testSecret(p.slug, p.key));

// Peças (vídeos) e revisão por anotações (tarefa 022): ?path= é a pasta da peça relativa a contents/
const piece = (q: URLSearchParams) => q.get('path') ?? '';
on('GET', '/api/projects/:slug/pieces', (p) => S.listPieces(p.slug));
on('GET', '/api/projects/:slug/piece', (p, _, q) => S.getPiece(p.slug, piece(q)));
on('PUT', '/api/projects/:slug/piece/review', (p, b, q) => S.saveReview(p.slug, piece(q), b));
on('POST', '/api/projects/:slug/pieces', (p, b) => S.createPiece(p.slug, b));
on('GET', '/api/projects/:slug/piece/text', (p, _, q) => S.getPieceText(p.slug, piece(q), q.get('file') ?? ''));
on('PUT', '/api/projects/:slug/piece/text', (p, b, q) => S.savePieceText(p.slug, piece(q), q.get('file') ?? '', String(b.text ?? '')));
// Ficha da peça (peca.json): nome, versão principal, tags, notas (legenda, copy…), favorito, arquivada
on('PUT', '/api/projects/:slug/piece/meta', (p, b, q) => S.savePieceMeta(p.slug, piece(q), b ?? {}));
// Abrir no computador: ?file= relativo à pasta da peça (vazio = a pasta). reveal = Explorer com o arquivo selecionado; open = app padrão
// ajustes diretos no vídeo (022 C): volume, duração e texto → timeline.json; prévia = sfx → mix → produce --draft
on('POST', '/api/projects/:slug/piece/adjust', (p, b, q) => VE.ajustar(p.slug, piece(q), b));
on('GET', '/api/projects/:slug/piece/preview', (p, _, q) => VE.previaStatus(p.slug, piece(q)));
on('POST', '/api/projects/:slug/piece/preview', (p, b, q) => VE.gerarPrevia(p.slug, piece(q), b ?? {}));
on('POST', '/api/projects/:slug/piece/reveal', (p, _, q) => openOnDesktop(S.pieceAbsPath(p.slug, piece(q), q.get('file') ?? ''), 'reveal'));
on('POST', '/api/projects/:slug/piece/open', (p, _, q) => openOnDesktop(S.pieceAbsPath(p.slug, piece(q), q.get('file') ?? ''), 'open'));

function openOnDesktop(file: string, how: 'reveal' | 'open') {
  const isDir = statSync(file).isDirectory();
  const opts = { detached: true, stdio: 'ignore' as const };
  if (process.platform === 'win32') {
    // aspas por conta própria: o explorer não aceita o argumento "/select,..." inteiro entre aspas
    const arg = how === 'reveal' && !isDir ? `/select,"${file}"` : `"${file}"`;
    spawn('explorer.exe', [arg], { ...opts, windowsVerbatimArguments: true }).unref();
  } else if (process.platform === 'darwin') spawn('open', how === 'reveal' && !isDir ? ['-R', file] : [file], opts).unref();
  else spawn('xdg-open', [how === 'reveal' && !isDir ? dirname(file) : file], opts).unref();
  return { ok: true };
}

// Editor de mockups (tarefa 030): catálogo, capturas (colar/arrastar) e peças em camadas (mockup.json versão 2)
on('GET', '/api/mockup/catalogo', () => MK.catalogo());
on('GET', '/api/mockup/aparelhos', () => MK.aparelhosRuntime());
on('GET', '/api/projects/:slug/capturas', (p) => MK.listarCapturas(p.slug));
on('POST', '/api/projects/:slug/capturas', (p, b) => MK.novaCaptura(p.slug, b ?? {}));
on('GET', '/api/projects/:slug/mockups', (p) => MK.listarMockups(p.slug));
on('POST', '/api/projects/:slug/mockups', (p, b) => MK.criarMockup(p.slug, b ?? {}));
on('GET', '/api/projects/:slug/mockup', (p, _, q) => MK.lerMockup(p.slug, piece(q)));
on('PUT', '/api/projects/:slug/mockup', (p, b, q) => MK.salvarMockup(p.slug, piece(q), b));
on('POST', '/api/projects/:slug/mockup/export', (p, b, q) => AV.comAtividade(
  { slug: p.slug, tipo: 'render', fonte: 'mockup', titulo: `Exportando mockup ${piece(q).split('/').pop()}`, passo: 'Renderizando em alta', link: `/p/${p.slug}/mockups?peca=${encodeURIComponent(piece(q))}`, ref: piece(q) },
  () => MK.exportarMockup(p.slug, piece(q), b ?? {}), (r) => ({ resumo: r.ok ? `${r.arquivos.length} arquivo(s)` : undefined, erro: r.ok ? null : r.erro ?? 'export falhou' })));

// Galeria de formatos (tarefa 027): global, library/formatos/<id>/formato.json
on('GET', '/api/formats', () => S.listFormats());
on('POST', '/api/formats', (_, b) => S.createFormatDraft(b));
on('GET', '/api/formats/:id', (p) => S.getFormat(p.id));
on('PUT', '/api/formats/:id', (p, b) => S.saveFormat(p.id, b ?? {}));
on('POST', '/api/formats/:id/refs', (p, b) => S.addFormatRef(p.id, b ?? {}));
on('DELETE', '/api/formats/:id/refs/:i', (p) => S.removeFormatRef(p.id, Number(p.i)));
on('POST', '/api/formats/:id/examples', (p, b) => S.promoteExample(p.id, b ?? {}));
on('DELETE', '/api/formats/:id/examples/:i', (p) => S.removeExample(p.id, Number(p.i)));

on('GET', '/api/validate', () => S.validateAll());

// ---------- infraestrutura ----------
function match(pattern: string, path: string): Params | null {
  const a = pattern.split('/'), b = path.split('/');
  if (a.length !== b.length) return null;
  const out: Params = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(':')) out[a[i].slice(1)] = decodeURIComponent(b[i]);
    else if (a[i] !== b[i]) return null;
  }
  return out;
}
const readBody = (req: IncomingMessage) => new Promise<any>((res, rej) => {
  let d = ''; req.on('data', (c) => (d += c)); req.on('end', () => { try { res(d ? JSON.parse(d) : {}); } catch (e) { rej(e); } }); req.on('error', rej);
});
const send = (res: ServerResponse, code: number, data: unknown) => {
  res.statusCode = code; res.setHeader('content-type', 'application/json; charset=utf-8'); res.end(JSON.stringify(data ?? null));
};
const MIME: Record<string, string> = { '.mp4': 'video/mp4', '.json': 'application/json', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf', '.mp3': 'audio/mpeg', '.wav': 'audio/wav' };

/**
 * Arquivo → resposta, sem derrubar o servidor: erro do stream (pasta no lugar de arquivo, arquivo apagado ou travado
 * por uma coleta no meio) sem 'error' handler é exceção não tratada e mata o processo (o app inteiro passa a dar
 * "Failed to fetch"). Aqui vira 404/500 ou só encerra a conexão se o corpo já começou.
 */
function pipeFile(res: ServerResponse, file: string, opts?: { start: number; end: number }) {
  const st = createReadStream(file, opts);
  st.on('error', (e) => {
    if (!res.headersSent) { res.removeHeader('content-length'); res.removeHeader('content-range'); send(res, (e as NodeJS.ErrnoException).code === 'ENOENT' || (e as NodeJS.ErrnoException).code === 'EISDIR' ? 404 : 500, { error: 'arquivo indisponível' }); }
    else res.destroy();
  });
  st.pipe(res);
}

export const handler: Connect.NextHandleFunction = async (req, res, next) => {
  // o handler é async: exceção fora do try das rotas (URI malformada em decodeURIComponent, statSync de arquivo que
  // sumiu…) vira promise rejeitada sem tratamento, e o Node encerra o processo. Tudo passa por aqui.
  try { await route(req, res, next); }
  catch (e) {
    console.error('[hub-api]', req.method, req.url, e);
    if (!res.headersSent) send(res, (e as Error)?.name === 'URIError' ? 400 : 500, { error: String((e as Error)?.message ?? e) });
    else res.destroy();
  }
};

const route: Connect.NextHandleFunction = async (req, res, next) => {
  const url = new URL(req.url ?? '/', 'http://x');
  // /media/<slug>/<competitor>/<arquivo> → imagens baixadas pelos coletores
  const m = url.pathname.match(/^\/media\/([^/]+)\/([^/]+)\/(.+)$/);
  if (m) {
    // só dentro da pasta de mídia do próprio concorrente (nada de ../ até o .env ou o project.yml)
    const ok = /^[a-z0-9][a-z0-9-]*$/i.test(m[1]) && /^[a-z0-9][a-z0-9_-]*$/i.test(m[2]);
    const base = ok ? normalize(join(S.ROOT, P.media(m[1], m[2]))) : '';
    const file = ok ? normalize(join(base, decodeURIComponent(m[3]))) : '';
    if (!ok || !file.startsWith(base + sep) || !existsSync(file)) return send(res, 404, { error: 'não encontrado' });
    res.setHeader('content-type', MIME[extname(file).toLowerCase()] ?? 'application/octet-stream');
    return pipeFile(res, file);
  }
  // /ads-salvo/<slug>/<concorrente>/<arquivo> → miniaturas dos anúncios salvos (037 D; no git, ao contrário de media/)
  const sv = url.pathname.match(/^\/ads-salvo\/([^/]+)\/([^/]+)\/([\w.-]+)$/);
  if (sv) {
    const ok = isSlug(sv[1]) && isSlug(sv[2]);
    const file = ok ? join(S.ROOT, P.adsSalvos(sv[1], sv[2]), sv[3]) : '';
    if (!ok || /\.\./.test(sv[3]) || !existsSync(file)) return send(res, 404, { error: 'não encontrado' });
    res.setHeader('content-type', MIME[extname(file).toLowerCase()] ?? 'application/octet-stream');
    return pipeFile(res, file);
  }
  // /ficha-file/<slug>/<concorrente>/<plataforma>__<id>/quadros/<arquivo> → quadros-chave das fichas (data/intel, fora do git)
  const ff = url.pathname.match(/^\/ficha-file\/([^/]+)\/([^/]+)\/([^/]+)\/(quadros\/[^/]+)$/);
  if (ff) {
    const file = (await import('../../core/fichas')).quadroFile(ff[1], ff[2], decodeURIComponent(ff[3]), decodeURIComponent(ff[4]));
    if (!file) return send(res, 404, { error: 'não encontrado' });
    res.setHeader('content-type', MIME[extname(file).toLowerCase()] ?? 'application/octet-stream');
    return pipeFile(res, file);
  }
  // /brand-file/<slug>/<fonts|logo|icons>/<arquivo> → fontes e logo da marca para a prévia do kit
  const bf = url.pathname.match(/^\/brand-file\/([a-z0-9][a-z0-9-]*)\/(fonts|logo|icons)\/([^/]+)$/);
  if (bf) {
    const file = join(S.ROOT, P.brand(bf[1]), bf[2], decodeURIComponent(bf[3]));
    if (/\.\./.test(bf[3]) || !existsSync(file)) return send(res, 404, { error: 'não encontrado' });
    res.setHeader('content-type', MIME[extname(file).toLowerCase()] ?? 'application/octet-stream');
    return pipeFile(res, file);
  }
  // /format-ref/<formato>/<arquivo> → prints de referência da galeria de formatos
  const fr = url.pathname.match(/^\/format-ref\/([a-z0-9][a-z0-9-]*)\/([^/]+)$/);
  if (fr) {
    const file = S.formatRefFile(fr[1], decodeURIComponent(fr[2]));
    if (!file) return send(res, 404, { error: 'não encontrado' });
    res.setHeader('content-type', MIME[extname(file).toLowerCase()] ?? 'application/octet-stream');
    return pipeFile(res, file);
  }
  // /piece-file/<slug>/<pasta da peça>/<arquivo> → MP4, slides e quadros da peça, com Range (o player precisa para pular no tempo)
  const pf = url.pathname.match(/^\/piece-file\/([^/]+)\/(.+?)\/(exports|render|png)\/(.+)$/);
  if (pf) {
    const file = /^[a-z0-9][a-z0-9-]*$/.test(pf[1]) ? S.pieceFile(pf[1], decodeURIComponent(pf[2]), `${pf[3]}/${decodeURIComponent(pf[4])}`) : null;
    if (!file) return send(res, 404, { error: 'não encontrado' });
    const size = statSync(file).size, range = req.headers.range?.match(/^bytes=(\d*)-(\d*)$/);
    res.setHeader('content-type', MIME[extname(file).toLowerCase()] ?? 'application/octet-stream');
    res.setHeader('accept-ranges', 'bytes');
    if (!range) { res.setHeader('content-length', size); return pipeFile(res, file); }
    const start = range[1] ? +range[1] : Math.max(0, size - +range[2]), end = range[1] && range[2] ? Math.min(+range[2], size - 1) : size - 1;
    res.statusCode = 206; res.setHeader('content-range', `bytes ${start}-${end}/${size}`); res.setHeader('content-length', end - start + 1);
    return pipeFile(res, file, { start, end });
  }
  // /mk/lib/… (runtime, molduras, fundos) e /mk/emp/<slug>/(brand|capturas)/… → editor de mockups (o iframe do runtime)
  const mk = url.pathname.match(/^\/mk\/(lib|emp)\/(.+)$/);
  if (mk) {
    const resto = decodeURIComponent(mk[2]);
    const file = mk[1] === 'lib' ? MK.arquivoLib(resto) : MK.arquivoEmpresa(resto.split('/')[0], resto.split('/').slice(1).join('/'));
    if (!file) return send(res, 404, { error: 'não encontrado' });
    res.setHeader('content-type', MIME[extname(file).toLowerCase()] ?? 'application/octet-stream');
    res.setHeader('cache-control', mk[1] === 'lib' && !resto.startsWith('runtime/') ? 'max-age=3600' : 'no-cache');
    return pipeFile(res, file);
  }
  if (!url.pathname.startsWith('/api/')) return next();
  for (const [method, pattern, h] of routes) {
    if (method !== req.method) continue;
    const p = match(pattern, url.pathname);
    if (!p) continue;
    // slug e id de concorrente viram caminho de arquivo: só [a-z0-9-] (sem ../ nem separadores)
    if (pattern.includes('/competitors') && ((p.slug !== undefined && !isSlug(p.slug)) || (p.id !== undefined && !isSlug(p.id)))) return send(res, 400, { error: 'slug ou id inválido' });
    try {
      const body = ['POST', 'PUT'].includes(method) ? await readBody(req) : undefined;
      return send(res, 200, await h(p, body, url.searchParams));
    } catch (e) {
      if (e instanceof S.ValidationError) return send(res, 422, { error: 'validação', file: e.file, issues: e.issues });
      return send(res, 500, { error: String((e as Error)?.message ?? e) });
    }
  }
  send(res, 404, { error: `rota não encontrada: ${req.method} ${url.pathname}` });
};
