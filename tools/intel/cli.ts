// Uso: npm run collect -- <slug> <competitorId|--all> [--max 30] [--platform youtube,tiktok] [--fixture [--growth 1.1]]
// Cada execução grava um snapshot novo por perfil em companies/<slug>/competitors/<id>/snapshots/ (nunca apaga os antigos).
export {};
const argv = process.argv.slice(2);
const flag = (n: string) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
const pos = argv.filter((a, i) => !a.startsWith('--') && !['--max', '--platform', '--growth'].includes(argv[i - 1] ?? ''));
const [slug, target] = [pos[0], argv.includes('--all') ? '--all' : pos[1]];
if (!slug || !target) {
  console.log('uso: npm run collect -- <slug> <competitorId|--all> [--max 30] [--platform youtube,tiktok] [--fixture]');
  process.exit(1);
}
const { collectCompetitor, collectAll } = await import('./collect');
const { fixtureRunner } = await import('./fixture-runner');
type R = Awaited<ReturnType<typeof collectCompetitor>>;
const opt = {
  maxItems: flag('--max') ? Number(flag('--max')) : undefined,
  platforms: flag('--platform')?.split(','),
  ...(argv.includes('--fixture') ? { runner: fixtureRunner({ growth: Number(flag('--growth') ?? 1), images: true }), source: 'fixture' as const } : {}),
};
const print = (id: string, rs: R) => {
  console.log(`\n■ ${id}`);
  if (!rs.length) console.log('  (sem perfis cadastrados)');
  for (const r of rs) {
    console.log(`  ${r.ok ? '✅' : '❌'} ${r.key.padEnd(34)} ${r.ok ? `${r.items} itens · ${r.followers ?? '—'} seguidores · ${r.source}` : ''}`);
    for (const e of r.errors) console.log(`     ⚠ ${e}`);
    for (const w of r.warnings) console.log(`     · ${w}`);
  }
};
let fail = 0;
try {
  if (target === '--all') {
    await collectAll(slug, opt, (id, rs) => { print(id, rs); fail += rs.filter((r) => !r.ok).length; });
  } else {
    const rs = await collectCompetitor(slug, target, opt);
    print(target, rs);
    fail = rs.filter((r) => !r.ok).length;
  }
} catch (e) {
  console.error(`❌ ${(e as Error).message}`);
  process.exit(1);
}
process.exit(fail ? 2 : 0);
