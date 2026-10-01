<!--
Sync Impact Report
- Version change: 1.0.0 -> 1.0.1 (PATCH)
- Principles modified:
  - IV. Progressão Pedagógica com Validação Rígida: clarificada a redação de 'Organização Correta por Espécie', especificando que frutas alocadas nos cestos devem ser puras e com mínimo de 1 por cesto, harmonizando com a permanência de frutas remanescentes na bancada para a mecânica de subtração concreta (Princípio III).
- Deferred Items / TODOs: Nenhum.
-->

# Aprendendo com as Frutas Constitution

## Core Principles

### I. Interface Lúdica, Responsiva e Naturalista
A interface visual DEVE ser altamente engajante e lúdica para crianças do 2º ano do Ensino Fundamental, com suporte responsivo pleno tanto em computadores de mesa (desktop) quanto em dispositivos móveis (tablets e smartphones).
- **Imagens Realistas de Frutas Regionais**: O jogo DEVE utilizar exclusivamente imagens fotográficas ou ilustrações naturalistas e realistas de frutas regionais brasileiras (ex.: caju, manga, goiaba, cupuaçu, açaí, banana, melancia), descartando elementos puramente cartunescos ou estilizações abstratas que descaracterizem a identificação biológica da fruta.
- **Responsividade e Usabilidade Tátil**: Todos os elementos interativos DEVEM possuir dimensões mínimas de área de toque de 48x48px, com espaçamento adequado para evitar toques acidentais por crianças.
- **Justificativa**: Conectar o aprendizado escolar à realidade concreta e regional da criança, respeitando sua fase de desenvolvimento psicomotor através de usabilidade táctil ergonômica.

### II. Feedback Sonoro Didático Exclusivo por Seleção
O jogo DEVE dispor de áudio com voz feminina clara, com dicção perfeita, tom afetuoso e didático em português brasileiro.
- **Gatilho Único e Restrito**: O áudio nominal DEVE ser acionado **exclusivamente** no instante em que o aluno toca ou clica em uma fruta para selecioná-la, pronunciando com clareza o nome da fruta selecionada (ex.: "Manga!", "Caju!").
- **Proibição de Poluição Sonora**: É terminantemente proibido disparar nomes de frutas em loop, locuções concorrentes ou sons automáticos não solicitados que dispersem a concentração e a memória auditiva da criança.
- **Justificativa**: Consolidar a associação fonema-grafema-objeto no instante exato da atenção focada da criança, evitando sobrecarga sensorial.

### III. Mecânica de Subtração Intuitiva via Drag and Drop
A interação primária com os elementos de contagem DEVE adotar a mecânica de arrastar e soltar (*drag and drop*), com suporte unificado a eventos de mouse e ponteiro/toque (*touch*).
- **Simulação da Ação Física**: A criança transfere a fruta arrastando-a diretamente da bancada (espaço inicial de coleta) para o cesto de palha correspondente.
- **Conservação do Espaço Vazio na Bancada**: Ao retirar uma fruta de sua posição na bancada, aquele espaço físico exato DEVE permanecer claramente vazio (com contorno sutil ou espaço em branco na bancada), sem reagrupamento automático imediato das frutas restantes.
- **Operação de Subtração Concreta**: O espaço vazio na bancada atua como representação visual e espacial intuitiva da operação matemática de subtração (retirar uma quantidade de uma quantidade total inicial).
- **Justificativa**: No 2º ano do Ensino Fundamental, o pensamento operatório concreto necessita de âncoras espaciais e físicas para assimilar o significado da subtração antes da pura abstração algorítmica.

### IV. Progressão Pedagógica com Validação Rígida
O avanço para o nível ou fase seguinte é ESTRITAMENTE CONDICIONADO ao sucesso total nas etapas de classificação e resolução de problemas:
- **Organização Correta por Espécie**: Todas as frutas alocadas nos cestos DEVEM ser distribuídas estritamente de acordo com a sua espécie, com a presença de ao menos 1 unidade em cada um dos 6 cestos. Se qualquer fruta estiver no cesto errado ou permanecer em estado intermediário inválido, o avanço é BLOQUEADO. As frutas que permanecem em seus slots na bancada representam o minuendo concreto da operação de subtração (Princípio III).
- **Exatidão Absoluta no Quiz**: É terminantemente proibido avançar se houver qualquer erro não corrigido nas respostas das perguntas do quiz (seja contagem de unidades ou cálculos de valor em dinheiro).
- **Feedback Formativo**: Em caso de erro, o jogo não deve punir nem avançar, mas sim fornecer retorno encorajador, mantendo o estado para que a criança reflita e execute a correção até o acerto.
- **Justificativa**: Garantir que as competências pedagógicas fundamentais sejam verdadeiramente consolidadas antes da introdução de novos graus de complexidade.

### V. Avaliação Matemática Padronizada em 3 Alternativas
Todas as questões matemáticas avaliativas (contagem de frutas, soma de unidades, subtração ou cálculo de preço/sistema monetário) DEVEM seguir uma estrutura rigorosa:
- **Exatamente Três Alternativas**: Toda pergunta DEVE conter impreterivelmente 3 (três) botões ou cartões de resposta disponíveis simultaneamente.
- **Apenas Uma Correta**: Exatamente 1 (uma) alternativa DEVE ser matematicamente correta, e as outras 2 (duas) alternativas DEVEM ser distratores pedagogicamente plausíveis baseados em erros comuns de contagem da faixa etária.
- **Justificativa**: Adequação à capacidade de processamento de crianças de 7 a 8 anos, minimizando a sobrecarga cognitiva e eliminando o viés do chute binário (50%).

### VI. Arquitetura Client-Side Pura e Stateless
A aplicação DEVE ser concebida como uma aplicação web puramente estática (*client-side*), sem qualquer dependência de backend ou banco de dados.
- **Sem Banco de Dados / Sem Chamadas Remotas de Estado**: Toda a lógica de jogo, sorteio de desafios, reprodução de áudio, validação de regras e cálculo de pontuação/fases DEVE ocorrer em memória no navegador do usuário.
- **Hospedagem Estática Universal**: A aplicação DEVE ser compilada ou estruturada para entrega por qualquer servidor ou plataforma estática (ex.: GitHub Pages, Vercel, Netlify, Cloudflare Pages ou visualização local).
- **Privacidade e Proteção de Dados (LGPD Infantil)**: Nenhum dado pessoal, registro de desempenho ou identificador de criança DEVE ser coletado, transmitido ou gravado externamente.
- **Justificativa**: Garantir compatibilidade total com escolas de baixa conectividade, segurança e privacidade absoluta para o público infantil e custo zero de infraestrutura.

## Diretrizes Pedagógicas e de Acessibilidade

### Alinhamento com a BNCC (2º Ano do Ensino Fundamental)
- **Matemática**:
  - `EF02MA01`: Comparar e ordenar números naturais pela compreensão das características do sistema de numeração decimal.
  - `EF02MA05`: Construir fatos básicos da adição e da subtração e utilizá-los no cálculo mental ou escrito.
  - `EF02MA20`: Estabelecer a equivalência de valores entre moedas e cédulas do sistema monetário brasileiro para resolver situações cotidianas de compra e venda de frutas.
- **Ciências**:
  - `EF02CI04`: Descrever características de plantas e seus frutos, reconhecendo a importância das espécies frutíferas regionais na nutrição saudável.

### Acessibilidade Lúdica
- Contraste visual adequado (WCAG 2.1 AA) com elementos gráficos nítidos.
- Textos em fonte sem serifa, legíveis em caixa alta ou formato adequado para leitores iniciantes.
- Sons de reforço positivo harmoniosos, sem ruídos estridentes.

## Governança e Ciclo de Vida

### Procedimento de Emendas
1. Qualquer proposta de emenda aos princípios fundamentais DEVE ser formalmente registrada neste documento acompanhada de justificativa pedagógica e técnica detalhada.
2. A atualização do arquivo DEVE refletir o incremento de versão semântica:
   - **MAJOR (X.0.0)**: Alterações substanciais que modifiquem princípios inegociáveis (ex.: alteração na mecânica central de progressão ou introdução de arquitetura cliente-servidor).
   - **MINOR (1.X.0)**: Adição de novos princípios, expansão de regras de acessibilidade ou inclusão de novos módulos pedagógicos.
   - **PATCH (1.0.X)**: Correções ortográficas, clarificações de texto e ajustes menores de formatação semântica.
3. Todas as alterações DEVEM atualizar as datas de `Last Amended` e o relatório `Sync Impact Report`.

### Verificação de Conformidade
- Toda especificação funcional (`spec`), arquitetura técnica (`plan`) ou implementação (`tasks`) subsequente DEVE citar e validar a aderência estrita a esta constituição antes de sua aprovação.

---
**Version**: 1.0.1 | **Ratified**: 2026-09-30 | **Last Amended**: 2026-10-01
