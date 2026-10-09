// Pacote do anúncio e resultados de um projeto de vídeo (tarefa 045 F).
// pacote: variantes aprovadas → MP4 com o nome do anúncio, textos (copys/headlines/CTA dos insumos), UTMs,
//   planilha no molde da importação em massa da Meta (anuncios.csv) + lista para colar à mão (pacote.md) + manifesto.
// resultados: CSV exportado do Gerenciador de Anúncios → métricas por variante e por opção de eixo → vencedora por eixo
//   → variantes/resultados/<data>.{json,md} + linhas novas no campaigns/LOG_ANGULOS.md (só acréscimo).
// O nome do anúncio é `<nome do projeto>__<id da variante>`: o resultado volta para o eixo sem tabela de-para.
// Usado pelo script (tools/video-kit/scripts/pacote.mjs) e pelo app (core/variantes.ts). Contrato: video/references/variantes.md.
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync, copyFileSync, appendFileSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { view as insumosView, empresaDe } from './insumos.mjs';

const lerJson = (f, padrao) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return padrao; } };
const hoje = () => new Date().toISOString().slice(0, 10);
export class PacoteErro extends Error {}

// botão (pt-BR, igual aos insumos) → valor do "Call to Action" da Meta
export const CTA_META = {
  'Saiba mais': 'LEARN_MORE', 'Cadastre-se': 'SIGN_UP', 'Comece agora': 'GET_STARTED', 'Baixar': 'DOWNLOAD',
  'Fale conosco': 'CONTACT_US', 'Enviar mensagem': 'MESSAGE_PAGE', 'Assinar': 'SUBSCRIBE',
};
const MAX_TEXTOS = 5; // a Meta testa até 5 textos principais, 5 títulos e 5 descrições por anúncio

function carregar(pasta) {
  const dir = resolve(pasta);
  const proj = lerJson(join(dir, 'projeto.json'), null);
  if (!proj) throw new PacoteErro(`sem projeto.json em ${dir}`);
  const indice = lerJson(join(dir, 'variantes', 'indice.json'), { variantes: [] });
  const aval = lerJson(join(dir, 'variantes', 'aval.json'), {});
  return { dir, proj, indice, aval, nome: proj.nome ?? basename(dir) };
}

const csvCampo = (v) => { const s = String(v ?? ''); return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const csvLinha = (arr) => arr.map(csvCampo).join(',');
const unicos = (arr) => [...new Set(arr.map((s) => String(s ?? '').trim()).filter(Boolean))];

/** monta a URL com UTMs (utm_content = nome do anúncio, como pede a skill ads-meta) */
export function urlTags(campanha, nomeAnuncio) {
  return `utm_source=meta&utm_medium=paid-social&utm_campaign=${encodeURIComponent(campanha)}&utm_content=${encodeURIComponent(nomeAnuncio)}&utm_term={{adset.name}}`;
}

/**
 * Monta o pacote. opts: { ids?, formatos?: ['4x5','9x16'], campanha?, conjunto?, link?, data?, seco?, empresa? }.
 * Sem ids: as variantes com aval "aprovada" ou "final". Devolve { saida, anuncios, avisos }.
 */
export function montarPacote(pasta, opts = {}) {
  const { dir, proj, indice, aval, nome } = carregar(pasta);
  const cfg = proj.anuncio ?? {};
  const data = opts.data ?? hoje();
  const campanha = (opts.campanha ?? cfg.campanha ?? `${data.slice(0, 7)}-${nome}`).toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  const conjunto = opts.conjunto ?? cfg.conjunto ?? `${campanha}__amplo`;
  const link = opts.link ?? cfg.link ?? '';
  const formatos = opts.formatos?.length ? opts.formatos : ['4x5', '9x16'];
  const avisos = [];

  const geradas = (indice.variantes ?? []).filter((v) => !v.erro);
  let ids = opts.ids?.length ? opts.ids : geradas.filter((v) => ['aprovada', 'final'].includes(aval[v.id]?.status)).map((v) => v.id);
  if (!ids.length) throw new PacoteErro('nenhuma variante aprovada: aprove na aba Variantes ou passe os ids (--so a,b)');
  const faltam = ids.filter((id) => !geradas.some((v) => v.id === id));
  if (faltam.length) throw new PacoteErro(`variante(s) não gerada(s) ou com erro: ${faltam.join(', ')}`);
  ids = [...new Set(ids)];
  if (ids.length < 3) avisos.push(`só ${ids.length} anúncio(s): a ads-meta recomenda 3+ por conjunto para o teste comparar`);

  // textos do anúncio (não multiplicam vídeos: a Meta testa as opções dentro de cada anúncio)
  const slug = empresaDe(dir, opts.empresa);
  let ins = { copys: [], headlines: [], ctas: [] };
  try { ins = insumosView(dir, { empresa: slug }); } catch (e) { avisos.push(`insumos ilegíveis: ${e.message}`); }
  const textos = unicos(ins.copys.map((c) => c.texto_principal));
  const titulos = unicos([...ins.copys.map((c) => c.titulo), ...ins.headlines.map((h) => h.texto)]);
  const descricoes = unicos(ins.copys.map((c) => c.descricao));
  const botoes = unicos(ins.ctas.map((c) => c.botao));
  if (!textos.length) avisos.push('sem copy (texto principal): escreva em Insumos → Copys ou peça à IA');
  if (!titulos.length) avisos.push('sem título/headline: escreva em Insumos → Headlines ou Copys');
  for (const [n, arr] of [['textos principais', textos], ['títulos', titulos], ['descrições', descricoes]]) {
    if (arr.length > MAX_TEXTOS) avisos.push(`${arr.length} ${n}: a Meta aceita ${MAX_TEXTOS} por anúncio, entram os ${MAX_TEXTOS} primeiros`);
  }
  if (botoes.length > 1) avisos.push(`${botoes.length} botões nos CTAs: cada anúncio leva 1 (vai "${botoes[0]}"); testar botão = outro conjunto`);
  const botao = botoes[0] ?? 'Saiba mais';
  if (!botoes.length) avisos.push('sem CTA nos insumos: botão padrão "Saiba mais"');
  if (!link) avisos.push('sem link de destino: passe --link ou grave "anuncio.link" no projeto.json (a coluna Link sai vazia)');

  const saida = join(dir, 'pacote', data);
  const anuncios = ids.map((id) => {
    const v = geradas.find((x) => x.id === id);
    const nomeAnuncio = v.nome ?? `${nome}__${id}`;
    const arquivos = {};
    for (const f of formatos) {
      const finais = (v.exports ?? []).filter((e) => e.includes(`-${f}`));
      const e = finais.find((x) => !x.endsWith('-rascunho.mp4')) ?? finais[0];
      if (!e) { avisos.push(`${id}: sem MP4 ${f} (gere esse formato)`); continue; }
      if (e.endsWith('-rascunho.mp4')) avisos.push(`${id} ${f}: só rascunho (voz grátis); o final sai com a voz aprovada`);
      arquivos[f] = { origem: e, arquivo: `${nomeAnuncio}-${f}.mp4` };
    }
    return { nome: nomeAnuncio, variante: id, escolhas: v.escolhas, arquivos, url_tags: urlTags(campanha, nomeAnuncio) };
  });
  const rascunhos = avisos.filter((a) => a.includes('só rascunho')).length;
  const resumoAvisos = rascunhos > 2 ? [...avisos.filter((a) => !a.includes('só rascunho')), `${rascunhos} arquivo(s) ainda em rascunho (voz grátis); o final sai com a voz aprovada`] : avisos;

  const pacote = { data, projeto: nome, campanha, conjunto, link, botao, cta_meta: CTA_META[botao] ?? botao, textos: textos.slice(0, MAX_TEXTOS), titulos: titulos.slice(0, MAX_TEXTOS), descricoes: descricoes.slice(0, MAX_TEXTOS), anuncios, avisos: resumoAvisos };
  if (opts.seco) return { saida, ...pacote };

  mkdirSync(saida, { recursive: true });
  for (const a of anuncios) for (const f of Object.values(a.arquivos)) copyFileSync(join(dir, f.origem), join(saida, f.arquivo));

  // planilha no molde da importação em massa (Gerenciador → Importar). Uma linha por anúncio; vídeo = o do feed (4:5),
  // o 9:16 entra em "personalizar por posicionamento". Os cabeçalhos seguem o modelo da Meta: conferir com o modelo
  // baixado do próprio Gerenciador na 1ª importação (a Meta muda nomes de coluna de tempos em tempos).
  const cab = ['Campaign Name', 'Ad Set Name', 'Ad Name', 'Body', 'Title', 'Link Description', 'Link', 'Call to Action', 'URL Tags', 'Video File Name'];
  const linhas = anuncios.map((a) => csvLinha([campanha, conjunto, a.nome, textos[0] ?? '', titulos[0] ?? '', descricoes[0] ?? '', link, pacote.cta_meta, a.url_tags, (a.arquivos['4x5'] ?? a.arquivos[formatos[0]] ?? Object.values(a.arquivos)[0])?.arquivo ?? '']));
  writeFileSync(join(saida, 'anuncios.csv'), '﻿' + [csvLinha(cab), ...linhas].join('\r\n') + '\r\n');
  writeFileSync(join(saida, 'pacote.json'), JSON.stringify(pacote, null, 2) + '\n');
  writeFileSync(join(saida, 'pacote.md'), pacoteMd(pacote));
  return { saida, ...pacote };
}

function pacoteMd(p) {
  const l = (arr) => (arr.length ? arr.map((t, i) => `${i + 1}. ${t}`).join('\n') : '_(nenhum: escrever nos Insumos)_');
  return `# Pacote do anúncio · ${p.projeto} · ${p.data}

- **Campanha:** \`${p.campanha}\` · **Conjunto:** \`${p.conjunto}\` (Advantage+, público amplo; não mexer por 3–5 dias)
- **Link:** ${p.link || '_(falta: passe --link ou grave anuncio.link no projeto.json)_'}
- **Botão:** ${p.botao} (${p.cta_meta})
- **Subir em massa:** Gerenciador → Importar → \`anuncios.csv\` (confira os cabeçalhos com o modelo baixado do Gerenciador na 1ª vez). Os MP4 desta pasta já têm o nome do anúncio.
- **Formatos:** 1 anúncio por variante; vídeo do feed = 4:5, e em Stories/Reels troque pelo 9:16 do mesmo nome ("personalizar por posicionamento").
- **Resultados:** exporte o relatório por anúncio (CSV, com Nome do anúncio, Valor usado, Impressões, Cliques no link, Resultados, Reproduções de 3 s e ThruPlays) e importe na aba Variantes → Resultados (ou \`pacote.mjs <pasta> resultados <csv>\`).

## Textos principais (até 5; a Meta testa sozinha)
${l(p.textos)}

## Títulos
${l(p.titulos)}

## Descrições
${l(p.descricoes)}

## Anúncios (${p.anuncios.length})
| nome do anúncio | ${Object.keys(p.anuncios[0]?.escolhas ?? {}).join(' | ')} | arquivos |
|---|${Object.keys(p.anuncios[0]?.escolhas ?? {}).map(() => '---|').join('')}---|
${p.anuncios.map((a) => `| \`${a.nome}\` | ${Object.values(a.escolhas).join(' | ')} | ${Object.values(a.arquivos).map((f) => f.arquivo).join('<br>')} |`).join('\n')}

UTMs (parâmetros de URL) por anúncio: \`utm_source=meta&utm_medium=paid-social&utm_campaign=${p.campanha}&utm_content=<nome do anúncio>&utm_term={{adset.name}}\`
${p.avisos.length ? `\n## Avisos\n${p.avisos.map((a) => `- ${a}`).join('\n')}\n` : ''}`;
}

// ---------------- resultados ----------------

const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim();

/** CSV do Gerenciador (vírgula, ponto e vírgula ou tab; aspas) → linhas de objetos pelo cabeçalho */
export function lerCsv(texto) {
  const t = String(texto).replace(/^﻿/, '');
  const prim = t.split(/\r?\n/, 1)[0];
  const sep = [';', '\t', ','].map((s) => [s, prim.split(s).length]).sort((a, b) => b[1] - a[1])[0][0];
  const rows = [];
  let row = [], campo = '', aspas = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (aspas) {
      if (c === '"') { if (t[i + 1] === '"') { campo += '"'; i++; } else aspas = false; } else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === sep) { row.push(campo); campo = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; row.push(campo); rows.push(row); row = []; campo = ''; }
    else campo += c;
  }
  if (campo || row.length) { row.push(campo); rows.push(row); }
  const [cab, ...resto] = rows.filter((r) => r.some((x) => x.trim()));
  if (!cab) return { cab: [], linhas: [] };
  return { cab, linhas: resto.map((r) => Object.fromEntries(cab.map((k, i) => [k, r[i] ?? '']))) };
}

/** "1.234,56" · "1,234.56" · "R$ 12,50" · "3,2%" → número (vazio/— = null) */
export function num(s) {
  let x = String(s ?? '').replace(/[^\d.,-]/g, '');
  if (!x || x === '-') return null;
  const ponto = x.lastIndexOf('.'), virg = x.lastIndexOf(',');
  if (ponto >= 0 && virg >= 0) x = ponto > virg ? x.replace(/,/g, '') : x.replace(/\./g, '').replace(',', '.');
  else if (virg >= 0) x = /^-?\d{1,3}(,\d{3})+$/.test(x) ? x.replace(/,/g, '') : x.replace(',', '.');
  else if (ponto >= 0 && /^-?\d{1,3}(\.\d{3})+$/.test(x)) x = x.replace(/\./g, '');
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

// colunas do relatório (pt-BR e inglês), achadas pelo cabeçalho normalizado
const COLUNAS = {
  nome: (h) => ['nome do anuncio', 'ad name'].includes(h),
  gasto: (h) => h.startsWith('valor usado') || h.startsWith('amount spent') || h === 'gasto',
  impressoes: (h) => h === 'impressoes' || h === 'impressions',
  cliques: (h) => h === 'cliques no link' || h === 'link clicks',
  resultados: (h) => h === 'resultados' || h === 'results',
  v3s: (h) => (h.includes('3 segundos') || h.includes('3-second') || h.includes('3 second')) && !h.includes('custo') && !h.includes('cost'),
  thruplay: (h) => (h === 'thruplays' || h === 'thruplay' || h.startsWith('thruplays')) && !h.includes('custo') && !h.includes('cost'),
};
const METRICAS = ['gasto', 'impressoes', 'cliques', 'resultados', 'v3s', 'thruplay'];

function taxas(m) {
  const d = (a, b) => (a != null && b ? a / b : null);
  return { ...m, hook: d(m.v3s, m.impressoes), retencao: d(m.thruplay, m.v3s), ctr: d(m.cliques, m.impressoes), cpc: d(m.gasto, m.cliques), cpr: d(m.gasto, m.resultados) };
}
const soma = (lista) => Object.fromEntries(METRICAS.map((k) => {
  const vs = lista.map((m) => m[k]).filter((v) => v != null);
  return [k, vs.length ? vs.reduce((a, b) => a + b, 0) : null];
}));

// métrica que decide cada eixo: abertura = gancho (para o dedo); voz = retenção (segura até o fim); resto = CTR
const DECIDE = { abertura: ['hook', 'ctr'], voz: ['retencao', 'ctr'] };
const MIN_IMPRESSOES = 1000;
const NOME_METRICA = { hook: 'gancho (3 s ÷ impressões)', retencao: 'retenção (ThruPlay ÷ 3 s)', ctr: 'CTR do link' };
const pct = (v) => (v == null ? '—' : `${(v * 100).toFixed(1).replace('.', ',')}%`);
const brl = (v) => (v == null ? '—' : `R$ ${v.toFixed(2).replace('.', ',')}`);

/**
 * Lê o CSV do Gerenciador e cruza com as variantes. opts: { data?, campanha?, seco?, empresa? }.
 * Devolve { data, variantes, eixos, sem_par, arquivos, log } (e grava, salvo `seco`).
 */
export function importarResultados(pasta, csvTexto, opts = {}) {
  const { dir, proj, indice, nome } = carregar(pasta);
  const data = opts.data ?? hoje();
  const { cab, linhas } = lerCsv(csvTexto);
  const col = {};
  for (const [k, ok] of Object.entries(COLUNAS)) col[k] = cab.find((h) => ok(norm(h)));
  if (!col.nome) throw new PacoteErro(`o CSV não tem a coluna "Nome do anúncio" (colunas: ${cab.slice(0, 12).join(', ')}…)`);
  if (!col.impressoes) throw new PacoteErro('o CSV não tem a coluna "Impressões"');
  const ids = (indice.variantes ?? []).map((v) => v.id).sort((a, b) => b.length - a.length);
  const escolhas = Object.fromEntries((indice.variantes ?? []).map((v) => [v.id, v.escolhas]));
  const porVar = {}, semPar = [];
  for (const l of linhas) {
    const n = String(l[col.nome] ?? '').trim();
    if (!n || /^(resultados? totais|total)/i.test(n)) continue;
    const limpo = n.replace(/\.mp4$/i, '').replace(/-(\d+x\d+)(-rascunho)?$/, '');
    const id = ids.find((x) => limpo === `${nome}__${x}` || limpo.endsWith(`__${x}`) || limpo === x);
    if (!id) { semPar.push(n); continue; }
    (porVar[id] ??= []).push(Object.fromEntries(METRICAS.map((k) => [k, col[k] ? num(l[col[k]]) : null])));
  }
  if (!Object.keys(porVar).length) throw new PacoteErro(`nenhum anúncio do CSV bate com as variantes de "${nome}" (nomes esperados: ${nome}__<id>). Sem par: ${semPar.slice(0, 5).join(', ')}`);
  const variantes = Object.fromEntries(Object.entries(porVar).map(([id, ms]) => [id, { escolhas: escolhas[id], ...taxas(soma(ms)) }]));

  // por eixo: soma as variantes de cada opção → métrica que decide → vencedora (com volume mínimo e folga de 10%)
  const nomesEixos = Object.keys(proj.eixos ?? {});
  const eixos = nomesEixos.map((eixo) => {
    const opcoes = [...new Set(Object.values(variantes).map((v) => v.escolhas?.[eixo]).filter(Boolean))].map((op) => {
      const vs = Object.values(variantes).filter((v) => v.escolhas?.[eixo] === op);
      return { opcao: op, n: vs.length, ...taxas(soma(vs)) };
    });
    if (opcoes.length < 2) return { eixo, opcoes, metrica: null, vencedora: null, motivo: opcoes.length ? 'uma opção só: nada a comparar neste eixo' : 'sem dados' };
    const metrica = (DECIDE[eixo] ?? ['ctr']).find((k) => opcoes.every((o) => o[k] != null)) ?? null;
    if (!metrica) return { eixo, opcoes, metrica: null, vencedora: null, motivo: 'faltam colunas para comparar (Reproduções de 3 s, ThruPlays ou Cliques no link)' };
    const pouco = opcoes.filter((o) => (o.impressoes ?? 0) < MIN_IMPRESSOES);
    const ord = [...opcoes].sort((a, b) => b[metrica] - a[metrica]);
    for (const o of opcoes) o.status = 'em teste';
    if (pouco.length) return { eixo, opcoes, metrica, vencedora: null, lider: ord[0].opcao, motivo: `pouco volume (< ${MIN_IMPRESSOES} impressões em ${pouco.map((o) => o.opcao).join(', ')}): seguir rodando` };
    if (ord[0][metrica] < ord[1][metrica] * 1.1) return { eixo, opcoes, metrica, vencedora: null, lider: ord[0].opcao, motivo: `empate técnico (${ord[0].opcao} ${pct(ord[0][metrica])} × ${ord[1].opcao} ${pct(ord[1][metrica])}, folga < 10%)` };
    ord[0].status = 'vencedor';
    for (const o of ord.slice(1)) o.status = o[metrica] <= ord[0][metrica] * 0.8 ? 'aposentado' : 'em teste';
    return { eixo, opcoes, metrica, vencedora: ord[0].opcao, motivo: `${ord[0].opcao} ${pct(ord[0][metrica])} em ${NOME_METRICA[metrica]} (2ª: ${ord[1].opcao} ${pct(ord[1][metrica])})` };
  });

  // linhas para o LOG_ANGULOS.md (formato da skill ads-meta): uma por opção de eixo que teve comparação
  const campanha = opts.campanha ?? proj.anuncio?.campanha ?? nome;
  const textoOpcao = (eixo, op) => {
    const o = (proj.eixos?.[eixo] ?? []).find((x) => x.id === op) ?? {};
    if (o.voz) return `voz ${o.voz}`;
    const f = Object.values(o.falas ?? {})[0];
    return `"${(typeof f === 'string' ? f : f?.say ?? f?.text ?? op).replace(/\|/g, '/')}"`;
  };
  const log = eixos.filter((e) => e.metrica).flatMap((e) => e.opcoes.map((o) =>
    `| ${data} | ${campanha} | ${e.eixo}: ${o.opcao} | ${textoOpcao(e.eixo, o.opcao)} | ${NOME_METRICA[e.metrica].split(' (')[0]} ${pct(o[e.metrica])} · CTR ${pct(o.ctr)} · ${brl(o.cpr)}/resultado · ${o.impressoes ?? 0} impr. | ${o.status} |`));

  const out = { data, projeto: nome, arquivo_csv: opts.arquivo ?? null, variantes, eixos, sem_par: semPar, log };
  if (opts.seco) return { ...out, arquivos: [] };
  const rdir = join(dir, 'variantes', 'resultados');
  mkdirSync(rdir, { recursive: true });
  writeFileSync(join(rdir, `${data}.json`), JSON.stringify(out, null, 2) + '\n');
  writeFileSync(join(rdir, `${data}.md`), resultadosMd(out));
  const arquivos = [join(rdir, `${data}.json`), join(rdir, `${data}.md`)];
  if (log.length) {
    const slug = empresaDe(dir, opts.empresa);
    const camp = join(resolve(dir, '..', '..'), 'campaigns');
    const lf = join(camp, 'LOG_ANGULOS.md');
    mkdirSync(camp, { recursive: true });
    if (!existsSync(lf)) writeFileSync(lf, `# Log de ângulos · ${slug}\n\nSó acrescentar linhas, nunca apagar (skill ads-meta). Status: em teste, vencedor, aposentado.\n\n| data | campanha | ângulo | hook/variação | métrica-chave | status |\n|---|---|---|---|---|---|\n`);
    const ja = readFileSync(lf, 'utf8');
    const novas = log.filter((l) => !ja.includes(l)); // importar o mesmo CSV de novo não duplica linha
    if (novas.length) { appendFileSync(lf, (ja.endsWith('\n') ? '' : '\n') + novas.join('\n') + '\n'); arquivos.push(lf); }
  }
  return { ...out, arquivos };
}

function resultadosMd(r) {
  const eixosMd = r.eixos.map((e) => `## ${e.eixo}\n${e.vencedora ? `**Vencedora: ${e.vencedora}** · ${e.motivo}` : `Sem vencedora: ${e.motivo}`}\n\n| opção | anúncios | impressões | gancho | retenção | CTR | CPC | custo/resultado | status |\n|---|---|---|---|---|---|---|---|---|\n${e.opcoes.map((o) => `| ${o.opcao} | ${o.n} | ${o.impressoes ?? '—'} | ${pct(o.hook)} | ${pct(o.retencao)} | ${pct(o.ctr)} | ${brl(o.cpc)} | ${brl(o.cpr)} | ${o.status ?? ''} |`).join('\n')}`).join('\n\n');
  const vars = Object.entries(r.variantes).sort((a, b) => (b[1].ctr ?? 0) - (a[1].ctr ?? 0))
    .map(([id, v]) => `| ${id} | ${v.impressoes ?? '—'} | ${brl(v.gasto)} | ${pct(v.hook)} | ${pct(v.retencao)} | ${pct(v.ctr)} | ${v.resultados ?? '—'} | ${brl(v.cpr)} |`).join('\n');
  return `# Resultados · ${r.projeto} · ${r.data}\n\nMétrica que decide: abertura = gancho (reproduções de 3 s ÷ impressões), voz = retenção (ThruPlay ÷ 3 s), demais = CTR do link. Vencedora só com ≥ ${MIN_IMPRESSOES} impressões por opção e folga ≥ 10%.\n\n${eixosMd}\n\n## Por variante\n| variante | impressões | gasto | gancho | retenção | CTR | resultados | custo/resultado |\n|---|---|---|---|---|---|---|---|\n${vars}\n${r.sem_par.length ? `\n**Sem par no projeto:** ${r.sem_par.join(', ')}\n` : ''}`;
}

/** último resultado importado (para o app): { data, variantes, eixos } ou null */
export function ultimoResultado(pasta) {
  const rdir = join(resolve(pasta), 'variantes', 'resultados');
  if (!existsSync(rdir)) return null;
  const fs = (() => { try { return readdirSync(rdir); } catch { return []; } })().filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
  return fs.length ? lerJson(join(rdir, fs.at(-1)), null) : null;
}
