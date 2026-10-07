# Galeria de formatos (tarefa 027)

Global: todas as empresas usam. **Formato** = o como (texto cinético, meme, antes × depois…); **tipo de conteúdo** = o porquê (educativo, identificação, humor, bastidor, prova, produto, lançamento, oferta).

```
library/formatos/<id>/
  formato.json   verbete (schema/format.ts): essência, tipos, funil, canais, proporções, estrutura,
                 quando usar/não usar, variações, observações e nota do Oliver, exemplos, referências
  refs/          prints de referência (de terceiros: fora do git)
```

- **ativo** = tem a skill `.claude/skills/fmt-<id>/` (o que a IA executa). **rascunho** = referência solta; repetiu 2–3 vezes → vira skill.
- **Exemplos** apontam para a peça (`companies/<empresa>/contents/<pasta>`), a mídia não é copiada.
- **Observações do Oliver mandam sobre a skill.** A IA lê antes de produzir.
- Peça → formato: `formato` no `peca.json`. `node tools/review.mjs <pasta>` mostra o formato no topo.
- App: aba **Formatos** (galeria, verbete, "Usar num conteúdo novo", "Marcar numa peça", "Promover como exemplo", "Nova referência"). Na peça: campo **Formato** na Ficha.
- Formato novo com skill: criar `fmt-<id>` (skill-creator) + `formato.json` com `status: ativo`; `npm run validate` confere se a skill existe.
