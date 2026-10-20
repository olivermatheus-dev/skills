// monta o relatorio.json do módulo funcionalidades (Fulger, 2026-10-10)
const fs = require('fs');
const S = __dirname;
const ROOT = 'C:/Users/Oliver Matheus/Desktop/git/skills/companies/fulger';
const DIR = ROOT + '/intel/relatorios/2026-10-10-funcionalidades';
const { out } = JSON.parse(fs.readFileSync(S + '/merged.json', 'utf8'));
const m = JSON.parse(fs.readFileSync(ROOT + '/intel/matriz.json', 'utf8'));
const NOME = { aulvi: 'Aulvi', beaky: 'Beaky', eclasse: 'eClasse', ensinaapp: 'EnsinaApp', fluentdesk: 'FluentDesk', iorclass: 'iorCLASS', iprofe: 'iProfe', profeu: 'Profeu', proffin: 'Proffin', 'sistema-classis': 'Sistema Classis' };
const IDS = Object.keys(NOME);

// status do Fulger: matriz, corrigida pelo PRODUTO.md onde a matriz não sabe
const NOS_FIX = { 'lembrete-push': 'parcial', 'video-externa': 'nao' };
const nosDe = (id) => NOS_FIX[id] ?? m.cells._nos?.[id]?.status ?? 'desconhecido';
const NOS_TXT = { sim: 'Fulger: tem', parcial: 'Fulger: em parte', planejado: 'Fulger: planejado', nao: 'Fulger: não tem', desconhecido: 'Fulger: a confirmar' };
const NOTA_X = { 'lembrete-push': ' (lembrete sai pelo WhatsApp do professor)', 'video-externa': ' (tem vídeo próprio)', 'cobranca-automatica': ' (por decisão)' };

const score = (r) => r.sim.length + r.parcial.length / 2;
const rank = [...out].sort((a, b) => score(b) - score(a) || a.nome.localeCompare(b.nome));
const itens = rank.map((r) => ({
  grupo: r.grupo, nome: r.nome,
  tem: r.sim.map((i) => NOME[i]), parcial: r.parcial.map((i) => NOME[i]),
  nota: NOS_TXT[nosDe(r.id)] + (NOTA_X[r.id] || ''),
}));
const by = Object.fromEntries(out.map((r) => [r.id, r]));
const q = (id) => by[id].sim.length;

const matriz = {
  tipo: 'matriz', titulo: 'Matriz *completa*',
  sub: 'Matriz do app cruzada com o texto dos sites em 10/10/2026. "?" = não aparece no site.',
  colunas: ['Fulger', ...IDS.map((i) => NOME[i])], colunaNos: 0,
  linhas: m.features.map((f) => ({ grupo: f.group, nome: f.name, valores: [
    ({ planejado: 'nao', desconhecido: 'desconhecido' })[nosDe(f.id)] ?? nosDe(f.id),
    ...IDS.map((i) => (by[f.id].sim.includes(i) ? 'sim' : by[f.id].parcial.includes(i) ? 'parcial' : by[f.id].nao.includes(i) ? 'nao' : 'desconhecido')),
  ] })),
};

const sec = (id, titulo, eles, nos, sugestoes, extra = {}) => ({ tipo: 'secao', titulo, quantos: q(id), de: 10, status: ({ planejado: 'nao' })[nosDe(id)] ?? nosDe(id), eles, nos, sugestoes, ...extra });

const R = {
  empresa: 'fulger', nos: 'Fulger', modulo: 'funcionalidades', data: '2026-10-10',
  cabecalho: 'Fulger · Funcionalidades e como são vendidas',
  fonte: 'Fonte: matriz do app (09/10) + texto dos sites dos concorrentes (10/10/2026)',
  paginas: [
    { tipo: 'capa', titulo: 'Funcionalidades: *o que eles têm e como vendem*',
      subtitulo: 'Quantos dos 10 concorrentes têm cada funcionalidade, e a copy, o benefício e a dor que usam para vender cada uma.',
      pontos: [
        `**O piso do mercado é dinheiro e agenda:** controle de pagamentos (${q('controle-pagamentos')} de 10), agenda visual (${q('agenda-visual')}), Pix (${q('cobranca-pix')}), lembrete automático (${q('lembrete-push')}) e ficha do aluno (${q('ficha-aluno')}). Ter isso não diferencia ninguém.`,
        '**Ninguém vende pela função:** os melhores sites vendem pela cena. "Prof, pode remarcar? às 23h", "perder o controle de quem faltou e quem pagou".',
        '**Os vilões são a planilha e o WhatsApp:** 8 de 10 sites citam a planilha, e dois põem o WhatsApp no título como o problema.',
        `**O Fulger tem o que quase ninguém tem:** pacote que vira crédito (${q('pacote-credito')} de 10 completo), falta com regra de cobrança (0), link do aluno sem login (0) e videochamada própria (0).`,
      ],
      meta: [
        ['Concorrentes', '10: Aulvi, Beaky, eClasse, EnsinaApp, FluentDesk, iorCLASS, iProfe, Profeu, Proffin, Sistema Classis'],
        ['Critério', 'todos os concorrentes ativos (os 10 principais escolhidos pelo Oliver)'],
        ['Dados', 'matriz do app (09/10) cruzada com o texto dos sites (10/10). Conta só o que o site mostra: o que não aparece no site entra como "não vimos". Copy entre aspas é literal.'],
      ] },

    { tipo: 'ranking', titulo: 'Quantos têm *cada funcionalidade*', sub: 'As 45 funcionalidades da matriz, da mais comum à mais rara. Na etiqueta, a situação do Fulger.', total: 10, itens },

    { tipo: 'insights', titulo: 'Obrigação × *diferencial*',
      pontosTitulo: 'Como ler o ranking',
      pontos: [
        `**Obrigação (6 ou mais de 10):** controle de pagamentos, agenda visual, Pix, lembrete automático, ficha do aluno. Quem chega sem isso perde na comparação. O Fulger tem quatro: o **Pix está em parte** e o **lembrete não é automático** (sai pelo WhatsApp do professor).`,
        '**Comum (4 a 5):** diário de aula, presença, turmas, relatórios financeiros, cobrança automática, app do aluno, plano de aula, materiais. O mercado já espera, mas não é decisivo.',
        '**Raro (até 2):** reposição pelo aluno, mensagens prontas, confirmação de aula, pacote que vira crédito, falta com regra, link sem login, vídeo próprio. É aqui que está a **posição**.',
        '**A cobrança automática divide o mercado:** 5 de 10 cobram e dão baixa sozinhos. O Fulger não faz isso por decisão e precisa transformar a escolha em argumento.',
      ],
      sugestoesTitulo: 'O que isso pede',
      sugestoes: [
        'Na landing, mostrar o piso rápido (pagamentos, agenda, ficha, Pix) e gastar o espaço nobre no raro.',
        'Fechar o Pix copia-e-cola na cobrança antes do lançamento: é obrigação, e 7 de 10 já têm.',
        'Responder a "não é automático?" na própria página: o professor decide e a mensagem sai pelo WhatsApp dele.',
      ] },

    { tipo: 'cards', titulo: 'Como eles *vendem*', sub: 'O jeito de apresentar as funcionalidades, lido no texto de cada site.',
      itens: [
        { rotulo: 'Pela dor (4 de 10)', titulo: 'Aulvi, EnsinaApp, FluentDesk, Sistema Classis', texto: 'Abrem com a cena do problema ("Se você já passou por isso…", "Você se identifica?", "Sua rotina, antes e depois") e só depois listam a função. São os sites mais fortes do grupo.' },
        { rotulo: 'Pela função (4 de 10)', titulo: 'eClasse, iorCLASS, iProfe, Proffin', texto: 'Blocos com o nome da função e uma frase ("Gestão de Alunos", "Agenda e Horários"). Dor quase nunca nomeada. O eClasse não cita nenhuma.' },
        { rotulo: 'Pela automação (2 de 10)', titulo: 'Profeu e EnsinaApp', texto: '"Sua rotina de professor no piloto automático." "Você dá a aula; o resto anda sozinho." A promessa é o sistema fazer no lugar do professor.' },
        { rotulo: 'Pelo público (1 de 10)', titulo: 'Beaky', texto: 'Separa o que o aluno ganha (app, lições) do que o professor ganha (painel), e fecha com comparativo contra Notion e Classroom.' },
      ] },

    { tipo: 'cards', titulo: 'Os vilões e as *dores* mais usadas', sub: 'O que os sites nomeiam como problema, contado no texto das páginas.',
      itens: [
        { rotulo: 'Planilha (8 de 10 citam)', titulo: '"Adeus planilhas!" (Proffin)', texto: 'O vilão número 1. Proffin, Sistema Classis e iorCLASS citam mais de 10 vezes cada. Vira genérico: todo mundo é "contra a planilha".' },
        { rotulo: 'WhatsApp como bagunça', titulo: '"Suas aulas merecem mais que o WhatsApp." (EnsinaApp)', texto: 'EnsinaApp e FluentDesk põem o WhatsApp no título como o problema. Aulvi e Classis fazem o contrário: usam o WhatsApp como canal de entrega.' },
        { rotulo: 'Constrangimento de cobrar (3 de 10)', titulo: '"Receba sem o constrangimento de cobrar." (Profeu)', texto: 'Aulvi, Profeu e Sistema Classis. A Aulvi resolve como o Fulger: "a mensagem pronta. Você só encaminha." Os outros dois, com cobrança automática.' },
        { rotulo: 'Tempo e falta', titulo: '"Lembretes automáticos que reduzem faltas em até 40%." (Classis)', texto: 'O aluno que esquece e o professor "no vácuo". A Classis é a única que põe número na promessa.' },
      ] },

    sec('controle-pagamentos', 'Controle de pagamentos: *10 de 10*', [
      ['Sistema Classis', '"Saiba quem pagou, quem deve e quanto você vai ganhar no mês, em um segundo." Benefício: a previsão do mês. Dor: perder o controle.'],
      ['Aulvi', 'Dor explícita: "perder o controle de quem remarcou, quem faltou e quem já pagou". Mostra o recibo "Pago".'],
      ['Proffin', '"Adeus planilhas! Gerencie os pagamentos das aulas com clareza." Extrato por aluno.'],
      ['iorCLASS', 'Dor: não saber "para onde seu dinheiro está indo".'],
      ['eClasse, iProfe', 'Só o nome da função ("Controle dos pagamentos"), sem dor.'],
    ], 'Temos: contas a receber, pacote, estorno e relatórios. É obrigação, não diferencial.', [
      'Vender pela pergunta que dói: *"quem me deve este mês?"*, respondida numa tela.',
      'Juntar com o pacote e a falta: "o que cada aluno deve, já descontado o que ele faltou e o crédito que sobrou". Nenhum deles faz essa conta.',
    ]),

    sec('agenda-visual', 'Agenda visual: *8 de 10* (+2 em parte)', [
      ['Beaky', '"Sua semana inteira em uma tela." Junta agenda, receita e reposições.'],
      ['Sistema Classis', '"Calendário Inteligente: agende aulas sem conflitos." Dor: aulas sobrepostas.'],
      ['iorCLASS', 'Agenda de aulas junto com "seus compromissos pessoais". Dor: vida pessoal e aulas misturadas.'],
      ['EnsinaApp', '"Grade semanal": monta uma vez e o aluno agenda sozinho. Dor: agenda espalhada no WhatsApp.'],
      ['iProfe', '"Nunca perca um compromisso."'],
    ], 'Temos: semana, dia e mês, indisponibilidade e férias, painel do dia, agenda assinável no Google e no iPhone.', [
      'A agenda é obrigação. O que vende é o que ela evita: o choque de horário (Classis) e a semana montada sozinha (Aulvi).',
      'Mostrar a recorrência com alcance ("só esta, as próximas ou todas"): é o que tira o retrabalho de remarcar.',
    ]),

    sec('cobranca-pix', 'Cobrança por Pix: *7 de 10*', [
      ['Aulvi', '"A cobrança fecha aqui dentro." Chave Pix e copia-e-cola no recibo. Dor: "montar a conta na mão toda vez".'],
      ['EnsinaApp', '"PIX e pacotes": o aluno paga pelo painel, "sem comissão".'],
      ['FluentDesk, eClasse', 'Pix e boleto por gateway (Asaas). Venda pela automação.'],
      ['Profeu', '"Receba sem o constrangimento de cobrar."'],
      ['Beaky', 'Pix só a partir do plano Essential. Aparece no FAQ, não na vitrine.'],
    ], 'Em parte: a página de cobrança sem login existe; "Já paguei", comprovante e recibo estão em construção.', [
      'Fechar o Pix copia-e-cola na página `/pagar` antes do lançamento: 7 de 10 têm.',
      'Vender como a Aulvi: *a conta já somada, com o Pix pronto*. O aluno abre o link, sem app nem login.',
    ]),

    sec('lembrete-push', 'Lembrete de aula automático: *6 de 10*', [
      ['Sistema Classis', '"Lembretes automáticos que reduzem faltas em até 40%." No WhatsApp, com cota por plano. Dor: "aluno esquece da aula e você fica no vácuo".'],
      ['EnsinaApp', 'E-mail na véspera e aviso no dia. Dor explícita: o aluno que não aparece.'],
      ['FluentDesk', 'Push e e-mail para aluno, pai e professor. Dor: "cancelamentos sem aviso".'],
      ['Beaky', '"Dois lembretes automáticos, 15 min antes e quando a aula começa." Depende do app do aluno.'],
      ['Profeu', 'Pelo Telegram. O WhatsApp está "em breve".'],
    ], 'Em parte: "Aulas de amanhã" abre o WhatsApp com a mensagem pronta para todos os alunos, em um toque. Não é automático por decisão.', [
      'Vender o toque como vantagem: *"o lembrete sai do seu WhatsApp, com o seu jeito"*. O aluno lê no app que ele já usa, sem instalar nada.',
      'Não prometer redução de falta com número enquanto não houver dado nosso.',
    ]),

    sec('ficha-aluno', 'Ficha do aluno: *6 de 10*', [
      ['iorCLASS', '"Acompanhe todas as informações de seus alunos em uma única tela." Dor: planilhas que "fazem você gastar muito mais tempo para encontrar as suas informações".'],
      ['iProfe', 'Depoimento: com planilhas, "era um pesadelo".'],
      ['Sistema Classis', '"Cadastre, organize e acompanhe o histórico completo de cada aluno."'],
      ['Beaky', '"Cadastre seus alunos em menos de 5 minutos."'],
    ], 'Temos: ficha com resumo, objetivo, foto e abas de aulas, plano e financeiro.', [
      'Vender pela dor da Gaby: *"abrir o aluno e saber onde ele parou"*. Ninguém fala de continuidade pedagógica, só de cadastro.',
    ]),

    sec('diario-aula', 'Diário e anotações da aula: *5 de 10*', [
      ['iProfe', '"Saiba exatamente o que foi abordado na última aula." O melhor argumento do grupo.'],
      ['iorCLASS', 'Relatório "do que foi lecionado e realizado em cada aula", que vira extrato para o aluno.'],
      ['EnsinaApp', 'Notas públicas e privadas por aula.'],
      ['eClasse, Beaky', '"Diário de Classe Digital", "bloquinho de notas". Só o nome.'],
    ], 'A confirmar: o planejamento do aluno mostra a última aula dada; nota por aula não está no registro do produto.', [
      'Conferir no código se há nota por aula. Se houver, vender como o iProfe: *"comece a aula de onde parou"*.',
      'É a ponte para a Big Idea "tire sua escola da cabeça": a memória do professor fica no sistema.',
    ]),

    sec('presenca', 'Presença e frequência: *5 de 10*', [
      ['Aulvi', '"Confirmação em um toque" pela notificação. Dor: "perder o controle de quem remarcou, quem faltou e quem já pagou".'],
      ['Sistema Classis', 'Frequência em todos os planos, para "acabar com faltas e atrasos".'],
      ['FluentDesk', 'Status da aula: concluída, falta, cancelada.'],
      ['eClasse, Beaky', 'Presença dentro do diário ou de página customizada.'],
    ], 'Temos: presença, concluir e desfazer, "avisou". E a falta sem aviso cobra pela regra do professor.', [
      'Ninguém liga presença a dinheiro. Vender a junção: *"marcou falta sem aviso, a cobrança já sabe"*.',
    ]),

    sec('cobranca-automatica', 'Cobrança e baixa automáticas: *5 de 10*', [
      ['Sistema Classis', '"Fica sem graça de cobrar o aluno que atrasou → cobrança profissional e automática sem constrangimento."'],
      ['Profeu', '"Cobrança Automática: receba sem o constrangimento de cobrar."'],
      ['EnsinaApp', '"PIX cai e o pacote libera na hora."'],
      ['eClasse, FluentDesk', 'Faturas geradas sozinhas pelo Asaas, com juros e desconto.'],
    ], 'Não temos, por decisão: o professor confirma o pagamento e nada sai sozinho no nome dele.', [
      'Não brigar no "automático". Vender o controle: *"nenhuma mensagem sai sem você ver, e o dinheiro cai direto na sua conta, sem intermediário"*.',
      'A Aulvi prova que funciona: "a mensagem pronta. Você só encaminha." É o mesmo ângulo, então o Fulger precisa de acabamento melhor, não de outra promessa.',
    ]),

    sec('app-aluno', 'App ou portal do aluno: *5 de 10*', [
      ['Beaky', '"Tudo que você, como aluno, precisa entre uma aula e outra." App iOS e Android. Dor: procurar informação em conversas.'],
      ['EnsinaApp', '"Envie o link. Eles agendam, pagam e recebem tudo automático."'],
      ['FluentDesk', '"Área do aluno com sua marca. Não parece mais improviso."'],
      ['iorCLASS', 'App com agenda, anotações e pagamentos do aluno.'],
      ['eClasse', '"Portal do Cliente" para ver horário e pagar.'],
    ], 'Em parte: o app do aluno é básico, mas as páginas sem login (pagar, confirmar, entrar na sala) já existem. Nenhum concorrente tem isso.', [
      'Virar o jogo: *"seu aluno não instala nada"*. Contra a Beaky, que depende de app, e contra os portais com login.',
      'Usar a dor da FluentDesk a nosso favor: o link do Fulger também "não parece improviso".',
    ]),

    sec('relatorios-fin', 'Relatórios financeiros: *4 de 10* (+3 em parte)', [
      ['Proffin', '"Entenda seus resultados com clareza! Porque dar aula é também gerir com inteligência." Gráficos e previsão.'],
      ['iorCLASS', 'Relatórios para "entender melhor o seu faturamento".'],
      ['Sistema Classis', '"Saúde do Negócio: relatórios e métricas para entender e crescer."'],
      ['Beaky, EnsinaApp', 'Só o número da receita do mês no painel.'],
    ], 'Temos: relatórios do livro de entradas e saídas. O arquivo do Carnê-Leão e do MEI está em construção.', [
      'Quando o arquivo do imposto existir, é argumento único: nenhum dos 10 fala de Carnê-Leão nem de MEI.',
    ]),

    sec('plano-aula', 'Plano de aula e materiais: *4 de 10* cada', [
      ['Beaky', '"Planos de estudo ligados ao aluno." Dor: trabalho repetitivo de planejamento.'],
      ['iorCLASS', 'Plano "para que seus alunos saibam antecipadamente o que será realizado em cada aula".'],
      ['FluentDesk', 'Dor nomeada: "PDFs no Drive, links perdidos, arquivos sumidos".'],
      ['Profeu', 'IA que gera o plano de aula "em segundos".'],
      ['EnsinaApp', 'Materiais por aluno, PDF protegido.'],
    ], 'Plano em parte (quadro visual das aulas). Materiais: sim, em matéria, módulos e tópicos, reaproveitáveis entre alunos.', [
      'Vender como método: *"monte uma vez, use com todos os alunos"*. Os concorrentes guardam arquivo por aluno; o Fulger guarda o roteiro do professor.',
      'A dor da FluentDesk ("PDFs no Drive, links perdidos") é boa e pode ser adaptada na nossa voz.',
    ], { quantos: 4 }),

    sec('remarcacao', 'Remarcação e reposição: *2 de 10* (+2 em parte)', [
      ['EnsinaApp', '"Remarcação com regras, sem drama." Dor: "Prof, pode remarcar?" às 23h. A melhor cena de todos os sites.'],
      ['Beaky', '"O aluno remarca aula por conta própria" nos horários que o professor libera. Dor: "ping pong de mensagens". Os reels sobre isso são os que mais rendem.'],
      ['Aulvi', '"Nenhuma aula esquecida": aula não dada fica pendente até remarcar.'],
      ['FluentDesk', 'Remarcação com histórico; o aluno pede pelo sistema.'],
    ], 'Temos a remarcação pelo professor com alcance (só esta, as próximas, todas). A reposição pelo aluno está em construção.', [
      'Hoje: vender o alcance, *"remarcou uma, remarcou o semestre"*. Ninguém mostra isso.',
      'Quando a reposição pelo aluno sair: atacar a cena das 23h, pelo link e sem app.',
    ]),

    sec('pacote-credito', 'Pacote que vira crédito: *1 de 10* (+2 em parte)', [
      ['EnsinaApp', '"Pacotes de 4 ou 8 aulas", liberados quando o Pix cai. Sem crédito consumido aula a aula.'],
      ['Aulvi', 'Mensalidade antecipada em que a aula que não rolou vira crédito.'],
      ['eClasse', '"Pacotes e Contratações", sem falar de saldo.'],
    ], 'Temos: o pacote vira crédito, a aula dada consome, o professor vê o saldo. É o diferencial mais forte do Fulger em dinheiro.', [
      'Vender pela dor da persona: *"o pacote de aulas que vira conta de cabeça"*. Nenhum site nomeia essa dor.',
      'Peça de conteúdo e de anúncio: "Quantas aulas faltam no pacote da Ana?", respondido numa tela.',
    ]),

    sec('falta-cobranca', 'Falta com regra de cobrança: *0 de 10*', [
      ['Aulvi', 'O mais perto: a aula que não rolou vira crédito, e um guia explica a regra de falta e reposição.'],
      ['Sistema Classis, Beaky', 'Falam de falta só para reduzir com lembrete. Nada sobre o que fazer com o dinheiro dela.'],
    ], 'Temos: a falta sem aviso cobra, a avisada não, a experimental não. A regra é do professor.', [
      'Território vazio: *"o aluno faltou sem avisar, e a dúvida de cobrar acabou"*. É o gatilho de compra listado no `AUDIENCE.md`.',
      'Encaixa no pilar "Dinheiro sem conta de cabeça" e vale um anúncio próprio.',
    ]),

    sec('video-externa', 'Videochamada: *0 de 10* com vídeo próprio', [
      ['EnsinaApp', '"Meet + Calendar": link do Meet gerado e enviado. Dor: "link do Meet mandado na última hora".'],
      ['FluentDesk', 'Link do Meet ou Zoom anexado à aula.'],
      ['eClasse, Beaky', 'O link da aula guardado na agenda ou no app.'],
    ], 'Temos: sala própria por aula, o aluno entra pelo link. É só para duas pessoas.', [
      'Vender o fim da caça ao link: *"a aula já tem sala, o aluno entra pelo link"*.',
      'Não prometer aula em grupo por vídeo.',
    ], { quantos: 0 }),

    { tipo: 'cards', titulo: 'O que *só o Fulger* tem', sub: 'Nenhum dos 10 mostra no site.',
      itens: [
        { rotulo: 'Área do aluno', titulo: 'Link sem login', texto: 'Pagar, confirmar a aula e entrar na sala no celular, sem instalar nada e sem senha.' },
        { rotulo: 'Aulas e presença', titulo: 'Falta com regra de cobrança', texto: 'A falta sem aviso cobra pela regra do professor; a avisada e a experimental não.' },
        { rotulo: 'Videochamada', titulo: 'Sala própria por aula', texto: 'Sem Meet nem Zoom: a aula já nasce com a sala.' },
        { rotulo: 'Financeiro', titulo: 'Pacote que vira crédito', texto: 'Só a EnsinaApp tem pacote completo, e sem saldo consumido aula a aula.' },
        { rotulo: 'Comunicação', titulo: 'Mensagens prontas no WhatsApp do professor', texto: 'Só a Aulvi tem algo parecido (a mensagem de cobrança pronta).' },
      ] },

    matriz,

    { tipo: 'insights', titulo: 'O que *priorizar*',
      pontosTitulo: 'No produto',
      pontos: [
        '**Pix copia-e-cola na cobrança** antes do lançamento: obrigação, 7 de 10 têm.',
        '**Confirmar a nota por aula** (diário): 5 de 10 têm, e é o "onde o aluno parou" da persona.',
        '**Reposição pelo aluno, pelo link:** 2 de 10 têm, e é o tema que mais rende no Instagram da Beaky.',
      ],
      sugestoesTitulo: 'Na copy, enquanto isso',
      sugestoes: [
        'Vender pela cena, não pela função: falta sem aviso, pacote de cabeça, "Prof, pode remarcar?", o link do Meet na última hora.',
        'Gastar o espaço nobre no que é raro: pacote que vira crédito, falta com regra, aluno que não instala nada, sala de vídeo própria.',
        'Transformar o "não é automático" em controle: nada sai sem você ver, e o dinheiro cai direto na sua conta.',
        'Fugir do "adeus planilha": 8 de 10 já dizem isso. O vilão do Fulger é lembrar de tudo, todos os dias.',
        'Atualizar a matriz do app com o que os sites mostraram (39 células saíram de "desconhecido").',
      ] },
  ],
};
fs.writeFileSync(DIR + '/relatorio.json', JSON.stringify(R, null, 2) + '\n');
console.log('ok', R.paginas.length, 'páginas');
