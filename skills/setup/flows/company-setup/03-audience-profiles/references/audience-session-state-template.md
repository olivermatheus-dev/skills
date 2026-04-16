# AUDIENCE_SESSION_STATE — [Empresa]

> Template em branco. Copiar para `[ACTIVE_COMPANY_PATH]/audiences/AUDIENCE_SESSION_STATE.md` ao iniciar novo mapeamento.
> Este arquivo registra o estado da sessão de mapeamento de públicos do Bloco 3 (distinto do `context/WORKFLOW_STATE.md`, que é do pipeline de conteúdo, e dos `contents/<peça>/WORKFLOW_STATE.md`, que são por peça).
> Atualizar campos conforme cada skill avança. Não apagar campos — usar "pendente" ou "pulada" como valores quando não aplicável.

---

## Sessão Atual
- empresa: [nome da empresa]
- data_inicio: [YYYY-MM-DD]
- publico_ativo: [nome do segmento sendo processado agora]
- audience_file: [ACTIVE_COMPANY_PATH]/audiences/AUDIENCE_[slug].md

---

## Públicos Mapeados (atualizado pela Skill 4.1)

| # | Nome do Segmento | B2B/B2C | Prioridade | Decisor B2B | Status R1 | Status Geral |
|---|-----------------|---------|------------|-------------|-----------|--------------|
| 1 | [nome] | [B2B/B2C] | Alta/Média/Baixa | [cargo se B2B] | executada/pulada | pendente |
| 2 | [nome] | [B2B/B2C] | Alta/Média/Baixa | [cargo se B2B] | executada/pulada | pendente |

---

## Flags B2B (atualizado pela Skill 4.1)
- b2b_bifurcacao: false
- perfis_relacionados: []
- perfil_ativo: —

---

## Estado das Pesquisas
- r1_status: pendente
- r1_lista_concorrentes: []
- r2_status: pendente
- r3_status: pendente
- r4_status: pendente
- r5_status: pendente
- r6_status: pendente

---

## Estado da Persona — [Nome do Público] (atualizado pela Skill 4.2)
- persona_ativa: pendente
- rings_pendentes: [3, 5]

---

## Campos Reservados para Skill 4.3 — [Nome do Público]

> Estes campos são coletados na Skill 4.2 mas só usados na Skill 4.3.
> NÃO inserir no AUDIENCE_[nome].md ainda — a Skill 4.3 fará isso.

- p2_6_pesquisas_noturnas: pendente
- p2_7_vergonha: pendente
- p2_8_jantar_bem_sucedidos: pendente
- p3_9_narrativa_interna: pendente

---

## Estado Dores/Desejos — [Nome do Público] (atualizado pela Skill 4.3)
- dores_mapeadas: false
- citacoes_literais: []
- r4_status: pendente
- rings_completos: []

---

## Estado 9 Tipos — [Nome do Público] (atualizado pela Skill 4.4)
- mapa_9_tipos: pendente
- tipos_priorizados: []
- tipo_negligenciado: pendente

---

## Estado Consciência — [Nome do Público] (atualizado pela Skill 4.5)
- audience_completo: false
- nivel_consciencia_predominante: pendente
- distribuicao_conteudo: pendente
- r5_status: pendente

---

## Próxima Ação
- proxima_acao: Skill 4.1 — Target Audiences

---

## Histórico de Sessões

| Data | Skill Executada | Público | Resultado |
|------|----------------|---------|-----------|
| [data] | [skill] | [público] | [concluído/pausado] |
