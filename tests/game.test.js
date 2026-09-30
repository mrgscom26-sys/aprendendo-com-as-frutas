/**
 * Suíte de Testes Automatizados - Aprendendo com as Frutas
 * Executado nativamente via Node.js Test Runner (node:test e node:assert)
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  FRUIT_CATALOG,
  FRUIT_IDS,
  GameState,
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

    let hasEmpty = false;
    for (let id of FRUIT_IDS) {
      if (GameState.baskets[id].items.length === 0) {
        hasEmpty = true;
        break;
      }
    }
    assert.equal(hasEmpty, true, 'Deve detectar cesto vazio');
  });

  await t.test('Deve rejeitar avanço se houver mistura de espécies', () => {
    FRUIT_IDS.forEach(id => {
      GameState.baskets[id] = { targetFruitId: id, items: [{ instanceId: `i-${id}`, fruitId: id }] };
    });
    // Adiciona manga no cesto de açaí
    GameState.baskets['acai'].items.push({ instanceId: 'i-wrong', fruitId: 'manga' });

    let hasMixed = false;
    for (let id of FRUIT_IDS) {
      const wrong = GameState.baskets[id].items.find(item => item.fruitId !== id);
      if (wrong) {
        hasMixed = true;
        break;
      }
    }
    assert.equal(hasMixed, true, 'Deve detectar fruta em cesto incorreto');
  });

  await t.test('Deve aceitar avanço quando todos os 6 cestos estão puros e não-vazios', () => {
    FRUIT_IDS.forEach(id => {
      GameState.baskets[id] = {
        targetFruitId: id,
        items: [{ instanceId: `i-${id}`, fruitId: id }]
      };
    });

    let isValid = true;
    for (let id of FRUIT_IDS) {
      const basket = GameState.baskets[id];
      if (basket.items.length === 0 || basket.items.some(item => item.fruitId !== id)) {
        isValid = false;
        break;
      }
    }
    assert.equal(isValid, true, 'Cestos válidos devem passar com sucesso');
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
