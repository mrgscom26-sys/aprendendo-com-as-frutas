/**
 * Aprendendo com as Frutas - Aplicação Educacional Interativa
 * 2º Ano do Ensino Fundamental
 *
 * Módulos:
 * 1. FruitCatalog & GameState (Catálogo Oficial e Máquina de Estados)
 * 2. AudioEffects & SpeechManager (Web Audio API & Web Speech API com voz feminina)
 * 3. DragDropEngine (HTML5 Drag & Drop Nativo + Suporte a Touch/Pointer Events)
 * 4. QuizEngine (Avaliação com 3 Alternativas e Retry Formativo)
 * 5. LevelManager & UIController (Controle de Fases, Validação e Troféu)
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. Catálogo Oficial das Frutas Regionais e Estado da Sessão
     ========================================================================== */
  const FRUIT_CATALOG = {
    acai: {
      id: 'acai',
      name: 'Açaí',
      category: 'pequena',
      categoryLabel: 'Pequena',
      price: 1,
      image: 'assets/images/acai.jpg',
      scaleClass: 'fruit-small',
      audioText: 'Açaí'
    },
    buriti: {
      id: 'buriti',
      name: 'Buriti',
      category: 'pequena',
      categoryLabel: 'Pequena',
      price: 2,
      image: 'assets/images/buriti.jpg',
      scaleClass: 'fruit-small',
      audioText: 'Buriti'
    },
    manga: {
      id: 'manga',
      name: 'Manga',
      category: 'media',
      categoryLabel: 'Média',
      price: 3,
      image: 'assets/images/manga.jpg',
      scaleClass: 'fruit-medium',
      audioText: 'Manga'
    },
    cupuacu: {
      id: 'cupuacu',
      name: 'Cupuaçu',
      category: 'media',
      categoryLabel: 'Média',
      price: 4,
      image: 'assets/images/cupuacu.jpg',
      scaleClass: 'fruit-medium',
      audioText: 'Cupuaçu'
    },
    jaca: {
      id: 'jaca',
      name: 'Jaca',
      category: 'grande',
      categoryLabel: 'Grande',
      price: 5,
      image: 'assets/images/jaca.jpg',
      scaleClass: 'fruit-large',
      audioText: 'Jaca'
    },
    melancia: {
      id: 'melancia',
      name: 'Melancia',
      category: 'grande',
      categoryLabel: 'Grande',
      price: 10,
      image: 'assets/images/melancia.jpg',
      scaleClass: 'fruit-large',
      audioText: 'Melancia'
    }
  };

  const FRUIT_IDS = ['acai', 'buriti', 'manga', 'cupuacu', 'jaca', 'melancia'];

  const FRUIT_PLURALS = {
    acai: { singular: 'açaí', plural: 'açaís' },
    buriti: { singular: 'buriti', plural: 'buritis' },
    manga: { singular: 'manga', plural: 'mangas' },
    cupuacu: { singular: 'cupuaçu', plural: 'cupuaçus' },
    jaca: { singular: 'jaca', plural: 'jacas' },
    melancia: { singular: 'melancia', plural: 'melancias' }
  };

  const GameState = {
    currentLevel: 1, // 1 ou 2
    phase: 'ORGANIZING', // 'ORGANIZING' | 'QUIZ' | 'CELEBRATION'
    benchSlots: [], // { slotId, fruitId, instanceId, isOccupied }
    baskets: {}, // { [fruitId]: { targetFruitId, items: [] } }
    quizQuestions: [],
    currentQuestionIndex: 0,
    soundEnabled: true,
    draggedItem: null, // item ativo em arraste
    selectedFruit: null // fruta atualmente selecionada por clique ou toque
  };

  /* ==========================================================================
     2. Módulo de Áudio: Efeitos Sonoros e Síntese de Voz Didática
     ========================================================================== */
  const AudioEngine = {
    ctx: null,

    initContext() {
      if (typeof window === 'undefined') return;
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    },

    playTone(frequency, type, duration, delay = 0, gainLevel = 0.2) {
      if (typeof window === 'undefined' || !GameState.soundEnabled) return;
      try {
        this.initContext();
        if (!this.ctx) return;
        const now = this.ctx.currentTime + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, now);

        gain.gain.setValueAtTime(gainLevel, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      } catch (e) {
        console.warn('Audio tone error:', e);
      }
    },

    playDrop() {
      // Som suave de impacto na palha/madeira
      this.playTone(180, 'sine', 0.12, 0, 0.25);
    },

    playSuccess() {
      // Acorde alegre de acerto (C5 -> E5 -> G5)
      this.playTone(523.25, 'sine', 0.15, 0, 0.2);
      this.playTone(659.25, 'sine', 0.2, 0.1, 0.2);
      this.playTone(783.99, 'triangle', 0.35, 0.2, 0.25);
    },

    playError() {
      // Toque suave descendente encorajador
      this.playTone(330, 'triangle', 0.18, 0, 0.2);
      this.playTone(260, 'sine', 0.25, 0.12, 0.2);
    },

    playFanfare() {
      // Fanfarra triunfal do troféu
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        this.playTone(freq, 'triangle', 0.35, idx * 0.14, 0.3);
      });
      setTimeout(() => {
        this.playTone(1046.50, 'sine', 0.8, 0, 0.35);
      }, 700);
    }
  };

  const SpeechManager = {
    selectedVoice: null,
    voicesLoaded: false,

    init() {
      if ('speechSynthesis' in window) {
        const loadVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            this.voicesLoaded = true;
            // Busca preferencial por voz feminina em português do Brasil
            this.selectedVoice = voices.find(v =>
              (v.lang === 'pt-BR' || v.lang === 'pt_BR') &&
              /luciana|francisca|heloisa|maria|leticia|yara|female|feminina|google português do brasil/i.test(v.name)
            ) || voices.find(v => v.lang === 'pt-BR' || v.lang.startsWith('pt')) || null;
          }
        };

        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = loadVoices;
        }
      }
    },

    speak(text, priority = false) {
      if (typeof window === 'undefined' || !GameState.soundEnabled || !('speechSynthesis' in window)) return;

      try {
        // Princípio II: Interrompe qualquer som prévio para evitar poluição auditiva
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.9; // Cadência didática, clara para crianças
        utterance.pitch = 1.1; // Timbre acolhedor

        if (this.selectedVoice) {
          utterance.voice = this.selectedVoice;
        }

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Erro na síntese de voz:', err);
      }
    },

    speakFruitName(fruitId) {
      const fruit = FRUIT_CATALOG[fruitId];
      if (fruit) {
        this.speak(fruit.audioText);
      }
    }
  };

  /* ==========================================================================
     3. Mecânica de Drag and Drop (HTML5 Nativo + Pointer/Touch Events)
     ========================================================================== */
  const DragDropEngine = {
    touchClone: null,
    dragData: null,
    touchDragData: null,
    selectedFruit: null,
    touchOriginX: 0,
    touchOriginY: 0,
    hasMoved: false,
    isPointerDragging: false,

    init() {
      this.bindBenchEvents();
      this.bindBasketEvents();
      this.bindGlobalPointerEvents();
    },

    bindGlobalPointerEvents() {
      // Cancela arraste tátil flutuante se houver cancelamento de ponteiro (touch)
      window.addEventListener('pointercancel', () => {
        if (this.isPointerDragging) {
          this.removeTouchClone();
          this.clearDragOverStates();
          this.touchDragData = null;
          this.isPointerDragging = false;
        }
      });

      // Clique global no fundo desmarca fruta selecionada se clicar fora de alvos interativos
      window.addEventListener('click', (e) => {
        if (!e.target.closest('.fruit-item') && !e.target.closest('.basket-card') && !e.target.closest('.bench-slot')) {
          this.clearSelectedFruit();
        }
      });
    },

    // Seleção com clique ou toque simples (Acessibilidade)
    selectFruit(data, element) {
      this.clearSelectedFruit();
      this.selectedFruit = data;
      GameState.selectedFruit = data;
      if (element) {
        element.classList.add('selected');
      }
      SpeechManager.speakFruitName(data.fruitId);
      const fruitName = FRUIT_CATALOG[data.fruitId]?.name || data.fruitId;
      if (data.source === 'bench') {
        UIController.setFeedbackMessage(`Fruta ${fruitName} selecionada! Arraste ou clique no cesto para guardar.`);
      } else {
        UIController.setFeedbackMessage(`Fruta ${fruitName} selecionada no cesto! Arraste ou clique em um espaço vazio da bancada para devolver.`);
      }
    },

    clearSelectedFruit() {
      this.selectedFruit = null;
      GameState.selectedFruit = null;
      if (typeof document !== 'undefined') {
        document.querySelectorAll('.fruit-item.selected, .basket-fruit-item.selected').forEach(el => el.classList.remove('selected'));
      }
    },

    bindBenchEvents() {
      const benchGrid = document.getElementById('bench-grid');

      // Drag Over (HTML5 Drag & Drop)
      benchGrid.addEventListener('dragover', (e) => {
        const slot = e.target.closest('.bench-slot.empty');
        if (slot) {
          e.preventDefault();
          if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'move';
          }
          slot.classList.add('drag-over');
        }
      });

      benchGrid.addEventListener('dragenter', (e) => {
        const slot = e.target.closest('.bench-slot.empty');
        if (slot) {
          e.preventDefault();
          slot.classList.add('drag-over');
        }
      });

      benchGrid.addEventListener('dragleave', (e) => {
        const slot = e.target.closest('.bench-slot');
        if (slot && !slot.contains(e.relatedTarget)) {
          slot.classList.remove('drag-over');
        }
      });

      // Drop na Bancada (HTML5 Drag & Drop)
      benchGrid.addEventListener('drop', (e) => {
        const slot = e.target.closest('.bench-slot.empty');
        if (slot) {
          e.preventDefault();
          e.stopPropagation();
          slot.classList.remove('drag-over');
          const targetSlotId = slot.dataset.slotId;

          let payload = this.dragData || GameState.draggedItem || this.selectedFruit;
          if (!payload && e.dataTransfer) {
            try {
              const raw = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
              if (raw) payload = JSON.parse(raw);
            } catch (_) {}
          }

          if (payload) {
            this.handleDropOnBench(targetSlotId, payload);
          }
          this.clearDragOverStates();
          this.clearSelectedFruit();
        }
      });

      // Clique em slot vazio da bancada para devolver fruta selecionada (Click-to-Return)
      benchGrid.addEventListener('click', (e) => {
        const slot = e.target.closest('.bench-slot.empty');
        if (slot && this.selectedFruit && this.selectedFruit.source === 'basket') {
          const targetSlotId = slot.dataset.slotId;
          this.handleDropOnBench(targetSlotId, this.selectedFruit);
          this.clearSelectedFruit();
        }
      });
    },

    bindBasketEvents() {
      const basketsGrid = document.getElementById('baskets-grid');

      // Drag Over (HTML5 Drag & Drop)
      basketsGrid.addEventListener('dragover', (e) => {
        const basketCard = e.target.closest('.basket-card');
        if (basketCard) {
          e.preventDefault();
          if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'move';
          }
          basketCard.classList.add('drag-over');
        }
      });

      basketsGrid.addEventListener('dragenter', (e) => {
        const basketCard = e.target.closest('.basket-card');
        if (basketCard) {
          e.preventDefault();
          basketCard.classList.add('drag-over');
        }
      });

      basketsGrid.addEventListener('dragleave', (e) => {
        const basketCard = e.target.closest('.basket-card');
        if (basketCard && !basketCard.contains(e.relatedTarget)) {
          basketCard.classList.remove('drag-over');
        }
      });

      // Drop no Cesto (HTML5 Drag & Drop)
      basketsGrid.addEventListener('drop', (e) => {
        const basketCard = e.target.closest('.basket-card');
        if (basketCard) {
          e.preventDefault();
          e.stopPropagation();
          basketCard.classList.remove('drag-over');

          const targetBasketFruitId = basketCard.dataset.targetFruitId;

          // Recuperação robusta de dados via memória local, dataTransfer e GameState
          let payload = this.dragData || GameState.draggedItem || this.selectedFruit;
          if (!payload && e.dataTransfer) {
            try {
              const raw = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
              if (raw) payload = JSON.parse(raw);
            } catch (_) {}
          }

          if (payload) {
            this.handleDropOnBasket(targetBasketFruitId, payload);
          }
          this.clearDragOverStates();
          this.clearSelectedFruit();
        }
      });

      // Clique no cesto para alocar fruta selecionada (Click-to-Place)
      basketsGrid.addEventListener('click', (e) => {
        const basketCard = e.target.closest('.basket-card');
        if (basketCard && this.selectedFruit) {
          const targetBasketFruitId = basketCard.dataset.targetFruitId;
          this.handleDropOnBasket(targetBasketFruitId, this.selectedFruit);
          this.clearSelectedFruit();
        }
      });
    },

    // Configura eventos nos itens de frutas renderizados
    attachFruitEvents(fruitElement, data) {
      // 1. Eventos nativos HTML5 Drag & Drop (Mouse/Desktop)
      fruitElement.setAttribute('draggable', 'true');

      fruitElement.addEventListener('dragstart', (e) => {
        this.dragData = data;
        GameState.draggedItem = data;
        this.selectedFruit = data;

        // Princípio II: Disparo mandatório da voz feminina ao selecionar e arrastar
        SpeechManager.speakFruitName(data.fruitId);

        fruitElement.classList.add('dragging');

        if (e.dataTransfer) {
          e.dataTransfer.setData('application/json', JSON.stringify(data));
          e.dataTransfer.setData('text/plain', JSON.stringify(data));
          e.dataTransfer.effectAllowed = 'move';
        }
      });

      fruitElement.addEventListener('dragend', () => {
        fruitElement.classList.remove('dragging');
        this.clearDragOverStates();
        // Não limpa imediatamente para garantir que o evento drop processe primeiro
        setTimeout(() => {
          if (this.dragData === data) this.dragData = null;
          if (GameState.draggedItem === data) GameState.draggedItem = null;
        }, 80);
      });

      // 2. Eventos de Ponteiro / Toque para Tablets e Dispositivos Móveis
      fruitElement.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse') return;

        this.touchOriginX = e.clientX;
        this.touchOriginY = e.clientY;
        this.hasMoved = false;
        this.dragData = data;
        this.touchDragData = data;
        GameState.draggedItem = data;
        this.isPointerDragging = true;

        SpeechManager.speakFruitName(data.fruitId);

        try {
          fruitElement.setPointerCapture(e.pointerId);
        } catch (_) {}
      });

      fruitElement.addEventListener('pointermove', (e) => {
        if (!this.isPointerDragging || !this.touchDragData) return;

        const deltaX = Math.abs(e.clientX - this.touchOriginX);
        const deltaY = Math.abs(e.clientY - this.touchOriginY);

        if (deltaX > 6 || deltaY > 6) {
          this.hasMoved = true;
          this.updateTouchClone(e.clientX, e.clientY, data.fruitId);
          this.checkHoverTargets(e.clientX, e.clientY);
        }
      });

      fruitElement.addEventListener('pointerup', (e) => {
        if (this.isPointerDragging && this.touchDragData) {
          try {
            fruitElement.releasePointerCapture(e.pointerId);
          } catch (_) {}

          if (this.hasMoved) {
            this.handlePointerDrop(e.clientX, e.clientY, this.touchDragData);
          } else {
            // Toque rápido sem arrastar: seleciona a fruta
            this.selectFruit(data, fruitElement);
          }
        }

        this.removeTouchClone();
        this.clearDragOverStates();
        this.isPointerDragging = false;
        setTimeout(() => {
          if (this.touchDragData === data) this.touchDragData = null;
          if (this.dragData === data) this.dragData = null;
          if (GameState.draggedItem === data) GameState.draggedItem = null;
        }, 80);
      });

      // 3. Clique simples com mouse para selecionar a fruta (Acessibilidade)
      fruitElement.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.selectedFruit && this.selectedFruit.instanceId === data.instanceId) {
          this.clearSelectedFruit();
          UIController.setFeedbackMessage('Seleção desfeita. Arraste ou clique em uma fruta para começar.');
        } else {
          this.selectFruit(data, fruitElement);
        }
      });
    },

    updateTouchClone(x, y, fruitId) {
      if (!this.touchClone) {
        const fruit = FRUIT_CATALOG[fruitId];
        this.touchClone = document.createElement('div');
        this.touchClone.className = 'drag-touch-clone ' + fruit.scaleClass;
        this.touchClone.innerHTML = `<img src="${fruit.image}" alt="${fruit.name}" class="fruit-img">`;
        document.body.appendChild(this.touchClone);
      }
      this.touchClone.style.left = `${x}px`;
      this.touchClone.style.top = `${y}px`;
    },

    removeTouchClone() {
      if (this.touchClone && this.touchClone.parentNode) {
        this.touchClone.parentNode.removeChild(this.touchClone);
      }
      this.touchClone = null;
    },

    checkHoverTargets(x, y) {
      this.clearDragOverStates();

      // Esconde temporariamente o clone para elementFromPoint enxergar o alvo
      if (this.touchClone) {
        this.touchClone.style.display = 'none';
      }

      const elem = document.elementFromPoint(x, y);

      if (this.touchClone) {
        this.touchClone.style.display = 'block';
      }

      if (!elem) return;

      const basketCard = elem.closest('.basket-card');
      if (basketCard) {
        basketCard.classList.add('drag-over');
        return;
      }

      const emptySlot = elem.closest('.bench-slot.empty');
      if (emptySlot) {
        emptySlot.classList.add('drag-over');
      }
    },

    handlePointerDrop(x, y, dataPayload) {
      const payload = dataPayload || this.touchDragData || this.dragData || GameState.draggedItem;
      if (!payload) return;

      if (this.touchClone) {
        this.touchClone.style.display = 'none';
      }

      const elem = document.elementFromPoint(x, y);

      if (this.touchClone) {
        this.touchClone.style.display = 'block';
      }

      if (!elem) return;

      const basketCard = elem.closest('.basket-card');
      if (basketCard) {
        const targetFruitId = basketCard.dataset.targetFruitId;
        this.handleDropOnBasket(targetFruitId, payload);
        return;
      }

      const emptySlot = elem.closest('.bench-slot.empty');
      if (emptySlot) {
        const targetSlotId = emptySlot.dataset.slotId;
        this.handleDropOnBench(targetSlotId, payload);
      }
    },

    clearDragOverStates() {
      document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    },

    // Ação: Fruta solta no Cesto
    handleDropOnBasket(targetFruitId, dataPayload) {
      const payload = dataPayload || this.dragData || GameState.draggedItem || this.selectedFruit;
      if (!payload || !targetFruitId) return;

      const { instanceId, fruitId, source, originSlotId, originBasketId } = payload;

      if (source === 'bench') {
        // Princípio III: A vaga na bancada permanece vazia (Subtração Concreta)
        const slot = GameState.benchSlots.find(s => s.slotId === originSlotId);
        if (slot) {
          slot.isOccupied = false;
        }

        if (!GameState.baskets[targetFruitId]) {
          GameState.baskets[targetFruitId] = { targetFruitId, items: [] };
        }

        // Adiciona a fruta no cesto
        GameState.baskets[targetFruitId].items.push({
          instanceId,
          fruitId,
          originSlotId
        });

        const fruitName = FRUIT_CATALOG[fruitId]?.name || fruitId;
        const basketName = FRUIT_CATALOG[targetFruitId]?.name || targetFruitId;
        UIController.setFeedbackMessage(`Você colocou ${fruitName} no cesto de ${basketName}!`);
      } else if (source === 'basket' && originBasketId !== targetFruitId) {
        // Transferência entre cestos
        const originBasket = GameState.baskets[originBasketId];
        if (originBasket) {
          const itemIdx = originBasket.items.findIndex(it => it.instanceId === instanceId);
          if (itemIdx !== -1) {
            const [movedItem] = originBasket.items.splice(itemIdx, 1);
            if (!GameState.baskets[targetFruitId]) {
              GameState.baskets[targetFruitId] = { targetFruitId, items: [] };
            }
            GameState.baskets[targetFruitId].items.push(movedItem);
          }
        }
      }

      AudioEngine.playDrop();
      this.clearSelectedFruit();
      UIController.renderBenchSlots();
      UIController.renderBasketContents();
      UIController.updateBenchStats();
    },

    // Ação: Fruta devolvida para a Bancada (Desfazer Erro / Reversibilidade)
    handleDropOnBench(targetSlotId, dataPayload) {
      const payload = dataPayload || this.dragData || GameState.draggedItem || this.selectedFruit;
      if (!payload || !targetSlotId) return;

      const { instanceId, fruitId, source, originSlotId, originBasketId } = payload;
      const targetSlot = GameState.benchSlots.find(s => s.slotId === targetSlotId);
      if (!targetSlot || targetSlot.isOccupied) return;

      if (source === 'basket') {
        // Remove do cesto e reocupa o slot da bancada
        const basket = GameState.baskets[originBasketId];
        if (basket) {
          const itemIdx = basket.items.findIndex(it => it.instanceId === instanceId);
          if (itemIdx !== -1) {
            basket.items.splice(itemIdx, 1);
            targetSlot.isOccupied = true;
            targetSlot.fruitId = fruitId;
            targetSlot.instanceId = instanceId;
          }
        }
        const fruitName = FRUIT_CATALOG[fruitId]?.name || fruitId;
        UIController.setFeedbackMessage(`Você devolveu ${fruitName} para a bancada.`);
      } else if (source === 'bench' && originSlotId !== targetSlotId) {
        // Move para outro slot vazio na bancada
        const originSlot = GameState.benchSlots.find(s => s.slotId === originSlotId);
        if (originSlot) {
          originSlot.isOccupied = false;
          targetSlot.isOccupied = true;
          targetSlot.fruitId = fruitId;
          targetSlot.instanceId = instanceId;
        }
      }

      AudioEngine.playDrop();
      this.clearSelectedFruit();
      UIController.renderBenchSlots();
      UIController.renderBasketContents();
      UIController.updateBenchStats();
    }
  };

  /* ==========================================================================
     4. Módulo de Quiz e Validação Pedagógica Rigorosa
     ========================================================================== */
  const QuizEngine = {
    // Gera as perguntas para o Nível 1 (Classificação de Tamanho + Contagem)
    generateLevel1Questions() {
      const questions = [];

      // Parte A: Classificação de Tamanho para as 6 espécies
      FRUIT_IDS.forEach((fruitId) => {
        const fruit = FRUIT_CATALOG[fruitId];
        questions.push({
          id: `q-size-${fruitId}`,
          type: 'size_class',
          fruitId: fruitId,
          badgeLabel: 'Tamanho da Fruta',
          prompt: `A fruta ${fruit.name} é pequena, média ou grande?`,
          options: [
            { id: 'opt-peq', label: 'Pequena', value: 'pequena', isCorrect: fruit.category === 'pequena' },
            { id: 'opt-med', label: 'Média', value: 'media', isCorrect: fruit.category === 'media' },
            { id: 'opt-gra', label: 'Grande', value: 'grande', isCorrect: fruit.category === 'grande' }
          ],
          explanation: `O ${fruit.name} é classificado como uma fruta ${fruit.categoryLabel.toLowerCase()}!`
        });
      });

      // Parte B: Contagem exata de frutas presentes em cada cesto
      FRUIT_IDS.forEach((fruitId) => {
        const fruit = FRUIT_CATALOG[fruitId];
        const actualCount = GameState.baskets[fruitId].items.length;
        const options = this.generateNumberOptions(actualCount);

        questions.push({
          id: `q-count-${fruitId}`,
          type: 'count',
          fruitId: fruitId,
          badgeLabel: 'Contagem no Cesto',
          prompt: `Quantas frutas ${fruit.name} estão no cesto?`,
          options: options,
          explanation: `Você colocou exatamente ${actualCount} ${actualCount === 1 ? 'fruta' : 'frutas'} no cesto de ${fruit.name}.`
        });
      });

      return questions;
    },

    // Gera as perguntas para o Nível 2 (Precificação por Cesto + Valor Total)
    generateLevel2Questions() {
      const questions = [];
      let grandTotal = 0;
      const basketBreakdown = [];

      // Perguntas de precificação por cesto
      FRUIT_IDS.forEach((fruitId) => {
        const fruit = FRUIT_CATALOG[fruitId];
        const count = GameState.baskets[fruitId].items.length;
        const basketTotal = count * fruit.price;
        grandTotal += basketTotal;

        const pluralInfo = FRUIT_PLURALS[fruitId] || { singular: fruit.name.toLowerCase(), plural: `${fruit.name.toLowerCase()}s` };
        const fruitNoun = count === 1 ? pluralInfo.singular : pluralInfo.plural;
        const operationText = `${count} ${fruitNoun} × R$ ${fruit.price},00 = ?`;

        basketBreakdown.push({
          fruitId: fruitId,
          fruitName: fruit.name,
          image: fruit.image,
          count: count,
          unitPrice: fruit.price,
          subtotal: basketTotal
        });

        const options = this.generatePriceOptions(basketTotal, fruit.price);

        questions.push({
          id: `q-price-${fruitId}`,
          type: 'basket_price',
          fruitId: fruitId,
          count: count,
          fruitNoun: fruitNoun,
          operationText: operationText,
          badgeLabel: 'Cálculo de Preço',
          prompt: `Quanto você pagará pelas frutas no cesto do ${fruit.name}? (Cada fruta custa R$ ${fruit.price},00)`,
          options: options,
          explanation: `${count} ${fruitNoun} × R$ ${fruit.price},00 = R$ ${basketTotal},00.`
        });
      });

      // Pergunta final consolidada do valor total de todos os cestos
      const additionFormulaText = basketBreakdown.map(b => `R$ ${b.subtotal},00`).join(' + ');
      const totalOptions = this.generateGrandTotalOptions(grandTotal);
      questions.push({
        id: 'q-price-total',
        type: 'total_price',
        fruitId: null,
        badgeLabel: 'Valor Total da Feira',
        basketBreakdown: basketBreakdown,
        additionFormulaText: additionFormulaText,
        prompt: 'Qual o valor total de todos os 6 cestos da feira? Some o valor de cada cesto para descobrir!',
        options: totalOptions,
        explanation: `A soma de todos os cestos resultou em R$ ${grandTotal},00 (${additionFormulaText} = R$ ${grandTotal},00). Excelente cálculo!`
      });

      return questions;
    },

    // Gera exatamente 3 opções numéricas distintas (1 correta e 2 distratores)
    generateNumberOptions(correct) {
      const distractorPool = [correct + 1, correct - 1, correct + 2, correct - 2, correct + 3]
        .filter(n => n > 0 && n !== correct);

      // Embaralha distratores
      distractorPool.sort(() => Math.random() - 0.5);

      const optionsValues = [correct, distractorPool[0], distractorPool[1]];
      optionsValues.sort(() => Math.random() - 0.5);

      return optionsValues.map((val, idx) => ({
        id: `opt-${idx}`,
        label: `${val}`,
        value: val,
        isCorrect: val === correct
      }));
    },

    // Gera 3 opções em reais para valor por cesto
    generatePriceOptions(correctTotal, unitPrice) {
      const d1 = correctTotal + unitPrice;
      const d2 = correctTotal > unitPrice ? correctTotal - unitPrice : correctTotal + (unitPrice * 2);

      const optionsValues = [correctTotal, d1, d2];
      // Garante unicidade estrita
      const uniqueValues = Array.from(new Set(optionsValues));
      while (uniqueValues.length < 3) {
        uniqueValues.push(correctTotal + (uniqueValues.length * 3));
      }
      uniqueValues.sort(() => Math.random() - 0.5);

      return uniqueValues.map((val, idx) => ({
        id: `opt-price-${idx}`,
        label: `R$ ${val},00`,
        value: val,
        isCorrect: val === correctTotal
      }));
    },

    // Gera 3 opções para o valor total consolidado
    generateGrandTotalOptions(correctTotal) {
      const d1 = correctTotal + 5;
      const d2 = correctTotal > 5 ? correctTotal - 5 : correctTotal + 10;
      const optionsValues = [correctTotal, d1, d2];
      // Garante unicidade estrita
      const uniqueValues = Array.from(new Set(optionsValues));
      while (uniqueValues.length < 3) {
        uniqueValues.push(correctTotal + (uniqueValues.length * 5));
      }
      uniqueValues.sort(() => Math.random() - 0.5);

      return uniqueValues.map((val, idx) => ({
        id: `opt-total-${idx}`,
        label: `R$ ${val},00`,
        value: val,
        isCorrect: val === correctTotal
      }));
    }
  };

  /* ==========================================================================
     5. Gerenciador de Níveis e Interface do Usuário (UIController)
     ========================================================================== */
  const LevelManager = {
    startLevel(levelNumber) {
      GameState.currentLevel = levelNumber;
      GameState.phase = 'ORGANIZING';
      GameState.benchSlots = [];
      GameState.baskets = {};
      GameState.quizQuestions = [];
      GameState.currentQuestionIndex = 0;

      // Inicializa os 6 cestos vazios
      FRUIT_IDS.forEach(id => {
        GameState.baskets[id] = {
          targetFruitId: id,
          items: []
        };
      });

      // Configuração de quantidades por nível
      let fruitQuantities = {};
      if (levelNumber === 1) {
        // Nível 1: Bancada com 27 frutas preenchendo todos os 27 slots da banca do feirante (preenche os 9 espaços vazios).
        // Frutas menos expostas na feira (Buriti, Cupuaçu, Jaca e Açaí) recebem 5 unidades cada,
        // Manga recebe 4 e Melancia recebe 3. Todas entre 1 e 6 por espécie (FR-006).
        fruitQuantities = {
          buriti: 5,
          cupuacu: 5,
          jaca: 5,
          acai: 5,
          manga: 4,
          melancia: 3
        };
      } else {
        // Nível 2: no mínimo 8 frutas por tipo (48 frutas ao todo)
        FRUIT_IDS.forEach(id => {
          fruitQuantities[id] = 8; // exatamente 8 frutas por espécie
        });
      }

      // Constrói slots fixos na bancada
      let slotIndex = 1;
      FRUIT_IDS.forEach(fruitId => {
        const qty = fruitQuantities[fruitId];
        for (let i = 1; i <= qty; i++) {
          GameState.benchSlots.push({
            slotId: `slot-${slotIndex}`,
            fruitId: fruitId,
            instanceId: `inst-${fruitId}-${i}`,
            isOccupied: true
          });
          slotIndex++;
        }
      });

      // Embaralha as frutas na bancada para desafio de organização
      this.shuffleBenchSlots();

      UIController.updateLevelBadge();
      UIController.renderBaskets();
      UIController.renderBenchSlots();
      UIController.updateBenchStats();
      UIController.updateGuidanceText();
    },

    shuffleBenchSlots() {
      // Embaralha a distribuição de frutas entre os slots
      const fruitsToDistribute = GameState.benchSlots.map(s => ({
        fruitId: s.fruitId,
        instanceId: s.instanceId
      }));
      fruitsToDistribute.sort(() => Math.random() - 0.5);

      GameState.benchSlots.forEach((slot, idx) => {
        slot.fruitId = fruitsToDistribute[idx].fruitId;
        slot.instanceId = fruitsToDistribute[idx].instanceId;
        slot.isOccupied = true;
      });
    },

    // Verificação algorítmica pura da pureza dos cestos (testável sem DOM)
    checkBasketsPurity(baskets = GameState.baskets) {
      for (let fruitId of FRUIT_IDS) {
        const basket = baskets[fruitId];
        if (!basket || !basket.items || basket.items.length === 0) {
          return {
            isValid: false,
            errorType: 'EMPTY',
            problematicBasketId: fruitId,
            problematicFruitId: null
          };
        }
        const wrongFruit = basket.items.find(item => item.fruitId !== fruitId);
        if (wrongFruit) {
          return {
            isValid: false,
            errorType: 'MIXED',
            problematicBasketId: fruitId,
            problematicFruitId: wrongFruit.fruitId
          };
        }
      }
      return {
        isValid: true,
        errorType: null,
        problematicBasketId: null,
        problematicFruitId: null
      };
    },

    // Validação rígida: impede avanço se houver mistura ou cesto vazio
    validateBasketsForProgression() {
      // Remove destaques de erro anteriores
      if (typeof document !== 'undefined') {
        document.querySelectorAll('.basket-card').forEach(b => b.classList.remove('basket-error'));
      }

      const status = this.checkBasketsPurity(GameState.baskets);

      if (!status.isValid) {
        if (typeof document !== 'undefined') {
          const basketCard = document.querySelector(`.basket-card[data-target-fruit-id="${status.problematicBasketId}"]`);
          if (basketCard) basketCard.classList.add('basket-error');
        }

        const basketName = FRUIT_CATALOG[status.problematicBasketId]?.name || status.problematicBasketId;

        if (status.errorType === 'EMPTY') {
          AudioEngine.playError();
          UIController.showAlert(
            'Cesto Vazio!',
            `Você precisa colocar pelo menos uma fruta no cesto de ${basketName} antes de concluir a organização!`
          );
          return false;
        }

        if (status.errorType === 'MIXED') {
          const fruitName = FRUIT_CATALOG[status.problematicFruitId]?.name || status.problematicFruitId;
          AudioEngine.playError();
          UIController.showAlert(
            'Fruta no Cesto Errado!',
            `Atenção! Encontramos ${fruitName} no cesto de ${basketName}. Lembre-se: é proibido misturar as espécies!`
          );
          return false;
        }
      }

      // Validação passou com êxito!
      AudioEngine.playSuccess();
      this.startQuizPhase();
      return true;
    },

    startQuizPhase() {
      GameState.phase = 'QUIZ';
      if (GameState.currentLevel === 1) {
        GameState.quizQuestions = QuizEngine.generateLevel1Questions();
      } else {
        GameState.quizQuestions = QuizEngine.generateLevel2Questions();
      }
      GameState.currentQuestionIndex = 0;
      UIController.renderQuizQuestion();
    },

    handleQuizAnswer(selectedOption, optionBtn) {
      const currentQuestion = GameState.quizQuestions[GameState.currentQuestionIndex];
      const feedbackBox = document.getElementById('quiz-feedback-box');
      const feedbackText = document.getElementById('quiz-feedback-text');
      const nextBtn = document.getElementById('btn-quiz-next');

      if (selectedOption.isCorrect) {
        // Resposta Correta!
        AudioEngine.playSuccess();
        optionBtn.classList.add('btn-correct');

        // Desabilita todas as opções
        document.querySelectorAll('.quiz-option-btn').forEach(btn => btn.disabled = true);

        feedbackBox.className = 'quiz-feedback-box';
        feedbackBox.style.display = 'flex';
        feedbackText.textContent = `Muito bem! ${currentQuestion.explanation}`;

        SpeechManager.speak('Muito bem! Resposta correta.');

        nextBtn.style.display = 'inline-flex';
        nextBtn.focus();
      } else {
        // Resposta Incorreta: Política de Retry Formativo (sem reiniciar o jogo)
        AudioEngine.playError();
        optionBtn.classList.add('btn-incorrect');
        optionBtn.disabled = true;

        feedbackBox.className = 'quiz-feedback-box error';
        feedbackBox.style.display = 'flex';
        feedbackText.textContent = 'Ops! Quase lá. Pense com carinho e tente outra alternativa!';

        SpeechManager.speak('Ops, tente novamente!');
      }
    },

    advanceQuizQuestion() {
      GameState.currentQuestionIndex++;
      if (GameState.currentQuestionIndex < GameState.quizQuestions.length) {
        UIController.renderQuizQuestion();
      } else {
        // Concluiu o Quiz do nível atual
        document.getElementById('quiz-modal').style.display = 'none';

        if (GameState.currentLevel === 1) {
          // Passa para o Nível 2
          AudioEngine.playSuccess();
          UIController.showAlert(
            'Parabéns! Nível 1 Concluído! 🌟',
            'Você organizou todos os cestos e acertou todas as perguntas de classificação e contagem! Agora vamos para o Nível 2 com a feira cheia e cálculo de preços!'
          );
          setTimeout(() => {
            LevelManager.startLevel(2);
          }, 600);
        } else {
          // Concluiu o Nível 2 -> Conquista do Troféu
          this.triggerCelebration();
        }
      }
    },

    triggerCelebration() {
      GameState.phase = 'CELEBRATION';
      AudioEngine.playFanfare();

      const modal = document.getElementById('celebration-modal');
      const summaryBox = document.getElementById('celebration-summary');

      let totalFruits = 0;
      let totalAmount = 0;
      FRUIT_IDS.forEach(id => {
        const count = GameState.baskets[id].items.length;
        totalFruits += count;
        totalAmount += count * FRUIT_CATALOG[id].price;
      });

      summaryBox.innerHTML = `
        <div class="stat-item">
          <span class="stat-label">Frutas Organizadas</span>
          <span class="stat-value">${totalFruits}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Cestos Perfeitos</span>
          <span class="stat-value">6 de 6</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Valor Total da Feira</span>
          <span class="stat-value">R$ ${totalAmount},00</span>
        </div>
      `;

      modal.style.display = 'flex';
      SpeechManager.speak('Parabéns! Você conquistou o troféu Saber Matemático!');
    }
  };

  /* ==========================================================================
     6. Controlador de Interface (UIController)
     ========================================================================== */
  const UIController = {
    init() {
      this.setupAudioUnlock();
      this.bindButtons();
      SpeechManager.init();
      DragDropEngine.init();
      LevelManager.startLevel(1);
    },

    setupAudioUnlock() {
      const unlock = () => {
        AudioEngine.initContext();
        if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        document.removeEventListener('pointerdown', unlock);
        document.removeEventListener('keydown', unlock);
      };
      document.addEventListener('pointerdown', unlock, { once: true });
      document.addEventListener('keydown', unlock, { once: true });
    },

    bindButtons() {
      // Concluir Organização
      document.getElementById('btn-finish-organizing').addEventListener('click', () => {
        LevelManager.validateBasketsForProgression();
      });

      // Próxima Pergunta do Quiz
      document.getElementById('btn-quiz-next').addEventListener('click', () => {
        LevelManager.advanceQuizQuestion();
      });

      // Fechar Alerta
      document.getElementById('btn-alert-close').addEventListener('click', () => {
        document.getElementById('alert-modal').style.display = 'none';
      });

      // Repetir Instrução da Professora
      document.getElementById('btn-repeat-instruction').addEventListener('click', () => {
        const text = document.getElementById('guidance-text').textContent;
        SpeechManager.speak(text);
      });

      // Alternar Áudio
      document.getElementById('btn-toggle-sound').addEventListener('click', () => {
        GameState.soundEnabled = !GameState.soundEnabled;
        const icon = document.getElementById('sound-icon');
        icon.textContent = GameState.soundEnabled ? '🔊' : '🔇';
        if (GameState.soundEnabled) {
          SpeechManager.speak('Voz da professora ativada!');
        } else {
          window.speechSynthesis.cancel();
        }
      });

      // Reiniciar Feira
      document.getElementById('btn-restart').addEventListener('click', () => {
        if (confirm('Deseja reiniciar a feira desde o Nível 1?')) {
          LevelManager.startLevel(1);
        }
      });

      // Jogar Novamente após Troféu
      document.getElementById('btn-play-again').addEventListener('click', () => {
        document.getElementById('celebration-modal').style.display = 'none';
        LevelManager.startLevel(1);
      });
    },

    updateLevelBadge() {
      if (typeof document === 'undefined') return;
      const badge = document.getElementById('level-badge');
      const desc = document.getElementById('level-desc');
      const pricePill = document.getElementById('price-table-pill');

      if (GameState.currentLevel === 1) {
        badge.textContent = 'Nível 1';
        desc.textContent = 'Classificação e Contagem';
        pricePill.style.display = 'none';
      } else {
        badge.textContent = 'Nível 2';
        desc.textContent = 'Feira e Sistema Monetário';
        pricePill.style.display = 'inline-flex';
      }
    },

    updateGuidanceText() {
      if (typeof document === 'undefined') return;
      const guidance = document.getElementById('guidance-text');
      if (GameState.currentLevel === 1) {
        guidance.textContent = 'Nível 1: Arraste cada fruta para o seu cesto de palha correspondente. Observe o espaço vazio que fica na bancada ao pegar cada fruta!';
      } else {
        guidance.textContent = 'Nível 2: Hoje a feira está repleta! Organize as frutas nos cestos para calcularmos os preços em reais de cada uma!';
      }
      setTimeout(() => {
        SpeechManager.speak(guidance.textContent);
      }, 500);
    },

    updateBenchStats() {
      if (typeof document === 'undefined') return;
      const remaining = GameState.benchSlots.filter(s => s.isOccupied).length;
      const el = document.getElementById('bench-remaining-count');
      if (el) el.textContent = remaining;
    },

    setFeedbackMessage(message) {
      if (typeof document === 'undefined') return;
      const el = document.getElementById('feedback-message');
      if (el) {
        el.textContent = message;
      }
    },

    // Renderiza a grade de slots da bancada (conservando o espaço vazio!)
    renderBenchSlots() {
      if (typeof document === 'undefined') return;
      const grid = document.getElementById('bench-grid');
      if (!grid) return;
      grid.innerHTML = '';

      GameState.benchSlots.forEach(slot => {
        const slotEl = document.createElement('div');
        slotEl.className = `bench-slot ${slot.isOccupied ? 'occupied' : 'empty'}`;
        slotEl.dataset.slotId = slot.slotId;

        if (slot.isOccupied) {
          const fruit = FRUIT_CATALOG[slot.fruitId];
          const fruitEl = document.createElement('div');
          fruitEl.className = `fruit-item ${fruit.scaleClass}`;
          fruitEl.dataset.instanceId = slot.instanceId;
          fruitEl.dataset.fruitId = slot.fruitId;
          fruitEl.dataset.source = 'bench';
          fruitEl.dataset.originSlotId = slot.slotId;
          fruitEl.setAttribute('role', 'button');
          fruitEl.setAttribute('tabindex', '0');
          fruitEl.setAttribute('aria-label', `${fruit.name}, fruta ${fruit.categoryLabel}`);

          fruitEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              SpeechManager.speakFruitName(slot.fruitId);
            }
          });

          fruitEl.innerHTML = `
            <img src="${fruit.image}" alt="${fruit.name}" class="fruit-img">
            <span class="fruit-label">${fruit.name}</span>
          `;

          DragDropEngine.attachFruitEvents(fruitEl, {
            instanceId: slot.instanceId,
            fruitId: slot.fruitId,
            source: 'bench',
            originSlotId: slot.slotId
          });

          slotEl.appendChild(fruitEl);
        }

        grid.appendChild(slotEl);
      });
    },

    // Renderiza os 6 cestos de palha
    renderBaskets() {
      if (typeof document === 'undefined') return;
      const grid = document.getElementById('baskets-grid');
      if (!grid) return;
      grid.innerHTML = '';

      FRUIT_IDS.forEach(fruitId => {
        const fruit = FRUIT_CATALOG[fruitId];
        const card = document.createElement('div');
        card.className = 'basket-card';
        card.dataset.targetFruitId = fruitId;

        card.innerHTML = `
          <div class="basket-plaque">
            <h3 class="basket-title">Cesto de ${fruit.name}</h3>
            <div class="basket-badges">
              <span class="basket-category-tag category-${fruit.category}">Tamanho ${fruit.categoryLabel}</span>
              ${GameState.currentLevel === 2 ? `<span class="basket-price-tag">R$ ${fruit.price},00 cada</span>` : ''}
            </div>
          </div>
          <div class="basket-drop-zone" id="drop-zone-${fruitId}">
            <div class="basket-straw-bg" aria-hidden="true"></div>
            <span class="basket-empty-hint" id="empty-hint-${fruitId}">Solte ${fruit.name} aqui</span>
          </div>
          <div class="basket-counter" id="counter-${fruitId}">0 frutas</div>
        `;

        grid.appendChild(card);
      });

      this.renderBasketContents();
    },

    // Atualiza as frutas contidas dentro de cada cesto
    renderBasketContents() {
      if (typeof document === 'undefined') return;
      FRUIT_IDS.forEach(fruitId => {
        const basket = GameState.baskets[fruitId];
        const dropZone = document.getElementById(`drop-zone-${fruitId}`);
        const emptyHint = document.getElementById(`empty-hint-${fruitId}`);
        const counter = document.getElementById(`counter-${fruitId}`);

        if (!dropZone) return;

        // Limpa frutas antigas preservando o background
        const oldFruits = dropZone.querySelectorAll('.basket-fruit-item');
        oldFruits.forEach(el => el.remove());

        if (basket.items.length === 0) {
          if (emptyHint) emptyHint.style.display = 'block';
          if (counter) counter.textContent = '0 frutas';
        } else {
          if (emptyHint) emptyHint.style.display = 'none';
          if (counter) {
            const count = basket.items.length;
            counter.textContent = `${count} ${count === 1 ? 'fruta' : 'frutas'}`;
          }

          // Adiciona cada fruta no cesto com suporte a devolução (reversibilidade)
          basket.items.forEach(item => {
            const fruit = FRUIT_CATALOG[item.fruitId];
            const fruitEl = document.createElement('div');
            fruitEl.className = 'basket-fruit-item';
            fruitEl.dataset.instanceId = item.instanceId;
            fruitEl.dataset.fruitId = item.fruitId;
            fruitEl.dataset.source = 'basket';
            fruitEl.dataset.originBasketId = fruitId;
            fruitEl.setAttribute('role', 'button');
            fruitEl.setAttribute('tabindex', '0');
            fruitEl.setAttribute('aria-label', `${fruit.name} no cesto de ${FRUIT_CATALOG[fruitId].name}`);
            fruitEl.title = `Arrastar ${fruit.name} de volta para a bancada`;

            fruitEl.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                SpeechManager.speakFruitName(item.fruitId);
              }
            });

            fruitEl.innerHTML = `<img src="${fruit.image}" alt="${fruit.name}">`;

            DragDropEngine.attachFruitEvents(fruitEl, {
              instanceId: item.instanceId,
              fruitId: item.fruitId,
              source: 'basket',
              originBasketId: fruitId
            });

            dropZone.appendChild(fruitEl);
          });
        }
      });
    },

    // Renderiza a pergunta ativa do quiz
    renderQuizQuestion() {
      if (typeof document === 'undefined') return;
      const modal = document.getElementById('quiz-modal');
      const question = GameState.quizQuestions[GameState.currentQuestionIndex];
      if (!question) return;

      const fruit = FRUIT_CATALOG[question.fruitId];
      const previewBox = document.getElementById('quiz-fruit-preview');
      const badgeType = document.getElementById('quiz-type-badge');
      const stepIndicator = document.getElementById('quiz-step-indicator');
      const promptText = document.getElementById('quiz-question-prompt');
      const supportContainer = document.getElementById('quiz-support-container');
      const optionsContainer = document.getElementById('quiz-options-container');
      const feedbackBox = document.getElementById('quiz-feedback-box');
      const nextBtn = document.getElementById('btn-quiz-next');

      // Reseta estados visuais
      feedbackBox.style.display = 'none';
      nextBtn.style.display = 'none';
      optionsContainer.innerHTML = '';

      badgeType.textContent = question.badgeLabel;
      stepIndicator.textContent = `Pergunta ${GameState.currentQuestionIndex + 1} de ${GameState.quizQuestions.length}`;
      promptText.textContent = question.prompt;

      if (question.type === 'total_price') {
        previewBox.innerHTML = `
          <span style="font-size: 2.4rem; line-height: 1;" aria-hidden="true">🧺</span>
          <strong>6 Cestos da Feira</strong>
        `;
      } else if (fruit) {
        previewBox.innerHTML = `
          <img src="${fruit.image}" alt="${fruit.name}" class="quiz-preview-img">
          <strong>${fruit.name}</strong>
        `;
      } else {
        previewBox.innerHTML = '';
      }

      // Renderiza Janela de Apoio Pedagógico conforme o tipo de pergunta
      if (supportContainer) {
        if (question.type === 'count') {
          // Apoio visual de contagem: mostra o cesto com as frutas selecionadas/alocadas para o aluno contar
          const basketItems = (GameState.baskets[question.fruitId] && GameState.baskets[question.fruitId].items) || [];
          let fruitsHtml = '';
          if (basketItems.length === 0) {
            fruitsHtml = '<span class="basket-empty-hint" style="display:block;">Cesto Vazio (0 frutas)</span>';
          } else {
            fruitsHtml = basketItems.map((item, idx) => {
              const itemFruit = FRUIT_CATALOG[item.fruitId] || fruit;
              return `
                <div class="counting-fruit-pill">
                  <img src="${itemFruit.image}" alt="${itemFruit.name}">
                  <span class="counting-number-badge">${idx + 1}</span>
                </div>
              `;
            }).join('');
          }

          supportContainer.innerHTML = `
            <div class="support-header">
              <span class="support-icon">🧺</span>
              <span>Cesto de Apoio: Conte as frutas dentro do cesto!</span>
            </div>
            <div class="support-basket-visual">
              ${fruitsHtml}
            </div>
            <p class="support-tip">💡 Aponte o dedinho ou o mouse para contar cada fruta no cesto acima.</p>
          `;
          supportContainer.style.display = 'block';
        } else if (question.type === 'basket_price') {
          // Apoio de multiplicação: mostra a operação sem dar o resultado final
          const count = question.count !== undefined ? question.count : (GameState.baskets[question.fruitId]?.items.length || 0);
          const fruitNoun = question.fruitNoun || (count === 1 ? fruit.name.toLowerCase() : `${fruit.name.toLowerCase()}s`);
          const unitPriceFormatted = `R$ ${fruit.price},00`;

          supportContainer.innerHTML = `
            <div class="support-header">
              <span class="support-icon">✖️</span>
              <span>Operação Matemática de Apoio (Multiplicação):</span>
            </div>
            <div class="support-equation-box">
              <span class="equation-text">${count} ${fruitNoun} × ${unitPriceFormatted} = </span>
              <span class="equation-unknown">?</span>
            </div>
            <p class="support-tip">💡 Multiplique a quantidade de frutas pelo preço de cada uma para encontrar o valor do cesto!</p>
          `;
          supportContainer.style.display = 'block';
        } else if (question.type === 'total_price') {
          // Apoio de adição: mostra o valor de cada cesto por fruta e pede para o aluno somar
          const breakdown = question.basketBreakdown || FRUIT_IDS.map(id => {
            const f = FRUIT_CATALOG[id];
            const c = GameState.baskets[id]?.items.length || 0;
            return {
              fruitId: id,
              fruitName: f.name,
              image: f.image,
              count: c,
              subtotal: c * f.price
            };
          });

          const formulaText = question.additionFormulaText || breakdown.map(b => `R$ ${b.subtotal},00`).join(' + ');

          supportContainer.innerHTML = `
            <div class="support-header">
              <span class="support-icon">➕</span>
              <span>Operação Matemática de Apoio (Adição dos Cestos):</span>
            </div>
            <div class="support-addition-grid">
              ${breakdown.map(b => `
                <div class="addition-item-pill">
                  <img src="${b.image}" alt="${b.fruitName}">
                  <span>${b.fruitName}:</span>
                  <strong>R$ ${b.subtotal},00</strong>
                </div>
              `).join('')}
            </div>
            <div class="support-equation-box addition-equation-box">
              <span class="equation-text">${formulaText} = </span>
              <span class="equation-unknown">?</span>
            </div>
            <p class="support-tip">💡 Some os valores de cada cesto de frutas para obter o valor total da feira!</p>
          `;
          supportContainer.style.display = 'block';
        } else {
          // Para classificação de tamanho (size_class), oculta o container de apoio
          supportContainer.style.display = 'none';
          supportContainer.innerHTML = '';
        }
      }

      // Renderiza exatamente 3 alternativas padronizadas
      question.options.forEach(option => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-option-btn';
        btn.textContent = option.label;
        btn.dataset.optionId = option.id;

        btn.addEventListener('click', () => {
          LevelManager.handleQuizAnswer(option, btn);
        });

        optionsContainer.appendChild(btn);
      });

      modal.style.display = 'flex';
      SpeechManager.speak(question.prompt);
    },

    showAlert(title, message) {
      if (typeof document === 'undefined') return;
      const modal = document.getElementById('alert-modal');
      document.getElementById('alert-title').textContent = title;
      document.getElementById('alert-message').textContent = message;
      modal.style.display = 'flex';
      SpeechManager.speak(message);
    }
  };

  // Inicializa a aplicação assim que o DOM estiver carregado no navegador
  if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
      UIController.init();
    });
  }

  // Exportação para testes automatizados unitários (Node.js / CommonJS)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      FRUIT_CATALOG,
      FRUIT_IDS,
      FRUIT_PLURALS,
      GameState,
      AudioEngine,
      SpeechManager,
      DragDropEngine,
      QuizEngine,
      LevelManager,
      UIController
    };
  }
})();

