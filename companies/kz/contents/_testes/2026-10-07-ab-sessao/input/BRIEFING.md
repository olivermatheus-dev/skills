# Briefing: vídeo de apresentação da KZ (teste A/B de custo)

**Empresa:** kz · **Data:** 2026-10-07

## Entradas (iguais para as duas versões)
- `voz-final.mp3`: voz final já gerada no ElevenLabs (Eleven v4, voz Carla). **Não gerar outra voz.** Usar como está e encaixar as cenas nos tempos dela (transcrever para obter os tempos por palavra).
- `refs/`: prints reais da plataforma (sala da sessão online, Meu Consultório, Meus Clientes, sessões do cliente). Contêm dados mockados e menus de admin: usar **só como base visual**. Não recriar a plataforma inteira; recriar trechos simplificados e bonitos, na marca, só para exibir a ideia de cada fala. Não mostrar menus de admin nem e-mails/nomes reais (usar nomes fictícios).

## Texto enviado ao ElevenLabs
> Se você é terapeuta, imagine começar cada sessão com tudo o que precisa já à sua frente. O histórico do paciente, suas anotações, o que foi trabalhado antes e o que você planejou para aquele encontro. Tudo organizado para você entrar na sessão sabendo exatamente de onde continuar. E se o atendimento for online, você nem precisa mudar de ferramenta. A chamada acontece ali mesmo, dentro da sua rotina de trabalho. Antes da sessão, você pode se preparar com calma. Durante o atendimento, encontra rapidamente as informações importantes. E depois, mantém tudo organizado para o próximo encontro. Menos abas abertas. Menos informações espalhadas. Menos tempo tentando lembrar onde você anotou alguma coisa. E mais espaço para se concentrar no que realmente importa: o seu paciente! Essa é a KZ. Uma forma mais simples de organizar seus atendimentos e cuidar da sua rotina profissional. Conheça a KZ.

## Entrega
- MP4 em motion graphics (skill `video`, nível médio), formato principal 9:16; 4:5 se sobrar.
- Trilha de fundo discreta da biblioteca (só com licença) e sound design leve.
- QC final com `node tools/video/qc.mjs <pasta> --sheet`.
- Sem aprovação intermediária do Oliver neste teste: siga direto do plano ao MP4 (as decisões ficam registradas no `plano.md` da pasta).
