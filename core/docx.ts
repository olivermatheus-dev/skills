// Texto de um .docx sem dependência: o .docx é um zip; lemos word/document.xml pelo diretório central
// e viramos parágrafos em linhas (títulos do Word → "#", listas → "-"). Serve para "roteiro pronto" enviado no app.
import { inflateRawSync } from 'node:zlib';

function unzipEntry(buf: Buffer, name: string): Buffer | null {
  // fim do diretório central (EOCD): assinatura 0x06054b50 nos últimos ~64 KB
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) return null;
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  for (let n = 0; n < count && buf.readUInt32LE(p) === 0x02014b50; n++) {
    const method = buf.readUInt16LE(p + 10), size = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28), extraLen = buf.readUInt16LE(p + 30), commentLen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    if (buf.toString('utf8', p + 46, p + 46 + nameLen) === name) {
      const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
      const data = buf.subarray(start, start + size);
      return method === 0 ? data : method === 8 ? inflateRawSync(data) : null;
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  return null;
}

const decode = (s: string) => s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

/** markdown simples a partir do .docx; null se não for um .docx válido */
export function docxToText(buf: Buffer): string | null {
  const xml = unzipEntry(buf, 'word/document.xml')?.toString('utf8');
  if (!xml) return null;
  const paras = xml.match(/<w:p[ >][\s\S]*?<\/w:p>|<w:p\/>/g) ?? [];
  const lines = paras.map((p) => {
    const text = decode((p.match(/<w:t(?: [^>]*)?>[^<]*<\/w:t>|<w:tab\/>|<w:br\/>/g) ?? [])
      .map((r) => (r === '<w:tab/>' ? '\t' : r === '<w:br/>' ? '\n' : r.replace(/<[^>]+>/g, ''))).join(''));
    const h = p.match(/<w:pStyle w:val="(?:Heading|Ttulo|Titulo)(\d)"/i);
    if (h && text.trim()) return `${'#'.repeat(Math.min(+h[1], 4))} ${text.trim()}`;
    if (/<w:numPr>/.test(p) && text.trim()) return `- ${text.trim()}`;
    return text;
  });
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
