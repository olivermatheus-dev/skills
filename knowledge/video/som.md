# Som

> Fontes: Etapa 5 + guia do Ludus (consolidado em 2026-10-07). Valores = ponto de partida. Ferramentas, biblioteca, fichas e licenças: skill `audio` e `library/audio/README.md`. O Claude **não escuta**: confere sincronia, metadados e medição; ouvido final = Oliver.

## 1. Princípio e hierarquia
- Todo efeito tem **função nomeável** (reforçar ação, tornar movimento perceptível, continuidade, antecipação, ênfase, mudança, espaço, materialidade, feedback, ritmo). Sem função → fora.
- O asset não é o sound design; a decisão de como ele entra é.
- Prioridade: fala → sons necessários para entender → sound design → música → ambiência. Sem fala, música ou SFX podem protagonizar.

## 2. Andamento e sincronia
- **BPM antes de animar:** calmo 70–95 · médio 96–115 · energia 116–128. 1 batida = 60/BPM s (120 BPM = 0,5 s = 15 quadros a 30 fps).
- Troca de ideia em tempo forte, a cada **2 ou 4 batidas**; não corte em toda batida (critério de sincronia: `ritmo.md`).
- Som e imagem no **mesmo quadro**. Na dúvida, visual 1 quadro antes; **nunca o som antes**.
- **align `peak`:** o pico do arquivo cai no quadro do evento / de maior velocidade visual (whoosh, impact, riser). `start` só para click/pop.

## 3. Música como narrativa
- Não é papel de parede: varie energia, instrumentação e presença. **Tirar a música** num momento-chave pode pesar mais que somar.
- Entrar/sair em pontos musicais (início de frase, mudança harmônica, build, drop, resolução); drop no quadro da virada.
- Reduzir densidade antes de um evento costuma funcionar melhor que riser.
- Com voz: trilha sem melodia no registro médio (mais grave/aguda ou simples).
- Trilha 100% sintetizada serve para pulsos/impactos/risers; vídeo-chave → considerar faixa licenciada.

## 4. Decisão por evento
| evento visual | som |
|---|---|
| movimento grande / pequeno (UI, card) | whoosh / swish |
| chegada, impacto, reveal | impact (+ sub para massa) |
| expectativa | riser 1–4 s (longo) ou reverse (curto, termina no evento) |
| resolução | impact, drop, downer ou **silêncio** |
| microinteração | click, tick, pop |
| transição narrativa | sound bridge (áudio atravessa o corte) |
| passagem premium | transição tonal **no tom da trilha** |
| contato físico | foley (só o que merece presença) |
| nada disso | **nenhum efeito** |

- **A maioria dos eventos não ganha som.** Hard cut não precisa de som.
- Escolha: função → intensidade → caráter → duração → escala → só então buscar. **2–4 candidatos** testados com imagem, voz e música; nunca o primeiro resultado.

## 5. Regras por tipo
- **Riser** sempre resolve (impact, corte, silêncio, drop, reveal).
- **Silêncio** seco de 0,2–0,5 s logo antes do impacto da revelação.
- **Impact forte** só onde há peso real; existe sutil/seco/digital/elegante. **Sub** dá peso, não volume; com moderação.
- **Impacto da marca:** hit + cauda (reverb 2–4 s); motivo de 3–5 notas que volta na revelação.
- **Downer** só quando a energia visual também desce.
- **Transições:** whip → whoosh rápido · slide → swish direcional · zoom → whoosh/tonal · reveal → reverse + impact leve · cinematográfica → riser + impact. Whoosh começa 4–8 quadros antes do movimento.
- **Motion:** sonorize **eventos perceptivos** (início, encaixe/snap, assentamento, reveal, sumiço), não keyframes. 1 animação = 1–2 sons (card: swish → click).
- **Layering:** movimento + impacto + tonal (+ sub), cada camada resolvendo uma dimensão. Nunca empilhar "para parecer profissional".
- **Escala/direção/espaço:** pequeno/rápido = curto e leve; pesado = grave. Pan ≤ ~30% L/R em movimento lateral claro. Motion flat: seco ou room curto consistente.

## 6. Família e anti-repetição
- **Uma família por vídeo** (identidade em `BRAND.md` > Som; vazio = minimalista premium: clicks discretos, soft impacts, *air*, tonais sutis).
- Evento repetido: 3–5 variantes alternadas, ou pitch ±1–2 semitons / ganho ±5%. Nunca o mesmo arquivo perceptível em série.
- **Proibido por padrão:** whoosh em todo zoom · pop em toda legenda · impact em toda palavra · riser antes de toda transição · click em todo gráfico · bass drop em toda punchline.

## 7. Densidade por intensidade (escala 0–4 de `ritmo.md`)
| nível | som |
|---|---|
| 0 | ambiência, quase nenhum efeito |
| 1 | sound design invisível |
| 2 | microinterações e movimentos seletivos |
| 3 | whooshes, impacts, transições, sincronia musical |
| 4 | layering e contraste máximos, **curto** |

## 8. Mix e entrega
- **Ducking** da trilha sob voz: **−8 a −12 dB**, ataque ~100 ms, retorno 300–500 ms; revisar transições (subida no meio de frase, buracos).
- UI SFX **12–20 dB abaixo da voz**.
- Crossfade 5–20 ms contra estalos; 0,3–2 s em ambiência.
- **−14 LUFS integrado (±1)** · **true peak ≤ −1 dBTP** · LRA ~4–10 LU; sem compressão esmagando.
- Medir sempre e registrar no `plano.md`. Fonte sem licença registrada não entra.

## 9. QC (6 passadas + medição)
- [ ] **Função:** cada som tem motivo; sem resposta → removido.
- [ ] **Sincronia:** pico no quadro do evento; som nunca antes da imagem; risers resolvem.
- [ ] **Escala:** tamanho/peso do som = do que se vê.
- [ ] **Repetição:** nenhum arquivo perceptível repetido; família única.
- [ ] **Mix:** nada compete com a voz; ducking revisado.
- [ ] **Remoção:** tirou e ficou igual → fora.
- [ ] **Medido:** −14 LUFS ±1, TP ≤ −1 dBTP, registrado no plano.
- [ ] Entrega diz "ouvido final: Oliver".
