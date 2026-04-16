# Skills Catalog

Esta pasta passa a ser o catalogo central de skills do repositorio.

Estrutura alvo:

- `content/`: fluxos e skills de producao de conteudo.
- `setup/`: fluxos e skills de configuracao de empresa.
- `marketing/`: skills de marketing reutilizaveis e material compartilhado.

Convencoes iniciais:

- `flows/` guarda fluxos compostos com subpastas internas.
- `standalone/` guarda skills avulsas.
- a publicacao para `~/.claude/skills` e controlada por `scripts/skills-manifest.txt`.
- durante a migracao, o instalador prioriza caminhos novos dentro desta pasta e usa fallback para os caminhos legados na raiz.