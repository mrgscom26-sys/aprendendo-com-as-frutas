# Requirements Clarity & Precision Checklist: Aprendendo com as Frutas

**Purpose**: Validar a qualidade, exatidão, testabilidade e ausência de requisitos vagos ou ambíguos na especificação e arquitetura do jogo
**Created**: 2026-09-30
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md) | [data-model.md](../data-model.md)

**Note**: Este checklist é um artefato de revisão de qualidade dos requisitos ("Unit Tests for English").
**Review Ownership**: Revisão técnica e pedagógica para garantia de não-ambiguidade antes da codificação.
**Marker Semantics**: `[x]` indica que o requisito na documentação foi avaliado e determinado como específico, quantificado, testável e livre de subjetividade.

---

## 1. Precisão do Catálogo de Frutas e Dimensões Visuais

- [x] CHK001 As espécies de frutas estão taxativamente enumeradas sem margem para inclusão arbitrária de outros itens? [Clareza, Spec §FR-001]
  *Evidência*: Exatamente 6 frutas: Açaí, Buriti, Manga, Cupuaçu, Jaca e Melancia.
- [x] CHK002 A classificação por tamanho está explicitamente mapeada para cada uma das espécies? [Completude, Spec §FR-001]
  *Evidência*: Pequenas: Açaí e Buriti; Médias: Manga e Cupuaçu; Grandes: Melancia e Jaca.
- [x] CHK003 A representação visual "naturalista e realista" possui parâmetros e restrições objetivas de design? [Clareza, Spec §FR-002, Plan §Constitution Check]
  *Evidência*: Fotografias ou ilustrações hiper-realistas com sombreamento; proibição explícita de caricaturas ou estilizações abstratas.
- [x] CHK004 As proporções visuais e escalas relativas entre as frutas estão quantificadas em unidades de tela? [Mensurabilidade, Plan §Phase 0, Data Model §1.1]
  *Evidência*: Pequenas (~48-52px), Médias (~72-80px), Grandes (~100-110px); alvos de toque mínimos de 48x48px (WCAG).

---

## 2. Mecânica de Drag & Drop e Subtração Concreta

- [x] CHK005 O evento exato de disparo da voz didática está tecnicamente especificado sem ambiguidade? [Clareza, Spec §FR-003, Clarifications]
  *Evidência*: Disparo estrito no evento `onDragStart` (início do arraste / seleção intencional da fruta).
- [x] CHK006 O comportamento do espaço deixado na bancada está rigorosamente definido? [Completude, Spec §FR-005, Plan §Research 3]
  *Evidência*: O slot original permanece visivelmente desocupado (`.empty`) e a bancada NÃO realiza rearranjo (reflow/repack) dos outros itens.
- [x] CHK007 A reversibilidade da ação (desfazer erro devolvendo a fruta à bancada) está documentada com estado final claro? [Consistência, Spec §FR-004, Clarifications]
  *Evidência*: A fruta pode ser arrastada do cesto para qualquer slot vazio da bancada, reocupando o slot e decrementando a contagem do cesto.
- [x] CHK008 A compatibilidade com telas sensíveis ao toque (tablets e smartphones) está resolvida sem dependência exclusiva de mouse? [Cobertura, Plan §Research 1]
  *Evidência*: Suporte híbrido unificado para HTML5 Drag & Drop nativo e Pointer/Touch Events (`pointerdown`, `pointermove`, `pointerup`).

---

## 3. Regras de Progressão, Validação e Pureza de Cestos

- [x] CHK009 O critério de "não misturar as frutas" possui definição algorítmica booleana falsificável? [Testabilidade, Spec §FR-008, Data Model §1.3]
  *Evidência*: `isPure === true` SE E SOMENTE SE toda fruta contida no cesto possui `fruitId === cesto.targetFruitId`.
- [x] CHK010 A quantidade mínima obrigatória de frutas em cada cesto para permitir avanço está claramente estipulada? [Clareza, Spec §FR-006, Edge Cases]
  *Evidência*: Exigência mínima de $\ge 1$ fruta por cesto; avanço é bloqueado com mensagem amigável caso haja cesto vazio.
- [x] CHK011 A quantidade de frutas disponíveis na bancada em cada nível está matematicamente delimitada? [Completude, Spec §FR-006, §FR-007]
  *Evidência*: Nível 1: entre 1 e 6 frutas por tipo; Nível 2: no mínimo 8 frutas por tipo.

---

## 4. Estrutura e Formatação dos Questionários Matemáticos

- [x] CHK012 O número de alternativas de resposta para cada pergunta está estritamente fixado? [Clareza, Spec §FR-009, §FR-010, §FR-012, §FR-013]
  *Evidência*: Invariavelmente 3 alternativas por pergunta, com exatamente 1 correta e 2 distratores.
- [x] CHK013 A unicidade dos distratores (ausência de alternativas duplicadas ou idênticas à correta) está garantida por especificação? [Consistência, Spec §Edge Cases, Data Model §3]
  *Evidência*: Invariância formal: $\forall i \neq j, \text{option}[i].\text{value} \neq \text{option}[j].\text{value}$ e distratores $\neq$ resposta correta.
- [x] CHK014 A tabela de preços do Nível 2 possui valores monetários absolutos em reais para todas as 6 espécies? [Completude, Spec §FR-011]
  *Evidência*: Açaí: R$ 1; Buriti: R$ 2; Manga: R$ 3; Cupuaçu: R$ 4; Jaca: R$ 5; Melancia: R$ 10.
- [x] CHK015 A fórmula de cálculo do valor do cesto e do valor total da feira está explicitada matematicamente? [Clareza, Spec §FR-012, §FR-013]
  *Evidência*: $\text{ValorCesto} = \text{quantidade\_no\_cesto} \times \text{preço\_unitário}$; $\text{ValorTotal} = \sum_{i=1}^6 \text{ValorCesto}_i$.
- [x] CHK016 O comportamento diante de erro na resposta matemática está detalhado passo a passo? [Clareza, Spec §FR-014, Clarifications]
  *Evidência*: A alternativa incorreta é desabilitada/marcada, o jogo NÃO reinicia do zero, exibe feedback encorajador e mantém as outras opções ativas até o acerto.

---

## 5. Áudio, Voz Feminina Didática e Concorrência

- [x] CHK017 O idioma, gênero da voz e cadência da fala estão explicitados tecnicamente? [Clareza, Plan §Research 2, Spec §Assumptions]
  *Evidência*: Idioma `pt-BR`, perfil feminino (ex.: Luciana, Francisca, Heloisa), `rate: 0.9` (didática) e `pitch: 1.1`.
- [x] CHK018 A prevenção de ruído ou sobreposição de vozes em cliques rápidos está resolvida com comando explícito? [Testabilidade, Spec §Edge Cases, Plan §Research 2]
  *Evidência*: Chamada mandatória de `speechSynthesis.cancel()` imediatamente antes de qualquer nova emissão sonora.
- [x] CHK019 O mecanismo de contingência para navegadores offline ou sem vozes nativas está especificado? [Cobertura, Plan §Research 2]
  *Evidência*: Mapeamento de fallback para arquivos de áudio pré-gravados em `assets/audio/[fruta].mp3`.

---

## 6. Arquitetura Técnica, Execução Estática e LGPD

- [x] CHK020 A ausência total de banco de dados e servidores backend está estipulada como restrição inegociável? [Consistência, Spec §FR-016, Plan §Technical Context]
  *Evidência*: Operação 100% *client-side* em memória volátil; compatibilidade universal com hospedagem estática direta.
- [x] CHK021 As métricas não-funcionais de desempenho e tempo de carregamento estão quantificadas com limites numéricos? [Mensurabilidade, Spec §Success Criteria]
  *Evidência*: Latência de áudio $< 150\text{ms}$; carregamento total $< 2\text{s}$ em 4G; peso total de ativos $< 5\text{MB}$.
- [x] CHK022 A tela de consagração e a premiação final possuem critérios de disparo e conteúdo especificados? [Completude, Spec §FR-015, Data Model §1.5]
  *Evidência*: Disparada unicamente com 100% de acerto no Nível 1 e Nível 2; exibe ilustração do troféu e título "Saber Matemático".

---

## Conclusão da Avaliação de Clareza

- **Total de Itens Auditados**: 22 itens de qualidade.
- **Itens Aprovados (Sem Ambiguidade)**: 22 / 22 (100%).
- **Requisitos Vagos Detectados**: 0. Todos os termos qualitativos ("lúdica", "realista", "didática", "subtração concreta", "bloqueio rígido") estão devidamente ancorados em critérios quantitativos, estruturas de dados ou regras algorítmicas objetivas.
