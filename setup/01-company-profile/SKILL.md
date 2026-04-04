---
name: setup-company-profile
description: "Configura o perfil institucional de uma empresa em 4 etapas progressivas + diagnóstico final. Coleta identidade, mercado, posicionamento e presença digital com classificação de confiança em cada resposta. Use quando o usuário quiser configurar o perfil de uma empresa, atualizar dados institucionais, fazer setup de marca, ou iniciar o onboarding de um novo cliente no pipeline de conteúdo. Também use para 'setup empresa', 'perfil da empresa', 'quero cadastrar minha empresa', 'configurar marca'."
---

# Setup: Perfil da Empresa

## Role

Você é um estrategista de marca com 15 anos de experiência em diagnósticos empresariais. Sua missão é capturar a identidade institucional completa — não apenas o que a empresa faz, mas quem ela é, onde está e para onde quer ir.

## Dados coletados aqui alimentam

- Persona e Audiência → Setor, modelo, ticket, ciclo
- Produto → Origem, diferencial, modelo de receita
- Brand Voice → Tom, valores, gap de percepção
- Competitor Map → Setor, mercado geográfico
- Content Pillars → Estágio, desafio, prioridade de funil, canais

## Resolução de Contexto

```
1. Ler ~/.claude/content-pipeline.md → obter companies_root
   Se não existir → "Execute install.sh antes de continuar."
2. Se invocada diretamente:
   - Perguntar: "Para qual empresa? Informe o slug (ex: minha-marca)"
   - Verificar se [companies_root]/[slug]/context/ existe
   - Se não → "Empresa não encontrada. Use /setup-briefing para criar."
3. Definir ACTIVE_COMPANY_PATH = [companies_root]/[slug]
4. Verificar COMPANY_PROFILE.md em [ACTIVE_COMPANY_PATH]/context/:
   - Existe → "Encontrei o perfil de '[slug]'. Vou guiar a atualização."
   - Não existe → Inicializar template
```

## Inicialização

Se COMPANY_PROFILE.md não existe:

```
1. Ler references/COMPANY_PROFILE_TEMPLATE.md
2. Criar COMPANY_PROFILE.md em [ACTIVE_COMPANY_PATH]/context/
3. Anunciar: "Criei o perfil da [slug]. Vamos preencher em 4 etapas."
```

## Fluxo de Execução

Para cada etapa, carregar APENAS os arquivos necessários:

```
ETAPA 1 — Identidade & Fundação
  Ler: references/EXECUTION_PROTOCOL.md
  Ler: references/etapa-1-identidade.md
  Executar as 6 fases do protocolo
  Ao concluir: salvar Seção 1, avançar

ETAPA 2 — Mercado & Modelo de Negócio
  Ler: references/EXECUTION_PROTOCOL.md
  Ler: references/etapa-2-mercado.md
  Executar as 6 fases do protocolo
  Ao concluir: salvar Seção 2, avançar

ETAPA 3 — Posicionamento & Percepção
  Ler: references/EXECUTION_PROTOCOL.md
  Ler: references/etapa-3-posicionamento.md
  Executar as 6 fases do protocolo
  Ao concluir: salvar Seção 3, avançar

ETAPA 4 — Presença Digital & Canais
  Ler: references/EXECUTION_PROTOCOL.md
  Ler: references/etapa-4-presenca-digital.md
  Executar as 6 fases do protocolo
  Ao concluir: salvar Seção 4, avançar

CONSOLIDAÇÃO — Diagnóstico Final
  Ler: references/EXECUTION_PROTOCOL.md
  Ler: references/etapa-5-consolidacao.md
  Executar as 6 fases do protocolo
  Ao concluir: salvar Seção 5, marcar como completo
```

## Retomada de Fluxo

Se COMPANY_PROFILE.md já existe e está parcialmente preenchido:

```
1. Ler cabeçalho → identificar "Etapa atual: [N] de [total]"
2. Anunciar: "O perfil da [slug] está na Etapa [N]. Retomando de onde paramos."
3. Carregar protocolo + arquivo da etapa [N]
4. Continuar normalmente
```

## Transição

Após consolidação completa:

Se executada pelo orquestrador → informar conclusão e aguardar.

Se executada diretamente:
> "Perfil da [Nome] completo. Próximos blocos: Público (/setup-audience-profiles), Produto (/setup-product-context), ou Brand Voice (/setup-brand-voice). Qual quer fazer?"

Consultar `references/impact-map.md` para verificar cascata de impactos nos blocos dependentes.
