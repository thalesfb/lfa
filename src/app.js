import {
  applyCoin,
  createInitialMachine,
} from "./automaton.js";
import { getElements } from "./dom.js";
import { renderInterface } from "./ui-render.js";

const elements = getElements();

let uiState = {
  machine: createInitialMachine(),
  lastEvent: null,
  wordClosed: false,
  finishAttempted: false,
};

const render = () => {
  renderInterface({ elements, ...uiState });
};

const setMachineFromCoin = (button) => {
  if (uiState.wordClosed) {
    return;
  }

  const machine = applyCoin(uiState.machine, Number(button.dataset.coin));
  uiState = {
    ...uiState,
    machine,
    lastEvent: machine.history.at(-1),
    finishAttempted: false,
  };

  button.classList.remove("is-pressed");
  void button.offsetWidth;
  button.classList.add("is-pressed");
  render();
};

const finishPurchase = () => {
  uiState = {
    ...uiState,
    finishAttempted: true,
    wordClosed: uiState.machine.accepted,
  };
  render();
};

const resetMachine = () => {
  uiState = {
    machine: createInitialMachine(),
    lastEvent: null,
    wordClosed: false,
    finishAttempted: false,
  };
  render();
};

elements.coinButtons.forEach((button) => {
  button.addEventListener("click", () => setMachineFromCoin(button));
});

elements.finishButton.addEventListener("click", finishPurchase);
elements.resetButton.addEventListener("click", resetMachine);
elements.collectButton.addEventListener("click", resetMachine);

render();
