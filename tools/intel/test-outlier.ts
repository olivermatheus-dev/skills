// Teste do "fora da curva duplo" (perfil × mercado) de app/src/components/competitors/lib.tsx.
// Uso: npx tsx tools/intel/test-outlier.ts   (a parte final lê companies/kz/competitors/* e imprime exemplos reais; só leitura)
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildRows, groupSnapshots, withMarketOutlier, type Row } from '../../app/src/components/competitors/lib';

const near = (a: number | undefined, b: number) => assert.ok(a != null && Math.abs(a - b) < 1e-9, `${a} != ${b}`);
const snap = (key: string, followers: number, items: [string, string, number][]) => ({
  key, file: `${key}.json`,
  data: { platform: 'instagram', collectedAt: '2026-10-08T10:00:00Z', profile: { followers }, items: items.map(([id, type, views]) => ({ id, url: `u/${id}`, type, metrics: { views, likes: Math.round(views / 10) } })) },
}) as never;

// perfil pequeno (S) e grande (B), os dois no Instagram; reels 5+5 (n=10 → vale o formato), carrossel 1+1 (n=2 → cai para a rede)
const S = snap('s-instagram', 1000, [...[100, 200, 300, 400, 500].map((v, i): [string, string, number] => [`sr${i}`, 'reel', v]), ['sc', 'carrossel', 900]]);
const B = snap('b-instagram', 100000, [...[1000, 2000, 3000, 4000, 5000].map((v, i): [string, string, number] => [`br${i}`, 'reel', v]), ['bc', 'carrossel', 1100]]);
const rows = withMarketOutlier([S, B].flatMap((s) => buildRows([...groupSnapshots([s]).values()], {}, () => 'instagram')));
const get = (id: string) => rows.find((r) => r.item.id === id) as Row;

// medianas à mão: perfil S (reels+carrossel) = 350; perfil B = 2500; reels do mercado (10 itens) = (500+1000)/2 = 750; rede (12 itens) = (900+1000)/2 = 950
let r = get('sr4'); // reel 500 do perfil pequeno
near(r.outlier, 500 / 350); near(r.outlierMercado, 500 / 750);
assert.equal(r.mercadoEscopo, 'formato'); assert.equal(r.mercadoAmostra, 10); assert.equal(r.outlierMercadoBasis, 'views');
r = get('br4'); // reel 5000 do perfil grande
near(r.outlier, 5000 / 2500); near(r.outlierMercado, 5000 / 750);
r = get('sc'); // carrossel: só 2 no formato → rede inteira
near(r.outlier, 900 / 350); near(r.outlierMercado, 900 / 950);
assert.equal(r.mercadoEscopo, 'rede'); assert.equal(r.mercadoAmostra, 12);
// por seguidor: S tem 1.000 seguidores, B 100.000. Mediana de porSeguidor nos reels (10) = (0,05+0,1)/2 = 0,075; na rede (12) também 0,075
near(get('sr4').porSeguidor, 500 / 1000); near(get('sr4').porSeguidorMercado, 0.5 / 0.075);
near(get('br4').porSeguidor, 5000 / 100000); near(get('br4').porSeguidorMercado, 0.05 / 0.075);
near(get('sc').porSeguidor, 0.9); near(get('sc').porSeguidorMercado, 0.9 / 0.075); // carrossel, escopo rede
assert.equal(get('sc').porSeguidorBasis, 'views');
const semSeg = withMarketOutlier(buildRows([...groupSnapshots([{ ...(S as object), data: { ...(S as { data: object }).data, profile: {} } } as never]).values()], {}, () => 'instagram'));
assert.equal(semSeg[0].porSeguidor, undefined); assert.equal(semSeg[0].porSeguidorMercado, undefined);
console.log('ok: 3 casos à mão (perfil pequeno, perfil grande, formato com amostra < 10 → rede)');

// ---- dados reais (só leitura)
const dir = join(process.cwd(), 'companies', 'kz', 'competitors');
if (existsSync(dir)) {
  const all: (Row & { comp: string })[] = [];
  for (const c of readdirSync(dir)) {
    const sd = join(dir, c, 'snapshots');
    if (!existsSync(sd)) continue;
    const snaps = readdirSync(sd, { withFileTypes: true }).filter((d) => d.isDirectory()).flatMap((d) =>
      readdirSync(join(sd, d.name)).filter((f) => f.endsWith('.json')).map((f) => ({ key: d.name, file: f, data: JSON.parse(readFileSync(join(sd, d.name, f), 'utf8')) })));
    all.push(...buildRows([...groupSnapshots(snaps as never).values()], {}, (k) => k.split('-')[0]).map((x) => ({ ...x, comp: c })));
  }
  const mk = withMarketOutlier(all) as (Row & { comp: string })[];
  const top = (k: 'outlierMercado' | 'porSeguidorMercado' | 'outlier') => [...mk].filter((x) => x[k] != null).sort((x, y) => y[k]! - x[k]!)[0];
  const n = (v?: number) => (v == null ? '—' : v.toFixed(2));
  const fmt = (x: Row & { comp: string }) => `${x.comp} ${x.platform}/${x.item.type} ${x.item.id}: perfil ${n(x.outlier)}× · mercado ${n(x.outlierMercado)}× (${x.mercadoEscopo}, n=${x.mercadoAmostra}) · por seguidor ${x.porSeguidor != null ? (x.porSeguidor * 100).toFixed(1) + '%' : '—'} (${x.porSeguidorBasis}) · por seguidor × mercado ${n(x.porSeguidorMercado)}×`;
  console.log(`${mk.length} itens reais. Exemplos:`);
  for (const [t, x] of [['maior × mercado', top('outlierMercado')], ['maior por seguidor × mercado', top('porSeguidorMercado')], ['maior × perfil', top('outlier')]] as const) { assert.ok(x, t); console.log(` - ${t}: ${fmt(x)}`); }
  for (const x of mk.filter((x) => x.comp === 'corpora' && x.item.type === 'carrossel').sort((a, b) => (b.outlierMercado ?? 0) - (a.outlierMercado ?? 0)).slice(0, 2)) console.log(' - corpora carrossel:', fmt(x));
}
