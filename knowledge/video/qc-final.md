# QC final e polimento

> Base: material do usuário "Etapa 14" (2026-10-07), verificado e adaptado ao nosso fluxo: **o Claude confere por quadros, medições e metadados; o Oliver ouve e vê no celular.** É o mapa da revisão. Os critérios de cada tema ficam nos arquivos dele (links abaixo), sem repetir aqui.

## 1. Princípio
- **Pronto = todas as partes revisadas funcionando juntas**, não "todas as partes construídas".
- **Revisão em passadas separadas, uma pergunta por passada.** Não revise história, corte, som e cor ao mesmo tempo.
- **Macro antes de micro:** não polir SFX, glow, easing ou partícula de uma cena que talvez saia. Estrutura errada → volta ao plano.
- **A entrega é o arquivo renderizado, não a timeline.** O QC termina no MP4.

## 2. As passadas (nesta ordem; pode adaptar, não pule)
| # | passada | pergunta | como o Claude confere | critérios |
|---|---|---|---|---|
| 1 | história | o vídeo funciona como vídeo? promessa → desenvolvimento → payoff? | ler `timeline.json` (falas + on_screen) do início ao fim, sem consertar nada | `briefing-e-direcao.md` (arco) |
| 2 | estrutura e remoção | se tirar este trecho, perde informação, emoção ou ritmo? | teste de remoção por cena; procurar redundância fala × texto × visual | §3 abaixo |
| 3 | gancho e final | o assunto fica claro em 2 s? o final termina na hora? | 1º e último quadros da folha de contato | `ritmo-e-leitura.md` · `briefing-e-direcao.md` |
| 4 | cortes | por que este corte acontece aqui? | quadros antes/depois de cada troca de cena | `cortes-e-montagem.md` · `cobertura-e-reacao.md` · `b-roll.md` |
| 5 | ritmo | onde cansa, onde corre, onde não dá tempo de absorver? | `node tools/video/timeline.mjs check` + curva de intensidade do plano | `pacing-e-atencao.md` |
| 6 | frame e composição | sei onde olhar? algo encosta na borda, tangencia, fica sob a interface? | folhas de contato nos 2 formatos, em tamanho de celular | `design-e-composicao.md` §7 · `formatos-e-areas-seguras.md` |
| 7 | tipografia e texto | correto, legível, bem quebrado? nomes e números conferidos? | ler todo texto da `composition.html` contra o plano e o contexto | `tipografia-animada.md` §10 |
| 8 | legendas | entram e saem na fala? cobrem tudo? funcionam sem som? | `words` da timeline × captions | `tipografia-animada.md` |
| 9 | movimento | parece um sistema só? estabiliza? texto parado tempo suficiente? | quadros intermediários de cada animação-chave e transição | `animacao-comportamento.md` §9 · `curvas-e-polimento.md` §9 |
| 10 | dados e gráficos | qual conclusão? valor, unidade e fonte corretos? fala = gráfico? | dados em `data/*.json` × tela × fala | `infograficos-e-dados.md` §3 e §8 |
| 11 | integração e efeitos | cada efeito tem função? está integrado? | teste de remoção + versão 20% mais sutil | `compositing.md` §10 · `particulas-e-atmosfera.md` §9 · `transicoes-e-efeitos.md` |
| 12 | som | voz inteligível? trilha começa e termina certo? SFX repetido? | medições + `sfx` × `events` da timeline (o Claude **não escuta**) | `sound-design.md` · `som.md` |
| 13 | consistência | alguma cena parece de outro vídeo? a exceção tem motivo? | folha de contato inteira de uma vez | `BRAND.md` · `visual-e-cor.md` |
| 14 | técnico do arquivo | o arquivo bate com o destino? há erro? | `node tools/video/qc.mjs <pasta> --sheet` | §5 abaixo |
| 15 | pós-render | o MP4 final está igual ao aprovado? | folha de contato **do MP4** (não da timeline) | §5 |
| 16 | ouvido e celular | soa bem? funciona no celular, pequeno e sem som? | **Oliver** (ver §6) | — |

## 3. Editorial (as passadas que mais economizam)
- **Remoção:** tempo investido não torna um trecho necessário. Motion bonito que não serve à ideia sai.
- **Reforço é deliberado, redundância é acidental:** fala, texto e visual dizendo a mesma coisa sem função nova → tire um.
- **Progressão:** cada trecho responde "por que isto agora?". Efeito visual não conecta ideias desconectadas.
- **Gancho:** interesse antes de estímulo; nada de introdução antes do assunto.
- **Final:** conclui, leva ao CTA e termina antes da vontade de continuar explicando.
- **Zona morta** (nada novo, fala redundante) → resolva editando, não com efeito. **Hiperestímulo** (cortes + zoom + legenda + SFX + partícula juntos) → quantos desses precisamos?

## 4. Triagem e sistema de decisão
**Classifique antes de consertar. Corrija crítico primeiro.**
| nível | exemplos | efeito |
|---|---|---|
| **crítico** | dado ou nome errado, afirmação sem fonte, placeholder, proibição da marca, texto fora da área segura, mídia faltando, quadro preto/flash, clipping, sem áudio, dessincronia grave, export no formato errado | **bloqueia a entrega** |
| **maior** | texto ilegível no celular, ritmo arrastado, cor fora da marca, efeito sem função, SFX repetido, loudness fora do alvo, tela congelada sem motivo | corrigir antes de entregar |
| **menor** | espaçamento, micro-curva, efeito um pouco forte, nome de arquivo | corrigir se barato; senão registrar |

**Corrija a causa, não o sintoma:**
| parece… | olhe primeiro | antes de… |
|---|---|---|
| lento | estrutura e remoção | adicionar cortes |
| vazio | composição | adicionar partículas |
| fraco | hierarquia | adicionar glow |
| sem impacto | timing | adicionar SFX |
| colado | integração (`compositing.md`) | adicionar sombra |
| voz baixa | mixagem (ducking) | subir o ganho |
| cor estranha | gerenciamento de cor (BT.709) | recolorir |

**Saber onde parar:** o espectador perceberia? prejudica a mensagem? reduz a sensação de qualidade? Se não, é retorno decrescente. **A última passada refina decisões existentes; não reinventa o vídeo.** Em cena densa, pergunte "o que eu tiraria primeiro?" e teste tirar: se melhorar, fica fora.

## 5. Técnico e entrega
### Especificação de entrega social (default)
| item | valor |
|---|---|
| resolução | 1080×1350 (4:5) · 1080×1920 (9:16) · 1920×1080 (16:9) · 1080×1080; pixel quadrado; sem escala acidental |
| quadros | 30 fps **constante** (CFR), progressivo; mesmo fps da timeline, salvo decisão |
| vídeo | H.264, `yuv420p`, **BT.709 marcado** (`compositing.md` §9); CRF 16–18 (alta qualidade: a plataforma recomprime) |
| áudio | AAC 48 kHz estéreo, 256–320 kbps |
| loudness | **−14 LUFS integrado (±1), true peak ≤ −1 dBTP** para redes sociais. Não é universal: broadcast usa −23 (EBU R128); siga a especificação do destino (`--lufs` no `qc.mjs`) |
| legendas | queimadas no vídeo (fazem parte do design) |
| nome | `<AAAA-MM-DD>-<nome>-<formato>-vNN.mp4` (ex.: `2026-10-15-agenda-9x16-v02.mp4`). Nunca `final.mp4` |

- **Versões:** `v01`, `v02`… em `exports/`; nunca sobrescreva uma versão aprovada. O aprovado fica registrado no `plano.md`.
- **Master × entrega:** os quadros renderizados (ou um master em CRF ≤ 12) ficam locais em `render/`; o MP4 de entrega é derivado deles. Recortes e versões novas saem do master, não do MP4 comprimido. Nada disso vai para o git.
- **Bitrate e complexidade:** grão, partículas, confete e degradê escuro comprimem mal. Se a folha de contato do MP4 mostrar blocos, faixas (banding) ou borrão, baixe o CRF ou reduza o efeito.
- **Banding em degradê:** 8 bits + yuv420p criam faixas; em degradê grande, um ruído de 1–2% (dither) resolve. Fundo liso da marca não sofre disso.

### `tools/video/qc.mjs` (rodar sempre antes de entregar)
`node tools/video/qc.mjs <pasta-do-vídeo> --sheet` confere todo MP4 de `exports/`:
- **placeholders e afirmações "a confirmar"** em `composition.html`, `locucao.json` e `timeline.json` (procure de propósito; assistindo não se acha);
- **propriedades reais:** resolução, pixel quadrado, codec, `yuv420p`, BT.709, progressivo, fps constante, duração = timeline;
- **áudio:** existe (nunca fundo mudo), AAC, 44,1/48 kHz, estéreo, **loudness e true peak medidos** (EBU R128);
- **erros de quadro:** preto no início/fim/meio, flash branco de 1–3 quadros, tela congelada ≥ 1,5 s;
- **nome do arquivo** no padrão;
- `--sheet`: **folha de contato do MP4 final** em `render/qc/` para o Claude olhar (compressão, legendas, final, quadros estranhos).
Saída ❌/⚠️/· = crítico/maior/menor; código 1 se houver crítico.

**Pré-render:** nada de camada escondida ou desligada esquecida, print provisório, marca d'água de banco de imagem ou asset sem licença (`library/*/` com licença registrada).

## 6. O que só o Oliver confere (sempre listar na entrega)
O Claude não escuta e não vê no aparelho. Entregue com este pedido explícito:
- [ ] **Ouvir com fone:** cortes audíveis na voz, cliques, respiração estranha, música brigando com a voz.
- [ ] **Ouvir no alto-falante do celular:** a voz continua clara? a mix depende de grave que some?
- [ ] **Ver no celular, em tela cheia e pequeno:** texto, legenda e gráfico sobrevivem? brilho e cor ok?
- [ ] **Ver sem som:** dá para acompanhar pelas legendas e imagens?
- [ ] **Preview na plataforma** (rascunho no Instagram): interface cobre algo? recompressão estragou algo?

## 7. Aprovação
O vídeo só está aprovado se todas respondem "sim": **história** funciona · **clareza** fácil de entender · **ritmo** progride · **cortes** intencionais · **visual** sei onde olhar · **texto** correto e legível · **movimento** controlado · **gráficos** explicam · **integração** ok · **efeitos** têm função · **voz** clara · **trilha** sustenta · **SFX** reforça sem exagerar · **mix** com hierarquia · **cor** coerente e da marca · **técnico** `qc.mjs` sem crítico · **entrega** arquivo = destino.

**Premium não é mais efeito: é nada parecer acidental.** Decisões precisas, consistência, clareza, timing, boa tipografia, assets bons, contenção e ausência de erro. Ferramentas medem o sinal; o olho julga a imagem. A aprovação precisa dos dois.
