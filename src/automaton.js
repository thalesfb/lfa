export const COINS = Object.freeze([5, 10, 25]);
export const PRICE_CENTS = 30;
export const INITIAL_STATE = "q0";
export const COLLECT_INPUT = "R";
export const REJECT_STATE = "q_rej";
export const MAX_BALANCE_CENTS = PRICE_CENTS + Math.max(...COINS) - 5;

const stateByCredit = new Map();
const creditByState = new Map();

for (let credit = 0; credit < PRICE_CENTS; credit += 5) {
  const state = `q${credit}`;
  stateByCredit.set(credit, state);
  creditByState.set(state, credit);
}

for (let credit = PRICE_CENTS; credit <= MAX_BALANCE_CENTS; credit += 5) {
  const remainder = credit - PRICE_CENTS;
  const state = remainder === 0 ? "q30+" : `q30+${remainder}`;
  stateByCredit.set(credit, state);
  creditByState.set(state, credit);
}

export const CREDIT_STATES = Object.freeze([...creditByState.keys()]);
export const STATES = Object.freeze([...CREDIT_STATES, REJECT_STATE]);
export const INPUT_SYMBOLS = Object.freeze([...COINS, COLLECT_INPUT]);

const assertValidState = (state) => {
  if (!STATES.includes(state)) {
    throw new RangeError(`Estado inválido: ${state}`);
  }
};

const assertValidInput = (input) => {
  if (!INPUT_SYMBOLS.includes(input)) {
    throw new RangeError(`Entrada inválida: ${input}. Use uma moeda de 5, 10, 25 ou R.`);
  }
};

const stateForCredit = (credit) => {
  const state = stateByCredit.get(credit);

  if (!state) {
    throw new RangeError(`Crédito inválido para o modelo: ${credit}`);
  }

  return state;
};

export const creditForState = (state) => {
  assertValidState(state);
  return creditByState.get(state) ?? null;
};

export const evaluateTransition = (state, input) => {
  assertValidState(state);
  assertValidInput(input);

  if (state === REJECT_STATE) {
    return { nextState: REJECT_STATE, nextCredit: null, valid: false, productReady: false };
  }

  const credit = creditByState.get(state);
  let nextCredit;

  if (input === COLLECT_INPUT) {
    if (credit < PRICE_CENTS) {
      return { nextState: REJECT_STATE, nextCredit: null, valid: false, productReady: false };
    }

    nextCredit = credit - PRICE_CENTS;
  } else {
    if (credit >= PRICE_CENTS) {
      return { nextState: REJECT_STATE, nextCredit: null, valid: false, productReady: false };
    }

    nextCredit = credit + input;
  }

  const nextState = stateForCredit(nextCredit);

  return {
    nextState,
    nextCredit,
    valid: true,
    productReady: nextCredit >= PRICE_CENTS,
  };
};

export const transition = (state, input) => evaluateTransition(state, input).nextState;

export const describeState = (state) => {
  assertValidState(state);

  if (state === REJECT_STATE) {
    return "Entrada inválida; reinicie a simulação";
  }

  const credit = creditByState.get(state);
  const currency = `R$ ${(credit / 100).toFixed(2).replace(".", ",")}`;

  if (credit === 0) {
    return "Sem crédito";
  }

  if (credit >= PRICE_CENTS) {
    const remaining = ((credit - PRICE_CENTS) / 100).toFixed(2).replace(".", ",");
    return `Produto disponível; retirada deixa R$ ${remaining}`;
  }

  return `${currency} de crédito acumulado`;
};

export const createInitialMachine = () => ({
  state: INITIAL_STATE,
  credit: 0,
  productReady: false,
  productsCollected: 0,
  input: [],
  history: [],
});

const ensureValidMove = (event) => {
  if (!event.valid) {
    throw new RangeError("Transição inválida: retire o produto antes de inserir moedas ou acumule 30 centavos antes da retirada.");
  }
};

export const applyCoin = (machine, coin) => {
  assertValidState(machine.state);

  if (!COINS.includes(coin)) {
    throw new RangeError(`Moeda inválida: ${coin}. Use 5, 10 ou 25.`);
  }

  if (machine.productReady) {
    throw new RangeError("Retire o produto antes de inserir outra moeda.");
  }

  const result = evaluateTransition(machine.state, coin);
  ensureValidMove(result);

  const event = {
    input: coin,
    action: "insert-coin",
    coin,
    from: machine.state,
    to: result.nextState,
    credit: result.nextCredit,
    productReady: result.productReady,
  };

  return {
    ...machine,
    state: result.nextState,
    credit: result.nextCredit,
    productReady: result.productReady,
    input: [...machine.input, coin],
    history: [...machine.history, event],
  };
};

export const collectProduct = (machine) => {
  assertValidState(machine.state);

  if (!machine.productReady) {
    throw new RangeError("O produto ainda não está disponível.");
  }

  const result = evaluateTransition(machine.state, COLLECT_INPUT);
  ensureValidMove(result);

  const event = {
    input: COLLECT_INPUT,
    action: "collect-product",
    from: machine.state,
    to: result.nextState,
    creditBefore: machine.credit,
    credit: result.nextCredit,
    productReady: result.productReady,
  };

  return {
    ...machine,
    state: result.nextState,
    credit: result.nextCredit,
    productReady: result.productReady,
    productsCollected: machine.productsCollected + 1,
    input: [...machine.input, COLLECT_INPUT],
    history: [...machine.history, event],
  };
};

export const applyInput = (machine, input) => (
  input === COLLECT_INPUT ? collectProduct(machine) : applyCoin(machine, input)
);

export const runSequence = (sequence) => (
  sequence.reduce((machine, input) => applyInput(machine, input), createInitialMachine())
);
