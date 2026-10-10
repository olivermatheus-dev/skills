#!/usr/bin/env node
// Dados do relatório em PDF (skill relatorio-pdf): junta o que já está no repositório, sem rede.
// node tools/relatorio/dados.mjs <slug> <funcionalidades|secoes|redes> [--concorrentes a,b] [--top 5] [--todos] [--pasta <dir>]
// Saída: companies/<slug>/intel/relatorios/AAAA-MM-DD-<modulo>/dados.json + resumo no terminal.
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const flag = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const COM_VALOR = ['--concorrentes', '--top', '--pasta'];
const [slug, modulo] = args.filter((a, i) => !a.startsWith('--') && !COM_VALOR.includes(args[i - 1]));
const MODULOS = ['funcionalidades', 'secoes', 'redes'];
if (!slug || !MODULOS.includes(modulo)) {
  console.error(`uso: node tools/relatorio/dados.mjs <slug> <${MODULOS.join('|')}> [--concorrentes a,b] [--top 5] [--todos]`);
  process.exit(1);
}
const CO = join(ROOT, 'companies', slug);
if (!existsSync(CO)) { console.error(`empresa não encontrada: ${slug}`); process.exit(1); }
const readJson = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; } };
const hoje = new Date().toISOString().slice(0, 10);

// ---------- concorrentes ----------
function frontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---/); if (!m) return {};
  const o = {};
  for (const l of m[1].split('\n')) { const r = l.match(/^(\w+):\s*(.*)$/); if (r) o[r[1]] = r[2].replace(/^["']|["']$/g, ''); }
  return o;
}
function ultimosSnapshots(id) {
  const dir = join(CO, 'competitors', id, 'snapshots'); if (!existsSync(dir)) return [];
  return readdirSync(dir).map((pasta) => {
    const fs = readdirSync(join(dir, pasta)).filter((f) => f.endsWith('.json')).sort();
    const s = fs.length ? readJson(join(dir, pasta, fs.at(-1))) : null;
    return s && s.platform !== 'site' ? { ...s, _pasta: join(dir, pasta) } : null;
  }).filter(Boolean);
}
const todos = readdirSync(join(CO, 'competitors')).map((id) => {
  const p = join(CO, 'competitors', id, 'competitor.md'); if (!existsSync(p)) return null;
  const f = frontmatter(readFileSync(p, 'utf8'));
  if ((f.kind || 'concorrente') !== 'concorrente' || (f.status || 'ativo') !== 'ativo') return null;
  const snaps = ultimosSnapshots(id);
  const seguidores = snaps.reduce((a, s) => a + (s.profile?.followers || 0), 0);
  return { id, nome: f.name || id, favorito: f.favorite === 'true', seguidores, snaps };
}).filter(Boolean);
if (!todos.length) { console.error('nenhum concorrente ativo em competitors/'); process.exit(1); }

// benchmarks = escolhidos no pedido > intel/benchmarks.json (lista aprovada pelo Oliver) > favoritos + maior audiência
const top = Number(flag('--top') || 5);
const salvos = readJson(join(CO, 'intel', 'benchmarks.json'));
let escolhidos;
let criterio;
const porIds = (ids) => ids.map((id) => todos.find((c) => c.id === id) || (console.error(`concorrente não encontrado ou não ativo: ${id}`), process.exit(1)));
if (flag('--concorrentes')) {
  const ids = flag('--concorrentes').split(',').map((s) => s.trim());
  escolhidos = porIds(ids);
  criterio = 'escolhidos no pedido';
} else if (salvos?.ids?.length && !args.includes('--todos')) {
  escolhidos = porIds(salvos.ids);
  criterio = salvos.criterio || 'lista de benchmarks (intel/benchmarks.json)';
} else if (args.includes('--todos')) {
  escolhidos = [...todos].sort((a, b) => b.seguidores - a.seguidores); criterio = 'todos os concorrentes ativos';
} else {
  escolhidos = [...todos].sort((a, b) => (b.favorito - a.favorito) || (b.seguidores - a.seguidores)).slice(0, top);
  criterio = `sugestão automática: favoritos do app primeiro, depois a maior audiência somada nas redes (top ${top}); confirme e salve em intel/benchmarks.json`;
}
const nomes = Object.fromEntries(todos.map((c) => [c.id, c.nome]));
const ref = readJson(join(CO, 'intel', 'referencia.json')) || {};
const nossoNome = ref.name || slug;

// ---------- módulos ----------
function funcionalidades() {
  const m = readJson(join(CO, 'intel', 'matriz.json'));
  if (!m) return { erro: 'falta intel/matriz.json (rode a análise de funcionalidades: skill analise-concorrentes)' };
  const ids = escolhidos.map((c) => c.id);
  const st = (c, f) => m.cells?.[c]?.[f]?.status || 'desconhecido';
  const linhas = m.features.map((f) => {
    const bench = Object.fromEntries(ids.map((c) => [c, st(c, f.id)]));
    const contar = (lista, s) => lista.filter((c) => st(c, f.id) === s).length;
    return {
      id: f.id, nome: f.name, grupo: f.group, descricao: f.description,
      nos: st('_nos', f.id), nosNota: m.cells?._nos?.[f.id]?.note || '',
      bench, benchSim: contar(ids, 'sim'), benchParcial: contar(ids, 'parcial'),
      todosSim: contar(todos.map((c) => c.id), 'sim'), todosParcial: contar(todos.map((c) => c.id), 'parcial'),
      quemTem: ids.filter((c) => bench[c] === 'sim').map((c) => nomes[c]),
      quemParcial: ids.filter((c) => bench[c] === 'parcial').map((c) => nomes[c]),
    };
  });
  const ord = (a, b) => b.benchSim - a.benchSim || b.benchParcial - a.benchParcial || b.todosSim - a.todosSim;
  const com = (l) => l.benchSim + l.benchParcial > 0;
  return {
    atualizadoEm: m.updatedAt, grupos: m.groups,
    faltam: linhas.filter((l) => l.nos === 'nao' && com(l)).sort(ord),
    parciais: linhas.filter((l) => l.nos === 'parcial' && com(l)).sort(ord),
    aConfirmar: linhas.filter((l) => l.nos === 'desconhecido' && com(l)).sort(ord),
    soNos: linhas.filter((l) => l.nos === 'sim' && l.benchSim === 0).sort(ord),
    matriz: linhas,
  };
}

function secoes() {
  const lps = escolhidos.map((c) => ({ c, l: readJson(join(CO, 'competitors', c.id, 'analysis', 'landing.json')) }))
    .filter((x) => x.l?.data?.sections?.length);
  const faltando = escolhidos.filter((c) => !lps.find((x) => x.c.id === c.id)).map((c) => c.nome);
  const tipos = {};
  for (const { c, l } of lps) {
    const s = l.data.sections;
    s.forEach((sec, i) => {
      const t = (tipos[sec.type] ||= { tipo: sec.type, concorrentes: new Set(), posicoes: [], exemplos: [] });
      t.concorrentes.add(c.nome); t.posicoes.push(s.length > 1 ? i / (s.length - 1) : 0);
      t.exemplos.push({ concorrente: c.nome, titulo: sec.title, resumo: sec.summary });
    });
  }
  const agregado = Object.values(tipos).map((t) => ({
    tipo: t.tipo, quantos: t.concorrentes.size, de: lps.length,
    posicaoMedia: +(t.posicoes.reduce((a, b) => a + b, 0) / t.posicoes.length).toFixed(2), exemplos: t.exemplos,
  })).sort((a, b) => a.posicaoMedia - b.posicaoMedia);
  return {
    aviso: 'O tipo "outro" junta coisas diferentes: reagrupe pelos títulos (demonstração, para quem é, suporte/migração, mídia…) antes de montar as páginas.',
    semLanding: faltando,
    agregado,
    concorrentes: lps.map(({ c, l }) => ({
      nome: c.nome, url: l.data.url, atualizadoEm: l.updatedAt, hero: l.data.hero, ctas: l.data.ctas,
      provaSocial: l.data.socialProof, interessante: l.data.interesting, tom: l.data.tone,
      precos: readJson(join(CO, 'competitors', c.id, 'analysis', 'precos.json'))?.data ?? null,
      secoes: l.data.sections,
    })),
    nos: { nome: nossoNome, mensagem: ref.message ?? null, landing: ref.landing ?? null, preco: ref.price ?? null },
  };
}

const mediana = (xs) => { const v = xs.filter((x) => typeof x === 'number').sort((a, b) => a - b); if (!v.length) return null; const k = v.length >> 1; return v.length % 2 ? v[k] : (v[k - 1] + v[k]) / 2; };
function redes() {
  const perfis = []; const itens = [];
  for (const c of escolhidos) for (const s of c.snaps) {
    const its = s.items || [];
    const views = its.map((i) => i.metrics?.views), likes = its.map((i) => i.metrics?.likes);
    const datas = its.map((i) => i.publishedAt).filter(Boolean).sort();
    const dias = datas.length > 1 ? (new Date(datas.at(-1)) - new Date(datas[0])) / 864e5 : null;
    const medViews = mediana(views), medLikes = mediana(likes), seg = s.profile?.followers ?? null;
    perfis.push({
      concorrente: c.nome, rede: s.platform, handle: s.profile?.handle, url: s.profileUrl, coletadoEm: s.collectedAt, fonte: s.source,
      seguidores: seg, posts: s.profile?.postsCount ?? null, itensNaColeta: its.length,
      medianaViews: medViews, medianaLikes: medLikes,
      engajamentoMediano: seg && medLikes != null ? +(100 * medLikes / seg).toFixed(2) : null,
      postsPorSemana: dias && dias > 0 ? +((its.length - 1) / (dias / 7)).toFixed(1) : null,
      ultimoPost: datas.at(-1) || null, erros: s.errors?.length ? s.errors : undefined,
    });
    for (const i of its) {
      const v = i.metrics?.views ?? null;
      itens.push({
        concorrente: c.nome, rede: s.platform, tipo: i.type, url: i.url, legenda: (i.caption || i.title || '').slice(0, 280),
        publicadoEm: i.publishedAt, duracaoS: i.durationS, metricas: i.metrics || {},
        multiploMediana: v != null && medViews ? +(v / medViews).toFixed(1) : null,
        thumb: i.thumbnailLocal ? join(s._pasta, '..', '..', i.thumbnailLocal).replace(/\\/g, '/') : null,
      });
    }
  }
  // views e curtidas não se comparam entre redes: o top sai por rede; o múltiplo da mediana compara perfis de tamanhos diferentes
  const desde = Date.now() - 90 * 864e5;
  const recentes = itens.filter((i) => !i.publicadoEm || new Date(i.publicadoEm).getTime() >= desde);
  const chave = (i) => i.metricas.views ?? i.metricas.likes ?? 0;
  const topPorRede = {};
  // no máximo 2 por concorrente: o maior perfil não toma o top inteiro
  for (const r of [...new Set(recentes.map((i) => i.rede))]) {
    const porMarca = {};
    topPorRede[r] = recentes.filter((i) => i.rede === r).sort((a, b) => chave(b) - chave(a))
      .filter((i) => (porMarca[i.concorrente] = (porMarca[i.concorrente] || 0) + 1) <= 2).slice(0, 8);
  }
  return {
    aviso: 'Instagram sem token traz só os ~6 últimos posts: diga isso no relatório. Top = últimos 90 dias, por rede (views; sem views, curtidas).',
    perfis: perfis.sort((a, b) => (b.seguidores || 0) - (a.seguidores || 0)),
    topPorRede,
    topPorMultiplo: recentes.filter((i) => i.multiploMediana).sort((a, b) => b.multiploMediana - a.multiploMediana).slice(0, 12),
    nos: { nome: nossoNome, seguidores: ref.followers ?? null },
    semRedes: escolhidos.filter((c) => !c.snaps.length).map((c) => c.nome),
  };
}

const dados = { funcionalidades, secoes, redes }[modulo]();
const pasta = resolve(flag('--pasta') || join(CO, 'intel', 'relatorios', `${hoje}-${modulo}`));
mkdirSync(pasta, { recursive: true });
const saida = {
  empresa: slug, nos: nossoNome, modulo, geradoEm: new Date().toISOString(), criterio,
  concorrentes: escolhidos.map((c) => ({ id: c.id, nome: c.nome, favorito: c.favorito, seguidores: c.seguidores })),
  ativos: todos.length, ...dados,
};
writeFileSync(join(pasta, 'dados.json'), JSON.stringify(saida, (k, v) => (v instanceof Set ? [...v] : v), 2));

// ---------- esqueleto: as páginas mecânicas já montadas; a análise (capa, leituras, sugestões, obs) é da IA ----------
const A_FAZER = 'A FAZER (IA)';
const nb = escolhidos.length;
const dataBr = (iso) => (iso ? new Date(iso).toLocaleDateString('pt-BR') : '');
const fmt = (n) => (n == null ? '—' : Number(n).toLocaleString('pt-BR'));
const nomesBench = escolhidos.map((c) => c.nome).join(', ');
const capa = (titulo) => ({ tipo: 'capa', titulo, subtitulo: A_FAZER, pontos: [A_FAZER], meta: [['Concorrentes', `${nb}: ${nomesBench}`], ['Critério', criterio], ['Dados', A_FAZER]] });
const paginas = [];
if (modulo === 'funcionalidades' && !dados.erro) {
  const rk = (l) => ({ grupo: l.grupo, nome: l.nome, tem: l.quemTem, parcial: l.quemParcial, ...(l.nos !== 'nao' && l.nosNota ? { nota: l.nosNota } : {}) });
  paginas.push(capa(`Funcionalidades: *${nossoNome} × benchmarks*`));
  if (dados.faltam.length) paginas.push({ tipo: 'ranking', titulo: 'O que eles têm e *nós não*', sub: `Da mais comum para a menos comum entre os ${nb} benchmarks.`, total: nb, itens: dados.faltam.map(rk) });
  if (dados.parciais.length) paginas.push({ tipo: 'ranking', titulo: 'O que temos *só em parte*', sub: 'Existe, mas incompleto perto do que eles oferecem.', total: nb, itens: dados.parciais.map(rk) });
  if (dados.aConfirmar.length) paginas.push({ tipo: 'ranking', titulo: `A confirmar *no ${nossoNome}*`, sub: 'Eles têm; não sabemos se nós temos. Checar antes de priorizar.', total: nb, itens: dados.aConfirmar.map(rk) });
  if (dados.soNos.length) paginas.push({ tipo: 'cards', titulo: 'O que *só nós* temos', sub: `Nenhum dos ${nb} benchmarks oferece.`, itens: dados.soNos.map((l) => ({ rotulo: l.grupo, titulo: l.nome, texto: A_FAZER })) });
  paginas.push({ tipo: 'matriz', titulo: 'Matriz *completa*', sub: `Todas as funcionalidades mapeadas: ${nossoNome} e os ${nb} benchmarks.`, colunas: [nossoNome, ...escolhidos.map((c) => c.nome)], colunaNos: 0,
    linhas: [...dados.matriz].sort((a, b) => dados.grupos.indexOf(a.grupo) - dados.grupos.indexOf(b.grupo)).map((l) => ({ grupo: l.grupo, nome: l.nome, valores: [l.nos, ...escolhidos.map((c) => l.bench[c.id])] })) });
  paginas.push({ tipo: 'insights', titulo: 'O que *priorizar*', pontos: [A_FAZER], sugestoes: [A_FAZER] });
}
if (modulo === 'secoes') {
  paginas.push(capa(`Seções e copy: *${nossoNome} × concorrentes*`));
  paginas.push({ tipo: 'tabela', titulo: 'A promessa de *cada um*', sub: 'Headline e chamada principal do topo da página.', colunas: ['Marca', 'Headline', 'CTA'],
    linhas: [{ celulas: [`**${nossoNome}**`, dados.nos.mensagem?.headline || '—', dados.nos.mensagem?.cta || '—'], destaque: true }, ...dados.concorrentes.map((c) => [`**${c.nome}**`, c.hero?.headline || '—', c.hero?.cta || '—'])] });
  paginas.push({ tipo: 'tabela', titulo: 'Prova e *tom*', colunas: ['Marca', 'Prova social', 'Tom'],
    linhas: [{ celulas: [`**${nossoNome}**`, A_FAZER, dados.nos.mensagem?.tone || '—'], destaque: true }, ...dados.concorrentes.map((c) => [`**${c.nome}**`, (c.provaSocial || []).join(' · ') || '—', c.tom || '—'])] });
  for (const t of dados.agregado) paginas.push({ tipo: 'secao', titulo: t.tipo, quantos: t.quantos, de: t.de, posicao: t.posicaoMedia, status: A_FAZER,
    eles: t.exemplos.slice(0, 4).map((e) => [e.concorrente, `${e.titulo}: ${e.resumo}`]), nos: A_FAZER, sugestoes: [A_FAZER] });
  paginas.push({ tipo: 'insights', titulo: 'O que *mudar primeiro*', pontos: [A_FAZER], sugestoes: [A_FAZER] });
}
if (modulo === 'redes') {
  paginas.push(capa(`Redes sociais: *${nossoNome} × benchmarks*`));
  paginas.push({ tipo: 'tabela', titulo: 'Audiência e *ritmo*', sub: 'Último retrato de cada perfil. Engaj. = curtidas medianas ÷ seguidores.', colunas: ['Marca', 'Rede', 'Seguidores', 'Posts/sem.', 'Views (mediana)', 'Engaj.'], numericas: [2, 3, 4, 5],
    linhas: [...(dados.nos.seguidores ? [] : [{ celulas: [`**${nossoNome}**`, A_FAZER, '—', '—', '—', '—'], destaque: true }]),
      ...dados.perfis.map((p) => [`**${p.concorrente}**`, p.rede, p.seguidores, p.postsPorSemana ?? '—', p.medianaViews != null ? Math.round(p.medianaViews) : '—', p.engajamentoMediano != null ? `${String(p.engajamentoMediano).replace('.', ',')}%` : '—'])] });
  for (const [rede, lista] of Object.entries(dados.topPorRede)) paginas.push({ tipo: 'conteudos', titulo: `Top conteúdos: *${rede}*`, sub: 'Últimos 90 dias, por alcance (views; sem views, curtidas). Até 2 por marca.',
    itens: lista.map((i) => ({ thumb: i.thumb, perfil: i.concorrente, rede: i.rede, tipo: i.tipo, data: dataBr(i.publicadoEm), legenda: i.legenda,
      metricas: [i.metricas.views != null && `**${fmt(i.metricas.views)}** views`, i.metricas.likes != null && `${fmt(i.metricas.likes)} ♥`, i.metricas.comments != null && `${fmt(i.metricas.comments)} coment.`].filter(Boolean).join(' · '),
      multiplo: i.multiploMediana ? `${String(i.multiploMediana).replace('.', ',')}×` : null, obs: A_FAZER })) });
  paginas.push({ tipo: 'insights', titulo: 'O que *aproveitar*', pontos: [A_FAZER], sugestoes: [A_FAZER] });
}
const titulos = { funcionalidades: 'Funcionalidades', secoes: 'Seções e copy', redes: 'Redes sociais' };
writeFileSync(join(pasta, 'esqueleto.json'), JSON.stringify({
  empresa: slug, nos: nossoNome, modulo, data: hoje, cabecalho: `${nossoNome} · ${titulos[modulo]}`,
  fonte: `Fonte: ${{ funcionalidades: 'matriz de funcionalidades', secoes: 'análise das landing pages', redes: 'coleta das redes' }[modulo]} · ${dataBr(new Date())}`, paginas,
}, null, 2));

console.log(`${modulo} · ${nossoNome} · ${escolhidos.length} de ${todos.length} concorrentes ativos (${criterio})`);
console.log(escolhidos.map((c) => `  ${c.favorito ? '★' : ' '} ${c.nome.padEnd(20)} ${c.seguidores.toLocaleString('pt-BR')} seguidores`).join('\n'));
if (dados.erro) console.log('ERRO: ' + dados.erro);
if (modulo === 'funcionalidades' && !dados.erro) console.log(`faltam ${dados.faltam.length} · parciais ${dados.parciais.length} · a confirmar ${dados.aConfirmar.length} · só nós ${dados.soNos.length}`);
if (modulo === 'secoes') console.log(`${dados.concorrentes.length} landings · ${dados.agregado.length} tipos de seção${dados.semLanding.length ? ' · sem landing: ' + dados.semLanding.join(', ') : ''}`);
if (modulo === 'redes') console.log(`${dados.perfis.length} perfis · top por rede: ${Object.entries(dados.topPorRede).map(([r, l]) => r + ' ' + l.length).join(', ')}${dados.semRedes.length ? ' · sem coleta de redes: ' + dados.semRedes.join(', ') : ''}`);
console.log(`→ ${join(pasta, 'dados.json')}`);
