# Sound design e uso da biblioteca de efeitos

> Base: material do usuário "Etapa 5" (2026-10-07), verificado e complementado com valores iniciais. Mixagem, loudness, música e BPM ficam em `som.md`. A biblioteca (onde estão os arquivos, metadados, como buscar) está em `library/audio/README.md` e na skill `audio`.

## 1. Princípio
O som não é decoração colocada no fim: ele dá **movimento, velocidade, peso, escala, impacto, espaço, atmosfera, continuidade, antecipação, emoção e materialidade**. **Todo efeito precisa de uma função perceptiva nomeável.**

Funções possíveis:
- reforçar uma ação;
- tornar um movimento perceptível;
- criar continuidade;
- preparar um acontecimento;
- enfatizar;
- indicar mudança;
- criar atmosfera ou espaço;
- dar materialidade;
- dar feedback;
- sustentar o ritmo.

O melhor sound design não é notado como uma coleção de efeitos: **o asset não é o sound design; a decisão de como ele entra na cena é.**

## 2. Hierarquia (quem tem prioridade)
fala → sons necessários para entender o que acontece → sound design → música → ambiência.
Sem fala (sequência visual), a música ou o sound design podem assumir o protagonismo. Nem todos os elementos competem pela mesma atenção.

## 3. Sistema de decisão (por evento visual)
| existe… | considere |
|---|---|
| movimento importante | whoosh / swish (movimento) |
| chegada, impacto | impact / hit / sub |
| expectativa | riser (longo) ou reverse (curto) |
| resolução | impact, drop, downer ou **silêncio** |
| interação física | foley |
| ambiente | ambience / room tone |
| microinteração gráfica | click, tick, pop, UI |
| transição narrativa | sound bridge (o áudio atravessa o corte) |
| elemento musical | transição tonal compatível com a trilha |
| nada disso | **nenhum efeito** |

**Escolha do asset, nesta ordem:** função → intensidade (subtle/light/medium/strong/extreme) → caráter (clean, soft, organic, cinematic, digital, mechanical, playful, elegant, futuristic, dark, aggressive) → duração (short/medium/long) → escala (small/medium/large) → **só então** buscar candidatos. Nunca o primeiro resultado da palavra-chave.

**Audição:** separe 2–4 candidatos, teste **sincronizados com a imagem, com música e voz**, fique com o que integra melhor. Som incrível isolado pode falhar na mixagem.

## 4. Regras por tipo
| tipo | usar para | regra-chave |
|---|---|---|
| **whoosh** | deslocamento rápido, whip, swipe, entrada/saída grande, mudança de enquadramento | **o pico do som cai no quadro de maior velocidade visual** (não alinhe o início do arquivo ao início da animação). Pequeno/leve ↔ grande/grave |
| **swish** | cards, rótulos, UI, deslocamentos pequenos | quando um whoosh cinematográfico seria exagero |
| **impact** | título importante, reveal, virada, produto, clímax | existe sutil, seco, grave, metálico, digital, elegante; **forte só onde há peso real** |
| **sub impact** | massa sob reveals e mudanças de escala | dá peso, não volume; com moderação (grave em excesso cansa e embola) |
| **pop/click/tick** | aparição, seleção, check, números, bullets, UI | **varie**: 3–5 variantes da mesma família ou pitch ±1–2 semitons / ±5% de ganho; nunca o mesmo arquivo 20 vezes |
| **riser** | preparar reveal, drop, clímax, título | toda expectativa **precisa de resolução** (impact, corte, silêncio, drop, reveal). Duração inicial 1–4 s |
| **reverse** | anteceder um evento curto (texto, impacto, cena) | antecipação localizada; termina no quadro do evento |
| **downer** | fim, conclusão, queda, tom mais sério | só quando a energia visual também desce |
| **transição tonal** | passagem elegante/premium/emocional | **mesma tonalidade da trilha** (ou neutra); nunca conflitante |
| **foley** | passos, papel, teclado, xícara, objeto pousando | casar material, força, velocidade, superfície, distância; sonorizar **só o que merece presença física** |
| **ambience / room tone** | espaço e continuidade entre planos | nunca silêncio digital absoluto entre trechos de fala gravados numa sala |
| **sound bridge** | ligar cenas | antes de uma transição visual, veja se o áudio sozinho resolve |

## 5. Corte, transição e motion
- **Hard cut não precisa de som.** Só se houver movimento, impacto, mudança de espaço, ruptura ou intenção de estilo.
- **Transição com movimento claro:**
  - whip → whoosh rápido;
  - slide → swish direcional;
  - zoom → movimento tonal/whoosh;
  - reveal → reverse + impact leve;
  - cinematográfica → riser + impact ou transição tonal.
- **Camadas (*layering*):** movimento + impacto + tonal (+ sub), **cada camada resolvendo uma dimensão diferente**. Nunca empilhar para "parecer profissional".
- **Em motion, não sonorize keyframe.** Sonorize **eventos perceptivos**: início, aceleração, colisão/encaixe (*snap*), overshoot/assentamento, reveal, sumiço. Uma animação = 1–2 eventos sonoros. Ex.: card entra (swish discreto) → encaixa (click suave).
- **Escala:** pequeno ↔ som pequeno; rápido ↔ curto; pesado ↔ mais grave. Quebrar só de propósito (humor).
- **Direção:** movimento lateral claro pode ter pan discreto (até ~30% L/R), percebido como coerência, não como efeito.
- **Espaço/reverb:** o som mora no mesmo espaço da imagem. Seco demais em sala grande soa falso; reverb demais em close soa errado. Em motion "flat", prefira seco ou room curto e consistente.
- **Sweetening:** reforçar clique, contato ou textura para a ação convencer, sem denunciar o efeito.
- **Crossfade:** 5–20 ms para matar estalos em emendas; 0,3–2 s para ambiência e room tone. Só onde houver problema.

## 6. Densidade sonora segue a intensidade editorial (`pacing-e-atencao.md`)
| nível | som |
|---|---|
| 0 contemplativo | ambiência, foley, quase nenhum efeito |
| 1 natural | sound design invisível |
| 2 dinâmico | microinterações e movimentos seletivos |
| 3 energético | whooshes, impacts, ritmo, transições |
| 4 clímax | layering, impacto e contraste maiores, **por pouco tempo** |

## 7. Anti "YouTube genérico" (proibido por padrão)
- whoosh em todo zoom;
- pop em toda legenda;
- impact em toda palavra importante;
- riser antes de qualquer transição;
- click em todo gráfico;
- bass drop em toda punchline.

**O efeito reforça a intenção, não anuncia que houve edição.**

## 8. Identidade sonora (por marca, no `BRAND.md` > Som)
Defina os eixos:
- orgânico ↔ digital;
- suave ↔ agressivo;
- minimalista ↔ maximalista;
- elegante ↔ playful;
- cinematográfico ↔ natural;
- quente ↔ tecnológico.

Escolha também as **famílias preferidas** da biblioteca. Ex.: premium minimalista = clicks discretos, soft impacts, *air*, transições tonais sutis.

## 9. Controle de qualidade (6 passadas)
1. **Função:** por que este som existe? Sem resposta → remover.
2. **Sincronia:** movimento e som coincidem? Impacts no quadro certo? Os risers resolvem? O foley bate com a ação?
3. **Escala:** som compatível com o tamanho e o peso do que se vê?
4. **Repetição:** o mesmo arquivo aparece de forma perceptível? Troque por variantes.
5. **Mix:** compete com voz, música ou outros efeitos? (ver `som.md`)
6. **Remoção:** tire o efeito. Se continua igual, deixe fora.

O Claude **não escuta**: ele confere sincronia (quadro do evento × pico do arquivo), escala (metadados) e níveis (medição). O ouvido final é do usuário.
