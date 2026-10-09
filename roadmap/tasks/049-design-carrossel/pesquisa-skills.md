# Pesquisa: skills de design visual (HTML/CSS) para melhorar o carrossel

Data: 2026-10-09. Método: leitura de SKILL.md/README quando acessível; onde o GitHub não abriu, usei resumos de terceiros (marcado como "indireto"). Números de estrelas e de regras variam entre diretórios, então não uso como critério.

## (a) Fontes ranqueadas e o que roubar

### 1. Anthropic `frontend-design` (leitura direta)
https://github.com/anthropics/skills/tree/main/skills/frontend-design
A versão atual é bem diferente da antiga ("escolha uma estética ousada"): virou um **processo em 4 passos** + lista de tells.
- **Plano antes do código:** tokens compactos (4-6 hex nomeados, escala tipográfica, layout, princípios) + wireframe ASCII. Depois uma **revisão do plano**: "isso parece o default para esse tipo de peça? então troque e explique".
- **Ancorar no assunto:** tirar escolhas visuais do universo do tema (materiais, vernáculo), usar o conteúdo real, abrir com o elemento mais característico do assunto.
- **Dispositivos estruturais (régua, número, eyebrow, divisor, rótulo) só se carregam informação.** Numeração só em sequência real.
- **Boldness concentrada:** um elemento memorável, o resto quieto. Antes de fechar, **remover um elemento** ("tirar um acessório").
- Tells proibidos: destacar uma palavra do título com itálico/negrito/cor; rótulos em CAIXA ALTA; rótulo tipográfico sobre tudo; cards idênticos com mesmo raio e mesma sombra cinza; gradiente "wash"; creme + terracota; preto-quase-preto + um acento ácido; "PALAVRA — fragmento"; pontos-médios em meta-strings; "→" em botões.
- Tipografia: uma família, ou duas claramente distintas; não separar display/body por reflexo.

### 2. Impeccable (pbakaus/impeccable) (README + site; a skill em si não abriu)
https://github.com/pbakaus/impeccable · https://impeccable.style
Camada de comandos sobre o frontend-design: `shape` (planeja antes de codar), `craft`, `critique`, `audit`, `polish`, `bolder`, `quieter`, `distill`, `typeset`, `layout`, `colorize`, `extract`.
- **Contexto durável:** `PRODUCT.md` (público, propósito, voz) + `DESIGN.md` (sistema visual) lidos em toda geração. Equivale ao nosso context/ + BRAND.md; confirma o caminho.
- **Detector determinístico (59 regras)** que roda sem LLM + checagens só de LLM. Slop detectado: borda lateral colorida em card, gradiente roxo→azul, glow escuro, easing bounce, cards dentro de cards, tile de ícone arredondado acima de cada título, chip eyebrow ("Introducing"), seção numerada 01/02/03, pontos de status pulsando, paleta bege "de IA", serifa itálica no título, borda fina + sombra larga macia, cinza sobre fundo colorido, preto/cinza puro (tingir), headline vaga + CTA genérico.
- **Comandos de tom** (`bolder/quieter/distill`): a correção é uma direção, não "melhore". Serve para nosso passo de correção.
- **Crítica em duas avaliações isoladas** (ver seção d).

### 3. taste-skill (Leonxlnx) (SKILL.md lido direto)
https://github.com/Leonxlnx/taste-skill
Fonte mais rica em **sistema de variação**:
- **Três dials 1-10** (variância, movimento, densidade) por brief, com presets por caso. Para nós: dials por peça (variância alta em carrossel de provocação, baixa no educativo).
- **"Design Read" de uma linha** antes de codar: tipo de peça, público, vibe, família estética.
- **Regras anti-repetição mecânicas:** eyebrow no máximo 1 a cada 3 seções (contar rótulos caixa-alta; passou do teto, reprova); cada família de layout aparece **no máximo uma vez**, e 8 seções exigem ao menos 4 famílias; no máximo 2 splits imagem-texto seguidos; um rótulo por intenção de CTA.
- **Travas:** um tema (claro/escuro) por peça, exceto uma virada deliberada; **um acento**, dessaturado; um sistema de raio; sombras tingidas com o matiz do fundo, nunca preto puro; off-black/off-white.
- **Banidos:** neon/glow, gradiente em texto grande, H1 gritante, 3 cards iguais, header dividido (título grande à esquerda + parágrafo pequeno à direita), texto flutuante nos cantos, espaçamento "perfeito e sem vida", pílulas sobre foto, paginação "01 / 4" em imagem, texto vertical rotacionado, pontos de status decorativos, mais de um ponto-médio por linha, barras de progresso com trilho, números falsos redondos (99,99%), nomes genéricos, verbos de enchimento (elevate, seamless), travessão proibido, dashboards falsos feitos de div.
- **Cópia:** headline ≤ 8 palavras, subtexto ≤ 25; citação ≤ 3 linhas; auditoria de cópia (reescrever o "poético de performance"); uma voz por peça.
- **Pre-flight checklist** com caixas honestamente marcáveis; "se uma não marca, não está pronto".
- Variantes úteis: `soft-skill` (premium calmo), `minimalist-ui` (editorial), `industrial-brutalist-ui`, `redesign-existing-projects` (auditar, preservar, modernizar por alavancas: tipografia, espaçamento, cor, movimento, recomposição).

### 4. Anthropic Engineering: "Harness design for long-running apps" (leitura direta)
https://anthropic.com/engineering/harness-design-long-running-apps
O melhor relato do loop gerador→avaliador em HTML.
- **4 critérios de nota:** qualidade de design (coerência de cor/tipo/layout/detalhe numa identidade), **originalidade** (escolha deliberada vs template/default/motivo comum de IA), craft (hierarquia, espaçamento, harmonia, contraste), funcionalidade. **Pesar originalidade e qualidade acima de craft/funcionalidade**: craft o modelo já passa, e isso empurra para mais risco estético.
- Os **mesmos critérios** vão no prompt do gerador e do avaliador; a redação dos critérios molda o estilo (cuidado com frases que induzem convergência).
- O avaliador abre a página real (Playwright), tira screenshot, dá nota por critério **com crítica escrita**, e a crítica volta ao gerador.
- **5-15 iterações; a cada rodada o gerador escolhe refinar (nota subindo) ou pivotar para outra estética** (nota estagnada).
- **Avaliador calibrado com exemplos few-shot** com notas detalhadas, para evitar deriva de nota.

### 5. Open Design (nexu-io/open-design) e huashu-design (parcialmente indireto)
https://github.com/nexu-io/open-design · https://github.com/alchaincyf/huashu-design
- Cada render lê um **DESIGN.md como contrato de marca**; 151 sistemas prontos e 5 direções curadas quando não há marca.
- **Auto-crítica de 5 dimensões como gate antes de emitir** + API de lint do artefato (as dimensões não são publicadas).
- huashu: **protocolo de ativos da marca** (logo obrigatório, cores extraídas de ativos reais, nunca de memória), **3 direções diferenciadas** quando o briefing é vago, e modo crítica que devolve **Manter / Corrigir / Vitórias rápidas**. Proíbe gradiente roxo, emoji como ícone, cantos exageradamente redondos.
- A skill `social-carousel` do Open Design (3 cards 1080x1080): **título que lê como uma frase única atravessando os cards**, fundos em camadas de gradiente CSS, mono só para marca/indicador.

### 6. marcolang/marketing-skills `instagram-carousel` (resumo indireto)
https://github.com/marcolang/marketing-skills
Mais próximo do nosso caso, mas fraco em variedade.
- Pegar: **gancho primeiro** (nunca abrir pela marca; afirmação forte, número+benefício, pergunta que dói, resultado concreto, inversão de expectativa; os slides têm de entregar o prometido); **sequências por tipo** (padrão 7: Hero, Problema, Solução, Features, Detalhes, Como fazer, CTA; listicle; tutorial; comparação); barra de progresso e seta de deslizar **dentro da imagem**, sem seta no último.
- Armadilhas de export: não mudar o viewport (reflow); escalar com `device_scale_factor`; esperar as fontes; imagens em base64; gerar HTML por arquivo e não por heredoc.
- Fraqueza (não copiar): alternar claro/escuro com gradiente da marca é justamente o "tudo igual" que temos.

### 7. Open Carrusel (hainrixz/open-carrusel) (README)
https://github.com/hainrixz/open-carrusel
App local: chat + preview + filmstrip; **cada slide é um HTML independente** (body-only) com edição **por slide** e histórico; a mesma função `wrapSlideHtml` alimenta preview e Puppeteer (contrato de render único); overlay de **área segura** do Instagram; 1:1, 4:5, 9:16, máx. 10 slides. Sem loop de crítica automática. Pegar: slide como unidade independente, contrato de render único, safe-zone.

### 8. UI UX Pro Max (nextlevelbuilder) (README, indireto)
https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
Motor de raciocínio: produto → categoria → regra com **padrão, estilo, humor de cor, humor tipográfico, efeitos e anti-padrões da indústria**; bases de paletas e pares de fontes. Pegar: **banco curado de pares de fonte e paletas por humor** (em vez de escolher de memória) e **anti-padrões por nicho** (saúde/terapia: sem neon, sem animação agressiva, sem roxo/rosa de IA). Checklist: sem emoji como ícone (SVG Lucide), contraste 4.5:1, texto sem corte.

### 9. Anthropic `canvas-design` (leitura direta)
Dois passos: **filosofia visual** (nomear um movimento de 1-2 palavras, 4-6 parágrafos sobre espaço, cor, escala, ritmo, hierarquia) e depois a peça. Regras: repetição paciente de marcas sistemáticas, tipografia esparsa e fina integrada à composição, paleta limitada, margens corretas, nada sobreposto. **A segunda passada só refina** (alinhamento, espaço, cor) em vez de adicionar elementos. Em multipágina: "cada página distinta mas relacionada, como um livro de arte". É exatamente a variação com coerência que queremos.

### 10. Anthropic `theme-factory` e `brand-guidelines` (leitura direta)
Theme-factory: tema como spec (paleta com hex, par de fontes, identidade/público), **mostrar amostras antes de aplicar**, porta de confirmação, checagem de contraste embutida, nomes por humor. Brand-guidelines: cor do texto conforme o fundo; formas não textuais **ciclam pelos acentos**. Ideia útil: ciclar os acentos da marca entre slides. Simples demais para resolver sozinho.

### 11. Pesquisa acadêmica e posts de loop
- ReLook (ACL 2026) https://preview.aclanthology.org/ingest-acl/2026.acl-long.1167/ : crítico multimodal por screenshot; render inválido = nota zero; **só aceita revisão que melhora**.
- WebGen-Agent https://arxiv.org/html/2509.22644v1 : VLM dá nota ao screenshot; ao final **volta ao melhor passo**, não ao último.
- Visual prompting para crítica de UI https://arxiv.org/abs/2412.16829 : comentários com **caixa delimitadora** ligados a regiões; modelos críticam mal sem diretrizes explícitas.
- Post "design loop" https://www.stork.ai/blog/this-loop-unlocks-pro-ai-design : anedótico, sem rubrica publicada; vale só passar uma **imagem de referência** ao builder e julgar por "para o scroll? leva ao último slide?".

## (b) Padrões recorrentes das melhores

1. **Plano e tokens antes do código**, com revisão do plano contra o "default previsível".
2. **Contrato de marca em arquivo** (DESIGN.md/PRODUCT.md/BRAND.md) lido em toda geração; cores extraídas de ativos reais.
3. **Um elemento herói, resto quieto**; subtração final obrigatória.
4. **Variação governada por regras, não por "seja criativo":** dials de variância/densidade, famílias de layout com teto de repetição, contagem mecânica de eyebrows, ritmo (respiro após peso).
5. **Coerência por travas:** um acento, um raio, um tema, sombra tingida, uma ou duas famílias tipográficas. Varia a composição, trava o sistema.
6. **Escala tipográfica com hierarquia por peso/cor/tamanho** e medida limitada; título ≤ 8 palavras.
7. **Camadas e detalhe fino com função:** estrutura que carrega informação; grão só em overlay fixo; sombras tingidas.
8. **Cópia como design:** verbos concretos, nada "poético de performance", números reais.
9. **Checklist de pre-flight honesto** e/ou detector determinístico sem LLM.
10. **Render real + screenshot** como base de todo julgamento, nunca só o código.

## (c) Anti-padrões que as melhores proíbem

- Gradiente decorativo (roxo→azul, "wash", em texto grande), glow/neon, glassmorphism em tudo.
- Paletas-clichê: creme + terracota, bege "premium", preto + acento ácido; preto/cinza puros.
- Cards idênticos, cards dentro de cards, grade de 3 iguais, tile de ícone redondo sobre cada título, mesma sombra cinza em tudo, borda lateral colorida.
- Uma palavra do título destacada em itálico, cor ou negrito; serifa itálica como assinatura.
- Rótulos caixa-alta com tracking em tudo; eyebrow em toda seção; numeração 01/02/03 sem sequência real; "01 / 4" sobre imagem; pílulas sobre foto; pontos de status decorativos; texto vertical rotacionado; linhas de cruz decorativas.
- Header dividido (título grande à esquerda + parágrafo pequeno à direita); texto flutuando nos cantos; espaçamento perfeito e morto.
- Mesmo layout repetido em todos os slides; tema alternando sem razão.
- Fontes default (Inter/Arial/system) por reflexo; separar display e body por reflexo.
- Travessão e "→" como muleta; pontos-médios em meta-strings.
- Headline vaga e CTA genérico; verbos de enchimento; números redondos falsos; nomes genéricos.
- Dashboards/screenshots falsos desenhados com div; emoji como ícone (usar uma família de SVG, no nosso caso Lucide).
- Cinza sobre fundo colorido; contraste < 4.5:1 no corpo; texto cortado.
- Efeitos sem motivo (bounce, animação em tudo).

## (d) Como estruturam crítica e revisão

Estrutura mais sólida = Impeccable `critique` + loop da Anthropic:
1. **Duas avaliações isoladas em paralelo:** A = revisão de design pelo LLM (não vê B); B = detector determinístico + evidência do navegador. O LLM julga primeiro "isso é específico deste produto?" sem viés do detector; só depois sintetiza.
2. **Nota por heurística** (Nielsen 0-4, com "n/a" e renormalização) e **severidade P0-P3**. Relatório: tabela de notas, veredito de especificidade, 3-5 problemas prioritários com correção e comando sugerido, red flags por persona, observações menores.
3. **Rubrica ponderada** (Anthropic): originalidade + qualidade pesam mais que craft + funcionalidade; mesmo critério no gerador e no avaliador; **avaliador calibrado com few-shot**.
4. **Crítica por região** (caixa delimitadora), não comentário geral.
5. **Regra de aceitação estrita** (ReLook): só substitui a versão se a nota subir; guarda e restaura o **melhor passo** (WebGen-Agent).
6. **Refinar vs pivotar:** nota subindo = refinar; estagnada = trocar de direção.
7. **Correções direcionais** (bolder/quieter/distill/typeset/layout/colorize), não "melhore".
8. **Manter / Corrigir / Vitórias rápidas** (huashu) e passada final que **só refina e remove** (canvas-design, frontend-design).
9. **Render inválido (texto cortado, fonte não carregou) = nota zero** antes de qualquer julgamento estético.

## Recomendação para a skill `carousel` (síntese)

(1) **Plano por slide** (papel, família de layout, elemento herói, dials) + "Design Read" de uma linha, revisado contra o default; (2) **cada slide como HTML independente** sobre tokens travados do `brand.css`, com teto mecânico de repetição de layout/eyebrow/card e camadas intencionais (fundo com textura leve, forma gráfica, tipo, detalhe fino com função); (3) **render PNG**; (4) **crítica em duas vias:** lint determinístico (lista da seção c, contraste, corte, repetição) + crítico visual (Opus) com rubrica ponderada e exemplos calibrados, nota e correção por slide; (5) **correção só aceita se a nota subir**, máx. 3 rodadas, pivô se estagnar; (6) passo final de **remover um elemento**.

Limitações: não consegui abrir o SKILL.md do Impeccable, do marcolang nem do open-design no GitHub; essas partes vêm de README e resumos. Antes de copiar regras literais, instale e leia os arquivos (`npx skills add pbakaus/impeccable`, `npx skills add Leonxlnx/taste-skill`).
