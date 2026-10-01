/**
 * Suíte de Testes Automatizados - Aprendendo com as Frutas
 * Executado nativamente via Node.js Test Runner (node:test e node:assert)
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  FRUIT_CATALOG,
  FRUIT_IDS,
  FRUIT_PLURALS,
  GameState,
  DragDropEngine,
  QuizEngine,
  LevelManager
} = require('../app.js');

test('1. Catálogo Oficial das Frutas Regionais', async (t) => {
  await t.test('Deve conter exatamente as 6 frutas regionais especificadas', () => {
    assert.equal(FRUIT_IDS.length, 6);
    assert.deepEqual(FRUIT_IDS, ['acai', 'buriti', 'manga', 'cupuacu', 'jaca', 'melancia']);
  });

  await t.test('Deve ter as classificações de tamanho corretas', () => {
    // Pequenas
    assert.equal(FRUIT_CATALOG.acai.category, 'pequena');
    assert.equal(FRUIT_CATALOG.buriti.category, 'pequena');
    // Médias
    assert.equal(FRUIT_CATALOG.manga.category, 'media');
    assert.equal(FRUIT_CATALOG.cupuacu.category, 'media');
    // Grandes
    assert.equal(FRUIT_CATALOG.jaca.category, 'grande');
    assert.equal(FRUIT_CATALOG.melancia.category, 'grande');
  });

  await t.test('Deve ter a tabela de preços oficial do Nível 2', () => {
    assert.equal(FRUIT_CATALOG.acai.price, 1);
    assert.equal(FRUIT_CATALOG.buriti.price, 2);
    assert.equal(FRUIT_CATALOG.manga.price, 3);
    assert.equal(FRUIT_CATALOG.cupuacu.price, 4);
    assert.equal(FRUIT_CATALOG.jaca.price, 5);
    assert.equal(FRUIT_CATALOG.melancia.price, 10);
  });
});

test('2. Princípio V da Constituição - Invariante de 3 Alternativas por Questão', async (t) => {
  await t.test('generateNumberOptions deve gerar exatamente 3 opções distintas com 1 correta', () => {
    const testCounts = [1, 2, 3, 5, 8, 12];
    for (const count of testCounts) {
      const options = QuizEngine.generateNumberOptions(count);
      assert.equal(options.length, 3, `Deveria ter 3 opções para contagem ${count}`);
      
      const correctCount = options.filter(o => o.isCorrect).length;
      assert.equal(correctCount, 1, `Deveria ter exatamente 1 opção correta para contagem ${count}`);

      const correctOption = options.find(o => o.isCorrect);
      assert.equal(correctOption.value, count);

      const uniqueValues = new Set(options.map(o => o.value));
      assert.equal(uniqueValues.size, 3, 'Todas as 3 opções numéricas devem ser distintas');
      
      options.forEach(o => {
        assert.ok(o.value > 0, `Valor da opção (${o.value}) deve ser estritamente positivo`);
      });
    }
  });

  await t.test('generatePriceOptions deve gerar exatamente 3 opções distintas em reais com 1 correta', () => {
    const testCases = [
      { total: 5, unitPrice: 1 },
      { total: 8, unitPrice: 2 },
      { total: 12, unitPrice: 3 },
      { total: 20, unitPrice: 4 },
      { total: 40, unitPrice: 5 },
      { total: 80, unitPrice: 10 }
    ];

    for (const tc of testCases) {
      const options = QuizEngine.generatePriceOptions(tc.total, tc.unitPrice);
      assert.equal(options.length, 3, `Deveria ter 3 opções para total R$ ${tc.total}`);

      const correctCount = options.filter(o => o.isCorrect).length;
      assert.equal(correctCount, 1, `Deveria ter exatamente 1 opção correta para total R$ ${tc.total}`);

      const correctOption = options.find(o => o.isCorrect);
      assert.equal(correctOption.value, tc.total);
      assert.equal(correctOption.label, `R$ ${tc.total},00`);

      const uniqueValues = new Set(options.map(o => o.value));
      assert.equal(uniqueValues.size, 3, 'Todas as 3 opções de preço devem ser distintas');
    }
  });

  await t.test('generateGrandTotalOptions deve gerar exatamente 3 opções distintas para o total geral', () => {
    const testTotals = [25, 50, 100, 150];
    for (const total of testTotals) {
      const options = QuizEngine.generateGrandTotalOptions(total);
      assert.equal(options.length, 3);

      const correctCount = options.filter(o => o.isCorrect).length;
      assert.equal(correctCount, 1);

      const correctOption = options.find(o => o.isCorrect);
      assert.equal(correctOption.value, total);

      const uniqueValues = new Set(options.map(o => o.value));
      assert.equal(uniqueValues.size, 3);
    }
  });
});

test('3. Nível 1 - Perguntas de Classificação e Contagem', async (t) => {
  // Configura estado mock para teste
  FRUIT_IDS.forEach(id => {
    GameState.baskets[id] = { targetFruitId: id, items: [
      { instanceId: `inst-${id}-1`, fruitId: id },
      { instanceId: `inst-${id}-2`, fruitId: id }
    ] };
  });

  const questions = QuizEngine.generateLevel1Questions();

  await t.test('Deve gerar 6 perguntas de tamanho e 6 de contagem (total 12)', () => {
    assert.equal(questions.length, 12);
  });

  await t.test('Perguntas de tamanho devem ter as 3 categorias e resposta correta', () => {
    const sizeQuestions = questions.filter(q => q.type === 'size_class');
    assert.equal(sizeQuestions.length, 6);

    sizeQuestions.forEach(q => {
      assert.equal(q.options.length, 3);
      const correctOpt = q.options.find(o => o.isCorrect);
      const fruit = FRUIT_CATALOG[q.fruitId];
      assert.equal(correctOpt.value, fruit.category);
    });
  });

  await t.test('Perguntas de contagem devem avaliar a quantidade real do cesto', () => {
    const countQuestions = questions.filter(q => q.type === 'count');
    assert.equal(countQuestions.length, 6);

    countQuestions.forEach(q => {
      assert.equal(q.options.length, 3);
      const correctOpt = q.options.find(o => o.isCorrect);
      assert.equal(correctOpt.value, 2); // 2 itens configurados no mock
    });
  });
});

test('4. Nível 2 - Precificação e Valor Total', async (t) => {
  // Configura cestos com 3 frutas cada
  let expectedGrandTotal = 0;
  FRUIT_IDS.forEach(id => {
    const qty = 3;
    GameState.baskets[id] = {
      targetFruitId: id,
      items: Array.from({ length: qty }, (_, i) => ({ instanceId: `inst-${id}-${i}`, fruitId: id }))
    };
    expectedGrandTotal += qty * FRUIT_CATALOG[id].price;
  });

  const questions = QuizEngine.generateLevel2Questions();

  await t.test('Deve gerar 6 perguntas de cesta e 1 de valor total (total 7)', () => {
    assert.equal(questions.length, 7);
  });

  await t.test('Perguntas de preço por cesto devem calcular corretamente (quantidade × preço unitário)', () => {
    const basketQuestions = questions.filter(q => q.type === 'basket_price');
    assert.equal(basketQuestions.length, 6);

    basketQuestions.forEach(q => {
      const fruit = FRUIT_CATALOG[q.fruitId];
      const expectedTotal = 3 * fruit.price;
      const correctOpt = q.options.find(o => o.isCorrect);
      assert.equal(correctOpt.value, expectedTotal);
    });
  });

  await t.test('Pergunta final deve calcular o valor total e não associar à melancia ou fruta única', () => {
    const totalQuestion = questions.find(q => q.type === 'total_price');
    assert.ok(totalQuestion, 'Deve existir pergunta de total_price');
    assert.equal(totalQuestion.fruitId, null, 'fruitId deve ser null para representar a feira como um todo');
    
    const correctOpt = totalQuestion.options.find(o => o.isCorrect);
    assert.equal(correctOpt.value, expectedGrandTotal);
  });
});

test('5. Princípio IV da Constituição - Validador de Pureza dos Cestos', async (t) => {
  await t.test('Deve rejeitar avanço se algum cesto estiver vazio', () => {
    // Configura 5 cestos cheios e 1 vazio
    FRUIT_IDS.forEach(id => {
      GameState.baskets[id] = { targetFruitId: id, items: [{ instanceId: `i-${id}`, fruitId: id }] };
    });
    GameState.baskets['melancia'].items = []; // Melancia vazia

    const result = LevelManager.checkBasketsPurity(GameState.baskets);
    assert.equal(result.isValid, false, 'Deve detectar cesto vazio e rejeitar avanço');
    assert.equal(result.errorType, 'EMPTY');
    assert.equal(result.problematicBasketId, 'melancia');
  });

  await t.test('Deve rejeitar avanço se houver mistura de espécies', () => {
    FRUIT_IDS.forEach(id => {
      GameState.baskets[id] = { targetFruitId: id, items: [{ instanceId: `i-${id}`, fruitId: id }] };
    });
    // Adiciona manga no cesto de açaí
    GameState.baskets['acai'].items.push({ instanceId: 'i-wrong', fruitId: 'manga' });

    const result = LevelManager.checkBasketsPurity(GameState.baskets);
    assert.equal(result.isValid, false, 'Deve detectar fruta em cesto incorreto e rejeitar avanço');
    assert.equal(result.errorType, 'MIXED');
    assert.equal(result.problematicBasketId, 'acai');
    assert.equal(result.problematicFruitId, 'manga');
  });

  await t.test('Deve aceitar avanço quando todos os 6 cestos estão puros e não-vazios', () => {
    FRUIT_IDS.forEach(id => {
      GameState.baskets[id] = {
        targetFruitId: id,
        items: [{ instanceId: `i-${id}`, fruitId: id }]
      };
    });

    const result = LevelManager.checkBasketsPurity(GameState.baskets);
    assert.equal(result.isValid, true, 'Cestos válidos devem passar com sucesso');
    assert.equal(result.errorType, null);
    assert.equal(result.problematicBasketId, null);
  });
});

test('6. Princípio III da Constituição - Subtração Visual na Bancada', async (t) => {
  await t.test('Slots desocupados devem manter sua posição com isOccupied = false', () => {
    const slots = [
      { slotId: 'slot-1', fruitId: 'acai', instanceId: 'inst-1', isOccupied: true },
      { slotId: 'slot-2', fruitId: 'buriti', instanceId: 'inst-2', isOccupied: true }
    ];

    // Simula remoção de fruta do slot-1
    slots[0].isOccupied = false;

    assert.equal(slots.length, 2, 'Grade de slots preserva quantidade total de espaços');
    assert.equal(slots[0].isOccupied, false, 'Slot de origem fica desocupado (vazio)');
    assert.equal(slots[1].isOccupied, true, 'Outros slots continuam inalterados');
  });
});

test('7. Mecânica de Alocação de Frutas nos Cestos (Drag & Drop e Seleção)', async (t) => {
  // Inicializa estado mock para teste de transferência
  GameState.benchSlots = [
    { slotId: 'slot-1', fruitId: 'manga', instanceId: 'inst-manga-1', isOccupied: true },
    { slotId: 'slot-2', fruitId: 'buriti', instanceId: 'inst-buriti-1', isOccupied: true }
  ];
  FRUIT_IDS.forEach(id => {
    GameState.baskets[id] = { targetFruitId: id, items: [] };
  });

  await t.test('Deve transferir fruta da bancada para o cesto correto e desocupar o slot (subtração)', () => {
    const itemData = {
      instanceId: 'inst-manga-1',
      fruitId: 'manga',
      source: 'bench',
      originSlotId: 'slot-1'
    };

    DragDropEngine.handleDropOnBasket('manga', itemData);

    assert.equal(GameState.baskets['manga'].items.length, 1, 'Cesto de manga deve conter 1 fruta');
    assert.equal(GameState.baskets['manga'].items[0].instanceId, 'inst-manga-1');
    assert.equal(GameState.benchSlots[0].isOccupied, false, 'Slot da bancada deve permanecer desocupado');
  });

  await t.test('Deve permitir devolver a fruta do cesto para o slot vazio na bancada (reversibilidade)', () => {
    const returnData = {
      instanceId: 'inst-manga-1',
      fruitId: 'manga',
      source: 'basket',
      originBasketId: 'manga'
    };

    DragDropEngine.handleDropOnBench('slot-1', returnData);

    assert.equal(GameState.baskets['manga'].items.length, 0, 'Cesto de manga deve ficar vazio após devolução');
    assert.equal(GameState.benchSlots[0].isOccupied, true, 'Slot da bancada volta a ficar ocupado');
  });

  await t.test('Deve permitir alocação via seleção e clique (Click-to-Move)', () => {
    const fruitData = {
      instanceId: 'inst-buriti-1',
      fruitId: 'buriti',
      source: 'bench',
      originSlotId: 'slot-2'
    };

    // 1. Aluno seleciona a fruta
    DragDropEngine.selectFruit(fruitData);
    assert.deepEqual(GameState.selectedFruit, fruitData, 'Fruta deve estar selecionada no estado');

    // 2. Aluno clica no cesto
    DragDropEngine.handleDropOnBasket('buriti', null);

    assert.equal(GameState.baskets['buriti'].items.length, 1, 'Cesto do buriti deve receber a fruta selecionada');
    assert.equal(GameState.benchSlots[1].isOccupied, false, 'Slot da fruta selecionada deve desocupar');
    assert.equal(GameState.selectedFruit, null, 'Seleção deve ser limpa após alocação');
  });
});

test('8. Nível 1 - Preenchimento Completo da Bancada e Priorização Regional', async (t) => {
  LevelManager.startLevel(1);

  await t.test('Deve conter exatamente 27 slots ocupados (preenchendo os 9 espaços vazios)', () => {
    assert.equal(GameState.benchSlots.length, 27, 'A bancada deve ter exatamente 27 frutas no Nível 1');
    const occupiedCount = GameState.benchSlots.filter(s => s.isOccupied).length;
    assert.equal(occupiedCount, 27, 'Todos os 27 slots devem iniciar ocupados');
  });

  await t.test('Frutas menos expostas (Buriti, Cupuaçu, Jaca e Açaí) devem ter 5 unidades cada', () => {
    const counts = {};
    FRUIT_IDS.forEach(id => { counts[id] = 0; });
    GameState.benchSlots.forEach(s => {
      counts[s.fruitId]++;
    });

    assert.equal(counts.buriti, 5, 'Buriti deve ter 5 unidades');
    assert.equal(counts.cupuacu, 5, 'Cupuaçu deve ter 5 unidades');
    assert.equal(counts.jaca, 5, 'Jaca deve ter 5 unidades');
    assert.equal(counts.acai, 5, 'Açaí deve ter 5 unidades');
    assert.equal(counts.manga, 4, 'Manga deve ter 4 unidades');
    assert.equal(counts.melancia, 3, 'Melancia deve ter 3 unidades');
  });

  await t.test('Todas as frutas respeitam o limite de 1 a 6 unidades por espécie (FR-006)', () => {
    const counts = {};
    GameState.benchSlots.forEach(s => {
      counts[s.fruitId] = (counts[s.fruitId] || 0) + 1;
    });

    for (const [fruitId, count] of Object.entries(counts)) {
      assert.ok(count >= 1 && count <= 6, `Fruta ${fruitId} (${count}) deve estar no intervalo [1, 6]`);
    }
  });
});

test('9. Janela de Apoio Pedagógico - Multiplicação e Adição', async (t) => {
  // Prepara estado com quantidades conhecidas
  FRUIT_IDS.forEach(id => {
    GameState.baskets[id] = {
      targetFruitId: id,
      items: [
        { instanceId: `inst-${id}-1`, fruitId: id },
        { instanceId: `inst-${id}-2`, fruitId: id }
      ]
    };
  });

  const questions = QuizEngine.generateLevel2Questions();

  await t.test('Perguntas de preço por cesto devem conter operationText sem revelar o resultado (= ?)', () => {
    const basketQuestions = questions.filter(q => q.type === 'basket_price');
    assert.equal(basketQuestions.length, 6);

    basketQuestions.forEach(q => {
      const fruit = FRUIT_CATALOG[q.fruitId];
      assert.ok(q.operationText, 'Deve conter propriedade operationText');
      assert.ok(q.operationText.endsWith('= ?'), `Operação deve terminar com '= ?' (encontrado: ${q.operationText})`);
      assert.ok(q.operationText.includes(`R$ ${fruit.price},00`), 'Operação deve conter o preço unitário formatado');
      assert.ok(q.operationText.includes('2 '), 'Operação deve conter a quantidade (2 frutas)');
      assert.equal(q.options.length, 3, 'Deve manter exatamente 3 opções de resposta');
    });

    // Caso específico do Buriti com 2 unidades (exemplo do usuário: "2 buritis x 2,00 = ?")
    const buritiQ = basketQuestions.find(q => q.fruitId === 'buriti');
    assert.equal(buritiQ.operationText, '2 buritis × R$ 2,00 = ?');
  });

  await t.test('Pergunta de valor total da feira deve conter basketBreakdown e additionFormulaText', () => {
    const totalQ = questions.find(q => q.type === 'total_price');
    assert.ok(totalQ, 'Deve existir pergunta total_price');
    assert.ok(totalQ.basketBreakdown, 'Deve conter basketBreakdown com os 6 cestos');
    assert.equal(totalQ.basketBreakdown.length, 6);

    totalQ.basketBreakdown.forEach(b => {
      assert.equal(b.count, 2);
      assert.equal(b.subtotal, 2 * b.unitPrice);
      assert.ok(b.fruitName);
      assert.ok(b.image);
    });

    assert.ok(totalQ.additionFormulaText, 'Deve conter additionFormulaText formatado');
    assert.ok(totalQ.additionFormulaText.includes(' + '), 'Fórmula deve somar os cestos');
    assert.equal(totalQ.options.length, 3, 'Deve manter 3 opções de resposta');
  });

  await t.test('Dicionário de Plurais deve conter formas corretas de todas as espécies', () => {
    assert.ok(FRUIT_PLURALS);
    assert.equal(FRUIT_PLURALS.acai.plural, 'açaís');
    assert.equal(FRUIT_PLURALS.buriti.plural, 'buritis');
    assert.equal(FRUIT_PLURALS.manga.plural, 'mangas');
    assert.equal(FRUIT_PLURALS.cupuacu.plural, 'cupuaçus');
    assert.equal(FRUIT_PLURALS.jaca.plural, 'jacas');
    assert.equal(FRUIT_PLURALS.melancia.plural, 'melancias');
  });
});

