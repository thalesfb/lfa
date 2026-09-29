# VEND-30 — Trabalho 01 de LFA

Simulador de uma máquina de vendas representada por um **AFD**. O produto custa 30 centavos;
a máquina aceita moedas de 5, 10 e 25 centavos e conserva o excedente para a compra seguinte.

[![CI](https://github.com/thalesfb/lfa/actions/workflows/ci.yml/badge.svg)](https://github.com/thalesfb/lfa/actions/workflows/ci.yml)
[![Deploy GitHub Pages](https://github.com/thalesfb/lfa/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/thalesfb/lfa/actions/workflows/deploy-pages.yml)
[![Demonstração](https://img.shields.io/badge/demo-GitHub%20Pages-0f766e?style=flat-square&logo=github)](https://thalesfb.github.io/lfa/)
[![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-f0b429?style=flat-square)](LICENSE)

## Regra de crédito e retirada

As moedas são aceitas enquanto o crédito é menor que 30 centavos. Ao atingir ou ultrapassar
30 centavos, a máquina habilita a retirada e pausa a entrada de moedas. Retirar o produto
desconta 30 centavos do saldo atual.

O saldo antes da retirada não passa de 50 centavos: o saldo anterior é menor que 30 e a moeda
de maior valor é 25. Portanto, não existe saldo de 60 centavos nesta máquina.

```text
10 + 10 + 10 = 30: q30+  --R--> q0
25 + 10 = 35:     q30+5 --R--> q5
25 + 25 = 50:     q30+20 --R--> q20
```

`q30+` inicia a faixa de estados com produto disponível. Ela contém cinco estados distintos:
`q30+`, `q30+5`, `q30+10`, `q30+15` e `q30+20`. O sufixo registra o excedente sobre o preço.
Esses estados não podem ser fundidos em um único estado `q30+`: a retirada deve levar saldos
diferentes a destinos diferentes, como `q30+` para `q0` e `q30+20` para `q20`.

## Modelo formal

O modelo é um AFD completo `M = (Q, Σ, δ, q0, F)`:

```text
Q = {q0, q5, q10, q15, q20, q25,
     q30+, q30+5, q30+10, q30+15, q30+20, q_rej}
Σ = {5, 10, 25, R}
q0 = estado inicial
F = {q30+, q30+5, q30+10, q30+15, q30+20}
```

`R` significa retirar o produto. Os estados de `F` indicam que o produto está disponível. Em
estados abaixo de 30 centavos, `δ` soma a moeda ao crédito. Ao entrar em `F`, novos depósitos
são bloqueados até `R`; então `δ` desconta 30 centavos e retorna ao estado do saldo restante.
Entradas incompatíveis levam a `q_rej`, que possui laços para todo símbolo de `Σ`.

O AFD tem 12 estados e 48 transições. A interface deriva “produto disponível” do estado atual;
não usa função de saída `λ`, pilha ou crédito ilimitado.

### Transições de retirada

| Estado atual | Entrada `R` | Saldo após retirada |
| --- | --- | --- |
| `q30+` | `q0` | 0¢ |
| `q30+5` | `q5` | 5¢ |
| `q30+10` | `q10` | 10¢ |
| `q30+15` | `q15` | 15¢ |
| `q30+20` | `q20` | 20¢ |

O arquivo [`vending-machine.jff`](vending-machine.jff) contém o mesmo AFD no formato JFLAP.
O gerador [`scripts/generate-jflap.mjs`](scripts/generate-jflap.mjs) constrói o arquivo a partir
da tabela executada pelo código.

## Interface

- Os botões representam as entradas de moedas; `R` é o botão “Retirar produto”.
- O visor mostra o saldo exato. Na faixa `q30+`, também mostra quanto restará após a retirada.
- Quando o produto fica disponível, moedas são bloqueadas até a retirada.
- A fita e o histórico registram moedas, retiradas e cada mudança de estado.
- Reiniciar devolve a máquina a `q0`.

## Organização do código

- [`src/automaton.js`](src/automaton.js) define os estados e a função de transição `δ`;
- [`src/app.js`](src/app.js) conecta moedas e retirada à máquina;
- [`src/ui-render.js`](src/ui-render.js) mostra saldo, estados, tabela e histórico;
- [`src/diagram.js`](src/diagram.js) desenha a faixa de estados e destaca a última transição;
- [`src/ui-copy.js`](src/ui-copy.js) contém as mensagens da interface;
- [`vending-machine.jff`](vending-machine.jff) abre o modelo no JFLAP.

## Desenvolvimento e validação

Requer Node.js.

```powershell
npm test
node scripts/generate-jflap.mjs
python -m http.server 4173
```

Abra <http://localhost:4173> para visualizar a aplicação local. A demonstração publicada fica
em <https://thalesfb.github.io/lfa/>.

Os testes cobrem as 48 transições, o teto de 50 centavos, os três casos de retirada, a rejeição
de moedas enquanto o produto aguarda retirada e a equivalência entre código e arquivo JFLAP.

## Referências

- [Bonifácio e Costa — Modelagem de uma Vending Machine utilizando um Autômato Finito com Saída](https://www.din.uem.br/~yandre/TC/artigo-vending-machine.pdf)
- [JFLAP — Tutorial de autômatos finitos](https://jflap.org/csed/jflap/tutorial/fa/fa.html)
