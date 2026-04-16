# Contexto do Produto — TestCo

> Gerado pela Skill S2 (Setup, Bloco 2).
> **Última atualização:** 2026-04-16

## Tipo de Produto
- **Categoria:** SaaS (assinatura recorrente mensal)

## O que é (descrição informal)
Plataforma que automatiza testes end-to-end para aplicação web. Pluga no repo, grava o fluxo uma vez (ou a IA grava a partir de sessão real de usuário), roda tudo a cada deploy. Quando o teste quebra por mudança de UI, a IA conserta sozinha em 90% dos casos — você revisa só o PR do conserto.

## Módulos / Funcionalidades principais
1. **Gravador inteligente** — captura fluxos de cliques ou converte sessões reais em testes
2. **Engine de auto-reparo** — detecta testes quebrados e sugere fix automático
3. **Execução paralela em cloud** — milhares de testes em minutos sem infra própria
4. **Integração CI/CD** — GitHub Actions, GitLab CI, CircleCI, Jenkins
5. **Dashboard de flakiness** — mostra testes instáveis com heatmap temporal

## Problema central que resolve
Times de engenharia gastam 15–20% do tempo mantendo testes E2E que quebram a cada refator. O TestCo elimina essa manutenção — os testes se consertam sozinhos.

## Anti-persona (para quem NÃO é)
Empresas com <5 devs (custo alto pro estágio), times que não rodam CI/CD, ou produtos mobile-nativos (foco é web).

## Diferenciais competitivos
- IA proprietária de auto-reparo (não wrapper de LLM) — 90% de conserto autônomo
- Setup em 5 min via CLI vs. semanas dos concorrentes
- Integração com session replay (converte sessões reais em testes)
- Transparência do engine — mostra em linguagem natural o que mudou e por quê

## Detalhes comerciais
- **Faixa de preço:** R$499/mês (5 devs) até R$4.999/mês (50+ devs); enterprise sob consulta
- **Modelo:** Assinatura mensal, precificada por seats; trial 14 dias

## Objeção principal pré-compra
"Já temos Cypress há 2 anos — migrar vai travar o time por semanas."

## Prova social disponível
- 180 empresas ativas, incluindo 4 unicórnios brasileiros (NDA)
- Case: Fintech X reduziu CI de 42min para 8min em 30 dias
- 450 stars no GitHub labs
- NPS 72 (Q1/2026)

## Time-to-value
Primeiro teste rodando em <10 min. Primeiro auto-reparo (wow moment) em ~1 semana.

## Features subestimadas
- **Dashboard de flakiness** — clientes descobrem que 30% dos testes eram flaky antes
- **Integração com session replay** — converter sessões em testes é o que mais surpreende

## Limitações do produto
- Foco exclusivo em web (não roda mobile nativo)
- Não substitui testes unitários
- Auto-reparo precisa de 2-3 execuções históricas
- Não atende stacks legacy (jQuery puro, PHP SSR sem SPA)

## Proposta de valor em uma frase
"Testes E2E que se consertam sozinhos — pare de mexer em teste quebrado a cada deploy."
