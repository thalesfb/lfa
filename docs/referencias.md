# Referências para estudo — Linguagens Formais e Autômatos

Este roteiro organiza fontes para estudar a disciplina a partir do exemplo da VEND-30.
Ele separa o que é fundamento teórico, o que é prática com ferramentas e o que pertence
ao artigo que motivou o trabalho.

## Como este projeto se relaciona com o artigo

O artigo **Modelagem de uma Vending Machine utilizando um Autômato Finito com Saída**
modela uma máquina de venda como uma Máquina de Mealy: além de mudar de estado, a
máquina produz saídas associadas às transições. O modelo do artigo inclui moedas de 5,
10, 25 e 50 centavos, seleção de categorias e produtos, troco e estados de liberação.

Este repositório implementa deliberadamente um recorte menor, adequado ao estudo de um
AFD reconhecedor:

- `Σ = {5, 10, 25}` é o alfabeto de entrada;
- a palavra é aceita quando a soma chega a pelo menos 30 centavos;
- `q30+` representa a classe de todos os créditos maiores ou iguais a 30;
- não há estoque, escolha de produto, troco ou função de saída `λ`.

Essa diferença é importante: a VEND-30 demonstra a função de transição `δ` e a aceitação
de palavras; ela não afirma ser uma reprodução completa da máquina de Mealy do artigo.

## Roteiro recomendado

### 1. Comece pelo vocabulário

Estude alfabetos, palavras, linguagens, concatenação, prefixo e linguagem reconhecida.
Em seguida, escreva AFDs como uma 5-tupla `M = (Q, Σ, δ, q0, F)` e acompanhe a execução
de uma palavra símbolo a símbolo.

### 2. Desenhe e teste AFDs

Use o diagrama e a tabela da VEND-30 para responder: quais estados representam o crédito
acumulado? Por que `q30+` pode ter laços? O que muda se o preço for 35? Depois compare o
resultado com o arquivo `vending-machine.jff` no JFLAP.

### 3. Relacione estados a linguagens regulares

Estude expressões regulares, equivalência de autômatos, fechamento das linguagens
regulares e minimização. A ideia de agrupar todos os valores `>= 30` em `q30+` é um bom
gancho para discutir estados equivalentes e a intuição de Myhill–Nerode.

### 4. Avance para autômatos com saída

Compare o AFD reconhecedor com as máquinas de Moore e Mealy. Na Mealy, a saída depende do
estado e da entrada na transição; na Moore, a saída é associada ao estado. Releia então
o artigo da vending machine e identifique quais símbolos produzem troco ou liberam um
produto.

### 5. Prossiga para os próximos modelos

Depois de dominar AFD, NFA e minimização, siga para gramáticas livres de contexto,
autômatos com pilha, máquinas de Turing e decidibilidade. O curso do MIT organiza essa
progressão junto com complexidade computacional.

## Referências principais

| Prioridade | Referência | O que estudar | Relação com o projeto |
| --- | --- | --- | --- |
| Essencial | Bonifácio e Costa, **Modelagem de uma Vending Machine utilizando um Autômato Finito com Saída** | Máquina de Mealy, estados de crédito, produtos, troco e saídas | É o artigo motivador; compare-o com o recorte AFD da VEND-30. |
| Essencial | Cornell, **DFA introduction** | Definição de AFD como 5-tupla e execução | Dá a notação formal usada em `src/automaton.js`. |
| Essencial | MIT OpenCourseWare, **Automata, Computability, and Complexity** | AFD, NFA, linguagens regulares e fundamentos da disciplina | Fornece aulas, notas e listas em uma sequência completa. |
| Essencial | Shallit, **Finite automata and regular languages** | Reconhecedores, Moore, Mealy e linguagens regulares | Ajuda a distinguir aceitação de saída. |
| Intermediária | Cornell, **DFA minimization notes** | Myhill–Nerode e minimização | Explica a intuição por trás de estados equivalentes e do agrupamento `q30+`. |
| Intermediária | Hopcroft, Motwani e Ullman, **Introduction to Automata Theory, Languages, and Computation** | Livro-texto sobre autômatos, linguagens regulares e complexidade | Referência ampla para aprofundamento e consulta. |
| Prática | **JFLAP book** e tutorial de autômatos finitos | Construção, execução, rastreamento e minimização | Permite abrir e experimentar `vending-machine.jff`. |

## Fontes consultadas

1. [Bonifácio e Costa — artigo original sobre a vending machine (PDF)](https://www.din.uem.br/yandre/TC/artigo-vending-machine.pdf).
2. [UEM — materiais de Teoria da Computação](https://www.din.uem.br/~yandre/tc.htm).
3. [Cornell — DFA introduction](https://www.cs.cornell.edu/courses/cs2800/2017fa/lectures/lec21-dfa.html).
4. [MIT OpenCourseWare — Automata, Computability, and Complexity](https://ocw.mit.edu/courses/6-045j-automata-computability-and-complexity-spring-2011/).
5. [MIT — Lecture 3: deterministic finite automata](https://ocw.mit.edu/courses/6-045j-automata-computability-and-complexity-spring-2011/a8b9bb8d5d9c1f7a6b4a85056b8dcbde_MIT6_045JS11_lec03.pdf).
6. [Shallit — Finite automata and regular languages](https://www.cambridge.org/core/books/abs/second-course-in-formal-languages-and-automata-theory/finite-automata-and-regular-languages/F193C87118322C9202FB00B11125CF1C), DOI: [10.1017/CBO9780511808876.004](https://doi.org/10.1017/CBO9780511808876.004).
7. [Cornell — DFA minimization and Myhill–Nerode](https://courses.cs.cornell.edu/cs4120/2023sp/notes/leximpl/index.html).
8. [Hopcroft, Motwani e Ullman — Introduction to Automata Theory, Languages, and Computation](https://www.pearson.com/en-us/subject-catalog/p/introduction-to-automata-theory-languages-and-computation/P200000003517/9780321455369).
9. [JFLAP — livro oficial](https://jflap.org/jflapbook/jflapbook2006.pdf) e [tutorial de autômato finito](https://jflap.org/tutorial/fa/createfa/fa.html).
10. [UFMG — autômato finito com saída](https://homepages.dcc.ufmg.br/~loureiro/md/md_6Funcoes.pdf).

## Perguntas para revisar

1. Por que o conjunto de estados precisa ser finito mesmo que o crédito real possa crescer?
2. Qual é a diferença entre a palavra de entrada ser aceita e a máquina liberar um produto?
3. O que se perde ao trocar a Máquina de Mealy do artigo por um AFD reconhecedor?
4. Se o preço mudar para 35 centavos, quais estados e transições precisam ser alterados?
5. O AFD poderia ser minimizado para uma quantidade menor de estados sem mudar a linguagem?
