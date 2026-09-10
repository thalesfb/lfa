export const COINS = Object.freeze([5, 10, 25]);
export const PRICE_CENTS = 30;
export const INITIAL_STATE = "q0";
export const FINAL_STATE = "q30+";

const AMOUNT_STATES = Object.freeze({
  q0: 0,
  q5: 5,
  q10: 10,
  q15: 15,
  q20: 20,
  q25: 25,
  [FINAL_STATE]: PRICE_CENTS,
});

export const STATES = Object.freeze(Object.keys(AMOUNT_STATES));

const stateForCredit = (credit) => {
  if (credit >= PRICE_CENTS) {
    return FINAL_STATE;
  }

  return `q${credit}`;
};

const assertValidState = (state) => {
  if (!Object.hasOwn(AMOUNT_STATES, state)) {
    throw new RangeError(`Estado inválido: ${state}`);
  }
};

const assertValidCoin = (coin) => {
  if (!COINS.includes(coin)) {
    throw new RangeError(`Moeda inválida: ${coin}. Use 5, 10 ou 25.`);
  }
};

/**
 * Função de transição do autômato.
 *
 * O estado q30+ agrega todos os valores maiores ou iguais ao preço. Isso
 * mantém o autômato finito e representa diretamente a condição de aceitação
 * pedida no enunciado.
 */
export const transition = (state, coin) => {
  assertValidState(state);
  assertValidCoin(coin);

  if (state === FINAL_STATE) {
    return FINAL_STATE;
  }

  return stateForCredit(AMOUNT_STATES[state] + coin);
};

export const isFinalState = (state) => state === FINAL_STATE;

export const describeState = (state) => {
  assertValidState(state);

  if (state === INITIAL_STATE) {
    return "Sem moedas inseridas";
  }

  if (state === FINAL_STATE) {
    return "Valor suficiente — palavra aceita";
  }

  return `R$ ${(AMOUNT_STATES[state] / 100).toFixed(2).replace(".", ",")} acumulados`;
};

export const createInitialMachine = () => ({
  state: INITIAL_STATE,
  credit: 0,
  accepted: false,
  input: [],
  history: [],
});

export const applyCoin = (machine, coin) => {
  assertValidState(machine.state);
  assertValidCoin(coin);

  const nextState = transition(machine.state, coin);
  const nextCredit = machine.credit + coin;
  const event = {
    coin,
    from: machine.state,
    to: nextState,
    credit: nextCredit,
  };

  return {
    state: nextState,
    credit: nextCredit,
    accepted: isFinalState(nextState),
    input: [...machine.input, coin],
    history: [...machine.history, event],
  };
};

export const runSequence = (sequence) => {
  return sequence.reduce((machine, coin) => applyCoin(machine, coin), createInitialMachine());
};
