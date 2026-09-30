# Phase 0 Research: Aprendendo com as Frutas

**Feature**: `001-aprendendo-frutas`  
**Date**: 2026-09-30  
**Status**: Completed  

---

## 1. Drag and Drop Nativo com Suporte Universal (Desktop & Mobile)

### Desafio
O usuário especificou a API nativa de Drag and Drop do HTML5 (`dragstart`, `dragover`, `drop`). No entanto, a especificação e a Constituição (Princípio I) exigem funcionamento fluido em computadores desktop e dispositivos móveis (tablets e smartphones escolares). Os navegadores mobile (iOS Safari e Android Chrome) têm suporte limitado ou inconsistente para a API tradicional de HTML5 Drag and Drop baseada em mouse.

### Solução Arquitetural
- **Implementação Híbrida/Pointer Events Unificados**:
  - Para desktop: Suporte nativo aos eventos HTML5 `dragstart`, `dragend`, `dragover`, `drop`, `dragenter`, `dragleave` com atributo `draggable="true"`.
  - Para mobile/touch: Suporte transparente via Pointer Events (`pointerdown`, `pointermove`, `pointerup`, `pointercancel`) ou touch events com coordenadas `document.elementFromPoint(x, y)`.
  - Ambas as abordagens utilizam o mesmo motor de regras e estado centralizado (`handleFruitPickup`, `handleFruitDrop`, `handleFruitReturn`).
  - O evento `onDragStart` (ou `pointerdown` que inicia o deslocamento) dispara imediatamente a locução da voz didática.

---

## 2. Síntese de Voz Didática Feminina (Web Speech API) & Fallback

### Desafio
A aplicação deve acionar exclusivamente uma voz feminina clara e didática em português brasileiro (`pt-BR`) quando o aluno inicia o arraste da fruta (`onDragStart`), sem atrasos e sem travar em navegadores offline ou sem vozes instaladas.

### Solução Técnica
1. **Web Speech API (`window.speechSynthesis`)**:
   - Detecção de vozes disponíveis via `speechSynthesis.getVoices()`.
   - Filtro prioritário por idioma `pt-BR` / `pt_BR` e perfil feminino (ex.: identificando nomes como "Luciana", "Francisca", "Heloisa", "Maria", "Google português do Brasil", "Yara", "Leticia", etc., ou vozes marcadas como femininas no sistema).
   - Configurações do `SpeechSynthesisUtterance`:
     - `rate: 0.9` (fala ligeiramente mais cadenciada e didática para crianças de 7-8 anos).
     - `pitch: 1.1` (timbre feminino acolhedor).
     - `lang: 'pt-BR'`.
2. **Prevenção de Falhas e Concorrência**:
   - `speechSynthesis.cancel()` é chamado imediatamente antes de cada nova locução, garantindo que arrastes rápidos não sobreponham áudios.
   - **Mapeamento de Fallback**: Caso o navegador do usuário bloqueie o sintetizador ou não possua vozes `pt-BR` instaladas, o sistema possui um mapeamento de fallback via Web Audio API / `Audio` sintetizado ou pré-gerado em cache (`assets/audio/[fruta].mp3`).

---

## 3. Representação Visual das Frutas Regionais e Espaço Vazio na Bancada

### Desafio
A Constituição exige imagens naturalistas e realistas das 6 frutas regionais (Açaí, Buriti, Manga, Cupuaçu, Jaca e Melancia) e a conservação do espaço físico vazio na bancada ao retirar a fruta para simbolizar a subtração concreta.

### Solução Técnica
1. **Estrutura da Bancada em Slots Fixos**:
   - A bancada utiliza CSS Grid com células/slots pré-posicionados com dimensões fixas (ex.: `slot-1`, `slot-2`, ...).
   - Cada slot possui um marcador visual de "lugar vazio" sutil (marca d'água de esteira de palha ou contorno em relevo da madeira).
   - Quando a fruta é retirada do slot, a classe `.occupied` é removida e a fruta vira filha do elemento arrastado ou do cesto de palha, mantendo o slot no DOM com a classe `.empty`.
   - **Nenhum rearranjo (reflow/repack) ocorre na bancada**, atendendo com 100% de rigor ao princípio pedagógico da subtração visual concreta.
2. **Ativos Visuais**:
   - Cada uma das 6 frutas possui representação realista de alta definição (fotografia recortada ou vetor naturalista com sombras e texturas hiper-realistas).
   - As escalas relativas no CSS refletem os tamanhos:
     - Pequenas (Açaí, Buriti): tamanho visual compacto (~48-56px).
     - Médias (Manga, Cupuaçu): tamanho visual médio (~72-80px).
     - Grandes (Melancia, Jaca): tamanho visual imponente (~96-112px).

---

## 4. Motor de Quiz e Validação Pedagógica Rígida

### Desafio
Garantir que exatamente 3 alternativas sejam geradas para cada pergunta, com 1 correta e 2 distratores plausíveis (sem duplicatas), e que tentativas erradas não reiniciem o jogo, mas bloqueiem rigorosamente o avanço.

### Solução Algorítmica
1. **Geração de Alternativas**:
   - Cálculo da resposta correta $C$.
   - Geração de distratores:
     - Para contagem: $C \pm 1$, $C \pm 2$ (garantindo valores $> 0$ e $\neq C$).
     - Para preço: $(C \pm \text{preço\_unitario})$ ou cálculos alternativos comuns (ex.: esquecer de multiplicar ou somar apenas uma unidade).
     - Embaralhamento aleatório (Fisher-Yates) das 3 opções.
2. **Mecânica de Retry Formativo**:
   - Ao clicar na alternativa incorreta:
     - Botão recebe classe `.btn-incorrect` (desabilitado e com leve animação *shake*).
     - Mensagem de áudio/texto: *"Tente novamente!"*.
     - O estado da pergunta continua ativo aguardando a seleção de uma das opções restantes.
   - Ao clicar na alternativa correta:
     - Botão recebe classe `.btn-correct` (efeito de sucesso / comemoração).
     - Avança para a próxima pergunta da fase.
3. **Validação de Cestos**:
   - Função `validateBaskets()` verifica cada cesto:
     - Se `cesto.frutas.length === 0`: Notifica *"Coloque ao menos uma fruta no cesto do [Nome]"*.
     - Se `cesto.frutas.some(f => f.especie !== cesto.especieAlvo)`: Notifica *"Atenção! Tem fruta no cesto errado!"* e destaca visualmente o cesto com erro para que o aluno devolva a fruta para a bancada.

---

## 5. Arquitetura Estática e Zero Dependências de Build

### Decisão
- Sem bundlers (Webpack, Vite, Rollup) ou transpiladores (Babel) para máxima simplicidade e execução instantânea via duplo-clique no navegador ou serviço estático direto.
- Estrutura pura:
  - `index.html` (marcação acessível e semântica com tags ARIA).
  - `styles.css` (variáveis CSS modernas, Grid, Flexbox, media queries responsivas).
  - `app.js` (código modular organizado em objetos/namespaces com IIFE ou classes ES6 nativas).
