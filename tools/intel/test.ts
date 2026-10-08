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

const { Snapshot } = await import('../../schema');
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
  assert.ok(!by.facebook.ok && /ainda não existe/.test(by.facebook.errors[0]));
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

await t('validação geral do HUB_ROOT temporário', () => {
  assert.deepEqual(S.validateAll(), []);
});

console.log(`\n${pass} ok · ${fail} falha(s)`);
if (!fail) rmSync(root, { recursive: true, force: true });
else console.log(`dados do teste em ${root}`);
process.exit(fail ? 1 : 0);
