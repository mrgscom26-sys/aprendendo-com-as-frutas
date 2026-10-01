# Implementation Plan: Aprendendo com as Frutas

**Branch**: `001-aprendendo-frutas` | **Date**: 2026-09-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from [`specs/001-aprendendo-frutas/spec.md`](spec.md)

---

## Summary

Desenvolvimento da aplicação web educacional e interativa "Aprendendo com as Frutas" para crianças do 2º ano do Ensino Fundamental. O projeto recria o ambiente de uma feira livre de frutas regionais brasileiras onde a criança atua como consumidora.
A implementação utiliza estritamente tecnologias web nativas (**HTML5**, **CSS3** e **JavaScript Vanilla**), sem frameworks ou dependências de compilação. O sistema implementa arrastar e soltar (*drag and drop*) universal com preservação visual do espaço vazio na bancada (introdução intuitiva à subtração), locução de voz feminina didática acionada no evento `onDragStart`, controle rígido de pureza de cestos e questionários matemáticos com 3 alternativas por pergunta, culminando na premiação com o troféu "Saber Matemático".

---

## Technical Context

**Language/Version**: HTML5, CSS3 (Modern Grid/Flexbox), JavaScript (ES6+ Vanilla).  
**Primary Dependencies**: Nenhuma (Zero frameworks como React, Vue ou Angular; bibliotecas externas dispensadas para garantir autonomia total).  
**APIs Nativas Utilizadas**:
- **HTML5 Drag and Drop API** + suporte unificado a **Pointer Events** para dispositivos móveis táteis.
- **Web Speech API** (`SpeechSynthesisUtterance`) para síntese de voz feminina didática em português (`pt-BR`) e **Web Audio API** para síntese dinâmica de efeitos sonoros em tempo real por osciladores, garantindo autonomia estática sem necessidade de arquivos externos de áudio.  
**Storage**: N/A (Stateless / Memória volátil do navegador, sem banco de dados ou backend, garantindo conformidade estrita com LGPD infantil).  
**Testing**: Roteiros de testes de aceitação descritos em [`quickstart.md`](quickstart.md) e validações manuais cobrindo cenários P1, P2 e P3.  
**Target Platform**: Navegadores modernos (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari) em ambientes desktop, tablets e smartphones.  
**Project Type**: Single-Page Application (SPA) estática pura.  
**Performance Goals**: Carregamento total em < 2s; latência entre toque e disparo da voz < 150ms; animações fluidas a 60 FPS.  
**Constraints**: Zero backend; 100% hospedável em servidores estáticos (GitHub Pages, Vercel, Netlify, Cloudflare Pages ou visualização local direta via `file:///`).  
**Scale/Scope**: 2 níveis pedagógicos completos, 6 espécies de frutas regionais, 3 categorias de tamanho, 4 modalidades de quiz e troféu comemorativo.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Princípio Constitucional | Status | Avaliação Técnica no Plano |
| :--- | :---: | :--- |
| **I. Interface Lúdica, Responsiva e Naturalista** | **PASS** | CSS Grid e Flexbox com breakpoint fluido (360px a 4K). Imagens realistas das 6 frutas regionais com dimensões táteis mínimas de 48x48px. |
| **II. Feedback Sonoro Didático Exclusivo** | **PASS** | Voz feminina em `pt-BR` disparada unicamente em `onDragStart`. Sem ruídos em loop contínuo; áudios anteriores interrompidos instantaneamente. |
| **III. Mecânica de Subtração via Drag & Drop** | **PASS** | Ao arrastar uma fruta para o cesto, o slot de origem na bancada torna-se `.empty` e permanece visualmente vago, sem reorganização dos outros itens. Ação reversível (devolver ao slot vazio). |
| **IV. Validação Rígida de Progressão** | **PASS** | Validador algorítmico impede avanço para o Nível 2 se houver mistura de espécies nos cestos ou alternativas incorretas no quiz. |
| **V. Avaliação Padronizada em 3 Alternativas** | **PASS** | Gerador de perguntas e distratores garante sempre 3 opções distintas, com exatamente 1 resposta matematicamente correta. |
| **VI. Arquitetura Client-Side Pura e Stateless** | **PASS** | Código 100% estático em `index.html`, `styles.css` e `app.js`. Zero backend, zero banco de dados, compatível com qualquer CDN/hospedagem estática. |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-aprendendo-frutas/
├── spec.md                 # Especificação funcional com cenários e requisitos
├── plan.md                 # Este documento de planejamento técnico de implementação
├── research.md             # Pesquisa técnica e decisões de arquitetura da Phase 0
├── data-model.md           # Modelo de dados, entidades e máquina de estados da Phase 1
├── quickstart.md           # Guia de execução local e roteiro de testes da Phase 1
├── contracts/
│   └── game-schema.json    # Contrato formal de validação de dados e configurações
└── checklists/
    └── requirements.md     # Checklist de qualidade da especificação
```

### Source Code (repository root)

```text
aprendendo-com-as-frutas/
├── index.html              # Marcação semântica da aplicação: Header, Feira, Bancada, Cestos, Quiz Modal, Troféu
├── styles.css              # Estilos responsivos, paleta de feira regional, slots de madeira, cestos de palha, animações
├── app.js                  # Módulo monolítico limpo: StateMachine, AudioEngine, DragDropEngine, QuizEngine, UIController
└── assets/
    └── images/             # Imagens realistas de alta fidelidade (.jpg)
        ├── acai.jpg        # Fruta pequena
        ├── buriti.jpg      # Fruta pequena
        ├── manga.jpg       # Fruta média
        ├── cupuacu.jpg     # Fruta média
        ├── jaca.jpg        # Fruta grande
        ├── melancia.jpg    # Fruta grande
        ├── cesto-palha.jpg # Cesto de palha artesanal
        └── trofeu.jpg      # Troféu "Saber Matemático"
```

**Structure Decision**: Adoção de uma estrutura estática direta na raiz do repositório (`index.html`, `styles.css`, `app.js` e `assets/`). Essa escolha elimina necessidade de etapas de compilação ou empacotamento, permitindo que qualquer educador, estudante ou desenvolvedor execute o projeto com um simples clique ou hospede instantaneamente em serviços de páginas estáticas.

---

## Componentes Arquiteturais do Código (`app.js`)

1. **`GameCatalog`**: Módulo com a definição canônica das frutas (id, nome, categoria, preço, escalas e textos de pronúncia).
2. **`SpeechManager`**: Módulo responsável pelo gerenciamento de áudio via `SpeechSynthesis`, filtrando vozes femininas em português brasileiro, controlando taxa de elocução didática e acionando fallbacks de arquivos `.mp3` se necessário.
3. **`DragDropController`**: Módulo que gerencia o ciclo de vida do arraste:
   - Disparo do evento `onDragStart` associado à emissão sonora da fruta.
   - Aplicação de classes CSS de feedback visual (`.dragging`, `.drag-over`).
   - Depósito no cesto (`drop`) com remoção da bancada e preservação do slot vazio (`.empty`).
   - Retorno reversível de frutas do cesto de volta a slots vazios da bancada.
   - Suporte unificado para mouse e eventos táteis de toque (*touch*).
4. **`QuizEngine`**: Módulo que formula dinamicamente as questões de classificação, contagem e precificação:
   - Geração estrita de 3 alternativas únicas (1 correta e 2 distratores plausíveis).
   - Gerenciamento de tentativas na mesma tela (desabilitando a alternativa incorreta selecionada sem reiniciar o jogo).
5. **`LevelManager`**: Máquina de estados que controla a progressão:
   - Configuração da bancada do Nível 1 (1 a 6 frutas por tipo).
   - Validação da organização dos 6 cestos (pureza e quantidade mínima).
   - Transição e configuração da bancada do Nível 2 (mínimo de 8 frutas por tipo).
   - Apresentação final do troféu "Saber Matemático".

---

## Complexity Tracking

> Nenhuma violação constitucional detectada. A arquitetura mantém complexidade mínima com zero dependências externas.
