# 010 — Enxugar a base de vídeo e criar níveis de edição

Status: feita · Depende de: 002 (material encerrado na Etapa 15)

## Objetivo
Gastar o mínimo de tokens por vídeo sem perder qualidade: cada vídeo carrega **só o que o nível pede**.

## Diagnóstico (2026-10-07)
- `knowledge/video/`: 24 arquivos, **~24,7 mil palavras (~45 mil tokens)**. Ler "tudo que é relevante" num vídeo custa mais que o próprio trabalho.
- Pacote de vídeo (skill `video` + moldes + 9 `fmt-*` + agentes + audio/locucao/orquestrar + BRAND kz): **~13 mil palavras**.
- **Sobreposições:**
  - movimento: `movimento.md` × `animacao-comportamento.md` × `curvas-e-polimento.md` (easing, overshoot e "nada parado" aparecem nos 3);
  - ritmo: `ritmo-e-leitura.md` × `pacing-e-atencao.md`;
  - som: `som.md` × `sound-design.md`;
  - montagem: `cortes-e-montagem.md` × `cobertura-e-reacao.md` × `b-roll.md` (boa parte é filmagem; hoje fazemos só motion);
  - frame: `visual-e-cor.md` × `design-e-composicao.md`;
  - processo: `esteira-de-producao.md` × skill `video` (as 5 etapas estão nos dois);
  - QC: checklists espalhados em 8 arquivos + `qc-final.md`.
- **Conteúdo de filmagem** (live action, roto, keying, talking head, podcast, esportes…) não serve ao MVP (motion de SaaS) e pesa ~25% da base.

## Proposta
1. **`knowledge/video/REGRAS.md` (~1,5–2 mil palavras):** o 20% que dá 80% da qualidade, em valores prontos (durações e molas, leitura, áreas seguras, cor, tipografia/legenda, transições, SFX/mix, partículas, export). **É a única leitura obrigatória do nível médio.**
2. **Fundir os temas** em ~8 arquivos de referência profunda (só nível alto ou dúvida pontual): `movimento` (3→1), `ritmo` (2→1), `som` (2→1), `frame` (2→1), `montagem` (3→1, com filmagem em seção final), `texto-e-dados`, `efeitos` (transições + compositing + partículas), `qc-final`. Meta: **≤ 13 mil palavras no total (−45%)**, sem perder regra útil.
3. **Skill `video` com 3 níveis** (default **médio**):
   | | simples | **médio (default)** | alto |
   |---|---|---|---|
   | leitura | BRAND + receita `fmt-*` | + `REGRAS.md` | + referências do tema + estilo |
   | plano | falas + folha curta no chat; segue sem portão se o pedido já for claro | `plano.md` enxuto + 1 style frame → **aval** | plano completo + 2–3 style frames → aval |
   | conferência | `timeline.mjs check` + `qc.mjs` | + 1 rodada de folhas de contato | passadas do `qc-final.md` + revisor + **2ª iteração** de polimento |
   | áudio | trilha da biblioteca, sem SFX extra | trilha + SFX nos gestos-chave | sound-designer completo |
4. **`fmt-*` mais curtos** (~350 palavras): só a receita própria; o comum vai para `REGRAS.md`.
5. Agentes e `CLAUDE.md` apontam para o nível, não para listas de arquivos.
6. `esteira-de-producao.md` some (vira a skill). INDICE e material bruto ficam (são registro, não são lidos em produção).

## Critérios de pronto
- Médio lê ≤ ~5 mil palavras além do roteiro (skill + REGRAS + fmt + BRAND).
- Nenhuma regra de valor perdida (checar com uma lista das regras numéricas antes/depois).
- Grep sem referência quebrada a arquivo antigo.

## Log
- 2026-10-07: análise e proposta registradas.
- 2026-10-07: feita.
  - `knowledge/video/`: 24 arquivos (~24,7 mil palavras) → `REGRAS.md` (núcleo, ~1,4 mil) + 10 temas; **~12,3 mil palavras no total (−50%)**. Fusões feitas por 6 subagentes em paralelo, cada um com teto de palavras e a lista das regras essenciais do tema; o `REGRAS.md` foi montado com essas listas.
  - Skill `video` reescrita com 3 níveis (simples · médio = padrão · alto), absorvendo a `esteira-de-producao.md`.
  - 5 `fmt-*` de vídeo: ~780 → ~545 palavras cada (estilo default + motor no topo; regras gerais removidas).
  - Agentes, `audio`, `carousel`, `locucao`, molde de marca e roadmap apontam para os nomes novos; nenhuma referência quebrada (grep).
  - Leitura do nível médio: skill `video` (~1 mil) + `REGRAS.md` (~1,4 mil) + `fmt-*` (~550) + `BRAND.md` (~600) ≈ **3,6 mil palavras** (antes, "ler o relevante" passava de 10 mil).
  - Achado de quebra: o `.gitignore` (`**/audio/`) escondia a skill `audio`, `tools/audio/` e os catálogos de `library/audio/` do git. Corrigido para `companies/**/audio/` e os arquivos foram versionados.
