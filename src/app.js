import {
  COINS,
  FINAL_STATE,
  PRICE_CENTS,
  STATES,
  applyCoin,
  createInitialMachine,
  describeState,
  isFinalState,
  transition,
} from "./automaton.js";
import { groupTransitions } from "./diagram.js";
import { getStatusCopy } from "./ui-copy.js";

const machineStatus = document.querySelector("#machine-status");
const statusText = document.querySelector("#status-text");
const currentState = document.querySelector("#current-state");
const stateDescription = document.querySelector("#state-description");
const creditValue = document.querySelector("#credit-value");
const progressBar = document.querySelector("#progress-bar");
const screenNote = document.querySelector("#screen-note");
const vendingMachine = document.querySelector("#purchase-panel");
const deliveryMessage = document.querySelector("#delivery-message");
const collectButton = document.querySelector("#collect-button");
const inputTape = document.querySelector("#input-tape");
const historyBody = document.querySelector("#history-body");
const transitionBody = document.querySelector("#transition-body");
const diagram = document.querySelector("#automaton-diagram");
const diagramCallout = document.querySelector("#diagram-callout");
const transitionAnnouncement = document.querySelector("#transition-announcement");
const coinButtons = [...document.querySelectorAll("[data-coin]")];
const finishButton = document.querySelector("#finish-button");

let machine = createInitialMachine();
let lastEvent = null;
let wordClosed = false;
let finishAttempted = false;

const statePositions = Object.freeze({
  q0: { x: 70, y: 250 },
  q5: { x: 190, y: 250 },
  q10: { x: 310, y: 250 },
  q15: { x: 430, y: 250 },
  q20: { x: 550, y: 250 },
  q25: { x: 230, y: 100 },
  [FINAL_STATE]: { x: 650, y: 100 },
});

const formatCurrency = (cents) => {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const edgeGeometry = (from, to, coin) => {
  const source = statePositions[from];
  const target = statePositions[to];

  if (from === FINAL_STATE && to === FINAL_STATE) {
    const loopLane = { 5: -8, 10: 0, 25: 8 }[coin];
    return {
      path: `M ${source.x - 24} ${source.y - 18} C ${source.x - 70} ${8 + loopLane}, ${source.x + 70} ${8 + loopLane}, ${source.x + 24} ${source.y - 18}`,
      label: { x: source.x, y: 22 + loopLane },
    };
  }

  if (to === FINAL_STATE) {
    const finalLane = { q5: 48, q10: 76, q15: 104, q20: 132, q25: 164 }[from] ?? 96;
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.hypot(dx, dy);
    const start = {
      x: source.x + (dx / distance) * 29,
      y: source.y + (dy / distance) * 29,
    };
    const end = {
      x: target.x - (dx / distance) * 29,
      y: target.y - (dy / distance) * 29,
    };
    const control = { x: (start.x + end.x) / 2, y: finalLane };

    return {
      path: `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} Q ${control.x.toFixed(1)} ${control.y.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`,
      label: { x: control.x, y: control.y - 7 },
    };
  }

  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const distance = Math.hypot(dx, dy);
  const start = {
    x: source.x + (dx / distance) * 29,
    y: source.y + (dy / distance) * 29,
  };
  const end = {
    x: target.x - (dx / distance) * 29,
    y: target.y - (dy / distance) * 29,
  };
  const midpoint = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
  const lane = { 5: 22, 10: 42, 25: 64 }[coin];
  const curveDirection = dy < -1 ? -1 : 1;
  const control = { x: midpoint.x, y: midpoint.y + curveDirection * lane };

  return {
    path: `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} Q ${control.x.toFixed(1)} ${control.y.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`,
    label: { x: control.x, y: control.y + (curveDirection < 0 ? -7 : 14) },
  };
};

const transitionIsActive = (from, to, coins) => {
  return lastEvent?.from === from && lastEvent?.to === to && coins.includes(lastEvent.coin);
};

const renderDiagram = () => {
  const edges = groupTransitions(STATES, COINS, transition).map(({ from, to, coins }) => {
    const geometry = edgeGeometry(from, to, coins[0]);
    const active = transitionIsActive(from, to, coins);
    const label = coins.join(" · ");
    return `
      <g class="diagram-edge ${active ? "is-active" : ""}" data-from="${from}" data-to="${to}" data-coins="${coins.join(",")}">
        <path d="${geometry.path}" marker-end="url(#arrow)" />
        <text x="${geometry.label.x}" y="${geometry.label.y}" text-anchor="middle">${label}</text>
      </g>
    `;
  });

  const nodes = STATES.map((state) => {
    const position = statePositions[state];
    const active = state === machine.state;
    const final = isFinalState(state);
    return `
      <g class="diagram-node ${active ? "is-current" : ""} ${final ? "is-final" : ""}" transform="translate(${position.x} ${position.y})">
        ${final ? '<circle class="node-ring" r="34" />' : ""}
        <circle class="node-circle" r="27" />
        <text class="node-label" text-anchor="middle" dy="5">${state}</text>
      </g>
    `;
  }).join("");

  diagram.innerHTML = `
    <title id="diagram-title">Diagrama de estados da vending machine</title>
    <desc id="diagram-description">Estados de q0 até q30+, com transições acionadas por moedas de 5, 10 e 25 centavos.</desc>
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
    </defs>
    <text class="diagram-axis-label" x="12" y="330">q0 → q30+ · quantidade acumulada de centavos</text>
    ${edges.join("")}
    ${nodes}
  `;
};

const renderStatus = () => {
  const accepted = machine.accepted;
  const copy = getStatusCopy({
    inputLength: machine.input.length,
    accepted,
    wordClosed,
    finishAttempted,
    missingLabel: formatCurrency(Math.max(PRICE_CENTS - machine.credit, 0)),
  });
  machineStatus.dataset.status = copy.pillStatus;
  vendingMachine.dataset.status = copy.pillStatus;
  statusText.textContent = copy.pillLabel;
  currentState.textContent = machine.state;
  stateDescription.textContent = describeState(machine.state);
  creditValue.textContent = formatCurrency(machine.credit);
  progressBar.style.width = `${Math.min((machine.credit / PRICE_CENTS) * 100, 100)}%`;
  progressBar.parentElement.setAttribute("aria-valuenow", String(Math.min(machine.credit, PRICE_CENTS)));
  screenNote.textContent = copy.screenNote;
  deliveryMessage.textContent = copy.deliveryMessage;

  coinButtons.forEach((button) => {
    button.disabled = wordClosed;
  });
  finishButton.disabled = wordClosed;
  collectButton.hidden = !(wordClosed && accepted);
};

const renderTape = () => {
  if (machine.input.length === 0) {
    inputTape.innerHTML = '<span class="tape-empty">A fita está vazia. Insira a primeira moeda.</span>';
    return;
  }

  inputTape.innerHTML = machine.input.map((coin, index) => `
    <span class="tape-token ${index === machine.input.length - 1 ? "is-latest" : ""}">
      <strong>${coin}</strong><small>¢</small>
    </span>
    ${index < machine.input.length - 1 ? '<span class="tape-separator">→</span>' : ""}
  `).join("");
};

const renderHistory = () => {
  if (machine.history.length === 0) {
    historyBody.innerHTML = '<tr class="empty-row"><td colspan="5">Nenhuma transição registrada ainda.</td></tr>';
    return;
  }

  historyBody.innerHTML = machine.history.map((event, index) => `
    <tr class="${index === machine.history.length - 1 ? "is-latest" : ""}">
      <td>${String(index + 1).padStart(2, "0")}</td>
      <td><span class="table-coin">${event.coin}¢</span></td>
      <td><code>${event.from}</code></td>
      <td><code>${event.to}</code></td>
      <td>${formatCurrency(event.credit)}</td>
    </tr>
  `).join("");
};

const renderTransitionTable = () => {
  transitionBody.innerHTML = STATES.map((state) => `
    <tr class="${state === machine.state ? "is-current" : ""}">
      <th scope="row"><code>${state}</code></th>
      ${COINS.map((coin) => `<td>${transition(state, coin)}</td>`).join("")}
    </tr>
  `).join("");
};

const renderCallout = () => {
  if (!lastEvent) {
    diagramCallout.innerHTML = '<span class="callout-arrow">↳</span><span>Escolha uma moeda para destacar a próxima transição.</span>';
    transitionAnnouncement.textContent = "Nenhuma transição executada ainda.";
    return;
  }

  diagramCallout.innerHTML = `
    <span class="callout-arrow">↳</span>
    <span><strong>${lastEvent.from}</strong> + <strong>${lastEvent.coin}¢</strong> → <strong>${lastEvent.to}</strong></span>
  `;
  transitionAnnouncement.textContent = `Transição: ${lastEvent.from} mais ${lastEvent.coin} centavos para ${lastEvent.to}.`;
};

const render = () => {
  renderStatus();
  renderTape();
  renderHistory();
  renderTransitionTable();
  renderDiagram();
  renderCallout();
};

coinButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (wordClosed) return;
    const coin = Number(button.dataset.coin);
    machine = applyCoin(machine, coin);
    lastEvent = machine.history.at(-1);
    finishAttempted = false;
    button.classList.remove("is-pressed");
    void button.offsetWidth;
    button.classList.add("is-pressed");
    render();
  });
});

finishButton.addEventListener("click", () => {
  finishAttempted = true;
  wordClosed = machine.accepted;
  render();
});

const resetMachine = () => {
  machine = createInitialMachine();
  lastEvent = null;
  wordClosed = false;
  finishAttempted = false;
  render();
};

document.querySelector("#reset-button").addEventListener("click", resetMachine);
collectButton.addEventListener("click", resetMachine);

render();
