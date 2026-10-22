// Uso: npm run acervo -- <slug> <concorrenteId> [--anos 1|2 | --dias N] [--status]
// Roda UM lote da coleta longa do Instagram (continua de onde o anterior parou), respeitando os limites da conta.
export {};
const argv = process.argv.slice(2);
const flag = (n: string) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
const [slug, id] = argv.filter((a, i) => !a.startsWith('--') && !['--anos', '--dias'].includes(argv[i - 1] ?? ''));
if (!slug || !id) { console.log('uso: npm run acervo -- <slug> <concorrenteId> [--anos 1|2 | --dias N] [--status]'); process.exit(1); }
const A = await import('./acervo');
const show = () => {
  const s = A.status(slug, id);
  const a = s.acervo;
  console.log(`@${s.handle ?? '?'} · acervo: ${a ? `${a.posts} posts · chegou até ${a.maisAntigo ?? '—'} · alvo ${a.alvoDias} dias${a.terminado ? ' · TERMINADO' : ''}` : 'nunca rodou'}`);
  console.log(`conta: ${s.conta.ok ? `livre (${s.conta.lotes24h}/${A.LIMITES.lotesPorDia} lotes nas últimas 24 h)` : `${s.conta.motivo} · libera ${new Date(s.conta.liberaEm!).toLocaleString('pt-BR')}`}`);
};
if (argv.includes('--status')) { show(); process.exit(0); }
const alvoDias = flag('--dias') ? Number(flag('--dias')) : flag('--anos') ? Number(flag('--anos')) * 365 : undefined;
try {
  const r = await A.runLote(slug, id, { alvoDias });
  console.log(`✅ lote: ${r.novos} posts novos · acervo com ${r.posts} · chegou até ${r.ate ?? '—'}${r.terminado ? ' · TERMINADO (chegou na data alvo)' : ''}`);
  for (const e of r.erros) console.log(`   ⚠ ${e}`);
} catch (e) {
  console.error(`❌ ${(e as Error).message}`);
  process.exitCode = 2;
}
show();
