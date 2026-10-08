// Uso: npm run ads -- <slug> <competitorId|--all> [--max 30] [--visivel]
// Coleta os anúncios ATIVOS (BR) da Biblioteca de Anúncios da Meta, sem login/token. Grava em competitors/<id>/ads/.
export {};
const argv = process.argv.slice(2);
const flag = (n: string) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
const pos = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--max');
const [slug, target] = [pos[0], argv.includes('--all') ? '--all' : pos[1]];
if (!slug || !target) {
  console.log('uso: npm run ads -- <slug> <competitorId|--all> [--max 30] [--visivel]');
  process.exit(1);
}
const { collectAds, collectAdsAll } = await import('./ads');
const opt = { max: flag('--max') ? Number(flag('--max')) : undefined, headless: !argv.includes('--visivel') };
const print = (r: Awaited<ReturnType<typeof collectAds>>) => {
  console.log(`\n■ ${r.id}\n  ${r.ok ? '✅' : '❌'} ${r.ads} anúncios lidos · total na biblioteca: ${r.total ?? '—'} · página: ${r.pageName ?? '—'} (${r.pageId ?? '—'})${r.file ? `\n     ${r.file}` : ''}`);
  for (const e of r.errors) console.log(`     ⚠ ${e}`);
};
let fail = 0;
if (target === '--all') {
  const { readdirSync, existsSync } = await import('node:fs');
  const { join } = await import('node:path');
  const dir = join(process.env.HUB_ROOT ?? process.cwd(), 'companies', slug, 'competitors');
  const ids = readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory() && existsSync(join(dir, d.name, 'competitor.md'))).map((d) => d.name);
  for (const r of await collectAdsAll(slug, ids, opt, print)) if (!r.ok) fail++;
} else {
  const r = await collectAds(slug, target, opt);
  print(r);
  if (!r.ok) fail++;
}
process.exit(fail ? 1 : 0);
