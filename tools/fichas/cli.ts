// npm run fichas -- <comando> …   (tarefa 040; README.md desta pasta). Sem LLM: o Opus entra na fase C e grava com `salvar`.
//   preparar <empresa> <concorrente> <chave…> [--reanalisar]   legenda/áudio → transcrição, quadros, hash (idempotente)
//   pacote   <empresa> <concorrente> <chave>                   imprime o pacote enxuto que o Opus recebe
//   quadros  <empresa> <concorrente> <arquivo.json>             grava descrição/OCR dos quadros (Haiku) nos insumos: { "<chave>": [{ tMs, descricao, ocr }] }
//   salvar   <empresa> <concorrente> <arquivo.json> [--reanalisar]   valida (schema + vocabulário) e grava a análise
//   relatorio <empresa> <concorrente> [--rede x] [--itens a,b | --top N] [--rodada id] [--pacote]   agregados → relatorios/<id>.md
//   relatorio <empresa> <concorrente> --rodada id --leitura arquivo.json                           grava a leitura do Opus
//   termo    <empresa> aceitar|recusar <grupo>:<valor> [--rodada id --de <concorrente>]              termo novo em lote
//   validar                                                    confere todas as fichas (o mesmo do npm run validate)
// chave = <plataforma>:<idDoItem> (ex.: tiktok:7691064446289988884)
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FichaAnalise } from '../../schema/ficha';
import { setMark } from '../../core/store';
import { dadosDir, loadVocab, nowIso, parseKey, readFicha, writeFicha } from './lib';

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith('--')));
/** opções com valor: --rede tiktok, --itens a,b, --top 10, --rodada id, --leitura arq.json, --de concorrente */
const COM_VALOR = new Set(['--rede', '--itens', '--top', '--rodada', '--leitura', '--de', '--motivo']);
const opt: Record<string, string> = {};
const pos: string[] = [];
for (let i = 0; i < argv.length; i++) {
  if (COM_VALOR.has(argv[i])) opt[argv[i].slice(2)] = argv[++i] ?? '';
  else if (!argv[i].startsWith('--')) pos.push(argv[i]);
}
const [cmd, slug, comp, ...resto] = pos;
const USO = `uso:
  npm run fichas -- preparar <empresa> <concorrente> <plataforma:id>… [--reanalisar]
  npm run fichas -- pacote   <empresa> <concorrente> <plataforma:id>
  npm run fichas -- quadros  <empresa> <concorrente> <arquivo.json>   (descrição/OCR do Haiku)
  npm run fichas -- salvar   <empresa> <concorrente> <arquivo.json> [--reanalisar]
  npm run fichas -- relatorio <empresa> <concorrente> [--rede tiktok] [--itens a,b | --top 10] [--rodada id] [--pacote]
  npm run fichas -- relatorio <empresa> <concorrente> --rodada <id> --leitura <arquivo.json>
  npm run fichas -- termo    <empresa> aceitar|recusar <grupo>:<valor> [--de <concorrente> --rodada <id>] [--motivo "…"]
  npm run fichas -- validar`;
const falha: (m: string) => never = (m) => { console.error(`❌ ${m}`); process.exit(1); };

async function main() {
  if (cmd === 'validar') {
    const { validarFichas } = await import('./validar');
    const errs = validarFichas();
    for (const e of errs) console.log(`❌ ${e.file}\n   ${e.issues.join('\n   ')}`);
    console.log(errs.length ? `\n${errs.length} ficha(s) com erro` : '✅ fichas, vocabulário e relatórios válidos');
    process.exit(errs.length ? 1 : 0);
  }
  if (cmd === 'termo') {
    // termo <empresa> aceitar|recusar <grupo>:<valor>; a definição vem do relatório (--de + --rodada) ou de --motivo na recusa
    const acao = comp, alvo = resto[0] ?? '';
    const [grupo, valor] = alvo.split(':');
    if (!slug || !['aceitar', 'recusar'].includes(acao ?? '') || !grupo || !valor) falha(USO);
    const { decidirTermos } = await import('./decidir');
    const r = decidirTermos(slug, opt.de ?? '', opt.rodada ?? '', [{ grupo, valor, decisao: acao === 'aceitar' ? 'aceito' : 'recusado', motivo: opt.motivo }]);
    for (const x of r) console.log(`${x.ok ? '✅' : '❌'} ${x.grupo}:${x.valor} ${x.msg}`);
    process.exit(r.every((x) => x.ok) ? 0 : 1);
  }
  if (!cmd || !slug || !comp) falha(USO);

  if (cmd === 'relatorio') {
    const R = await import('./relatorio');
    if (opt.leitura) {
      if (!opt.rodada) falha('informe --rodada <id> do relatório que recebe a leitura');
      const r = R.salvarLeitura(slug, comp, opt.rodada, opt.leitura);
      console.log(`✅ leitura gravada em companies/${slug}/competitors/${comp}/relatorios/${r.id}.md (${r.modelo}); nenhum número fora dos agregados`);
      return;
    }
    const rede = opt.rede ?? (opt.itens ? opt.itens.split(':')[0] : '');
    if (!rede) falha('informe --rede (tiktok, youtube, instagram) ou --itens');
    const r = R.gerarRelatorio(slug, comp, { rede, itens: opt.itens?.split(',').map((x) => x.trim()).filter(Boolean), top: opt.top ? Number(opt.top) : undefined, rodada: opt.rodada });
    const am = (r.agregados as { amostra: { n: number; nivel: string; avisos: string[] } }).amostra;
    console.log(`✅ ${r.id}: ${am.n} item(ns), ${am.nivel === 'padroes' ? 'padrões' : 'observações (amostra pequena)'} · ${r.termosNovos.filter((t) => !t.decisao).length} termo(s) novo(s) pendente(s)${r.leitura ? ' · leitura mantida' : ' · leitura pendente'}`);
    for (const a of am.avisos) console.log(`   · ${a}`);
    console.log(`   arquivo: companies/${slug}/competitors/${comp}/relatorios/${r.id}.md`);
    if (flags.has('--pacote')) console.log(JSON.stringify(R.pacoteRelatorio(slug, comp, r.id), null, 2));
    else if (!r.leitura) console.log(`   próximo: o Opus lê --pacote e grava com: npm run fichas -- relatorio ${slug} ${comp} --rodada ${r.id} --leitura <arquivo.json>`);
    return;
  }

  if (cmd === 'preparar') {
    if (!resto.length) falha('informe ao menos uma chave <plataforma:id>');
    const { preparar } = await import('./preparar');
    let ruim = 0;
    for (const key of resto) {
      parseKey(key);
      try {
        const r = await preparar(slug, comp, key, { reanalisar: flags.has('--reanalisar') });
        const ic = r.estado === 'pulado' ? '⏭' : r.estado === 'preparado' ? '✅' : '⚠';
        console.log(`${ic} ${key}: ${r.estado} em ${r.segundos} s${r.motivo ? ` (${r.motivo})` : ''}`);
        if (r.estado !== 'pulado') {
          const t = r.tempos;
          console.log(`   texto: ${r.fonteTexto ?? 'nenhum'}${r.palavras ? ` · ${r.palavras} palavras` : ''} · ${r.quadros} quadros${r.cortes != null ? ` · ${r.cortes} cortes de cena` : ''}`);
          if (t) console.log(`   tempos: baixar ${t.baixar ?? 0} s · transcrever ${t.transcrever ?? 0} s · quadros ${t.quadros ?? 0} s · total ${t.total} s`);
        }
        for (const a of r.avisos) console.log(`   · ${a}`);
        if (r.estado === 'parcial') ruim++;
      } catch (e) { ruim++; console.log(`❌ ${key}: ${(e as Error).message}`); }
    }
    process.exit(ruim ? 1 : 0);
  }

  if (cmd === 'pacote') {
    const key = resto[0] ?? falha('informe a chave <plataforma:id>');
    const f = readFicha(slug, comp, key) ?? falha(`sem ficha para ${key}: rode preparar antes`);
    if (!f.insumos) falha(`${key} ainda não foi preparada: rode preparar antes`);
    const ins = f.insumos!;
    const dir = dadosDir(slug, comp, key);
    const it = f.item as { type?: string; durationS?: number | null; publishedAt?: string | null; title?: string | null };
    // as 2 imagens que o Opus vê: abertura (0 s) e ~1,5 s; as demais só como tempo
    const alvo = [0, 1500].map((t) => ins.quadros.reduce<(typeof ins.quadros)[number] | undefined>((b, q) => (!b || Math.abs(q.tMs - t) < Math.abs(b.tMs - t) ? q : b), undefined)).filter(Boolean);
    const snaps = new Set(alvo.map((q) => q!.tMs));
    console.log(JSON.stringify({
      kind: f.kind, key: f.key, url: f.url, plataforma: f.key.split(':')[0], formatoMidia: it.type, duracaoS: ins.midia?.duracaoS ?? it.durationS ?? null, publicadoEm: it.publishedAt?.slice(0, 10) ?? null,
      titulo: it.title ?? null, medidas: f.medidas, legenda: ins.legendaLimpa ?? '',
      transcricao: ins.transcricao ? { fonte: ins.transcricao.fonte, idioma: ins.transcricao.idioma, segmentos: ins.transcricao.segmentos } : null,
      quadros: ins.quadros.map((q) => ({ tMs: q.tMs, descricao: q.descricao ?? null, ocr: q.ocr ?? null, imagem: snaps.has(q.tMs) ? join(dir, q.arquivo) : undefined })),
      cortesDeCenaS: ins.cenas ?? null, faltou: ins.faltou, insumosHash: ins.hash,
    }, null, 2));
    return;
  }

  if (cmd === 'quadros') {
    const arq = resto[0] ?? falha('informe o arquivo .json com { "<chave>": [{ tMs, descricao, ocr }] }');
    const todos = JSON.parse(readFileSync(arq, 'utf8').replace(/^﻿/, '')) as Record<string, { tMs: number; descricao?: string | null; ocr?: string | null }[]>;
    let n = 0;
    for (const [key, lista] of Object.entries(todos)) {
      const f = readFicha(slug, comp, key);
      if (!f?.insumos) continue; // chave de outro concorrente ou ainda não preparada
      for (const q of f.insumos.quadros) {
        const d = lista.find((x) => x.tMs === q.tMs);
        if (!d) continue;
        if (d.descricao) q.descricao = d.descricao;
        if (d.ocr) q.ocr = d.ocr; else delete q.ocr;
        n++;
      }
      writeFicha(slug, comp, f);
      console.log(`✅ ${key}: ${lista.length} quadro(s) descrito(s)`);
    }
    if (!n) falha(`nenhum quadro de ${comp} no arquivo (as chaves precisam ter ficha preparada)`);
    return;
  }

  if (cmd === 'salvar') {
    const arq = resto[0] ?? falha('informe o arquivo .json com a análise');
    const p = JSON.parse(readFileSync(arq, 'utf8').replace(/^﻿/, '')) as Record<string, unknown>;
    const key = String(p.key ?? '');
    parseKey(key);
    const vocab = loadVocab();
    const ficha = readFicha(slug, comp, key) ?? (await import('./medidas')).novaFicha(slug, comp, key);
    const bruta = (p.analise ?? { versaoPrompt: 1, ...p, key: undefined }) as Record<string, unknown>;
    const r = FichaAnalise.safeParse({ versaoVocab: vocab.versao, geradoEm: nowIso(), insumosHash: ficha.insumos?.hash, modelo: 'claude-opus-5-5', ...bruta });
    if (!r.success) falha(`análise fora do schema:\n  ${r.error.issues.map((i) => `${i.path.join('.') || '(raiz)'}: ${i.message}`).join('\n  ')}`);
    if (ficha.analise && !flags.has('--reanalisar')) falha(`${key} já tem análise (${ficha.analise.geradoEm}, ${ficha.analise.modelo}). Para refazer, use --reanalisar: a análise antiga vai para "anteriores" e suas edições (override) continuam.`);
    if (ficha.analise) ficha.anteriores = [ficha.analise, ...ficha.anteriores].slice(0, 3);
    ficha.analise = r.data;
    const { medidasDe } = await import('./medidas');
    ficha.medidas = medidasDe(slug, comp, key, ficha.medidas.seguidores) ?? ficha.medidas;
    writeFicha(slug, comp, ficha); // valida o vocabulário; lança com a lista dos valores aceitos
    setMark(slug, comp, key, { status: 'analisada' });
    console.log(`✅ ${key}: análise salva (${r.data.modelo}${ficha.anteriores.length ? `, ${ficha.anteriores.length} anterior(es) guardada(s)` : ''}) e marcada como analisada${r.data.termosNovos.length ? `\n   ${r.data.termosNovos.length} termo(s) novo(s) proposto(s): ${r.data.termosNovos.map((t) => `${t.grupo}:${t.valor}`).join(', ')}` : ''}`);
    return;
  }
  falha(`comando desconhecido "${cmd}"\n${USO}`);
}
main().catch((e) => falha((e as Error).message));
