// Popula uma CÓPIA do hub com 2 concorrentes fictícios e 4 coletas semanais (fixtures + imagens geradas no ffmpeg).
// Uso: npx tsx tools/intel/demo.ts <raiz-da-copia> [slug=kz]   — nunca rode na pasta real.
import { resolve } from 'node:path';

const root = process.argv[2];
const slug = process.argv[3] ?? 'kz';
if (!root) { console.log('uso: npx tsx tools/intel/demo.ts <raiz-da-copia> [slug]'); process.exit(1); }
process.env.HUB_ROOT = resolve(root);
if (process.env.HUB_ROOT === resolve(new URL('../..', import.meta.url).pathname)) { console.error('recusado: use uma cópia, não a pasta real do hub'); process.exit(1); }

const S = await import('../../core/store');
const { collectCompetitor } = await import('./collect');
const { fixtureRunner } = await import('./fixture-runner');

const comps = [
  { id: 'consultorio-leve', name: 'Consultório Leve', kind: 'concorrente' as const, favorite: true, tags: ['saas', 'gestao'],
    profiles: [
      { platform: 'youtube' as const, url: 'https://www.youtube.com/@consultorioleve', handle: 'consultorioleve' },
      { platform: 'site' as const, url: 'https://consultorio-leve.example', handle: 'consultorio-leve.example' },
    ], body: 'Concorrente direto (fictício, dados de demonstração). Forte em vídeo longo educativo.\n' },
  { id: 'ana-terapia', name: 'Ana | Terapia na prática', kind: 'criador' as const, favorite: false, tags: ['criadora', 'reels'],
    profiles: [
      { platform: 'tiktok' as const, url: 'https://www.tiktok.com/@anaterapia.exemplo', handle: 'anaterapia.exemplo' },
      { platform: 'instagram' as const, url: 'https://www.instagram.com/anaterapia.exemplo/', handle: 'anaterapia.exemplo' },
    ], body: 'Criadora de referência (fictícia). Bastidores de consultório, humor leve.\n' },
];
process.env.APIFY_TOKEN ??= 'fixture-token'; // o runner de fixtures responde pelo Apify
const weeks = [3, 2, 1, 0];
const growth = [1, 1.06, 1.13, 1.22];
for (const c of comps) {
  const { body, ...data } = c;
  S.saveCompetitor(slug, { ...data, created: '2026-09-10' }, body);
  for (const [i, w] of weeks.entries()) {
    const now = new Date(Date.now() - w * 7 * 86400_000);
    const rs = await collectCompetitor(slug, c.id, { runner: fixtureRunner({ growth: growth[i], images: true }), now, source: 'fixture' });
    console.log(`${c.id} · ${now.toISOString().slice(0, 10)} · ${rs.map((r) => `${r.key}:${r.ok ? r.items : 'erro'}`).join(' ')}`);
  }
}
console.log(`✅ demonstração em ${process.env.HUB_ROOT}/companies/${slug}/competitors`);
