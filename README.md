# VEND-30 — Trabalho 01 de LFA

Simulador local de um **autômato finito determinístico (AFD)** inspirado no comportamento
de uma vending machine. O projeto é um reconhecedor de palavras; ele não pretende modelar
estoque, troco ou a Máquina de Mealy completa do artigo.

## O que foi implementado

A máquina aceita moedas de **5, 10 e 25 centavos**. O produto custa **30 centavos**.
Uma palavra de entrada é aceita quando a soma das moedas chega a pelo menos 30 centavos:

`L = { w ∈ {5, 10, 25}* | soma(w) ≥ 30 }`

O estado `q30+` representa a classe de todos os valores acumulados maiores ou iguais a 30.
Ele não significa que o crédito operacional seja exatamente 30: a interface mantém o
crédito real separadamente para exibir, por exemplo, R$ 0,35. A agregação é válida porque,
depois de atingir 30, qualquer sufixo formado por moedas válidas continua aceito.

### Modelo formal

- `Σ = {5, 10, 25}`
- `Q = {q0, q5, q10, q15, q20, q25, q30+}`
- estado inicial: `q0`
- estados finais: `{q30+}`
- `δ: Q × Σ → Q` é total e determinística
- `δ(q30+, 5) = δ(q30+, 10) = δ(q30+, 25) = q30+`

O artigo indicado na aula 11 apresenta uma **Máquina de Mealy** mais completa, com categorias,
produtos, troco e símbolos de saída. Esta implementação usa o artigo como motivação e
comparação, mas implementa somente o AFD reconhecedor solicitado no Trabalho 01.

## Como a interface demonstra o modelo

- Os botões de moedas representam os símbolos de `Σ`.
- O estado atual e o histórico mostram cada aplicação de `δ`.
- O diagrama destaca o estado atual e a última transição.
- As moedas continuam habilitadas em `q30+` para demonstrar os laços absorventes do AFD.
- “Concluir palavra” encerra a entrada e informa se ela foi aceita ou rejeitada.
- “Reiniciar” inicia uma nova palavra.

## Como testar localmente

É necessário ter Node.js instalado.

```powershell
npm test
```

Para abrir a interface no navegador, inicie um servidor local na raiz do projeto:

```powershell
python -m http.server 4173
```

Depois acesse:

```text
http://localhost:4173
```

Abrir o `index.html` diretamente também pode funcionar em alguns navegadores, mas o servidor
local é recomendado porque a interface usa módulos JavaScript.

## Roteiro de teste manual

1. Ao abrir, confirme que o estado é `q0`, o crédito é `R$ 0,00` e não há palavra na fita.
2. Clique em `5`, depois `25`. O sistema deve chegar a `q30+` e indicar que a palavra está aceita.
3. Clique novamente em `5` e observe a transição `q30+ → q30+`.
4. Clique em “Concluir palavra”. O status deve ser “Palavra aceita”.
5. Clique em “Reiniciar”.
6. Clique em `10`, `10`, `10`. O resultado também deve ser aceito.
7. Reinicie, clique apenas em `5`, `10` e conclua a palavra. O resultado deve ser rejeitado em `q15`.
8. No saldo insuficiente, confirme que a máquina continua aceitando moedas; insira `25` para alcançar `q30+`.
9. Em uma compra aceita, clique em “Retirar produto” para iniciar uma nova compra sem precisar recarregar a página.
10. Observe o estado destacado, a seta da última transição, a fita e o histórico.
11. Abra “Consultar a tabela completa de transições” para conferir a função `δ`.

## Arquivos

- `index.html`: interface do simulador.
- `src/automaton.js`: contrato e regras do autômato.
- `src/app.js`: integração entre o autômato e a interface.
- `src/ui-copy.js`: mensagens derivadas do estado operacional da máquina.
- `src/diagram.js`: agrupamento visual de transições com o mesmo destino.
- `src/styles.css`: identidade visual e responsividade.
- `tests/automaton.test.js`: testes automatizados do comportamento.
- `tests/diagram.test.js` e `tests/ui-copy.test.js`: testes das regras de apresentação.
- `tests/public-contract.test.js`: contrato mínimo da interface pública.
- `vending-machine.jff`: modelo para abrir no JFLAP.
- `docs/referencias.md`: roteiro de estudo e referências de Linguagens Formais e Autômatos.

## Status do projeto

`npm test` verifica o contrato do autômato, casos aceitos e rejeitados, laços em `q30+`,
as 21 combinações estado/moeda e a equivalência entre o arquivo `.jff` e a função de
transição JavaScript.

O projeto é um protótipo educacional executável, com interface interativa, modelo `.jff`
compatível com JFLAP e testes automatizados para o comportamento do AFD. A interface
também apresenta a diferença entre o reconhecedor simplificado deste trabalho e a máquina
de Mealy completa descrita no artigo de referência.

Para continuar o estudo da disciplina, consulte o [roteiro de referências](docs/referencias.md).
