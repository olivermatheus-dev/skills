# 017 — Geração criativa com IA: Higgsfield (vídeo), Suno (trilha), ElevenLabs (voz)

Status: rascunho (futuro) · Liga com: 016 (publicidade criativa), 014 (galeria), skills `audio` e `locucao`
Pedido do Oliver em 2026-10-07: integrar geração de vídeo com IA (Higgsfield), trilhas (Suno) e voz (ElevenLabs) para montar peças publicitárias fortes (anúncios, pequenos comerciais).

## Papel de cada uma no fluxo
| ferramenta | para quê | entra onde |
|---|---|---|
| **ElevenLabs** | voz final (já no fluxo: v1.0 gratuita → roteiro no formato ElevenLabs → encaixe) e SFX gerados | skill `locucao`; `tools/audio/elevenlabs-sfx.mjs` |
| **Suno** | trilhas originais por objetivo e tom | skill `audio` → `library/audio/music.json` com licença |
| **Higgsfield** | planos de vídeo gerados por IA (cenas reais/cinematográficas, B-roll, personagens) | cenas de vídeo combinadas com motion (013) e galeria (014) |

## Regras desde já
- Chaves só no `.env` (`ELEVENLABS_API_KEY` já existe; adicionar as outras quando integrar). Cada ferramenta lê só a própria chave.
- **Licença comercial confirmada antes de usar em anúncio** (planos e termos mudam; registrar no catálogo como qualquer asset).
- Gerado por IA nunca como **prova** (depoimento, resultado, número). Saúde: nada que pareça paciente ou resultado clínico.
- Gerar em lote barato, escolher, e só então refinar (mesma lógica de "peneira" da 012).

## Antes de implementar
- [ ] Verificar se Higgsfield e Suno têm API ou só interface web (se só web: fluxo manual ou via navegador, como o ElevenLabs hoje).
- [ ] Custos e planos de cada uma; quem gera (Oliver manualmente × agente).

## Log
- 2026-10-07: integração registrada para o futuro.
