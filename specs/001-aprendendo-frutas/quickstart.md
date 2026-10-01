# Phase 1 Quickstart Guide: Aprendendo com as Frutas

**Feature**: `001-aprendendo-frutas`  
**Date**: 2026-09-30  
**Status**: Ready  

---

## 1. Visão Geral e Arquitetura Estática

A aplicação "Aprendendo com as Frutas" foi projetada como uma aplicação estática pura em HTML5, CSS3 e JavaScript Vanilla. Não requer compiladores, transpiladores, Node.js ou gerenciadores de pacotes para executar.

### Estrutura de Arquivos no Projeto
```text
aprendendo-com-as-frutas/
├── index.html            # Estrutura semântica e acessível (Bancada, Cestos, Modais)
├── styles.css            # Estilização responsiva, layout Grid/Flexbox e animações
├── app.js                # Lógica central: estado, drag & drop, áudio e quiz
├── assets/
│   └── images/           # Imagens realistas das 6 frutas, cesto e troféu (.jpg)
│       ├── acai.jpg
│       ├── buriti.jpg
│       ├── manga.jpg
│       ├── cupuacu.jpg
│       ├── jaca.jpg
│       ├── melancia.jpg
│       ├── cesto-palha.jpg
│       └── trofeu.jpg
└── specs/                # Documentação técnica e especificações (Spec-Kit)
```

---

## 2. Como Executar Localmente

### Opção A: Execução Direta (Sem Servidor)
Dê um duplo clique no arquivo [`index.html`](../../index.html) para abrir diretamente no seu navegador padrão (Google Chrome, Microsoft Edge, Firefox ou Safari).

### Opção B: Servidor Estático Local (Recomendado para Áudio)
Alguns navegadores impõem restrições de permissão para APIs de áudio (`SpeechSynthesis` ou `Audio`) em protocolo `file:///`. Para a melhor experiência:

**Via Python:**
```bash
python -m http.server 8000
```
Em seguida, acesse no navegador: `http://localhost:8000`

**Via PowerShell / Node (npx serve):**
```bash
npx serve .
```

---

## 3. Roteiro de Teste Manual dos Requisitos Pedagógicos

### Teste 1: Seleção e Feedback Sonoro
1. Abra o jogo no Nível 1.
2. Clique ou toque em qualquer fruta na bancada e inicie o arraste.
3. **Verificação**: Uma voz feminina nítida pronuncia o nome exato da fruta selecionada (ex.: "Manga!"). Se soltar e pegar outra rapidamente, o áudio anterior cessa e o novo é pronunciado.

### Teste 2: Arraste e Espaço Vazio (Subtração Intuitiva)
1. Arraste 2 mangas da bancada para o cesto identificado com "Manga".
2. **Verificação**: Os slots de onde as mangas saíram na bancada continuam visíveis e vazios (sem rearranjo dos outros itens).
3. Arraste 1 manga de volta do cesto para o slot vazio na bancada.
4. **Verificação**: A manga volta a ocupar a bancada e a contagem do cesto é reduzida.

### Teste 3: Validação Estrita de Cestos
1. Tente avançar com frutas misturadas (ex.: um açaí dentro do cesto de cupuaçu).
2. Clique em "Concluir Organização".
3. **Verificação**: O avanço é bloqueado com mensagem educativa solicitando a correção.

### Teste 4: Quiz de Classificação e Contagem (Nível 1)
1. Com todos os cestos organizados corretamente, conclua a organização.
2. Responda à pergunta de classificação de tamanho (ex.: "A fruta Melancia é pequena, média ou grande?").
3. Responda à pergunta de contagem do cesto (exata quantidade que você depositou).
4. Clique propositalmente em uma alternativa incorreta:
   - **Verificação**: A alternativa é desabilitada com aviso de "Tente novamente!" e as demais continuam ativas.
5. Selecione a correta para avançar para o Nível 2.

### Teste 5: Precificação e Troféu "Saber Matemático" (Nível 2)
1. No Nível 2, organize as frutas (mínimo de 8 disponíveis por espécie).
2. Responda às perguntas de precificação baseadas na tabela oficial (Açaí R$1, Buriti R$2, Manga R$3, Cupuaçu R$4, Jaca R$5, Melancia R$10).
3. Responda à pergunta final do valor total consolidado.
4. **Verificação**: Ao acertar, a tela comemorativa exibe o troféu "Saber Matemático" com efeitos festivos.
