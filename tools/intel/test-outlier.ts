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

// perfis pequeno (S), grande (B) e médio (T), os três no Instagram (3 concorrentes: vale o mercado).
// reels 5+5+1 (n=11 → vale o formato), carrossel 1+1+1 (n=3 → cai para a rede)
const S = snap('s-instagram', 1000, [...[100, 200, 300, 400, 500].map((v, i): [string, string, number] => [`sr${i}`, 'reel', v]), ['sc', 'carrossel', 900]]);
const B = snap('b-instagram', 100000, [...[1000, 2000, 3000, 4000, 5000].map((v, i): [string, string, number] => [`br${i}`, 'reel', v]), ['bc', 'carrossel', 1100]]);
const T = snap('t-instagram', 10000, [['tr', 'reel', 750], ['tc', 'carrossel', 950]]);
const rowsOf = (ss: unknown[]) => withMarketOutlier(ss.flatMap((s) => buildRows([...groupSnapshots([s as never]).values()], {}, () => 'instagram')));
const rows = rowsOf([S, B, T]);
const get = (id: string, rs: Row[] = rows) => rs.find((r) => r.item.id === id) as Row;

// medianas à mão: perfil S (reels+carrossel) = 350; perfil B = 2500; reels do mercado (11 itens) = 750; rede (14 itens) = (900+950)/2 = 925
let r = get('sr4'); // reel 500 do perfil pequeno
near(r.outlier, 500 / 350); near(r.outlierMercado, 500 / 750);
assert.equal(r.mercadoEscopo, 'formato'); assert.equal(r.mercadoAmostra, 11); assert.equal(r.outlierMercadoBasis, 'views'); assert.equal(r.mercadoConcorrentes, 3);
r = get('br4'); // reel 5000 do perfil grande
near(r.outlier, 5000 / 2500); near(r.outlierMercado, 5000 / 750);
r = get('sc'); // carrossel: só 3 no formato → rede inteira
near(r.outlier, 900 / 350); near(r.outlierMercado, 900 / 925);
assert.equal(r.mercadoEscopo, 'rede'); assert.equal(r.mercadoAmostra, 14);
// por seguidor: S 1.000, B 100.000, T 10.000 seguidores. Mediana nos reels (11) = 0,075; na rede (14) = (0,075+0,095)/2 = 0,085
near(get('sr4').porSeguidor, 500 / 1000); near(get('sr4').porSeguidorMercado, 0.5 / 0.075);
near(get('br4').porSeguidor, 5000 / 100000); near(get('br4').porSeguidorMercado, 0.05 / 0.075);
near(get('sc').porSeguidor, 0.9); near(get('sc').porSeguidorMercado, 0.9 / 0.085); // carrossel, escopo rede
assert.equal(get('sc').porSeguidorBasis, 'views');
const semSeg = withMarketOutlier(buildRows([...groupSnapshots([{ ...(S as object), data: { ...(S as { data: object }).data, profile: {} } } as never]).values()], {}, () => 'instagram'));
assert.equal(semSeg[0].porSeguidor, undefined); assert.equal(semSeg[0].porSeguidorMercado, undefined);
// só 2 concorrentes na rede (S e B): × mercado não vale ("—"), mesmo com 10 reels; o perfil continua valendo
const dois = rowsOf([S, B]);
for (const id of ['sr4', 'br4', 'sc']) {
  const x = get(id, dois);
  assert.equal(x.outlierMercado, undefined, id); assert.equal(x.porSeguidorMercado, undefined, id);
  assert.equal(x.mercadoConcorrentes, 2); assert.equal(x.mercadoEscopo, 'rede');
}
near(get('sr4', dois).outlier, 500 / 350);
// mesmo perfil contado uma vez: compOf junta perfis do mesmo concorrente (S e T = "x") → 2 concorrentes → "—"
const junto = withMarketOutlier([S, B, T].flatMap((s) => buildRows([...groupSnapshots([s as never]).values()], {}, () => 'instagram')), (x) => (x.profileKey === 'b-instagram' ? 'b' : 'x'));
assert.equal(get('sr4', junto).outlierMercado, undefined); assert.equal(get('sr4', junto).mercadoConcorrentes, 2);
console.log('ok: 5 casos à mão (perfil pequeno, perfil grande, formato com amostra < 10 → rede, < 3 concorrentes → sem mercado, compOf)');

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
  const mk = withMarketOutlier(all, (x) => x.comp) as (Row & { comp: string })[];
  const top = (k: 'outlierMercado' | 'porSeguidorMercado' | 'outlier') => [...mk].filter((x) => x[k] != null).sort((x, y) => y[k]! - x[k]!)[0];
  const n = (v?: number) => (v == null ? '—' : v.toFixed(2));
  const fmt = (x: Row & { comp: string }) => `${x.comp} ${x.platform}/${x.item.type} ${x.item.id}: perfil ${n(x.outlier)}× · mercado ${n(x.outlierMercado)}× (${x.mercadoEscopo}, n=${x.mercadoAmostra}, ${x.mercadoConcorrentes} conc.) · por seguidor ${x.porSeguidor != null ? (x.porSeguidor * 100).toFixed(1) + '%' : '—'} (${x.porSeguidorBasis}) · por seguidor × mercado ${n(x.porSeguidorMercado)}×`;
  console.log(`${mk.length} itens reais. Exemplos:`);
  for (const [t, x] of [['maior × mercado', top('outlierMercado')], ['maior por seguidor × mercado', top('porSeguidorMercado')], ['maior × perfil', top('outlier')]] as const) { assert.ok(x, t); console.log(` - ${t}: ${fmt(x)}`); }
  for (const x of mk.filter((x) => x.comp === 'corpora' && x.item.type === 'carrossel').sort((a, b) => (b.outlierMercado ?? 0) - (a.outlierMercado ?? 0)).slice(0, 2)) console.log(' - corpora carrossel:', fmt(x));
}
