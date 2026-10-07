# QC final e polimento

> Fontes: qc-final.md, material "Etapa 14" (consolidado em 2026-10-07). Valores = ponto de partida.

## 1. Princípio
- Entrega = MP4, não timeline. Uma pergunta por passada; macro antes de micro. Estrutura errada → volta ao plano.
- Claude confere quadros, medições e metadados; Oliver ouve e vê no celular.
- **Nível de esforço (skill `video`):** simples = só `timeline.mjs check` + `qc.mjs`; médio (default) = + 1 rodada de folhas de contato com as passadas 1, 6, 7 e 14–15; alto = todas as passadas + agente revisor + 2ª iteração.

## 2. Passadas (nesta ordem)
| # | passada | pergunta | como o Claude confere | critérios |
|---|---|---|---|---|
| 1 | história | promessa → desenvolvimento → payoff? | ler `timeline.json` (falas + on_screen) inteiro | `direcao.md` |
| 2 | remoção | tirar o trecho perde informação, emoção ou ritmo? | teste de remoção por cena | §3 |
| 3 | gancho e final | claro em 2 s? termina na hora? | 1º e último quadros | `ritmo.md` · `direcao.md` |
| 4 | cortes | por que este corte aqui? | quadros antes/depois da troca | `montagem.md` |
| 5 | ritmo | onde cansa ou corre? | `node tools/video/timeline.mjs check` + curva de intensidade | `ritmo.md` |
| 6 | frame | sei onde olhar? borda, tangência, sob a interface? | folhas nos 2 formatos, tamanho de celular | `frame.md` |
| 7 | texto e legenda | correto, legível? legenda na fala e sem som? | texto da `composition.html` × plano × contexto; `words` × captions | `texto-e-dados.md` |
| 8 | movimento | um sistema só? estabiliza? | quadros intermediários das animações | `movimento.md` |
| 9 | dados | valor, unidade, fonte; fala = gráfico? | `data/*.json` × tela × fala | `texto-e-dados.md` |
| 10 | efeitos | função e integração? | remoção + versão 20% mais sutil | `efeitos.md` |
| 11 | som | voz inteligível? SFX repetido? | medições + `sfx` × `events` (Claude **não escuta**) | `som.md` |
| 12 | consistência | cena de outro vídeo? | folha inteira | `BRAND.md` · `frame.md` |
| 13 | técnico | bate com o destino? | `node tools/video/qc.mjs <pasta> --sheet` | §5 |
| 14 | pós-render | MP4 = aprovado? | folha **do MP4** | §5 |
| 15 | ouvido e celular | soa bem? funciona pequeno? | **Oliver** (§6) | — |

## 3. Editorial
- Tempo investido não justifica trecho; motion que não serve sai. Redundância fala × texto × visual → tire um.
- "Por que isto agora?" Zona morta → editar, não efeito. Hiperestímulo → corte camadas.

## 4. Triagem
Classifique antes; crítico primeiro.

| nível | exemplos | efeito |
|---|---|---|
| **crítico** | dado/nome errado, afirmação sem fonte, placeholder, proibição da marca, fora da área segura, quadro preto/flash, clipping, sem áudio, dessincronia, formato errado | bloqueia |
| **maior** | ilegível no celular, ritmo arrastado, cor fora da marca, efeito sem função, SFX repetido, loudness fora | corrigir antes |
| **menor** | espaçamento, micro-curva, nome de arquivo | se barato; senão registrar |

**Causa, não sintoma:**
| parece… | olhe primeiro | antes de… |
|---|---|---|
| lento | estrutura e remoção | adicionar cortes |
| vazio | composição | partículas |
| fraco | hierarquia | glow |
| sem impacto | timing | SFX |
| colado | integração (`efeitos.md`) | sombra |
| voz baixa | ducking | subir ganho |
| cor estranha | BT.709 | recolorir |

Parar quando o espectador não perceberia. A última passada refina, não reinventa. Cena densa: teste tirar o primeiro candidato.

## 5. Técnico e entrega
| item | valor social (default) |
|---|---|
| resolução | 1080×1350 · 1080×1920 · 1920×1080; pixel quadrado |
| quadros | 30 fps CFR, progressivo, = timeline |
| vídeo | H.264, `yuv420p`, BT.709 marcado (`tecnico.md`), CRF 16–18 |
| áudio | AAC 48 kHz estéreo, 256–320 kbps |
| loudness | −14 LUFS integrado (±1), true peak ≤ −1 dBTP; broadcast −23: siga o destino (`--lufs`) |
| legendas | queimadas |
| nome | `<AAAA-MM-DD>-<nome>-<formato>-vNN.mp4`; nunca `final.mp4` |

- Versões `vNN` em `exports/`; nunca sobrescreva aprovada (registrada no `plano.md`). Master (quadros ou CRF ≤ 12) local em `render/`, fora do git; recortes saem dele.
- Grão, partículas, degradê escuro comprimem mal: blocos/banding no MP4 → baixar CRF ou reduzir efeito; degradê grande: dither 1–2%.
- Pré-render: sem camada esquecida, print provisório ou asset sem licença.

**`qc.mjs`** (sempre antes de entregar), em todo MP4 de `exports/`: placeholders/"a confirmar" nos fontes; propriedades da tabela acima e duração = timeline; áudio presente, LUFS e true peak; preto, flash de 1–3 quadros, congelado ≥ 1,5 s; nome. `--sheet` → folha do MP4 em `render/qc/`. ❌/⚠️/· = crítico/maior/menor; código 1 se crítico.

## 6. Só o Oliver confere (listar na entrega)
- [ ] Fone: cortes na voz, cliques, música brigando com a voz.
- [ ] Alto-falante do celular: voz clara sem grave?
- [ ] Celular, tela cheia e pequeno: texto, legenda, cor.
- [ ] Sem som: dá para acompanhar?
- [ ] Rascunho no Instagram: interface cobre? recompressão?

## 7. Aprovação
Tudo "sim": história · clareza · ritmo · cortes intencionais · sei onde olhar · texto correto · movimento controlado · gráficos explicam · efeitos com função · voz clara · trilha e SFX sem exagero · mix com hierarquia · cor da marca · `qc.mjs` sem crítico · arquivo = destino. Premium = nada parece acidental.
