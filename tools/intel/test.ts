// Testes offline dos coletores: normalizadores com fixtures + gravação em um HUB_ROOT temporário.
// Uso: npm run test:intel
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = mkdtempSync(join(tmpdir(), 'hub-intel-'));
process.env.HUB_ROOT = root;
for (const k of ['YOUTUBE_API_KEY', 'APIFY_TOKEN', 'APIFY_IG_EXTRA_POSTS', 'YTDLP_PATH', 'YTDLP_COOKIES', 'YTDLP_COOKIES_FROM_BROWSER', 'INTEL_YT_DEEP']) process.env[k] = '';
process.env.HUB_ENV_FILE = join(root, 'nao-existe.env');
process.env.INTEL_IG_PAUSE_MS = '1';
mkdirSync(join(root, 'companies', 't'), { recursive: true });
writeFileSync(join(root, 'companies', 't', 'project.yml'), 'slug: t\nname: Teste\ncreated: 2026-10-07\n');

const { Snapshot, AdsSnapshot } = await import('../../schema');
const N = await import('./normalize');
const S = await import('../../core/store');
const { collectCompetitor } = await import('./collect');
const { fixtureRunner, FIXTURES } = await import('./fixture-runner');
const { parseEnv } = await import('./env');
const { keyFor } = await import('./keys');
const { extFromType, realRunner } = await import('./runner');

const fx = (f: string) => readFileSync(join(FIXTURES, f), 'utf8');
const fj = (f: string) => JSON.parse(fx(f));
const now = new Date('2026-10-07T12:00:00Z');
const valid = (s: unknown) => { const r = Snapshot.safeParse(s); assert.ok(r.success, r.success ? '' : JSON.stringify(r.error.issues.slice(0, 3))); return r.data!; };

let pass = 0, fail = 0;
async function t(name: string, fn: () => unknown) {
  try { await fn(); pass++; console.log(`✅ ${name}`); } catch (e) { fail++; console.log(`❌ ${name}\n   ${(e as Error).stack?.split('\n').slice(0, 3).join('\n   ')}`); }
}

await t('utilitários: contagens humanas, duração ISO, .env, extensão', () => {
  assert.equal(N.parseHumanCount('12,3 mil'), 12300);
  assert.equal(N.parseHumanCount('1.2K'), 1200);
  assert.equal(N.parseHumanCount('3M'), 3_000_000);
  assert.equal(N.parseHumanCount('1.234'), 1234);
  assert.equal(N.parseHumanCount('1,234'), 1234);
  assert.equal(N.isoDuration('PT1H2M3S'), 3723);
  assert.equal(N.isoDuration('PT48S'), 48);
  assert.equal(N.num(-1), undefined);
  assert.equal(N.num('42'), 42);
  assert.deepEqual(parseEnv('# c\nA=1\nB="dois três"\nexport C=x # comentário\nD=\n'), { A: '1', B: 'dois três', C: 'x', D: '' });
  assert.equal(extFromType('image/jpeg'), 'jpg');
  assert.equal(extFromType('image/svg+xml'), null);
  assert.equal(keyFor({ platform: 'youtube', url: 'https://youtube.com/@Foo', handle: 'Foo' }), 'youtube-foo');
  assert.equal(keyFor({ platform: 'site', url: 'https://ex.example/a' }), 'site-ex-example-a');
});

await t('YouTube (yt-dlp): canal, vídeos, shorts e detalhes', () => {
  const s = valid(N.normalizeYtdlpYoutube({ profileUrl: 'https://www.youtube.com/@consultorioleve', now, videos: fj('youtube-videos.json'), shorts: fj('youtube-shorts.json'), deep: fx('youtube-deep.jsonl').trim().split('\n').map((l) => JSON.parse(l)) }));
  assert.equal(s.profile.name, 'Consultório Leve');
  assert.equal(s.profile.handle, 'consultorioleve');
  assert.equal(s.profile.followers, 48200);
  assert.match(s.profile.avatar!, /avatar-consultorioleve=s0/);
  assert.match(s.profile.banner!, /banner-consultorioleve=s0/);
  assert.match(s.profile.bio!, /Gestão leve/);
  assert.equal(s.items.length, 18);
  const shorts = s.items.filter((i) => i.type === 'short');
  assert.equal(shorts.length, 6);
  assert.match(shorts[0].url, /\/shorts\//);
  const v = s.items[0];
  assert.equal(v.type, 'video');
  assert.ok(v.metrics.views! > 0 && v.metrics.likes! > 0 && v.metrics.comments! > 0, 'detalhes mesclados');
  assert.ok(v.caption?.includes('passo a passo'));
  assert.match(v.thumbnail!, /hqdefault/); // a maior da lista plana
  assert.equal(v.durationS, 612);
  assert.match(v.publishedAt!, /^\d{4}-\d{2}-\d{2}/);
  assert.equal(s.items[11].metrics.likes, undefined); // sem detalhe → sem curtidas, sem crash
});

await t('YouTube (API v3): canal, Shorts detectados, live', () => {
  const api = fj('youtube-api.json');
  const s = valid(N.normalizeYoutubeApi({ profileUrl: 'https://www.youtube.com/@consultorioleve', now, channel: api.channels.items[0], videos: api.videos.items, shortIds: new Set(['bbbbbbbbbb2']) }));
  assert.equal(s.source, 'youtube-api');
  assert.equal(s.profile.followers, 48200);
  assert.equal(s.profile.postsCount, 214);
  assert.deepEqual(s.items.map((i) => i.type), ['video', 'short', 'live']);
  assert.equal(s.items[0].durationS, 725);
  assert.match(s.items[0].thumbnail!, /maxresdefault/);
  assert.equal(s.items[1].metrics.comments, undefined);
});

await t('TikTok: lista do yt-dlp + perfil do HTML', () => {
  const s = valid(N.normalizeTiktok({ profileUrl: 'https://www.tiktok.com/@anaterapia.exemplo', now, handle: 'anaterapia.exemplo', list: fj('tiktok-user.json'), profileHtml: fx('tiktok-profile.html') }));
  assert.equal(s.profile.followers, 184300);
  assert.equal(s.profile.postsCount, 412);
  assert.equal(s.profile.name, 'Ana | Terapia na prática');
  assert.deepEqual(s.profile.links, ['https://linktr.ee/anaterapia.exemplo']);
  assert.equal(s.items.length, 10);
  const i = s.items[4];
  assert.equal(i.metrics.views, 890000);
  assert.ok(i.metrics.shares! > 0 && i.metrics.saves! > 0);
  assert.match(i.thumbnail!, /cover-/);
  assert.match(i.url, /tiktok\.com\/@anaterapia\.exemplo\/video\//);
  // sem HTML: perfil mínimo das entradas
  const s2 = valid(N.normalizeTiktok({ profileUrl: 'https://www.tiktok.com/@x', now, list: fj('tiktok-user.json') }));
  assert.equal(s2.profile.name, 'Ana | Terapia na prática');
});

await t('Instagram (Apify profile scraper): perfil, reels, carrossel, post', () => {
  const s = valid(N.normalizeApifyInstagram({ profileUrl: 'https://www.instagram.com/anaterapia.exemplo/', now, result: fj('instagram-apify.json') }));
  assert.equal(s.profile.followers, 96400);
  assert.equal(s.profile.handle, 'anaterapia.exemplo');
  assert.match(s.profile.avatar!, /s320x320/);
  assert.deepEqual(s.profile.links, ['https://linktr.ee/anaterapia.exemplo']);
  assert.equal(s.items.length, 12);
  assert.deepEqual([...new Set(s.items.map((i) => i.type))].sort(), ['carrossel', 'post', 'reel']);
  const reel = s.items.find((i) => i.type === 'reel')!;
  assert.ok(reel.metrics.views! > reel.metrics.likes!);
  assert.equal(s.items.find((i) => i.type === 'post')!.metrics.views, undefined);
  assert.throws(() => N.normalizeApifyInstagram({ profileUrl: 'https://www.instagram.com/x/', now, result: [{ error: 'not_found', errorDescription: 'Perfil não existe' }] }), /Perfil não existe/);
});

await t('Instagram (og:description público)', () => {
  const html = '<meta property="og:title" content="Ana (@ana.x) • Instagram photos and videos"><meta property="og:description" content="12,3 mil seguidores, 540 seguindo, 688 publicações - Veja as fotos e vídeos do Instagram de Ana (@ana.x)"><meta property="og:image" content="https://cdn.example/a.jpg">';
  const p = N.parseInstagramOg(html)!;
  assert.equal(p.followers, 12300);
  assert.equal(p.following, 540);
  assert.equal(p.postsCount, 688);
  assert.equal(p.handle, 'ana.x');
});

await t('Instagram sem token (embed público): perfil exato, posts, views e duração do vídeo', () => {
  const s = valid(N.normalizePublicInstagram({
    profileUrl: 'https://www.instagram.com/natgeo/', now, embedHtml: fx('instagram-public-embed.html'), profileHtml: fx('instagram-public-profile.html'),
    postHtml: { DeNJLoOksoN: fx('instagram-public-post.html') },
  }));
  assert.equal(s.source, 'instagram-public');
  assert.equal(s.profile.handle, 'natgeo');
  assert.equal(s.profile.name, 'National Geographic');
  assert.equal(s.profile.verified, true);
  assert.ok(s.profile.followers! > 1_000_000 && s.profile.postsCount! > 30_000, 'contagens exatas do embed');
  assert.equal(s.profile.following, 195);
  assert.match(s.profile.bio!, /inner explorer/);
  assert.equal(s.items.length, 4);
  assert.deepEqual(s.items.map((i) => i.type), ['post', 'carrossel', 'reel', 'reel']);
  const reel = s.items.find((i) => i.id === 'DeNJLoOksoN')!;
  assert.ok(reel.metrics.views! > reel.metrics.likes! && reel.durationS! > 0, 'views e duração vieram do embed do post');
  assert.ok(s.items.every((i) => i.publishedAt && i.metrics.likes != null && i.metrics.comments != null && /^https/.test(i.thumbnail!)));
  assert.equal(s.items.find((i) => i.id === 'DeMwi4hA_f1')!.metrics.views, undefined, 'sem o embed do post, sem views');
  assert.throws(() => N.normalizePublicInstagram({ profileUrl: 'https://www.instagram.com/x/', now, embedHtml: '<html>login</html>' }), /embed do perfil/);
});

await t('Instagram sem token: o adaptador usa o embed público antes de Apify/yt-dlp', async () => {
  const saved = process.env.APIFY_TOKEN;
  process.env.APIFY_TOKEN = 'tok';
  const run = fixtureRunner({ igPublic: true });
  const c2 = S.saveCompetitor('t', { name: 'Pública', profiles: [{ platform: 'instagram', url: 'https://www.instagram.com/natgeo/', handle: 'natgeo' }] }).data;
  const r = await collectCompetitor('t', c2.id, { runner: run, noMedia: true });
  process.env.APIFY_TOKEN = saved;
  assert.ok(r[0].ok && r[0].source === 'instagram-public' && r[0].items === 4, JSON.stringify(r[0]));
  assert.ok(!run.calls.some((c) => c.includes('apify')), 'nem chamou o Apify');
  assert.equal(run.calls.filter((c) => c.includes('/embed/captioned')).length, 2, 'um embed por vídeo');
});

await t('Site: título, descrição, og:image, ícone e redes encontradas', () => {
  const s = valid(N.normalizeSite({ profileUrl: 'https://consultorio-leve.example', finalUrl: 'https://consultorio-leve.example/', now, html: fx('site.html') }));
  assert.equal(s.profile.name, 'Consultório Leve');
  assert.match(s.profile.bio!, /autônomos & clínicas/);
  assert.equal(s.profile.banner, 'https://consultorio-leve.example/img/og-capa.jpg');
  assert.equal(s.profile.avatar, 'https://consultorio-leve.example/apple-touch-icon.png');
  assert.deepEqual(s.profile.links, ['https://www.instagram.com/consultorioleve', 'https://www.youtube.com/@consultorioleve', 'https://www.tiktok.com/@consultorioleve']);
  assert.equal(s.items.length, 0);
});

// ---------- gravação ----------
const comp = S.saveCompetitor('t', {
  name: 'Demo', profiles: [
    { platform: 'youtube', url: 'https://www.youtube.com/@consultorioleve', handle: 'consultorioleve' },
    { platform: 'tiktok', url: 'https://www.tiktok.com/@anaterapia.exemplo', handle: 'anaterapia.exemplo' },
    { platform: 'instagram', url: 'https://www.instagram.com/anaterapia.exemplo/', handle: 'anaterapia.exemplo' },
    { platform: 'site', url: 'https://consultorio-leve.example' },
    { platform: 'facebook', url: 'https://www.facebook.com/x', handle: 'x' },
  ],
}).data;

await t('coleta completa (fixtures): grava snapshots válidos e imagens', async () => {
  process.env.APIFY_TOKEN = 'tok';
  const r = await collectCompetitor('t', comp.id, { runner: fixtureRunner({ images: true }), maxItems: 30 });
  const by = Object.fromEntries(r.map((x) => [x.platform, x]));
  assert.ok(by.youtube.ok && by.youtube.items === 18, JSON.stringify(by.youtube));
  assert.ok(by.tiktok.ok && by.tiktok.items === 10 && by.tiktok.followers === 184300);
  assert.ok(by.instagram.ok && by.instagram.items === 12 && by.instagram.source === 'apify');
  assert.ok(by.site.ok && by.site.items === 0);
  assert.equal(by.facebook, undefined, 'facebook sem coletor não entra na coleta');
  const snaps = S.listSnapshots('t', comp.id);
  assert.equal(snaps.length, 4);
  const yt = snaps.find((s) => s.key === 'youtube-consultorioleve')!.data;
  assert.ok(yt.profile.avatarLocal?.startsWith('media/youtube-consultorioleve/avatar-'));
  assert.ok(yt.items.every((i) => i.thumbnailLocal && existsSync(join(root, 'companies/t/competitors', comp.id, i.thumbnailLocal))));
});

await t('duas coletas seguidas = dois arquivos (imutável) e imagens não são baixadas de novo', async () => {
  const run = fixtureRunner({ growth: 1.1, images: true });
  const r = await collectCompetitor('t', comp.id, { runner: run, platforms: ['youtube'] });
  assert.ok(r[0].ok);
  const files = readdirSync(join(root, 'companies/t/competitors', comp.id, 'snapshots', 'youtube-consultorioleve'));
  assert.equal(files.length, 2, files.join(','));
  assert.equal(run.calls.filter((c) => c.startsWith('download')).length, 0, 'tudo já estava baixado');
  const [a, b] = S.listSnapshots('t', comp.id).filter((s) => s.key === 'youtube-consultorioleve');
  assert.ok(b.data.items[0].metrics.views! > a.data.items[0].metrics.views!, 'crescimento entre coletas');
});

await t('YouTube API preferida quando há YOUTUBE_API_KEY', async () => {
  process.env.YOUTUBE_API_KEY = 'k';
  const r = await collectCompetitor('t', comp.id, { runner: fixtureRunner(), platforms: ['youtube'], noMedia: true });
  process.env.YOUTUBE_API_KEY = '';
  assert.equal(r[0].source, 'youtube-api');
  assert.equal(r[0].items, 3);
});

await t('sem rede: erro claro, nada gravado, sem crash', async () => {
  const before = S.listSnapshots('t', comp.id).length;
  process.env.APIFY_TOKEN = '';
  const r = await collectCompetitor('t', comp.id, { runner: fixtureRunner({ offline: ['youtube', 'tiktok', 'instagram', 'example'] }) });
  assert.ok(r.every((x) => !x.ok));
  assert.match(r.find((x) => x.platform === 'instagram')!.errors[0], /APIFY_TOKEN/);
  assert.match(r.find((x) => x.platform === 'youtube')!.errors[0], /sem conexão/);
  assert.equal(S.listSnapshots('t', comp.id).length, before);
});

await t('yt-dlp ausente: mensagem com instrução de instalação', async () => {
  process.env.YTDLP_PATH = join(root, 'nao-existe', 'yt-dlp');
  await assert.rejects(realRunner.ytdlp(['--version']), /pip install -U yt-dlp/);
  process.env.YTDLP_PATH = '';
});

await t('anúncios Meta: normaliza JSON da biblioteca (imagem, vídeo, carrossel, variações)', async () => {
  const A = await import('./ads');
  const { AdsSnapshot } = await import('../../schema');
  const json = fj('ads-library.json');
  const r = A.normalizeAdsLibrary(json)!;
  assert.equal(r.total, 456);
  assert.equal(r.hasNext, true);
  assert.equal(r.endCursor, 'AQH-FIXTURE');
  assert.equal(r.ads.length, 4);
  const by = Object.fromEntries(r.ads.map((a) => [a.id, a]));
  const img = by['1719624392496275'], vid = by['1147792874353936'], car = by['2208553209888919'], dco = by['1309568727845896'];
  assert.equal(img.media.type, 'imagem');
  assert.ok(img.media.thumbnail?.startsWith('https://'));
  assert.equal(img.pageName, 'Salomé Uniformes');
  assert.equal(img.pageId, '180332498797281');
  assert.equal(img.startedAt, '2026-07-07');
  assert.deepEqual(img.platforms.slice(0, 2), ['facebook', 'instagram']);
  assert.equal(img.cta, 'Enviar mensagem pelo WhatsApp');
  assert.match(img.text!, /^Uniforme não é detalhe/);
  assert.equal(img.url, 'https://www.facebook.com/ads/library/?id=1719624392496275');
  assert.equal(vid.media.type, 'video');
  assert.match(vid.media.videoUrl!, /^https:\/\//);
  assert.equal(car.media.type, 'carrossel');
  assert.equal(dco.variations, 2);
  assert.equal(img.active, true);
  assert.equal(img.endedAt, undefined);
  // HTML com o JSON embutido (como a página entrega) e corpo graphql
  const html = `<html><script type="application/json" data-sjs>${JSON.stringify({ require: [json] })}</script></html>`;
  assert.equal(A.parseLibraryHtml(html)!.ads.length, 4);
  assert.equal(A.parseGraphqlBody(JSON.stringify(json))!.ads.length, 4);
  assert.equal(A.parseLibraryHtml('<html>nada</html>'), null);
  // escolha da página do anunciante
  assert.ok(A.pageMatches('Corpora Technology', ['Corpora']));
  assert.ok(A.pageMatches('PsiNota AI', ['Psinota ai']));
  assert.ok(!A.pageMatches('Corporate Brasil', ['Corpora']));
  assert.deepEqual(A.pickPage(r, ['Meu.ollie']), { pageId: '101255382057646', pageName: 'Meu.ollie' });
  assert.equal(A.pickPage(r, ['Inexistente Nome']), undefined);
  // gravação/leitura: listAds ordenado e latestAds
  const dir = join(root, 'companies', 't', 'competitors', 'x', 'ads');
  mkdirSync(dir, { recursive: true });
  for (const [f, at] of [['2026-10-08T10-00-00.json', '2026-10-08T10:00:00Z'], ['2026-10-01T10-00-00.json', '2026-10-01T10:00:00Z']] as const)
    writeFileSync(join(dir, f), JSON.stringify(AdsSnapshot.parse({ collectedAt: at, pageId: '1', ads: r.ads, total: 456 })));
  const l = A.listAds('t', 'x');
  assert.deepEqual(l.map((x) => x.data.collectedAt), ['2026-10-01T10:00:00Z', '2026-10-08T10:00:00Z']);
  assert.equal(A.latestAds('t', 'x')!.file, 'companies/t/competitors/x/ads/2026-10-08T10-00-00.json');
  assert.equal(A.latestAds('t', 'nada'), undefined);
  rmSync(join(root, 'companies', 't', 'competitors', 'x'), { recursive: true, force: true });
});

await t('histórico de anúncios: saída, reaparecimento e coleta truncada (037 A)', () => {
  const dir = join(root, 'companies', 't', 'competitors', 'h', 'ads');
  mkdirSync(dir, { recursive: true });
  const fdir = join(FIXTURES, 'ads-historico');
  const arquivos = readdirSync(fdir).filter((f) => f.endsWith('.json')).sort();
  const hoje = new Date('2026-10-25T00:00:00Z');
  const get = (h: ReturnType<typeof S.adsHistory>, id: string) => h.ads.find((a) => a.id === id)!;
  // 1 coleta só: nada saiu
  writeFileSync(join(dir, arquivos[0]), fx(`ads-historico/${arquivos[0]}`));
  let h = S.adsHistory('t', 'h', { hoje });
  assert.equal(h.coletas, 1); assert.equal(h.saidas, 0);
  assert.ok(h.ads.every((a) => !a.saiuDoAr && !a.reapareceu));
  // coleta 2 (completa): B sumiu
  writeFileSync(join(dir, arquivos[1]), fx(`ads-historico/${arquivos[1]}`));
  h = S.adsHistory('t', 'h', { hoje });
  assert.equal(h.saidas, 1);
  assert.equal(get(h, 'B').saiuDoAr, true);
  assert.equal(get(h, 'B').saiuEm, '2026-10-08T10:00:00Z');
  assert.equal(get(h, 'B').duracaoFinal, 18); // 20/09 → 08/10
  // coleta 3 truncada (erro): C ausente não prova saída
  writeFileSync(join(dir, arquivos[2]), fx(`ads-historico/${arquivos[2]}`));
  h = S.adsHistory('t', 'h', { hoje });
  assert.equal(h.coletasCompletas, 2); assert.equal(h.saidas, 1);
  assert.equal(get(h, 'C').saiuDoAr, false);
  // coleta 4: B2 = mesmo texto de B com id novo (reapareceu); C2 = irmão de C (não reapareceu, C ainda no ar)
  writeFileSync(join(dir, arquivos[3]), fx(`ads-historico/${arquivos[3]}`));
  h = S.adsHistory('t', 'h', { hoje });
  assert.equal(h.coletas, 4);
  assert.equal(get(h, 'B2').reapareceu, true); assert.equal(get(h, 'B2').reapareceuDe, 'B');
  assert.equal(get(h, 'C2').reapareceu, false);
  assert.equal(get(h, 'A').coletas, 4); assert.equal(get(h, 'A').primeiraVez, '2026-10-01T10:00:00Z'); assert.equal(get(h, 'A').ultimaVez, '2026-10-22T10:00:00Z');
  assert.equal(get(h, 'A').diasNoAr, 54);
  assert.equal(get(h, 'C').irmaos, 2); assert.equal(get(h, 'C2').irmaos, 2); assert.equal(get(h, 'A').irmaos, 1);
  assert.equal(get(h, 'C').conceito, get(h, 'C2').conceito);
  assert.equal(h.saidas, 1);
  // coleta no limite do coletor também é truncada
  assert.equal(S.coletaCompleta({ ads: new Array(S.ADS_LIMITE_COLETA).fill(0), total: S.ADS_LIMITE_COLETA, errors: [] }), false);
  assert.equal(S.coletaCompleta({ ads: [1], total: 5, errors: [] }), false);
  assert.equal(S.coletaCompleta({ ads: [1], total: 1, errors: [] }), true);
  rmSync(join(root, 'companies', 't', 'competitors', 'h'), { recursive: true, force: true });
});

await t('histórico de anúncios: completude, mesmo id e coleta vazia (037 A, revisão)', () => {
  const dir = join(root, 'companies', 't', 'competitors', 'h2', 'ads');
  const ad = (id: string, text: string, startedAt = '2026-09-01') => ({ id, active: true, startedAt, text, url: `https://www.facebook.com/ads/library/?id=${id}` });
  const put = (n: number, extra: Record<string, unknown>, ads: ReturnType<typeof ad>[]) => {
    mkdirSync(dir, { recursive: true });
    const day = String(n).padStart(2, '0');
    writeFileSync(join(dir, `2026-10-${day}T10-00-00.json`), JSON.stringify(AdsSnapshot.parse({ collectedAt: `2026-10-${day}T10:00:00Z`, pageId: '1', ads, errors: [], ...extra })));
  };
  const reset = () => rmSync(join(root, 'companies', 't', 'competitors', 'h2'), { recursive: true, force: true });
  const hoje = new Date('2026-10-30T00:00:00Z');
  const get = (h: ReturnType<typeof S.adsHistory>, id: string) => h.ads.find((a) => a.id === id)!;
  // (a) ausente numa coleta parcial e também na completa seguinte: sai na data da completa
  put(1, { total: 2, truncada: false }, [ad('A', 'um'), ad('B', 'dois')]);
  put(2, { total: 3, truncada: true }, [ad('A', 'um')]);
  let h = S.adsHistory('t', 'h2', { hoje });
  assert.equal(get(h, 'B').saiuDoAr, false);
  put(3, { total: 1, truncada: false }, [ad('A', 'um')]);
  h = S.adsHistory('t', 'h2', { hoje });
  assert.equal(get(h, 'B').saiuDoAr, true); assert.equal(get(h, 'B').saiuEm, '2026-10-03T10:00:00Z');
  assert.equal(get(h, 'B').diasNoAr, get(h, 'B').duracaoFinal); // saiu: diasNoAr = duração final, não "hoje"
  assert.equal(get(h, 'B').duracaoFinal, 32);
  reset();
  // (b) o mesmo id volta; depois um id novo com o mesmo conceito NÃO é reapareceu
  put(1, { truncada: false }, [ad('A', 'um'), ad('B', 'dois')]);
  put(2, { truncada: false }, [ad('A', 'um')]);
  put(3, { truncada: false }, [ad('A', 'um'), ad('B', 'dois')]);
  h = S.adsHistory('t', 'h2', { hoje });
  assert.equal(get(h, 'B').saiuDoAr, false);
  put(4, { truncada: false }, [ad('A', 'um'), ad('B', 'dois'), ad('B9', 'dois')]);
  h = S.adsHistory('t', 'h2', { hoje });
  assert.equal(get(h, 'B9').reapareceu, false); assert.equal(get(h, 'B9').reapareceuDe, null);
  reset();
  // (c) truncada: true sem erro não marca saída
  put(1, { truncada: false }, [ad('A', 'um'), ad('B', 'dois')]);
  put(2, { truncada: true, max: 1 }, [ad('A', 'um')]);
  h = S.adsHistory('t', 'h2', { hoje });
  assert.equal(h.coletasCompletas, 1); assert.equal(h.saidas, 0);
  reset();
  // (d) snapshot antigo (sem truncada) com 30 anúncios conta como incompleto
  const trinta = Array.from({ length: S.ADS_LIMITE_COLETA }, (_, i) => ad(`X${i}`, `t${i}`));
  put(1, { truncada: false }, [ad('B', 'dois')]);
  put(2, { total: 30 }, trinta); // B ausente, mas a leitura bateu no limite: não prova saída
  h = S.adsHistory('t', 'h2', { hoje });
  assert.equal(h.coletasCompletas, 1); assert.equal(h.saidas, 0); assert.equal(get(h, 'B').saiuDoAr, false);
  assert.equal(S.coletaCompleta({ ads: trinta.slice(0, 29), total: 29, errors: [] }), true);
  reset();
  // (e) coleta vazia sem total explícito não derruba o histórico; com total 0 e truncada false, sim
  put(1, { truncada: false }, [ad('A', 'um')]);
  put(2, { truncada: false }, []);
  h = S.adsHistory('t', 'h2', { hoje });
  assert.equal(h.saidas, 0); assert.equal(h.coletasCompletas, 1);
  put(3, { total: 0, truncada: false }, []);
  h = S.adsHistory('t', 'h2', { hoje });
  assert.equal(h.saidas, 1); assert.equal(get(h, 'A').saiuEm, '2026-10-03T10:00:00Z');
  reset();
});

await t('classificador de anúncios: acerto no gabarito ≥ 85% em funil e tipo (037 B)', async () => {
  const { lerGold, medir } = await import('./ads-gold');
  const ms = medir(lerGold());
  const linha = ms.map((m) => `${m.campo} ${m.certos}/${m.total} = ${(m.acerto * 100).toFixed(0)}%`).join(' · ');
  console.log(`   ${linha}`);
  for (const campo of ['funil', 'tipo'] as const) {
    const m = ms.find((x) => x.campo === campo)!;
    assert.ok(m.total >= 30, `gabarito pequeno demais em ${campo}: ${m.total}`);
    assert.ok(m.acerto >= 0.85, `${campo} caiu para ${(m.acerto * 100).toFixed(0)}% (mínimo 85%): ${m.erros.map((e) => `${e.comp} ${e.id} esperado ${e.esperado} veio ${e.veio}`).join('; ')}`);
  }
});

await t('marcas do Oliver: override sobrevive a coleta nova e a reclassificação; salvo abre sem o anúncio na coleta (037 D)', async () => {
  const { classificarAnuncio } = await import('./ads-classify');
  const { resolverCampo, AdsMarks } = await import('../../schema');
  const comp = join(root, 'companies', 't', 'competitors', 'm');
  const dir = join(comp, 'ads');
  mkdirSync(join(comp, 'media', 'ads'), { recursive: true });
  writeFileSync(join(comp, 'media', 'ads', 'A.jpg'), Buffer.from('miniatura-leve'));
  const ad = (id: string, text: string, extra: Record<string, unknown> = {}) => ({ id, active: true, startedAt: '2026-09-01', text, title: `Título ${id}`, cta: 'Cadastre-se', linkUrl: 'https://app.exemplo.com/cadastro', url: `https://www.facebook.com/ads/library/?id=${id}`, ...extra });
  const A = ad('A', 'Teste grátis por 15 dias, sem cartão. Cadastre-se!', { media: { type: 'video', thumbnail: 'https://cdn.exemplo.com/a.jpg', thumbnailLocal: 'media/ads/A.jpg', videoUrl: 'https://cdn.exemplo.com/a.mp4' } });
  const B = ad('B', 'Outro anúncio qualquer sobre agenda e prontuário');
  const put = (n: number, ads: unknown[]) => { mkdirSync(dir, { recursive: true }); writeFileSync(join(dir, `2026-10-0${n}T10-00-00.json`), JSON.stringify(AdsSnapshot.parse({ collectedAt: `2026-10-0${n}T10:00:00Z`, pageId: '1', total: ads.length, truncada: false, ads, errors: [] }))); };
  put(1, [A, B]);
  const regra = classificarAnuncio(AdsSnapshot.parse({ collectedAt: '2026-10-01T10:00:00Z', ads: [A] }).ads[0], {});
  const contra = regra.funil === 'topo' ? 'fundo' : 'topo';

  // override + nota + tags + salvar
  S.setAdMark('t', 'm', 'A', { override: { funil: contra, tipo: 'isca' }, note: 'copiar a oferta', tags: ['gratuito-sem-risco'] });
  let m = S.getAdsMarks('t', 'm').ads['meta:A'];
  assert.equal(m.override?.funil, contra); assert.equal(m.note, 'copiar a oferta'); assert.equal(m.saved, false); assert.equal(m.frozen, undefined);
  S.setAdMark('t', 'm', 'A', { saved: true });
  m = S.getAdsMarks('t', 'm').ads['meta:A'];
  assert.equal(m.saved, true); assert.equal(m.frozen?.id, 'A'); assert.match(m.frozen?.text ?? '', /Teste grátis/);
  assert.equal(m.frozenMedia, 'A.jpg'); assert.ok(existsSync(join(comp, 'ads', 'salvos', 'A.jpg')), 'miniatura copiada para dentro de ads/salvos');
  assert.equal(m.frozen?.media.videoUrl, 'https://cdn.exemplo.com/a.mp4'); // só o link: nenhum vídeo é baixado
  assert.ok(!readdirSync(join(comp, 'ads', 'salvos')).some((f) => /\.(mp4|webm|mov)$/.test(f)));
  assert.ok(AdsMarks.safeParse(JSON.parse(readFileSync(join(dir, 'marks.json'), 'utf8'))).success);
  assert.equal(S.listAdsMarks('t').m['meta:A'].note, 'copiar a oferta');

  // coleta nova: o anúncio A saiu do ar; B segue. As marcas ficam como estavam e o salvo abre inteiro.
  put(2, [B]);
  const marcasAntes = readFileSync(join(dir, 'marks.json'), 'utf8');
  assert.equal(S.adsHistory('t', 'm', { hoje: new Date('2026-10-05T00:00:00Z') }).ads.find((a) => a.id === 'A')!.saiuDoAr, true);
  assert.equal(readFileSync(join(dir, 'marks.json'), 'utf8'), marcasAntes, 'coleta não mexe no marks.json');
  m = S.getAdsMarks('t', 'm').ads['meta:A'];
  assert.equal(m.frozen?.text, A.text); assert.equal(m.frozen?.cta, 'Cadastre-se'); assert.equal(m.frozen?.linkUrl, A.linkUrl); assert.equal(m.frozen?.startedAt, '2026-09-01');
  assert.ok(!AdsSnapshot.parse(JSON.parse(readFileSync(join(dir, '2026-10-02T10-00-00.json'), 'utf8'))).ads.some((a) => a.id === 'A'), 'o anúncio não está mais na coleta');

  // reclassificação (regras de novo, a partir da cópia): o valor do Oliver continua vencendo
  const de2 = classificarAnuncio(m.frozen!, {});
  assert.deepEqual(resolverCampo('funil', de2.funil, m), { valor: contra, origem: 'voce' });
  assert.deepEqual(resolverCampo('tipo', de2.tipo, m), { valor: 'isca', origem: 'voce' });
  assert.deepEqual(resolverCampo('objetivo', de2.objetivo, m), { valor: de2.objetivo, origem: 'regra' });

  // voltar ao automático (null) tira só aquele campo
  S.setAdMark('t', 'm', 'A', { override: { funil: null } });
  m = S.getAdsMarks('t', 'm').ads['meta:A'];
  assert.equal(m.override?.funil, undefined); assert.equal(m.override?.tipo, 'isca'); assert.equal(m.saved, true);
  assert.deepEqual(S.validateAll().filter((e) => /marks\.json/.test(e.file) && /ads/.test(e.file)), []);

  // salvar anúncio que nunca esteve numa coleta falha sem sujar o arquivo
  assert.throws(() => S.setAdMark('t', 'm', 'ZZZ', { saved: true }), /nenhuma coleta/);
  assert.equal(S.getAdsMarks('t', 'm').ads['meta:ZZZ'], undefined);

  // tirar dos salvos apaga a cópia e a miniatura (nota e tags ficam); sem nada do Oliver a marca sai do arquivo
  S.setAdMark('t', 'm', 'A', { saved: false });
  m = S.getAdsMarks('t', 'm').ads['meta:A'];
  assert.equal(m.saved, false); assert.equal(m.frozen, undefined); assert.equal(m.note, 'copiar a oferta'); assert.ok(!existsSync(join(comp, 'ads', 'salvos', 'A.jpg')));
  S.setAdMark('t', 'm', 'A', { note: null, tags: [], override: { tipo: null } });
  assert.ok(!existsSync(join(dir, 'marks.json')), 'sem marcas, sem arquivo');
  assert.throws(() => S.setAdMark('t', 'm', '../x', { note: 'a' }), /inválido/);
  rmSync(comp, { recursive: true, force: true });
});

await t('validação geral do HUB_ROOT temporário', () => {
  assert.deepEqual(S.validateAll(), []);
});

console.log(`\n${pass} ok · ${fail} falha(s)`);
if (!fail) rmSync(root, { recursive: true, force: true });
else console.log(`dados do teste em ${root}`);
process.exit(fail ? 1 : 0);
