// npm run fichas -- <comando> …   (tarefa 040; README.md desta pasta). Sem LLM: o Opus entra na fase C e grava com `salvar`.
//   preparar <empresa> <concorrente> <chave…> [--reanalisar]   legenda/áudio → transcrição, quadros, hash (idempotente)
//   pacote   <empresa> <concorrente> <chave>                   imprime o pacote enxuto que o Opus recebe
//   salvar   <empresa> <concorrente> <arquivo.json> [--reanalisar]   valida (schema + vocabulário) e grava a análise
//   validar                                                    confere todas as fichas (o mesmo do npm run validate)
// chave = <plataforma>:<idDoItem> (ex.: tiktok:7691064446289988884)
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FichaAnalise } from '../../schema/ficha';
import { setMark } from '../../core/store';
import { dadosDir, loadVocab, nowIso, parseKey, readFicha, writeFicha } from './lib';

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith('--')));
const pos = argv.filter((a) => !a.startsWith('--'));
const [cmd, slug, comp, ...resto] = pos;
const USO = `uso:
  npm run fichas -- preparar <empresa> <concorrente> <plataforma:id>… [--reanalisar]
  npm run fichas -- pacote   <empresa> <concorrente> <plataforma:id>
  npm run fichas -- salvar   <empresa> <concorrente> <arquivo.json> [--reanalisar]
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
  if (!cmd || !slug || !comp) falha(USO);

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
