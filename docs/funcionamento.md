# Funcionamento programático do AFD VEND-30

Este documento explica a relação entre o modelo formal, o código JavaScript, o arquivo do
JFLAP e a interface. A implementação é um **AFD reconhecedor**: ela decide se a palavra de
moedas acumulou pelo menos 30 centavos. Ela não tenta representar estoque, troco ou todas as
saídas de uma máquina de Mealy.

## 1. O que significa “autocontido” neste modelo

O AFD é determinístico e total para o alfabeto escolhido:

```text
M = (Q, Σ, δ, q0, F)
Σ = {5, 10, 25}
Q = {q0, q5, q10, q15, q20, q25, q30+}
F = {q30+}
```

Ser total significa que, para **todo estado** e para **cada moeda de Σ**, existe exatamente
uma próxima transição. Por isso o autômato pode continuar processando uma palavra sem ficar
sem regra. Isso não quer dizer que toda palavra seja aceita: a aceitação acontece somente
quando o processamento termina em `q30+`.

## 2. A tabela completa de transições

O estado guarda o crédito acumulado enquanto ele ainda é menor que 30. Assim, as três
transições que saem de `q0` são:

```text
q0 + 5¢  → q5
q0 + 10¢ → q10
q0 + 25¢ → q25
```

Portanto, a dúvida `q0 + 10` é respondida por `q10`. A tabela completa é:

| Estado | 5¢ | 10¢ | 25¢ |
| --- | --- | --- | --- |
| `q0` | `q5` | `q10` | `q25` |
| `q5` | `q10` | `q15` | `q30+` |
| `q10` | `q15` | `q20` | `q30+` |
| `q15` | `q20` | `q25` | `q30+` |
| `q20` | `q25` | `q30+` | `q30+` |
| `q25` | `q30+` | `q30+` | `q30+` |
| `q30+` | `q30+` | `q30+` | `q30+` |

São 7 estados × 3 moedas = **21 combinações**, todas definidas e testadas. Quando duas ou
três moedas de um mesmo estado levam ao mesmo destino, o desenho agrupa os rótulos na mesma
seta para evitar repetição. Por exemplo, de `q20` para `q30+` aparecem `10 · 25`; isso
representa duas transições distintas com o mesmo destino.

## 3. Por que `q30+` fica em loop

`q30+` representa todos os créditos maiores ou iguais a 30, e não somente o valor exato de
30. Se o autômato já está nessa classe, inserir 5, 10 ou 25 não pode fazer a soma voltar
para menos de 30. Logo:

```text
δ(q30+, 5) = q30+
δ(q30+, 10) = q30+
δ(q30+, 25) = q30+
```

Esse é um estado final **absorvente**. Ele é final porque a palavra já atingiu o preço e é
absorvente porque qualquer continuação formada por moedas válidas continua pertencendo à
linguagem:

```text
L = { w ∈ {5, 10, 25}* | soma(w) ≥ 30 }
```

O código mantém duas informações relacionadas, mas diferentes: `machine.state` guarda a
classe formal (`q30+`) e `machine.credit` guarda o valor operacional exato para a tela, como
35 ou 50 centavos. Essa separação mantém o AFD finito sem esconder o crédito que o usuário
inseriu.

## 4. O caminho de uma moeda pelo programa

1. O usuário clica em um botão de 5, 10 ou 25 centavos em `index.html`.
2. `src/app.js` lê o valor e chama `applyCoin(machine, coin)`.
3. `applyCoin` chama `transition(machine.state, coin)` em `src/automaton.js`.
4. `transition` valida o estado e a moeda, calcula a soma e retorna o próximo estado.
5. `applyCoin` atualiza o estado formal, o crédito real, a palavra de entrada e o histórico.
6. `render()` atualiza o visor, a fita de moedas, a tabela, o destaque do estado atual e a
   última seta percorrida no diagrama.

A ação “Liberar produto” não inventa uma transição. Ela apenas encerra a entrada atual e
consulta se o estado alcançado é final. Se ainda estiver em `q15`, por exemplo, a palavra é
rejeitada naquele momento, mas a interface continua aceitando moedas para que o usuário possa
completar a palavra. Em `q30+`, o produto pode ser liberado; “Retirar produto” reinicia uma
nova palavra.

## 5. Código, JFLAP e testes

- [`src/automaton.js`](../src/automaton.js) contém `Q`, `Σ`, a função `transition` e o estado
  operacional da simulação.
- [`src/diagram.js`](../src/diagram.js) apenas agrupa visualmente transições que compartilham
  origem e destino; ele não altera a função δ.
- [`src/app.js`](../src/app.js) conecta os eventos da interface ao modelo e ao SVG.
- [`vending-machine.jff`](../vending-machine.jff) registra as mesmas 21 transições para
  abertura no JFLAP.
- [`tests/automaton.test.js`](../tests/automaton.test.js) verifica determinismo,
  completude, aceitação/rejeição, laços de `q30+` e equivalência com o `.jff`.

O diagrama é uma visualização compacta; a tabela e o guia “Como ler as setas” na interface
funcionam como uma segunda representação explícita da mesma função. Assim, uma seta agrupada
não deve ser interpretada como uma transição faltante.
