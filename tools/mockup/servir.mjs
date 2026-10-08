#!/usr/bin/env node
// Servidor estático mínimo para ver a galeria e as peças no navegador: node tools/mockup/servir.mjs [porta] → http://localhost:5181/
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const porta = Number(process.argv[2] || 5181);
createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/') { res.writeHead(302, { Location: '/library/mockups/galeria/index.html' }); return res.end(); }
  const f = join(ROOT, p);
  if (!f.startsWith(ROOT) || !existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); return res.end('não encontrado'); }
  res.writeHead(200, { 'Content-Type': TIPOS[extname(f).toLowerCase()] || 'application/octet-stream' });
  createReadStream(f).pipe(res);
}).listen(porta, () => console.log(`galeria: http://localhost:${porta}/`));
