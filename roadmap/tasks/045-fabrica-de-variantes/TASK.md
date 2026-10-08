# 045 — Fábrica de vídeo: projeto, blocos reutilizáveis e variantes (A/B) com fluxograma no app

Status: rascunho (plano para aval) · Junta e substitui o desenho de: 013 (cenas modulares e variantes), 014 (galeria reutilizável), 009 (MCP de edição), 015 (cortes e edits) · Liga com: 022 (revisão por anotações), 037/040 (anúncios dos concorrentes), `ads-meta`, `elevenlabs`
Pedido do Oliver em 2026-10-08: tudo em **blocos** reaproveitáveis; um **projeto de vídeo** recebe vários áudios/vozes, aberturas, headlines e copys (ou o Claude gera); o Claude faz a **v1**, o Oliver aprova e ajusta, e daí saem as **variantes e combinações quase sem tokens** (ex.: 3 vozes × 3 aberturas = 9), cada uma **sincronizada** (duração de bloco, entrada de texto na palavra certa). No app, um **fluxograma** com as ramificações para clicar, ver e baixar cada uma. Anúncio também testa **copy da descrição e CTA**. Depois, o mesmo motor vira **gerador de cortes e edits** (podcast → cortes → templates de edit com som, headline, punch, phonk).

## 0. O que já existe e serve de base
- A timeline **nasce do áudio** (`lib.mjs` → `layout()`): cada cena dura o que suas falas duram; eventos se prendem a palavras (`word: "f2:WhatsApp"`). Trocar a voz já reencaixa tudo sozinho. Isso é metade da sincronização das variantes.
- `timeline.mjs` (`vo|dur|text|music|vol`), `check.mjs`, `qc.mjs`, revisão por anotações (022) e "Gerar prévia" no app.
- `library/motion/cta/navegador` = 1º bloco de galeria com `meta.json`.
- **O que falta:** as cenas ainda são escritas **dentro** de um `composition.html` único (507 linhas na apresentação da kz). Sem separar isso, nada é reaproveitável de verdade. É a mudança técnica central.

## 1. Conceitos (vocabulário único para skill, app e agentes)
| conceito | o que é | onde mora |
|---|---|---|
| **Bloco** | unidade reaproveitável com entradas (slots) e parâmetros. Tipos: `cena` (motion em código), `abertura`, `cta`, `overlay` (headline, legenda, lower third), `transicao`, `clipe` (trecho de vídeo real), `look` (cor), `trilha`/`sfx`, `estilo-de-edit` (receita) | 3 escopos, ver §2 |
| **Slot** | o que o bloco recebe de fora: `texto`, `fala` (id da voz), `midia`, `numero`… Bloco nunca tem texto, cor ou tempo fixo dentro | `bloco.json` |
| **Projeto de vídeo** | briefing + insumos (vozes, aberturas, headlines, copys, CTAs, mídias) + sequência base de blocos + eixos de variação + variantes geradas | `contents/AAAA-MM-DD-<tema>/projeto.json` |
| **Eixo** | uma dimensão de teste: `voz`, `abertura`, `headline`, `cta`, `copy`, `formato`, `duracao`, `trilha`, `tema` | `projeto.json > eixos` |
| **Variante** | base + uma escolha por eixo + ajustes finos (patch). Montada por script, nunca reescrita pelo LLM | `variantes/<id>/` (timeline gerada + exports) |
| **Ajuste (patch)** | correção mínima de uma variante (ex.: headline entra na palavra "sozinha", abertura +0,3 s, `lead` da fala). JSON pequeno, nunca HTML | `projeto.json > variantes[].ajustes` |
| **Template de edit** | receita aplicada a qualquer fonte (corte de podcast, clipes): estilo de legenda, headline, trilha, look, regra de punch, cortes na batida | `library/edits/<id>/` ou da empresa |

## 2. Contrato do bloco (unifica 013 e 014)
```
<escopo>/blocos/<tipo>/<id>/
  bloco.js     export function criar(root, slots, params, ctx)   // ctx = { inicio, dur, fala(id), palavra("f2:X"), ev(id), formato, area }
  bloco.css    só var(--tokens) do brand.css
  bloco.json   { id, tipo, titulo, slots, params (padrão/min/máx), min_s, elastico, formatos, eventos/sfx sugeridos, tokens, origem, licenca }
  preview.png  1 quadro (script)
```
Regras: tempo **relativo** (entrada · hold · saída) → aceita outra duração; layout por **área segura** do formato; sem depender do vizinho (só `match_in/out` declarado); determinístico (sem `Math.random` sem semente).
**Escopos:** `library/blocos/` (genérico, só tokens) · `companies/<slug>/video-templates/blocos/` (usa a marca) · `contents/<projeto>/blocos/` (nasceu no projeto). **Promover** = mover para cima quando o Oliver gostar (botão no app). Vale também para os edits: estilo de edit é muito de projeto para projeto, então nasce local e sobe só o que se provar.
A composição passa a ser **gerada**: `compor.mjs` lê a sequência de blocos da timeline e monta o `composition.html` (importa cada `bloco.js`, chama `criar` com os tempos). O LLM escreve **blocos**, não composições.

## 3. O projeto de vídeo (`projeto.json`, rascunho do formato)
```json
{
  "tipo": "anuncio",
  "objetivo": "teste de gancho para terapeuta solo",
  "insumos": {
    "vozes":     [{ "id": "carla", "voz": "el-carla" }, { "id": "v2", "voz": "el-…" }, { "id": "v3", "arquivo": "_inbox/minha-voz.wav" }],
    "aberturas": [{ "id": "pergunta", "bloco": "abertura/pergunta-grande", "fala": "Você ainda confirma sessão pelo WhatsApp às 23h?" },
                  { "id": "numero",   "bloco": "abertura/numero-que-cresce", "fala": "…", "slots": { "numero": "…" } },
                  { "id": "cena",     "bloco": "abertura/print-zoom", "fala": "…" }],
    "headlines": ["…", "…"],
    "ctas":      [{ "botao": "Saiba mais", "fala": "…" }],
    "copys":     [{ "id": "c1", "texto_principal": "…", "titulo": "…", "descricao": "…" }]
  },
  "base": [ { "slot": "abertura" }, { "bloco": "cena/caos-de-apps" }, { "bloco": "cena/demo-agenda" }, { "slot": "cta" } ],
  "eixos": { "voz": ["carla","v2","v3"], "abertura": ["pergunta","numero","cena"] },
  "matriz": "completa",
  "variantes": [ { "id": "carla-pergunta", "ajustes": [] } ]
}
```
- `matriz`: `completa` (todas as combinações) ou lista escolhida (ex.: só as 5 que o estrategista recomendar).
- **Trilha ancorada:** a música se alinha ao **início do corpo** (marcador `drop`), não ao 0 s; abertura mais longa ou mais curta não desloca o "punch" da trilha.
- **Cache por conteúdo:** cada fala é gerada uma vez por (texto + voz + ajustes de voz). 3 vozes × 3 aberturas = 9 falas de abertura + 3 corpos, não 9 vídeos inteiros de voz.

## 4. Fluxo (quem faz o quê, onde gasta token)
```
1. Briefing + insumos ──► 2. Claude gera opções ──► 3. Oliver escolhe ──► 4. v1 (base) ──► 5. Revisão/aval ──► 6. Matriz ──► 7. QC por variante ──► 8. Ajuste só do que falhou ──► 9. Revisão em grade ──► 10. Final + pacote do anúncio ──► 11. Resultados voltam
```
| etapa | o que acontece | custo em tokens |
|---|---|---|
| 2 | Claude gera ângulos, 5–10 aberturas, headlines, copys de descrição e CTAs lendo `COPY.md`, `AUDIENCE`, `VOICE`, `LOG_ANGULOS.md`, relatórios de anúncios dos concorrentes (040 G) e as brechas (039) | médio, 1 vez |
| 4 | v1 = **uma** combinação "herói" feita inteira pela skill `video`, mas **montada com blocos** (reusa da galeria; escreve só o que faltar) | alto, 1 vez (cai a cada projeto com galeria maior) |
| 5 | revisão por anotações (022) até o aval → blocos ficam **travados** | baixo por ajuste |
| 6 | `variantes.mjs`: gera falas (cache), monta cada timeline (base + escolhas), reencaixa, compõe, renderiza rascunho | **zero** |
| 7 | QC automático de sincronia por variante (§5) | zero |
| 8 | só as variantes com aviso vão ao LLM, com um relatório de ~1–2 mil tokens (aviso + falas + tempos), e ele devolve **um ajuste JSON** | baixo, só onde falhou |
| 9 | Oliver vê a grade/fluxograma, aprova, anota | — |
| 10 | render final (blur nativo opcional) + pacote: MP4 por variante × formato, nomes de anúncio, copys, UTMs, planilha para subir em massa na Meta | zero |
| 11 | importar resultado por nome de anúncio → qual voz/abertura venceu → `LOG_ANGULOS.md` e próxima rodada | baixo |

**Nova abertura depois:** se é só texto num bloco de abertura existente, custo ≈ o texto. Se é ideia visual nova, o LLM escreve **um** bloco isolado e ele já entra para a galeria do projeto.

## 5. Sincronização automática (o "cada vídeo perfeito")
Regras checadas por script em cada variante (estende `check.mjs`):
- tempo mínimo de leitura de cada texto na tela (palavras × ritmo do formato), texto não some antes de a fala terminar;
- elemento preso a palavra (`word`) existe nessa voz e caiu dentro da cena; ênfase visual a ≤ 0,15 s da palavra;
- bloco abaixo do `min_s` ou esticado além do natural (hold longo demais → tela parada);
- abertura ≤ teto do formato (ex.: gancho em ≤ 3 s no anúncio); duração total ≤ `max_s` do eixo;
- trilha: punch/drop a ≤ 1 batida do marcador; loudness (−14 LUFS) e voz acima da trilha;
- legenda/headline fora da área segura ou sobre o rosto (vídeo real).
Resultado: `ok` / `aviso` / `erro` por variante, com o porquê. **Correção automática primeiro** (ex.: puxar `lead`, esticar hold dentro do `elastico`); só sobra para o LLM o que o script não resolve.

## 6. App: aba **Variantes** no projeto de vídeo
- **Fluxograma** (React Flow): Insumos (vozes, aberturas, headlines, copys) → **Base v1** → ramos por eixo → folhas = variantes. Cada folha: miniatura que toca no hover, selo QC (ok/aviso/erro), status (rascunho/aprovada/final), **play, baixar, anotar, aprovar, descartar**.
- **Matriz** (alternativa ao fluxo, melhor para 2 eixos): linhas = vozes, colunas = aberturas, célula = variante. Alternar entre Fluxo e Matriz.
- **Insumos editáveis** na própria tela: adicionar voz (arquivo ou voz da ElevenLabs), escrever/colar aberturas e headlines, botão "**Pedir à IA**: +5 aberturas" (fácil falar com a IA, regra do `APP.md`).
- Escolher combinações (marcar células), **Gerar variantes** (roda o script, faixa de progresso), **Baixar selecionadas** (.zip) e **Pacote do anúncio** (planilha + MP4 nomeados).
- Anotação numa variante abre a revisão 022 já existente; o ajuste vale **só para ela** ou **para todas** (escolha na hora).

## 7. Copy, CTA e teste do anúncio (com `ads-meta`)
- **Separar o que precisa de render do que não precisa.** Voz, abertura, headline na tela, CTA falado = variante de vídeo (render). Texto principal, título, descrição e botão = **opções de texto do anúncio**: a Meta testa várias opções de texto por anúncio sozinha, então não multiplicamos vídeos por copy. O projeto guarda as copys por variante ou por grupo.
- Nome do anúncio = id da variante (`kz-2026-10-gancho-sessao__voz-carla__ab-pergunta__4x5`) → resultado rastreável por eixo.
- O `ads-meta` recomenda o **desenho do teste**: matriz completa (9) pede verba para 9 anúncios saírem do aprendizado; alternativa barata em 2 rodadas (1ª: 3 aberturas com 1 voz; 2ª: a abertura vencedora × 3 vozes).
- Saúde/CFP: as proibições da kz continuam regra dura para toda copy gerada (revisor confere).

## 8. Depois: cortes e edits (mesmo motor, entrada em vídeo)
- **Fonte** (podcast, entrevista) → Whisper local com tempo por palavra → Claude barato sugere cortes (gancho → ideia completa → fecho) e marca o **punch** de cada um (frase de pico; reforço por energia do áudio) → o Oliver marca os cortes.
- Cada corte é um **clipe** (bloco de vídeo real) + **template de edit** aplicado: estilo de legenda, headline, look, trilha, regra de punch (ex.: "edit épico": até o punch, câmera parada e legenda limpa; no punch, phonk entra, cortes rápidos na batida, zoom/flash/shake, P&B). N cortes × M templates = variantes, no **mesmo fluxograma**.
- Peças técnicas novas: reenquadrar para 9:16 (rosto no centro, local), detectar batidas da trilha, vídeo real no HyperFrames ou ffmpeg por baixo com camada HTML por cima (decidir na fase).
- Direitos: só material com permissão ou uso aceito (regra da 015).

## 9. Fases (cada uma entrega algo usável)
| fase | entrega | critério de pronto |
|---|---|---|
| **A — Blocos** | contrato `bloco.json`/`bloco.js`, `compor.mjs` gera a composição, `check` entende blocos; **piloto:** quebrar a apresentação da kz (s1–s7) em blocos | o vídeo recomposto sai igual ao v03 (folha de quadros lado a lado) |
| **B — Variantes por script** | `projeto.json`, `variantes.mjs` (cache de falas, trilha ancorada, render rascunho, nomes) | 3 vozes × 3 aberturas = 9 MP4 sem LLM, a partir da base aprovada |
| **C — Sincronia** | QC por variante (§5) + correção automática + relatório curto para o LLM + `ajustes` | as 9 passam ou chegam ao LLM com ≤ 2 mil tokens cada |
| **D — App** | aba Variantes (Fluxo + Matriz), gerar, baixar, anotar, aprovar | o Oliver monta e baixa as 9 sem terminal |
| **E — Insumos pela IA** | "Pedir à IA" aberturas/headlines/copys/CTAs com contexto + intel; skill `video` e `ads-meta` com seção Variantes | 1 projeto real da kz gerado do briefing |
| **F — Pacote e resultado** | planilha para subir em massa, UTMs, import de resultados → `LOG_ANGULOS.md` | 1 teste real fechado com aprendizado registrado |
| **G — Galeria** | catálogo `library/INDEX.md` gerado, busca, folha de previews, Promover no app (o que era a 014) | o Claude acha um bloco sem abrir mídia |
| **H — Cortes e edits** | fonte → cortes → templates de edit → variantes (o que era a 015) | 1 podcast → 5 cortes × 2 templates no fluxograma |
O MCP da 009 vira desnecessário no curto prazo: os comandos do `timeline.mjs`/`variantes.mjs` já são a API barata (o app e o Claude chamam os mesmos). Reavaliar depois da D.

## 10. Perguntas para o Oliver (decidem o rumo)
1. **Piloto:** quebrar a apresentação da kz em blocos (sem esperar dados da kz) e fazer as 9 variantes nela como teste? Ou já um anúncio real (depende de preço/teste grátis/CFP)?
2. **Vozes das variantes:** gerar as 9 já na ElevenLabs (gasta créditos, ~3 corpos + 9 aberturas) ou rascunho grátis para escolher e ElevenLabs só nas aprovadas?
3. **Desenho do teste:** matriz completa (9 anúncios) ou em 2 rodadas (aberturas, depois vozes)?
4. **Edits/cortes:** já tem a 1ª página/tema e um podcast-fonte em mente? (define quando a fase H sobe na fila)
5. **Copy:** quer que o pacote saia como planilha de importação em massa da Meta, ou basta uma lista para colar à mão?

## Log
- 2026-10-08: plano escrito a partir do pedido do Oliver (sessão de planejamento do vídeo). Juntou 009, 013, 014 e 015 num desenho só; aguarda as respostas da §10 e o aval para começar a fase A.
