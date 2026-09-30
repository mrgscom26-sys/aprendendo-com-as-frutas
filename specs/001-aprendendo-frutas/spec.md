# Feature Specification: Aprendendo com as Frutas

**Feature Branch**: `001-aprendendo-frutas`

**Created**: 2026-09-30

**Status**: Draft

**Input**: User description: "Desenvolver a aplicação web interativa 'Aprendendo com as frutas'. O cenário é uma feira e o jogador atua como um consumidor. As frutas disponíveis dividem-se em 3 categorias de tamanho: Pequenas: Açaí e Buriti. Médias: Manga e Cupuaçu. Grandes: Melancia e Jaca. Nível 1: O aluno visualiza uma bancada com as frutas e 6 cestos de palha com nomes das frutas. O aluno deve arrastar e soltar entre 1 e 6 frutas de cada tipo nos seus respectivos cestos. Ao arrastar, ouve o nome da fruta e um espaço vazio substitui a fruta na banca. Ao término da organização, o sistema deve exibir perguntas de classificação: 'A fruta [Nome] é pequena, média ou grande?'. Em seguida, perguntas de contagem: 'Quantas frutas [Nome] estão no cesto?' (Com 3 alternativas). O aluno só passa ao Nível 2 se não misturar as frutas e acertar as respostas. Nível 2: Semelhante ao Nível 1, mas a bancada deve ter, no mínimo, 8 frutas de cada tipo disponíveis. Após organizar, o aluno deve responder a perguntas de precificação (Açaí: R$1; Buriti: R$2; Manga: R$3; Cupuaçu: R$4; Jaca: R$5; Melancia: R$10). Exemplo de pergunta: 'Quanto você pagará pelas frutas no cesto do Buriti?' (Com 3 alternativas). Pergunta final: 'Qual o valor total de todos os cestos?'. Conclusão: Se o aluno acertar tudo, recebe o troféu 'Saber Matemático' na tela."

---

## Clarifications

### Session 2026-09-30

- **Q: O aluno pode tirar uma fruta do cesto e devolvê-la à bancada caso queira desfazer um erro?**
  **A:** Sim. O sistema adota mecânica reversível: o aluno pode arrastar qualquer fruta de dentro de um cesto de volta para a bancada (reocupando um espaço vazio), permitindo autorreflexão e autocorreção autônoma antes de solicitar a conferência final da organização.
- **Q: Como será acionado o áudio com o nome da fruta?**
  **A:** O áudio é acionado no evento `onDragStart` (no início do arraste / seleção intencional da fruta), disparando a pronúncia da voz feminina didática de forma pontual, interrompendo instantaneamente qualquer locução anterior para evitar poluição sonora.
- **Q: O que ocorre se o aluno errar uma pergunta matemática no quiz? O jogo reinicia ou permite tentar a alternativa restante?**
  **A:** O jogo NÃO reinicia do zero. Ele emite um feedback formativo e encorajador imediato ("Tente novamente!"), desabilita/sinaliza visualmente a alternativa incorreta escolhida e mantém as demais alternativas ativas para nova tentativa na mesma tela, bloqueando estritamente o avanço de nível até que a opção correta seja selecionada.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Seleção, Movimentação e Identificação Concreta de Frutas (Priority: P1)

Como aluno do 2º ano do Ensino Fundamental atuando como consumidor em uma feira regional,
quero selecionar frutas realistas na bancada, ouvir a pronúncia correta de seus nomes ao iniciar o arraste e arrastá-las para os cestos de palha (ou devolvê-las se mudar de ideia),
para aprender a classificar elementos por espécie, associar a imagem ao som e vivenciar intuitivamente a subtração visual (espaço vazio deixado na bancada).

**Why this priority**: É a mecânica fundamental de todo o jogo. Sem a capacidade de tocar, ouvir, mover as frutas e ver os espaços vazios na bancada, nenhuma das atividades avaliativas posteriores (contagem e cálculos) pode ocorrer.

**Independent Test**: Pode ser testado de forma autônoma carregando a bancada da feira com as 6 espécies de frutas, iniciando o arraste de qualquer fruta para validar a emissão da voz feminina didática (evento `onDragStart`) e soltando-a no cesto de palha, verificando se o espaço físico original na bancada permanece vazio e, em seguida, devolvendo a fruta à bancada para validar a reversibilidade.

**Acceptance Scenarios**:

1. **Given** que o aluno está na tela inicial da bancada da feira, **When** ele inicia o arraste de uma fruta (evento `onDragStart`), **Then** o sistema reproduz imediatamente um áudio claro de voz feminina didática pronunciando o nome da referida fruta (ex.: "Buriti!", "Açaí!").
2. **Given** que o aluno iniciou o gesto de arrastar uma fruta da bancada, **When** ele a solta dentro de um cesto de palha, **Then** a fruta é acomodada dentro do cesto e a vaga correspondente na bancada permanece visivelmente desocupada como um espaço vazio.
3. **Given** que uma fruta foi retirada da bancada, **When** a fruta é movida para o cesto, **Then** a bancada NÃO realiza rearranjo automático dos outros itens, preservando a lacuna espacial de subtração.
4. **Given** que o aluno tenta soltar uma fruta fora de qualquer cesto válido ou da bancada, **When** o arraste é cancelado, **Then** a fruta retorna suavemente ao seu espaço de origem.
5. **Given** que o aluno depositou uma fruta no cesto e deseja desfazer a ação, **When** ele arrasta a fruta de dentro do cesto para um slot vazio da bancada, **Then** a fruta é removida do cesto e volta a ocupar o slot na bancada, recompondo o espaço físico.

---

### User Story 2 - Nível 1: Classificação por Tamanho e Contagem com Validação Rígida (Priority: P2)

Como aluno no Nível 1 da feira,
quero organizar entre 1 e 6 frutas de cada espécie nos 6 cestos identificados e responder aos desafios de classificação de tamanho e de contagem,
para consolidar o reconhecimento de grandezas relativas (pequena, média, grande) e o domínio da contagem quantitativa de 1 a 6.

**Why this priority**: Constrói as bases de classificação e contagem direta do 2º ano (BNCC EF02MA01) e valida o primeiro portão obrigatório de progressão pedagógica antes do avanço para o nível monetário.

**Independent Test**: Pode ser testado configurando uma bancada de Nível 1, organizando corretamente as frutas nos 6 cestos, respondendo às perguntas de classificação de tamanho e de contagem das frutas nos cestos, e validando que o avanço para o Nível 2 só é liberado se todos os cestos estiverem puros (sem mistura) e todas as respostas estiverem corretas.

**Acceptance Scenarios**:

1. **Given** que o aluno concluiu a transferência de 1 a 6 frutas de cada espécie para os cestos, **When** ele aciona o botão de finalizar organização, **Then** o sistema verifica se há mistura de espécies entre os cestos.
2. **Given** que qualquer cesto contenha uma fruta de espécie diferente da indicada no rótulo, **When** o aluno tenta validar a organização, **Then** o sistema bloqueia o avanço, emite feedback formativo encorajador e solicita que o aluno reorganize as frutas no cesto correto.
3. **Given** que todas as frutas foram alocadas corretamente por espécie, **When** tem início a etapa de perguntas, **Then** o sistema exibe perguntas de classificação de tamanho ("A fruta [Nome] é pequena, média ou grande?") com exatamente 3 alternativas: "Pequena", "Média" e "Grande", sendo a resposta validada conforme as regras:
   - Açaí e Buriti: Pequenas
   - Manga e Cupuaçu: Médias
   - Melancia e Jaca: Grandes
4. **Given** que a etapa de classificação de tamanho foi concluída, **When** o sistema apresenta a pergunta de contagem ("Quantas frutas [Nome] estão no cesto?"), **Then** são exibidas exatamente 3 alternativas numéricas, correspondendo exatamente 1 à quantidade real de frutas que o aluno depositou naquele cesto e 2 a distratores numéricos plausíveis.
5. **Given** que o aluno responde a uma pergunta de classificação ou contagem, **When** ele seleciona uma alternativa incorreta, **Then** o sistema desabilita visualmente a opção errada, emite retorno encorajador ("Tente novamente!"), mantém as opções restantes na tela e bloqueia o avanço até o acerto da alternativa correta, sem reiniciar o jogo.
6. **Given** que o aluno acerta todas as perguntas de classificação e contagem sem misturar frutas, **When** finaliza o questionário, **Then** o sistema desbloqueia e transiciona para o Nível 2.

---

### User Story 3 - Nível 2: Precificação, Cálculo Monetário e Troféu Final (Priority: P3)

Como aluno no Nível 2 da feira,
quero organizar um lote maior de frutas (no mínimo 8 de cada tipo) e resolver problemas de compra com valores em reais de cada cesto e do valor total da feira,
para aplicar operações de multiplicação intuitiva/adição repetida e sistema monetário brasileiro (BNCC EF02MA20) e conquistar o troféu "Saber Matemático".

**Why this priority**: Representa o ápice pedagógico e lúdico do jogo, combinando volume quantitativo maior (mínimo de 8 frutas por tipo) com contextualização monetária do cotidiano infantil.

**Independent Test**: Pode ser testado fornecendo 8+ frutas por espécie na bancada, organizando-as nos cestos, respondendo às perguntas de valor por cesto baseadas na tabela oficial de preços e à pergunta final do valor total consolidado, verificando a exibição do troféu ao atingir 100% de acerto.

**Acceptance Scenarios**:

1. **Given** que o Nível 2 foi iniciado, **When** a bancada é exibida, **Then** há disponíveis no mínimo 8 unidades de cada uma das 6 espécies de frutas (Açaí, Buriti, Manga, Cupuaçu, Jaca e Melancia).
2. **Given** que o aluno organizou as frutas nos 6 cestos sem misturar espécies, **When** avança para o quiz de precificação, **Then** o sistema calcula o valor de cada cesto com base no preço unitário oficial:
   - Açaí: R$ 1,00 cada
   - Buriti: R$ 2,00 cada
   - Manga: R$ 3,00 cada
   - Cupuaçu: R$ 4,00 cada
   - Jaca: R$ 5,00 cada
   - Melancia: R$ 10,00 cada
3. **Given** a pergunta de precificação por cesto (ex.: "Quanto você pagará pelas frutas no cesto do Buriti?"), **When** a pergunta é exibida, **Then** ela apresenta exatamente 3 alternativas monetárias (ex.: R$ 16,00, R$ 14,00, R$ 18,00), com apenas uma correta calculada pela fórmula `(quantidade_de_frutas_no_cesto × preço_unitário)`.
4. **Given** que o aluno clica em uma alternativa de preço errada, **When** a resposta é avaliada, **Then** a opção incorreta é desabilitada com aviso de incentivo ("Ops, vamos tentar de novo?"), permanecendo as demais opções ativas até a escolha correta.
5. **Given** que todas as perguntas individuais de cesto foram respondidas com acerto, **When** o sistema exibe a pergunta final, **Then** é questionado: "Qual o valor total de todos os cestos?", acompanhado de exatamente 3 alternativas com o valor da soma geral de todos os cestos.
6. **Given** que o aluno completou com êxito todas as etapas sem mistura e com 100% de acerto nas contas, **When** conclui a pergunta final, **Then** a tela final de celebração é exibida com o troféu ilustrado e o título "Saber Matemático".

---

### Edge Cases

- **Tentativa de avanço com cesto vazio**: Se o aluno não colocar nenhuma fruta em determinado cesto (0 frutas), o sistema solicita amigavelmente que ele transfira ao menos uma fruta de cada espécie antes de prosseguir.
- **Fruta solta em cesto incorreto**: Se uma Melancia for colocada no cesto de Manga, o sistema assinala o erro visualmente no momento da conferência, impedindo o prosseguimento e convidando a criança a devolver a fruta ou movê-la para o cesto certo.
- **Devolução para bancada cheia**: O aluno só pode devolver frutas para slots que estejam efetivamente vazios na bancada, preservando a matriz espacial.
- **Disparos rápidos de arraste (DragStart frenético)**: Ao iniciar arrastes em sequência rápida, o áudio anterior é cancelado imediatamente via `speechSynthesis.cancel()` ou interrupção do buffer de áudio, tocando apenas o som da fruta sob foco.
- **Geração de distratores sem colisão**: A função geradora de alternativas matemáticas assegura que os 2 distratores sejam sempre estritamente diferentes entre si e diferentes da resposta correta.
- **Redimensionamento de tela durante o arraste**: Em caso de rotação do dispositivo móvel ou resize de janela, as coordenadas das zonas de soltura (*drop zones*) são recalculadas para manter a precisão do toque.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE disponibilizar exatamente 6 espécies de frutas regionais brasileiras, categorizadas em:
  - Pequenas: Açaí e Buriti
  - Médias: Manga e Cupuaçu
  - Grandes: Melancia e Jaca
- **FR-002**: A interface visual DEVE utilizar representações realistas e naturalistas de cada uma das 6 frutas, com proporções visuais coerentes com seus tamanhos relativos.
- **FR-003**: O sistema DEVE acionar o feedback sonoro em voz feminina clara e didática no evento `onDragStart` (início do arraste / seleção intencional da fruta), pronunciando o nome da espécie sem sobreposição sonora.
- **FR-004**: O sistema DEVE implementar mecânica bidirecional e reversível de arrastar e soltar (*drag and drop*) compatível com mouse e telas táteis (*touch*), permitindo transportar frutas da bancada para os cestos e também devolver frutas de qualquer cesto para slots vazios da bancada antes da validação.
- **FR-005**: Ao retirar uma fruta de sua posição na bancada, o sistema DEVE manter o espaço de origem vazio na bancada, funcionando como representação visual concreta da operação de subtração. Ao devolver uma fruta, o slot vazio volta a ser ocupado.
- **FR-006**: No Nível 1, o sistema DEVE disponibilizar na bancada uma quantidade entre 1 e 6 frutas para cada uma das 6 espécies, e exigir que o aluno organize ao menos 1 unidade de cada fruta em seu respectivo cesto.
- **FR-007**: No Nível 2, a bancada DEVE conter no mínimo 8 unidades disponíveis de cada uma das 6 espécies de frutas.
- **FR-008**: O sistema DEVE validar rigorosamente a pureza de cada cesto. Se houver mistura de espécies em qualquer cesto, o sistema DEVE impedir o avanço de nível e indicar pedagogicamente a necessidade de correção.
- **FR-009**: Ao concluir a organização no Nível 1, o sistema DEVE gerar perguntas de classificação de tamanho ("A fruta [Nome] é pequena, média ou grande?") contendo exatamente 3 alternativas de resposta.
- **FR-010**: No Nível 1, o sistema DEVE gerar perguntas de contagem ("Quantas frutas [Nome] estão no cesto?"), baseadas dinamicamente na quantidade real depositada pela criança, apresentando exatamente 3 alternativas (1 correta e 2 distratores).
- **FR-011**: No Nível 2, o sistema DEVE aplicar os seguintes preços unitários tabelados:
  - Açaí: R$ 1,00
  - Buriti: R$ 2,00
  - Manga: R$ 3,00
  - Cupuaçu: R$ 4,00
  - Jaca: R$ 5,00
  - Melancia: R$ 10,00
- **FR-012**: No Nível 2, o sistema DEVE gerar perguntas de precificação por cesto ("Quanto você pagará pelas frutas no cesto do [Nome]?") com 3 alternativas em reais, calculadas pela multiplicação da quantidade no cesto pelo preço unitário da espécie.
- **FR-013**: No Nível 2, o sistema DEVE apresentar a pergunta de encerramento: "Qual o valor total de todos os cestos?", com 3 alternativas em reais correspondentes à soma geral dos valores calculados de todos os 6 cestos.
- **FR-014**: Em caso de resposta incorreta no quiz, o sistema DEVE desativar a alternativa incorreta, fornecer retorno formativo encorajador e permitir que o aluno escolha entre as alternativas restantes na mesma tela, bloqueando o avanço de nível até a seleção da resposta correta, sem reiniciar o jogo do zero.
- **FR-015**: Ao obter êxito integral em todas as etapas de organização e respostas matemáticas do Nível 1 e Nível 2, o sistema DEVE exibir a tela de consagração com o troféu "Saber Matemático".
- **FR-016**: Toda a aplicação DEVE operar estritamente no lado do cliente (*client-side*), sem necessidade de banco de dados, servidor de aplicação ou autenticação, permitindo publicação em qualquer plataforma de hospedagem estática.

---

### Key Entities *(data involved)*

- **Fruta**: Representa uma espécie botânica no jogo. Atributos: `id`, `nome` (ex.: "Buriti"), `categoria_tamanho` (`pequena`, `media`, `grande`), `preco_unitario` (em reais), `imagem_url`/recurso visual, `audio_pronuncia`.
- **ItemBancada**: Instância física de uma fruta posicionada em uma coordenada/slot da bancada. Atributos: `slot_id`, `fruta_id`, `estado` (`ocupado`, `vazio`).
- **CestoDePalha**: Recipiente de destino para acomodação de frutas na feira. Atributos: `cesto_id`, `fruta_alvo_id`, `frutas_contidas` (lista de instâncias de frutas alocadas), `esta_valido` (booleano: verdadeiro se todas as frutas contidas correspondem à espécie-alvo e quantidade > 0).
- **PerguntaQuiz**: Unidade de avaliação matemática ou de classificação. Atributos: `tipo` (`classificacao_tamanho`, `contagem`, `preco_cesto`, `preco_total`), `enunciado`, `alternativas` (lista de exatamente 3 opções), `indice_correto`, `tentativas_incorretas` (conjunto de índices de opções já eliminadas), `explicacao_formativa`.
- **SessaoJogo**: Estado em memória da progressão da criança. Atributos: `nivel_atual` (1 ou 2), `fase_nivel` (`organizacao_bancada`, `quiz_classificacao`, `quiz_contagem`, `quiz_precificacao`, `conclusao`), `historico_tentativas`, `trofeu_conquistado` (booleano).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das telas e componentes interativos (bancada, cestos, botões de alternativas) adaptam-se sem quebra ou rolagem horizontal indesejada em telas de 360px de largura até monitores 4K.
- **SC-002**: O tempo de latência entre o início do arraste (`onDragStart`) de uma fruta e o disparo da voz didática é inferior a 150 milissegundos.
- **SC-003**: 100% dos espaços de origem na bancada permanecem visualmente vazios após o arraste da fruta, sem salto ou deslocamento dos itens adjacentes, e são reocupados fidedignamente caso a fruta seja devolvida.
- **SC-004**: Toda e qualquer pergunta de avaliação gerada pelo sistema possui invariavelmente 3 alternativas distintas, com exatamente 1 alternativa correta.
- **SC-005**: O bloqueio de progressão possui 0% de falso-positivo de avanço (nenhum aluno avança com frutas trocadas ou respostas erradas).
- **SC-006**: A aplicação carrega completamente em menos de 2 segundos em conexões 4G padrão, pesando no total menos de 5MB de ativos compactados.

---

## Assumptions

- **Público-alvo**: Crianças de 7 a 8 anos cursando o 2º ano do Ensino Fundamental I, em processo de alfabetização e consolidação das quatro operações básicas e sistema monetário.
- **Dispositivos**: A aplicação será utilizada primordialmente em tablets escolares e computadores de laboratório de informática escolar, bem como em smartphones de familiares.
- **Síntese de Voz**: A voz feminina didática utilizará a API nativa de síntese de voz do navegador (Web Speech API) configurada para voz feminina em pt-BR com fallback de áudios gravados/sintetizados em alta definição embutidos.
- **Privacidade**: Em conformidade com a LGPD e o princípio VI da Constituição, nenhum dado de identificação do aluno é armazenado em servidores externos.
