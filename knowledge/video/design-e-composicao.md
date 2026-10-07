# Design, composição e direção de arte (o frame parado)

> Base: material do usuário "Etapa 7" (2026-10-07), verificado. **Design primeiro, movimento depois:** um frame amador parado continua amador animado. Defaults de cor e fundo em `visual-e-cor.md`; formatos e áreas seguras em `formatos-e-areas-seguras.md`.

## 1. Princípios
- **Função antes da estética.** Cada elemento explica, identifica, destaca, compara, localiza, quantifica, conecta, demonstra ou contextualiza. Decorar é a última prioridade. Pergunte: o que este elemento ajuda a entender ou sentir?
- **Hierarquia explícita.** Ordem de leitura: 1º, 2º, auxiliar. Use escala, peso, contraste, posição, cor, espaço e movimento, sem usar tudo ao mesmo tempo. **Teste do relance:** o que o olho acha primeiro? Se não é o mais importante, reajuste.
- **Um elemento dominante por frame** (headline, número, produto, personagem…). Se tudo é protagonista, nada é.
- **Caminho do olhar antes do caminho dos objetos:** desenhe headline → dado → explicação → detalhe. A animação depois segue essa ordem.
- **Composição deliberada:** nada "deixado em algum lugar". Não centralize tudo por hábito; o **espaço negativo é um elemento** (separa, dá legibilidade, sofisticação, descanso). Não preencha vazio com ícone, partícula, linha ou textura.
- **Proximidade antes de containers:** o relacionado fica perto e o diferente fica longe; caixas e bordas só se o espaço não bastar.
- **Alinhamento exato:** diferença acidental de poucos px denuncia amadorismo. Use um **grid invisível** (margens, colunas, regiões).
- **Spacing em escala, não arbitrário:** `--space-1..6` (ex.: 8 · 16 · 24 · 40 · 64 · 104 px em 1080), com as mesmas relações título↔subtítulo, ícone↔rótulo e bloco↔bloco.
- **Contraste que comunica função:** diferenças pequenas demais entre níveis somem. Teste em escala de cinza (valor ≠ cor): se tudo tem o mesmo valor, a hierarquia desaparece.
- **Cor funcional e paleta limitada:** base (estrutura) · apoio (secundário) · **destaque raro** (atenção) · semânticas (estado). O destaque só funciona se for raro. Nada de cor nova a cada gráfico.

## 2. Tipografia é design
- Defina família, peso, tamanho, largura, entrelinha, espaçamento, alinhamento e quebra. **Não aceite o padrão.**
- **Níveis:** headline · subheadline · corpo · legenda · metadado. Poucos níveis bem distintos. **No máximo 2 famílias** (display + neutra), cada uma com uma função; o ideal é 1 família com pesos.
- **Quebra de linha é edição de linguagem:** quebre por sentido, nunca separe grupos ("R$ / 129"), evite palavra curta sozinha na linha. Leia em voz alta seguindo as quebras.
- **Entrelinha (leading):** título grande 1,0–1,15; corpo 1,35–1,6.
- **Espaçamento entre letras (tracking):** título grande −0,01 a −0,03 em; CAIXA ALTA +0,02 a +0,08 em; texto longo sem tracking alto.
- **Kerning:** em título-herói, revise pares (AV, To, ra, "Te"): erro cresce com o tamanho.
- **Legibilidade real:** avalie no tamanho do celular, não no zoom do editor. Mínimos em `visual-e-cor.md`.
- **Tempo de leitura é requisito de design:** se o texto não cabe no tempo, **corte, resuma ou divida em etapas** antes de animar.

## 3. Forma e iconografia
- **Linguagem de formas única:** cantos (raio do `brand.css`), círculos, linhas, contorno × preenchimento, orgânico × geométrico. Mesmo raio para elementos equivalentes.
- **Contorno consistente:** ícones, bordas, conectores, gráficos e divisores na mesma família de espessura (ex.: 1,5 px em ícone de 24 px, escalando proporcionalmente).
- **Ícones de uma família só** (mesmo traço, raio, preenchimento, nível de detalhe). Texto simples > ícone decorativo.
- **Repetição cria identidade; variação acontece dentro do sistema:** mesma tipografia, paleta e grid, mas escalas, composições e ênfases diferentes.

## 4. Densidade e informação
- Um frame *pode* ter vídeo, texto, gráfico, ícone, forma e textura: **não deve** ter tudo. Mais elementos ≠ mais informação.
- **Revelação progressiva:** informação pesada entra em etapas (título → dado → comparação → conclusão). O layout é desenhado já pensando nisso.
- **Texto × imagem:** não cubra rosto, objeto principal ou ação. Use o espaço negativo da imagem; se não houver, reposicione, recorte, escureça localmente ou use um fundo de forma.
- **Legibilidade sobre vídeo, em ordem:** reposicionar → gradiente/scrim → desfoque ou escurecimento local → forma de fundo → mudar a cor. **Sombra pesada nunca é a primeira solução.**
- **Sombra** explica profundidade e separação, com uma direção de luz para o vídeo todo (níveis `--shadow-sm/md/lg`). **Glow** só com justificativa (luz, energia, interface). **Desfoque de profundidade** em sistema espacial coerente (frente / sujeito / fundo).
- **Integração com filmagem:** perspectiva, movimento de câmera, luz, contraste, profundidade, oclusão, foco, grão e motion blur. O gráfico parece **de propósito** pertencente ou de propósito sobreposto, nunca desconectado por acidente.

## 5. Processo (antes de animar)
1. **Direção de arte:** decida o que **pertence** ao projeto (referências, mood, tipo, paleta, composição, textura, forma, fotografia, intensidade gráfica, linguagem de animação). Para marcas, isso vem do `BRAND.md`: o motion **estende a marca no tempo**, não inventa outra.
2. **Referências por propriedade, não "vibe":** escala tipográfica, densidade, paleta, grid, espaçamento, forma, tratamento de imagem, caráter do movimento, ritmo. Decida quais propriedades adaptar.
3. **Style frames:** 2–3 frames-chave estáticos que fixam composição, tipo, cor, formas, ícones e tratamento **antes** de animar.
4. **Quadro mais cheio:** desenhe também o estado mais complexo (todos os elementos presentes). O sistema precisa funcionar no pior caso, não só no frame vazio bonito.
5. **Design system do vídeo:** títulos, legendas, lower thirds, citações, estatísticas, gráficos, callouts, rótulos, capítulos, fontes, cartão final. Resolva uma vez e reuse. Templates da empresa em `companies/<slug>/video-templates/`.
6. **Componentes e templates prontos são sistema, não produto:** primeiro a necessidade, depois o componente; adapte texto, tamanho, composição, duração, cor, spacing e animação. **Não misture linguagens** (lower third minimalista + título cyberpunk + transição cartoon).
7. **Formatos:** 9:16, 4:5, 1:1 e 16:9 pedem **composições** diferentes do mesmo sistema (hierarquia, escala, quebras, margens, recorte, densidade), não só redimensionar.
8. **Desenhar pensando no movimento:** alinhamentos, continuidade espacial, formas relacionadas e agrupamentos já sugerem a animação (a melhor animação está implícita na composição).
9. **Complexidade proporcional:** informação rápida = design simples; o momento-herói recebe a elaboração.

## 6. Polimento de pixel
- Revise ampliado (alinhamento, recortes, margens, bordas, raio, espaçamento, kerning, ícone, máscaras, linha de base) **e depois em tamanho real**.
- **Alinhamento óptico > matemático:** ícone de play, triângulos, letras como "A", "V" e "O", e logos precisam de compensação visual.
- **Acabamento uniforme:** o resultado é limitado pelo componente menos resolvido (título lindo + gráfico padrão = gráfico padrão).
- **Premium é a soma de pequenas decisões certas** (spacing, hierarquia, kerning, alinhamento, contraste, poucas cores, formas coerentes, margens, ausência do desnecessário). **Na dúvida, remova antes de adicionar.**

## 7. Revisão do frame (antes de animar)
- [ ] **Hierarquia:** sei onde olhar?
- [ ] **Clareza:** entendo a mensagem?
- [ ] **Composição:** está equilibrado?
- [ ] **Spacing:** há distâncias acidentais?
- [ ] **Tipografia:** quebras, pesos e espaçamentos são deliberados?
- [ ] **Cor:** há hierarquia e destaque raro?
- [ ] **Contraste:** tudo o que importa está legível?
- [ ] **Consistência:** é o mesmo sistema?
- [ ] **Integração:** o gráfico combina com a imagem?
- [ ] **Necessidade:** dá para remover algo?

**Se o frame depende da animação para ficar interessante, volte ao design.** Easing, overshoot, partículas, blur, transições e SFX não salvam um layout fraco.
