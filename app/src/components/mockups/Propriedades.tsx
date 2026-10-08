// Painel da direita do editor de mockups (tarefa 030): mostra os parâmetros do que está selecionado
// (aparelho, imagem, texto, forma) ou, sem seleção, o fundo da peça.
import type { ReactNode } from 'react';
import type { CapturaRuntime, MockupCatalogo } from '../../api';
import { Select, cx } from '../kit';
import { fundoCss, geo, temAjuste, type Camada, type Doc, type Fmt, type Fundo, type Geo } from './doc';

// ---------- controles ----------
export const Secao = ({ titulo, children, acao }: { titulo: string; children: ReactNode; acao?: ReactNode }) => (
  <section className="border-b border-border px-4 py-3 space-y-2.5">
    <div className="flex items-center justify-between"><h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{titulo}</h3>{acao}</div>
    {children}
  </section>
);
const Linha = ({ rotulo, children }: { rotulo: string; children: ReactNode }) => (
  <label className="flex items-center gap-2 text-xs"><span className="w-20 shrink-0 text-muted-foreground">{rotulo}</span><div className="flex-1 min-w-0 flex items-center gap-1.5">{children}</div></label>
);
function Deslizar({ rotulo, valor, min, max, passo = 0.01, onChange, fmt = (v: number) => String(+v.toFixed(2)) }: { rotulo: string; valor: number; min: number; max: number; passo?: number; onChange: (v: number) => void; fmt?: (v: number) => string }) {
  return (
    <Linha rotulo={rotulo}>
      <input type="range" min={min} max={max} step={passo} value={valor} onChange={(e) => onChange(Number(e.target.value))} className="flex-1 min-w-0 accent-primary" />
      <span className="w-10 text-right tabular-nums text-muted-foreground">{fmt(valor)}</span>
    </Linha>
  );
}
const sel = 'flex-1 min-w-0 h-7 px-1.5 text-xs';
function Escolha<T extends string>({ rotulo, valor, opcoes, onChange }: { rotulo: string; valor: T; opcoes: (T | [T, string])[]; onChange: (v: T) => void }) {
  return (
    <Linha rotulo={rotulo}>
      <Select className={sel} value={valor} onChange={(e) => onChange(e.target.value as T)}>
        {opcoes.map((o) => { const [v, n] = Array.isArray(o) ? o : [o, o]; return <option key={v} value={v}>{n}</option>; })}
      </Select>
    </Linha>
  );
}
function Segmentos<T extends string>({ valor, opcoes, onChange }: { valor: T; opcoes: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className={cx('rounded-md border border-border overflow-hidden text-xs', opcoes.length > 4 ? 'grid grid-cols-3' : 'flex')}>
      {opcoes.map(([v, n]) => <button key={v} type="button" onClick={() => onChange(v)} className={cx('flex-1 py-1', valor === v ? 'bg-primary-soft text-primary-ink font-medium' : 'hover:bg-muted')}>{n}</button>)}
    </div>
  );
}
const hex = (v?: string) => (v && /^#[0-9a-f]{6}$/i.test(v) ? v : '#ffffff');
function Cor({ rotulo, valor, onChange, tokens = [] }: { rotulo: string; valor?: string; onChange: (v: string) => void; tokens?: [string, string][] }) {
  return (
    <Linha rotulo={rotulo}>
      <input type="color" value={hex(valor)} onChange={(e) => onChange(e.target.value)} className="w-7 h-7 rounded border border-border bg-transparent p-0.5 cursor-pointer" />
      <input value={valor ?? ''} onChange={(e) => onChange(e.target.value)} className={sel} />
      {tokens.length > 0 && (
        <Select className="w-8 h-7 px-0 justify-center text-xs [&>svg:last-child]:hidden" value="" onChange={(e) => e.target.value && onChange(e.target.value)} title="cor da marca">
          <option value="">◐</option>
          {tokens.map(([v, n]) => <option key={v} value={v}>{n}</option>)}
        </Select>
      )}
    </Linha>
  );
}
const Chave = ({ rotulo, valor, onChange }: { rotulo: string; valor: boolean; onChange: (v: boolean) => void }) => (
  <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={valor} onChange={(e) => onChange(e.target.checked)} className="accent-primary" />{rotulo}</label>
);
const TOKENS: [string, string][] = [['--bg', 'fundo da marca'], ['--surface', 'superfície'], ['--surface-2', 'superfície 2'], ['--primary', 'cor principal'], ['--accent', 'destaque'], ['--text', 'texto'], ['--ink', 'tinta']];

// ---------- camada ----------
export function PainelCamada({ c, doc, fmt, cat, capturas, onProps, onGeo, onSemAjuste }: {
  c: Camada; doc: Doc; fmt: Fmt; cat: MockupCatalogo; capturas: CapturaRuntime[];
  onProps: (p: Record<string, unknown>) => void; onGeo: (p: Geo) => void; onSemAjuste: () => void;
}) {
  const g = geo(c, fmt);
  const sombra = c.sombra ?? {};
  const setSombra = (p: Record<string, unknown>) => onProps({ sombra: { ...sombra, ...p } });
  const ajustado = fmt !== doc.formatos[0] && temAjuste(c, fmt);
  const ap = cat.aparelhos.find((a) => a.id === c.modelo);
  const capOpcoes: [string, string][] = capturas.map((k) => [k.ref, k.nome.replace(/^\d{4}-\d{2}-\d{2}-/, '')]);
  return (
    <>
      <Secao titulo="Camada" acao={ajustado ? <button className="text-[11px] text-primary-ink hover:underline" onClick={onSemAjuste} title="apaga o ajuste fino deste formato">voltar ao padrão</button> : undefined}>
        <Linha rotulo="Nome"><input className={sel} value={c.nome ?? ''} onChange={(e) => onProps({ nome: e.target.value })} /></Linha>
        <Deslizar rotulo="Opacidade" valor={c.opacidade ?? 1} min={0} max={1} onChange={(v) => onProps({ opacidade: v })} fmt={(v) => `${Math.round(v * 100)}%`} />
        <Deslizar rotulo="Giro" valor={g.rot} min={-45} max={45} passo={0.5} onChange={(v) => onGeo({ rot: v })} fmt={(v) => `${v}°`} />
        <Deslizar rotulo="Largura" valor={g.w} min={0.05} max={2} onChange={(v) => onGeo({ w: v })} />
        {fmt !== doc.formatos[0] && <p className="text-[11px] text-muted-foreground">{ajustado ? 'Posição/tamanho ajustados só neste formato.' : `Mexer aqui grava um ajuste só para ${fmt}.`}</p>}
      </Secao>

      {(c.tipo === 'aparelho' || c.tipo === 'imagem') && (
        <Secao titulo={c.tipo === 'aparelho' ? 'Aparelho e tela' : 'Imagem'}>
          <Escolha rotulo="Print" valor={c.captura ?? ''} opcoes={[['', '— escolha —'], ...capOpcoes]} onChange={(v) => onProps({ captura: v || undefined })} />
          {c.tipo === 'aparelho' && (
            <>
              <Linha rotulo="Modelo">
                <Select className={sel} value={c.modelo ?? ''} onChange={(e) => onProps({ modelo: e.target.value, cor: undefined, orientacao: undefined })}>
                  <option value="">Automático (pelo print)</option>
                  <optgroup label="Desenhos">{cat.desenhos.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}</optgroup>
                  {(['celular', 'dobravel', 'tablet', 'notebook', 'desktop', 'monitor'] as const).map((t) => {
                    const l = cat.aparelhos.filter((a) => a.tipo === t);
                    return l.length ? <optgroup key={t} label={t}>{l.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}</optgroup> : null;
                  })}
                </Select>
              </Linha>
              {ap && ap.cores.length > 1 && <Escolha rotulo="Cor" valor={c.cor ?? ap.padrao.cor} opcoes={ap.cores.map((k) => [k.id, k.nome] as [string, string])} onChange={(v) => onProps({ cor: v })} />}
              {ap && ap.orientacoes.length > 1 && <Escolha rotulo="Orientação" valor={c.orientacao ?? ''} opcoes={[['', 'pelo print'], ...ap.orientacoes.map((o) => [o, o] as [string, string])]} onChange={(v) => onProps({ orientacao: v || undefined })} />}
              <Escolha rotulo="Ângulo" valor={c.angulo ?? 'frente'} opcoes={cat.angulos} onChange={(v) => onProps({ angulo: v })} />
              {(!ap) && <Escolha rotulo="Cantos" valor={c.cantos ?? (c.modelo === 'vidro' ? 'grande' : 'medio')} opcoes={cat.cantos} onChange={(v) => onProps({ cantos: v })} />}
              {(c.modelo === 'navegador' || c.modelo === 'vidro' || !c.modelo) && <Escolha rotulo="Tema" valor={c.tema ?? 'claro'} opcoes={[['claro', 'claro'], ['escuro', 'escuro']]} onChange={(v) => onProps({ tema: v })} />}
              <Escolha rotulo="Encaixe" valor={c.ajuste ?? 'auto'} opcoes={[['auto', 'automático'], ['cobrir', 'cobrir (corta)'], ['conter', 'inteiro'], ['estender', 'estender a base']]} onChange={(v) => onProps({ ajuste: v })} />
              <Chave rotulo="Reflexo de vidro na tela" valor={!!c.reflexo} onChange={(v) => onProps({ reflexo: v })} />
            </>
          )}
          <Escolha rotulo="Corte" valor={typeof c.recorte === 'object' ? 'sugerido' : c.recorte ?? (c.tipo === 'imagem' ? 'nenhum' : 'seguro')}
            opcoes={[['seguro', 'automático (bordas)'], ['sugerido', 'sugerido (barras)'], ['nenhum', 'sem corte']]}
            onChange={(v) => { const k = capturas.find((x) => x.ref === c.captura); onProps({ recorte: v === 'seguro' ? undefined : v === 'nenhum' ? 'nenhum' : k?.recorteSugerido ?? undefined }); }} />
          {c.tipo === 'imagem' && <Deslizar rotulo="Cantos" valor={c.raio ?? 0} min={0} max={0.1} passo={0.002} onChange={(v) => onProps({ raio: v })} />}
        </Secao>
      )}

      {(c.tipo === 'aparelho' || c.tipo === 'imagem' || c.tipo === 'forma') && (
        <Secao titulo="Sombra">
          <Segmentos valor={sombra.preset ?? (c.tipo === 'aparelho' ? 'produto' : 'nenhuma')} opcoes={[['nenhuma', 'sem'], ['contato', 'contato'], ['suave', 'suave'], ['flutuante', 'flutua'], ['produto', 'produto'], ['dramatica', 'forte']]} onChange={(v) => setSombra({ preset: v })} />
          {sombra.preset !== 'nenhuma' && (
            <>
              <Deslizar rotulo="Intensidade" valor={sombra.forca ?? 1} min={0} max={2.5} onChange={(v) => setSombra({ forca: v })} />
              <Deslizar rotulo="Distância" valor={sombra.distancia ?? 1} min={0} max={3} onChange={(v) => setSombra({ distancia: v })} />
              <Deslizar rotulo="Desfoque" valor={sombra.desfoque ?? 1} min={0.2} max={3} onChange={(v) => setSombra({ desfoque: v })} />
              <Cor rotulo="Cor" valor={sombra.cor ?? '#161a26'} onChange={(v) => setSombra({ cor: v })} />
              {c.tipo === 'aparelho' && <Chave rotulo="Sombra de chão (notebook, iMac)" valor={c.chao !== false} onChange={(v) => onProps({ chao: v })} />}
            </>
          )}
        </Secao>
      )}

      {c.tipo === 'texto' && (
        <Secao titulo="Texto">
          <textarea className="w-full min-h-[70px] px-2 py-1.5 rounded border border-border text-sm outline-none focus:border-primary" value={c.texto ?? ''} onChange={(e) => onProps({ texto: e.target.value })} />
          <p className="text-[11px] text-muted-foreground -mt-1">*palavra* = destaque · _palavra_ = serifa itálica · duplo clique no quadro edita ali</p>
          <Segmentos valor={c.fonte ?? 'titulo'} opcoes={[['titulo', 'Título'], ['corpo', 'Corpo'], ['serifa', 'Serifa']]} onChange={(v) => onProps({ fonte: v })} />
          <Deslizar rotulo="Tamanho" valor={g.tamanho ?? c.tamanho ?? 0.07} min={0.02} max={0.2} passo={0.001} onChange={(v) => onGeo({ tamanho: v })} fmt={(v) => `${Math.round(v * 1080)}px`} />
          <Escolha rotulo="Peso" valor={String(c.peso ?? '')} opcoes={[['', 'da marca'], ['400', 'regular'], ['500', 'médio'], ['600', 'semi'], ['700', 'negrito'], ['800', 'extra']]} onChange={(v) => onProps({ peso: v ? Number(v) : undefined })} />
          <Segmentos valor={c.alinhar ?? 'center'} opcoes={[['left', 'Esq.'], ['center', 'Centro'], ['right', 'Dir.']]} onChange={(v) => onProps({ alinhar: v })} />
          <Escolha rotulo="Cor" valor={/^(auto|texto|destaque|tinta)$/.test(c.cor ?? 'auto') ? c.cor ?? 'auto' : 'outra'} opcoes={[['auto', 'automática'], ['texto', 'texto da marca'], ['tinta', 'tinta'], ['destaque', 'destaque'], ['outra', 'outra…']]} onChange={(v) => onProps({ cor: v === 'outra' ? '#ffffff' : v })} />
          {c.cor && c.cor.startsWith('#') && <Cor rotulo="" valor={c.cor} onChange={(v) => onProps({ cor: v })} />}
          <Escolha rotulo="Ênfase" valor={c.corEnfase && !c.corEnfase.startsWith('#') ? c.corEnfase : c.corEnfase ? 'outra' : 'destaque'} opcoes={[['destaque', 'destaque'], ['texto', 'mesma do texto'], ['outra', 'outra…']]} onChange={(v) => onProps({ corEnfase: v === 'outra' ? '#ef7960' : v })} />
          {c.corEnfase?.startsWith('#') && <Cor rotulo="" valor={c.corEnfase} onChange={(v) => onProps({ corEnfase: v })} />}
          <Deslizar rotulo="Entrelinha" valor={c.entrelinha ?? (c.fonte === 'corpo' ? 1.4 : 1.12)} min={0.8} max={1.8} onChange={(v) => onProps({ entrelinha: v })} />
          <Deslizar rotulo="Espaçamento" valor={c.espacamento ?? (c.fonte === 'corpo' ? 0 : -0.01)} min={-0.06} max={0.2} passo={0.005} onChange={(v) => onProps({ espacamento: v })} fmt={(v) => `${v}em`} />
        </Secao>
      )}

      {c.tipo === 'forma' && (
        <Secao titulo="Forma">
          <Segmentos valor={c.forma ?? 'retangulo'} opcoes={[['retangulo', 'Retângulo'], ['pilula', 'Pílula'], ['circulo', 'Círculo']]} onChange={(v) => onProps({ forma: v })} />
          <Chave rotulo="Vidro fosco (desfoca o que está atrás)" valor={!!c.vidro} onChange={(v) => onProps({ vidro: v })} />
          {!c.vidro && <Cor rotulo="Cor" valor={c.cor ?? '--surface'} tokens={TOKENS} onChange={(v) => onProps({ cor: v })} />}
          {c.forma === 'retangulo' && <Deslizar rotulo="Cantos" valor={c.raio ?? 0.03} min={0} max={0.15} passo={0.002} onChange={(v) => onProps({ raio: v })} />}
          <Deslizar rotulo="Borda" valor={c.borda?.largura ?? 0} min={0} max={0.01} passo={0.0005} onChange={(v) => onProps({ borda: { ...(c.borda ?? {}), largura: v } })} fmt={(v) => `${Math.round(v * 1080)}px`} />
          {(c.borda?.largura ?? 0) > 0 && <Cor rotulo="Cor da borda" valor={c.borda?.cor ?? '--border'} tokens={TOKENS} onChange={(v) => onProps({ borda: { ...(c.borda ?? {}), cor: v } })} />}
        </Secao>
      )}
    </>
  );
}

// ---------- fundo ----------
export function PainelFundo({ f, cat, capturas, onChange }: { f: Fundo; cat: MockupCatalogo; capturas: CapturaRuntime[]; onChange: (f: Fundo) => void }) {
  const set = (p: Partial<Fundo>) => onChange({ ...f, ...p } as Fundo);
  const pad = f.padrao ?? { tipo: 'nenhum' };
  const setPad = (p: Record<string, unknown>) => set({ padrao: { ...pad, ...p } as Fundo['padrao'] });
  const paradas = f.paradas ?? [{ cor: '#fffaf5', pos: 0 }, { cor: '#f2d9cb', pos: 1 }];
  const pontos = f.pontos ?? [];
  return (
    <>
      <Secao titulo="Fundos prontos">
        <div className="grid grid-cols-4 gap-1.5">
          {cat.fundos.map((p: any) => (
            <button key={p.id} title={p.nome} onClick={() => onChange({ ...p.fundo, escuro: p.escuro, padrao: f.padrao })}
              className="aspect-[4/5] rounded-md border border-border hover:ring-2 hover:ring-primary/40" style={{ background: fundoCss(p.fundo) }} />
          ))}
          <button title="Cor da marca" onClick={() => onChange({ tipo: 'cor', cor: '--bg', padrao: f.padrao } as Fundo)} className="aspect-[4/5] rounded-md border border-border text-[10px] text-muted-foreground" style={{ background: '#f3ebe3' }}>marca</button>
          <button title="Transparente" onClick={() => onChange({ tipo: 'transparente' } as Fundo)} className="aspect-[4/5] rounded-md border border-border" style={{ background: fundoCss({ tipo: 'transparente' } as Fundo) }} />
        </div>
      </Secao>
      <Secao titulo="Fundo">
        <Escolha rotulo="Tipo" valor={f.tipo} opcoes={[['cor', 'cor lisa'], ['linear', 'gradiente linear'], ['radial', 'gradiente radial'], ['malha', 'malha (mesh)'], ['imagem', 'print desfocado'], ['transparente', 'transparente']]}
          onChange={(t) => set({ tipo: t, ...(t === 'malha' && !f.pontos ? { base: '#f3ebe3', desfoque: 0.18, pontos: [{ x: 0.45, y: 0.28, r: 0.48, cor: '#fffaf5' }, { x: 0.05, y: 0.95, r: 0.4, cor: '#f2d9cb' }] } : {}), ...((t === 'linear' || t === 'radial') && !f.paradas ? { paradas } : {}) })} />
        {f.tipo !== 'transparente' && <Chave rotulo="Fundo escuro (texto automático fica claro)" valor={!!f.escuro} onChange={(v) => set({ escuro: v })} />}
        {f.tipo === 'cor' && <Cor rotulo="Cor" valor={f.cor ?? '--bg'} tokens={TOKENS} onChange={(v) => set({ cor: v })} />}
        {(f.tipo === 'linear' || f.tipo === 'radial') && (
          <>
            {f.tipo === 'linear' ? <Deslizar rotulo="Ângulo" valor={f.angulo ?? 180} min={0} max={360} passo={1} onChange={(v) => set({ angulo: v })} fmt={(v) => `${v}°`} />
              : <>
                <Deslizar rotulo="Centro X" valor={f.centro?.x ?? 0.5} min={0} max={1} onChange={(v) => set({ centro: { x: v, y: f.centro?.y ?? 0.4 } })} />
                <Deslizar rotulo="Centro Y" valor={f.centro?.y ?? 0.4} min={0} max={1} onChange={(v) => set({ centro: { x: f.centro?.x ?? 0.5, y: v } })} />
              </>}
            {paradas.map((p, i) => (
              <div key={i} className="rounded-md bg-muted/60 p-2 space-y-1.5">
                <Cor rotulo={`Cor ${i + 1}`} valor={p.cor} tokens={TOKENS} onChange={(v) => set({ paradas: paradas.map((q, j) => (j === i ? { ...q, cor: v } : q)) })} />
                <Deslizar rotulo="Posição" valor={p.pos} min={0} max={1} onChange={(v) => set({ paradas: paradas.map((q, j) => (j === i ? { ...q, pos: v } : q)) })} fmt={(v) => `${Math.round(v * 100)}%`} />
                {paradas.length > 2 && <button className="text-[11px] text-destructive" onClick={() => set({ paradas: paradas.filter((_, j) => j !== i) })}>remover</button>}
              </div>
            ))}
            {paradas.length < 6 && <button className="text-xs text-primary-ink" onClick={() => set({ paradas: [...paradas, { cor: paradas[paradas.length - 1].cor, pos: 1 }] })}>+ cor</button>}
          </>
        )}
        {f.tipo === 'malha' && (
          <>
            <Cor rotulo="Base" valor={f.base ?? '#eeeeee'} tokens={TOKENS} onChange={(v) => set({ base: v })} />
            <Deslizar rotulo="Suavidade" valor={f.desfoque ?? 0.18} min={0.02} max={0.4} onChange={(v) => set({ desfoque: v })} />
            {pontos.map((p, i) => (
              <div key={i} className="rounded-md bg-muted/60 p-2 space-y-1.5">
                <Cor rotulo={`Mancha ${i + 1}`} valor={p.cor} tokens={TOKENS} onChange={(v) => set({ pontos: pontos.map((q, j) => (j === i ? { ...q, cor: v } : q)) })} />
                <Deslizar rotulo="X" valor={p.x} min={-0.2} max={1.2} onChange={(v) => set({ pontos: pontos.map((q, j) => (j === i ? { ...q, x: v } : q)) })} />
                <Deslizar rotulo="Y" valor={p.y} min={-0.2} max={1.3} onChange={(v) => set({ pontos: pontos.map((q, j) => (j === i ? { ...q, y: v } : q)) })} />
                <Deslizar rotulo="Tamanho" valor={p.r} min={0.05} max={1} onChange={(v) => set({ pontos: pontos.map((q, j) => (j === i ? { ...q, r: v } : q)) })} />
                <button className="text-[11px] text-destructive" onClick={() => set({ pontos: pontos.filter((_, j) => j !== i) })}>remover</button>
              </div>
            ))}
            {pontos.length < 6 && <button className="text-xs text-primary-ink" onClick={() => set({ pontos: [...pontos, { x: 0.5, y: 0.5, r: 0.4, cor: '#ffffff' }] })}>+ mancha</button>}
          </>
        )}
        {f.tipo === 'imagem' && (
          <>
            <Escolha rotulo="Print" valor={f.captura ?? ''} opcoes={[['', '— escolha —'], ...capturas.map((k) => [k.ref, k.nome.replace(/^\d{4}-\d{2}-\d{2}-/, '')] as [string, string])]} onChange={(v) => set({ captura: v || undefined })} />
            <Deslizar rotulo="Desfoque" valor={f.desfoque ?? 0.06} min={0} max={0.15} passo={0.005} onChange={(v) => set({ desfoque: v })} />
          </>
        )}
      </Secao>
      {f.tipo !== 'transparente' && (
        <Secao titulo="Textura">
          <Escolha rotulo="Padrão" valor={pad.tipo} opcoes={cat.padroes.map((p: any) => [p.id, p.nome] as [string, string])} onChange={(v) => setPad({ tipo: v })} />
          {pad.tipo !== 'nenhum' && (
            <>
              <Deslizar rotulo="Escala" valor={pad.escala ?? 0.05} min={0.01} max={0.2} passo={0.002} onChange={(v) => setPad({ escala: v })} />
              <Deslizar rotulo="Opacidade" valor={pad.opacidade ?? 0.08} min={0.01} max={0.4} onChange={(v) => setPad({ opacidade: v })} fmt={(v) => `${Math.round(v * 100)}%`} />
              <Cor rotulo="Cor" valor={pad.cor ?? (f.escuro ? '#ffffff' : '--text')} tokens={TOKENS} onChange={(v) => setPad({ cor: v })} />
              <Chave rotulo="Esmaecer nas bordas" valor={pad.esmaecer !== false} onChange={(v) => setPad({ esmaecer: v })} />
            </>
          )}
          <Deslizar rotulo="Grão" valor={f.grao ?? 0} min={0} max={0.15} passo={0.005} onChange={(v) => set({ grao: v })} fmt={(v) => `${Math.round(v * 100)}%`} />
          <Deslizar rotulo="Vinheta" valor={f.vinheta ?? 0} min={0} max={0.4} onChange={(v) => set({ vinheta: v })} fmt={(v) => `${Math.round(v * 100)}%`} />
        </Secao>
      )}
    </>
  );
}
