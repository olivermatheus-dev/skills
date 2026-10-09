// Pacote do anúncio e resultados de um projeto de vídeo (tarefa 045 F). Zero LLM.
//
//   node tools/video-kit/scripts/pacote.mjs <pasta> [--so id1,id2] [--formatos 4x5,9x16] [--link URL] [--campanha x] [--conjunto x] [--seco]
//       sem --so: as variantes aprovadas/finais. Grava <pasta>/pacote/<data>/ (MP4 com o nome do anúncio, anuncios.csv, pacote.md, pacote.json)
//   node tools/video-kit/scripts/pacote.mjs <pasta> resultados <relatorio.csv> [--data AAAA-MM-DD] [--seco] [--json]
//       CSV exportado do Gerenciador (por anúncio) → variantes/resultados/<data>.{json,md} + linhas no campaigns/LOG_ANGULOS.md
//   --seco: só mostra, não grava. Link e campanha também vêm de "anuncio": { link, campanha, conjunto } no projeto.json.
// Contrato: .claude/skills/video/references/variantes.md > "Pacote e resultados (fase F)".
import { readFileSync } from 'node:fs';
import { montarPacote, importarResultados, PacoteErro } from '../../lib/pacote.mjs';

const args = process.argv.slice(2);
const flags = {}, pos = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a.startsWith('--')) { const k = a.slice(2); if (['seco', 'json'].includes(k)) flags[k] = true; else flags[k] = args[++i]; } else pos.push(a);
}
const [pasta, cmd, arquivo] = pos;
const lista = (s) => (s ? String(s).split(',').map((x) => x.trim()).filter(Boolean) : undefined);
if (!pasta) { console.error('uso: pacote.mjs <pasta> [--so ids] | <pasta> resultados <csv> (veja o cabeçalho)'); process.exit(1); }

try {
  if (!cmd) {
    const p = montarPacote(pasta, { ids: lista(flags.so), formatos: lista(flags.formatos), link: flags.link, campanha: flags.campanha, conjunto: flags.conjunto, seco: flags.seco, empresa: flags.empresa });
    if (flags.json) { console.log(JSON.stringify(p, null, 2)); process.exit(0); }
    console.log(`${flags.seco ? '(seco) ' : '✓ '}pacote ${p.campanha}: ${p.anuncios.length} anúncio(s) → ${p.saida}`);
    for (const a of p.anuncios) console.log(`  ${a.nome}  [${Object.keys(a.arquivos).join(', ')}]`);
    console.log(`  textos ${p.textos.length} · títulos ${p.titulos.length} · descrições ${p.descricoes.length} · botão ${p.botao}`);
    for (const a of p.avisos) console.log(`  ⚠ ${a}`);
  } else if (cmd === 'resultados') {
    if (!arquivo) throw new PacoteErro('falta o CSV: pacote.mjs <pasta> resultados <relatorio.csv>');
    const r = importarResultados(pasta, readFileSync(arquivo, 'utf8'), { data: flags.data, seco: flags.seco, campanha: flags.campanha, empresa: flags.empresa, arquivo });
    if (flags.json) { console.log(JSON.stringify(r, null, 2)); process.exit(0); }
    console.log(`${flags.seco ? '(seco) ' : '✓ '}${Object.keys(r.variantes).length} variante(s) com resultado em ${r.data}`);
    for (const e of r.eixos) console.log(`  ${e.eixo}: ${e.vencedora ? `vencedora ${e.vencedora} · ` : ''}${e.motivo}`);
    if (r.sem_par.length) console.log(`  ⚠ sem par no projeto: ${r.sem_par.join(', ')}`);
    if (flags.seco) { console.log('\nlinhas que iriam para o LOG_ANGULOS.md:'); for (const l of r.log) console.log(l); }
    else for (const f of r.arquivos) console.log(`  gravado: ${f}`);
  } else throw new PacoteErro(`comando desconhecido "${cmd}" (nenhum = pacote, ou "resultados")`);
} catch (e) {
  if (e instanceof PacoteErro) { console.error(`✗ ${e.message}`); process.exit(1); }
  throw e;
}
