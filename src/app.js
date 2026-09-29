import {
  applyCoin,
  collectProduct as collectMachineProduct,
  createInitialMachine,
} from "./automaton.js";
import { getElements } from "./dom.js";
import { renderInterface } from "./ui-render.js";

const elements = getElements();

let uiState = {
  machine: createInitialMachine(),
  lastEvent: null,
  productReady: false,
};

const render = () => {
  renderInterface({ elements, ...uiState });
};

const setMachineFromCoin = (button) => {
  if (uiState.productReady) {
    return;
  }

  const machine = applyCoin(uiState.machine, Number(button.dataset.coin));
  uiState = {
    ...uiState,
    machine,
    lastEvent: machine.history.at(-1),
    productReady: machine.productReady,
  };

  button.classList.remove("is-pressed");
  void button.offsetWidth;
  button.classList.add("is-pressed");
  render();
};

const collectProductFromTray = () => {
  if (!uiState.productReady) {
    return;
  }

  const machine = collectMachineProduct(uiState.machine);
  uiState = {
    ...uiState,
    machine,
    lastEvent: machine.history.at(-1),
    productReady: machine.productReady,
  };
  render();
};

const resetMachine = () => {
  uiState = {
    machine: createInitialMachine(),
    lastEvent: null,
    productReady: false,
  };
  render();
};

elements.coinButtons.forEach((button) => {
  button.addEventListener("click", () => setMachineFromCoin(button));
});

elements.resetButton.addEventListener("click", resetMachine);
elements.collectButton.addEventListener("click", collectProductFromTray);

render();
