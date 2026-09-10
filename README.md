# VEND-30 — Trabalho 01 de LFA

Este repositório é, neste momento, exclusivo do Trabalho 01 de Linguagens Formais e
Autômatos. A interface usa a metáfora de uma máquina de vendas, mas o objeto formal do
trabalho é um **autômato finito determinístico (AFD) reconhecedor**.

## Objetivo e limite do trabalho

A VEND-30 reconhece palavras formadas por moedas de 5, 10 e 25 centavos. O produto custa
30 centavos e uma palavra é aceita quando a soma chega a pelo menos esse valor:

```text
L = { w ∈ {5, 10, 25}* | soma(w) ≥ 30 }
```

O artigo usado como motivação apresenta uma máquina de vendas mais completa, modelada como
uma **Máquina de Mealy**, com seleção de produtos, estoque, troco e símbolos de saída. Esses
elementos não fazem parte deste recorte: a implementação abaixo demonstra a função de
transição `δ` e a aceitação de palavras, sem transformar o trabalho em uma Máquina de Mealy.

Se o projeto crescer no futuro para abranger o artigo completo, a documentação específica
de cada novo escopo deverá ser separada. Por enquanto, toda a explicação necessária para
este trabalho fica aqui no README.

## Validação formal contra o Trabalho 01

O modelo implementado é a 5-tupla:

```text
M = (Q, Σ, δ, q0, F)
Σ = {5, 10, 25}
Q = {q0, q5, q10, q15, q20, q25, q30+}
q0 = estado inicial
F = {q30+}
δ: Q × Σ → Q
```

Isso mantém o trabalho dentro da definição de AFD:

- `Q` é finito e todos os sete estados são alcançáveis;
- `Σ` contém somente as três moedas permitidas;
- para cada estado e cada moeda existe exatamente um próximo estado;
- `δ` é determinística e total para `Σ`, resultando em 7 × 3 = 21 transições;
- a palavra só é aceita quando termina em `q30+`;
- o arquivo JFLAP usa `<type>fa</type>`, possui `q0` como inicial e `q30+` como final;
- não existe função de saída `λ`, estoque, troco ou seleção formal de produto.

### Tabela completa de transições

| Estado | 5¢ | 10¢ | 25¢ |
| --- | --- | --- | --- |
| `q0` | `q5` | `q10` | `q25` |
| `q5` | `q10` | `q15` | `q30+` |
| `q10` | `q15` | `q20` | `q30+` |
| `q15` | `q20` | `q25` | `q30+` |
| `q20` | `q25` | `q30+` | `q30+` |
| `q25` | `q30+` | `q30+` | `q30+` |
| `q30+` | `q30+` | `q30+` | `q30+` |

Assim, as três transições que saem do estado inicial são:

```text
q0 + 5¢  → q5
q0 + 10¢ → q10
q0 + 25¢ → q25
```

`q30+` representa a classe de todos os créditos maiores ou iguais a 30; não significa
exatamente 30 centavos. Por isso ele é um estado final absorvente:

```text
δ(q30+, 5) = δ(q30+, 10) = δ(q30+, 25) = q30+
```

O estado formal e o crédito operacional são mantidos separadamente: `machine.state` pode
ser `q30+`, enquanto `machine.credit` exibe R$ 0,35 ou R$ 0,50. Isso preserva a finitude do
AFD sem esconder o valor real inserido.

## Funcionamento programático

O caminho de uma moeda pelo programa é:

```text
clique na moeda
  → applyCoin(machine, coin)
  → transition(machine.state, coin)
  → atualiza estado, crédito e histórico
  → render() atualiza a interface
```

- [`src/automaton.js`](src/automaton.js) define `Q`, `Σ`, `δ`, a aceitação e o estado da
  simulação;
- [`src/app.js`](src/app.js) conecta os botões ao modelo e renderiza visor, fita, histórico
  e diagrama;
- [`src/diagram.js`](src/diagram.js) somente agrupa visualmente moedas que têm a mesma
  origem e destino; ele não altera `δ`;
- [`vending-machine.jff`](vending-machine.jff) contém as mesmas 21 transições para o JFLAP.

“Liberar produto” é uma ação da interface que consulta se o estado alcançado é final; não é
uma transição extra do AFD. Se o crédito for insuficiente, a tentativa é comunicada como
rejeitada, mas a entrada continua aberta para que o usuário possa inserir outras moedas.

## Como a interface demonstra o modelo

- os botões representam os símbolos de `Σ`;
- o estado atual, a fita e o histórico mostram a execução de `δ` passo a passo;
- o diagrama apresenta os estados e as arestas; o caminho já percorrido permanece marcado e
  a última transição recebe destaque mais forte;
- a guia “Como ler as setas” explicita os três caminhos que saem de `q0`;
- em telas estreitas, uma tabela de transições substitui o SVG reduzido para preservar a
  legibilidade sem barra horizontal;
- a tabela completa abaixo do simulador permite conferir toda a função `δ`.

## Visualização e entrega

É necessário ter Node.js instalado.

O objeto principal do trabalho é a interface web publicada. O servidor local abaixo serve
somente para visualizar e testar a aplicação durante o desenvolvimento:

```powershell
npm test
```

Para abrir a interface:

```powershell
python -m http.server 4173
```

Acesse <http://localhost:4173> apenas como pré-visualização local.

Para a entrega, o repositório deve ser publicado no GitHub e a raiz do projeto deve ser
habilitada no GitHub Pages. Como o repositório é `thalesfb/lfa`, a URL esperada da página do
projeto será:

<https://thalesfb.github.io/lfa/>

Essa página do GitHub Pages será a origem oficial da interface; `localhost` não é a URL de
entrega.

### Roteiro manual

1. Confirme o estado inicial `q0` e o crédito R$ 0,00.
2. Insira 10¢ e observe `q0 → q10`.
3. Insira 25¢ e observe `q10 → q30+`, com crédito real de R$ 0,35.
4. Insira outra moeda em `q30+` e observe o laço absorvente.
5. Tente liberar com apenas 10¢: a mensagem deve indicar rejeição, mas os botões continuam habilitados.
6. Complete a palavra com 25¢ e retire o produto.
7. Consulte a tabela completa e compare-a com o arquivo JFLAP.

## Testes automatizados

`npm test` verifica:

- contrato do trabalho e estado inicial;
- as 21 combinações da tabela de transições;
- aceitação exata, excesso de crédito e rejeição;
- laços absorventes em `q30+` mantendo o crédito real;
- determinismo, estados inicial/final e unicidade das transições no JFLAP;
- mensagens da interface, contrato público e layout responsivo.

## Referências e embasamento

### Artigo-base

- [Bonifácio e Costa — Modelagem de uma Vending Machine utilizando um Autômato Finito com Saída (PDF)](https://www.din.uem.br/yandre/TC/artigo-vending-machine.pdf)
- [UEM — materiais de Teoria da Computação](https://www.din.uem.br/~yandre/tc.htm)

O artigo é usado para comparar AFD reconhecedor e Máquina de Mealy. A VEND-30 não afirma
reproduzir o artigo completo: ela implementa apenas o recorte formal exigido para este
trabalho.

### Fundamentos de AFD e linguagens regulares

- [Cornell — DFA introduction](https://www.cs.cornell.edu/courses/cs2800/2017fa/lectures/lec21-dfa.html)
- [MIT OpenCourseWare — Automata, Computability, and Complexity](https://ocw.mit.edu/courses/6-045j-automata-computability-and-complexity-spring-2011/)
- [MIT — Lecture 3: deterministic finite automata (PDF)](https://ocw.mit.edu/courses/6-045j-automata-computability-and-complexity-spring-2011/a8b9bb8d5d9c1f7a6b4a85056b8dcbde_MIT6_045JS11_lec03.pdf)
- [Shallit — Finite automata and regular languages](https://www.cambridge.org/core/books/abs/second-course-in-formal-languages-and-automata-theory/finite-automata-and-regular-languages/F193C87118322C9202FB00B11125CF1C), DOI [10.1017/CBO9780511808876.004](https://doi.org/10.1017/CBO9780511808876.004)
- [Cornell — DFA minimization e Myhill–Nerode](https://courses.cs.cornell.edu/cs4120/2023sp/notes/leximpl/index.html)
- Hopcroft, Motwani e Ullman, [Introduction to Automata Theory, Languages, and Computation](https://www.pearson.com/en-us/subject-catalog/p/introduction-to-automata-theory-languages-and-computation/P200000003517/9780321455369)

### Ferramentas e autômatos com saída

- [JFLAP — livro oficial](https://jflap.org/jflapbook/jflapbook2006.pdf)
- [JFLAP — tutorial de autômatos finitos](https://jflap.org/tutorial/fa/createfa/fa.html)
- [UFMG — autômato finito com saída](https://homepages.dcc.ufmg.br/~loureiro/md/md_6Funcoes.pdf)

### Perguntas para continuar estudando

1. Por que o conjunto de estados precisa ser finito mesmo que o crédito real possa crescer?
2. Qual é a diferença entre uma palavra ser aceita e uma máquina liberar um produto?
3. O que se perde ao trocar a Máquina de Mealy do artigo por um AFD reconhecedor?
4. Se o preço mudar para 35 centavos, quais estados e transições precisam ser alterados?
5. O AFD poderia ser minimizado sem mudar a linguagem reconhecida?

## Status

A versão atual é local e testável. A publicação do repositório e da interface pertence à
etapa posterior de entrega.
