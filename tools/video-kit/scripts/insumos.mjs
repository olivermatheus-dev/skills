// Insumos de um projeto de vídeo pela linha de comando (tarefa 045 E): aberturas, vozes, headlines, CTAs e copys no projeto.json,
// com validação (o que o QC de sincronia reprovaria é recusado aqui). A IA grava SÓ por este script, nunca editando o projeto.json.
//
//   node tools/video-kit/scripts/insumos.mjs <pasta> listar [--json]
//   node tools/video-kit/scripts/insumos.mjs <pasta> contexto          # pacote curto para a IA escrever opções (≈ 2,5 mil tokens)
//   node tools/video-kit/scripts/insumos.mjs <pasta> add abertura --fala "…" --tela "a *b*|c" --cues troca=palavra,espalha=palavra [--id x] [--titulo …]
//   node tools/video-kit/scripts/insumos.mjs <pasta> add voz --voz edge-francisca [--id x] [--rate -8%]
//   node tools/video-kit/scripts/insumos.mjs <pasta> add headline --texto "…"  |  add cta --botao "Saiba mais" [--fala …]
//   node tools/video-kit/scripts/insumos.mjs <pasta> add copy --principal "…" --titulo "…" [--descricao …]
//   node tools/video-kit/scripts/insumos.mjs <pasta> editar <tipo> <id> --campo valor   |   rm <tipo> <id> [--forcar]
//   --forcar: confirma o que mexe em variante já gerada (editar/rm de opção em uso, rodada que esvazia, 1ª voz do projeto)
//   comuns: --por-que "ângulo + fonte" · --origem ia|oliver (padrão oliver) · --empresa <slug> (pasta fora de companies/)
// Contrato: .claude/skills/video/references/variantes.md > "Insumos (fase E)". Saída 1 = erro de validação (nada foi gravado).
import { resolve } from 'node:path';
import { view, contexto, aplicar, InsumoErro, TIPOS } from '../../lib/insumos.mjs';

const args = process.argv.slice(2);
const flags = {};
const pos = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a.startsWith('--')) {
    const k = a.slice(2);
    if (['json', 'forcar'].includes(k)) flags[k] = true;
    else flags[k] = args[++i];
  } else pos.push(a);
}
const [pasta, cmd, ...resto] = pos;
const sai = (msg, code = 1) => { console.error(msg); process.exit(code); };
if (!pasta || !cmd) sai('uso: insumos.mjs <pasta> listar|contexto|add|editar|rm … (veja o cabeçalho do script)');
const empresa = flags.empresa;
const cuesDe = (s) => Object.fromEntries(String(s ?? '').split(',').map((p) => p.trim()).filter(Boolean).map((p) => { const j = p.indexOf('='); return j < 0 ? [p, ''] : [p.slice(0, j).trim(), p.slice(j + 1).trim()]; }));
const dadosDe = (tipo) => ({
  abertura: { fala: flags.fala, tela: flags.tela, cues: flags.cues != null ? cuesDe(flags.cues) : undefined, titulo: flags.titulo },
  voz: { voz: flags.voz, rate: flags.rate },
  headline: { texto: flags.texto },
  cta: { botao: flags.botao, fala: flags.fala },
  copy: { texto_principal: flags.principal, titulo: flags.titulo, descricao: flags.descricao },
}[tipo]);

try {
  if (cmd === 'listar') {
    const v = view(pasta, { empresa });
    if (flags.json) console.log(JSON.stringify(v, null, 2));
    else {
      const sel = (k) => (v.avisos[k] ? `  ⚠ ${v.avisos[k].join(' · ')}` : '');
      const marca = (o) => `${o.usada ? ' [em uso]' : ''}${o.origem === 'ia' ? ' [IA]' : ''}`;
      console.log(`aberturas (molde ${v.molde ? `${v.molde.cena}; cues ${v.molde.cues.join(', ')}` : 'nenhum'})`);
      for (const a of v.aberturas) console.log(`  ${a.id}${marca(a)}: "${a.fala}" | ${a.tela}${sel(`abertura:${a.id}`)}`);
      console.log('vozes');
      for (const o of v.vozes) console.log(`  ${o.id}${marca(o)}: ${o.voz} (${o.nome})${o.rate ? ` rate ${o.rate}` : ''}${sel(`voz:${o.id}`)}`);
      console.log('headlines');
      for (const o of v.headlines) console.log(`  ${o.id}${marca(o)}: ${o.texto}${sel(`headline:${o.id}`)}`);
      console.log('ctas');
      for (const o of v.ctas) console.log(`  ${o.id}${marca(o)}: ${o.botao}${o.fala ? ` · "${o.fala}"` : ''}${sel(`cta:${o.id}`)}`);
      console.log('copys');
      for (const o of v.copys) console.log(`  ${o.id}${marca(o)}: ${o.titulo} · ${o.texto_principal}${sel(`copy:${o.id}`)}`);
    }
  } else if (cmd === 'contexto') {
    process.stdout.write(contexto(pasta, { empresa }));
  } else if (cmd === 'add') {
    const [tipo] = resto;
    if (!TIPOS.includes(tipo)) sai(`tipo inválido "${tipo}" (${TIPOS.join(', ')})`);
    const r = aplicar(pasta, { acao: 'add', tipo, id: flags.id, empresa, forcar: !!flags.forcar, dados: { ...dadosDe(tipo), por_que: flags['por-que'], origem: flags.origem } });
    console.log(`✓ ${tipo} "${r.id}" gravado em ${resolve(pasta, 'projeto.json')}`);
    for (const a of r.avisos) console.log(`  ⚠ ${a}`);
  } else if (cmd === 'editar') {
    const [tipo, id] = resto;
    if (!TIPOS.includes(tipo) || !id) sai('uso: editar <tipo> <id> --campo valor');
    const d = Object.fromEntries(Object.entries({ ...dadosDe(tipo), por_que: flags['por-que'] }).filter(([, v]) => v !== undefined));
    if (!Object.keys(d).length) sai('nada para editar (passe --fala/--tela/--cues/--texto…)');
    const r = aplicar(pasta, { acao: 'editar', tipo, id, empresa, forcar: !!flags.forcar, dados: d });
    console.log(`✓ ${tipo} "${r.id}" atualizado`);
    for (const a of r.avisos) console.log(`  ⚠ ${a}`);
  } else if (cmd === 'rm') {
    const [tipo, id] = resto;
    if (!TIPOS.includes(tipo) || !id) sai('uso: rm <tipo> <id> [--forcar]');
    const r = aplicar(pasta, { acao: 'rm', tipo, id, forcar: !!flags.forcar, empresa });
    console.log(`✓ ${tipo} "${id}" removido`);
    for (const a of r.avisos) console.log(`  ⚠ ${a}`);
  } else sai(`comando desconhecido "${cmd}" (listar, contexto, add, editar, rm)`);
} catch (e) {
  if (e instanceof InsumoErro) { for (const m of e.erros) console.error(`✗ ${m}`); process.exit(1); }
  throw e;
}
