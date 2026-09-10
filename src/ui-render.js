import { COINS, PRICE_CENTS, STATES, describeState, transition } from "./automaton.js";
import { renderDiagram } from "./diagram.js";
import { getStatusCopy } from "./ui-copy.js";

export const formatCurrency = (cents) => (cents / 100).toLocaleString("pt-BR", {
  style: "currency",
  currency: "BRL",
}).replace(/\u00a0/g, " ");

export const renderMachineStatus = ({ elements, machine, wordClosed, finishAttempted }) => {
  const copy = getStatusCopy({
    inputLength: machine.input.length,
    accepted: machine.accepted,
    wordClosed,
    finishAttempted,
    missingLabel: formatCurrency(Math.max(PRICE_CENTS - machine.credit, 0)),
  });

  elements.machineStatus.dataset.status = copy.pillStatus;
  elements.vendingMachine.dataset.status = copy.pillStatus;
  elements.statusText.textContent = copy.pillLabel;
  elements.currentState.textContent = machine.state;
  elements.stateDescription.textContent = describeState(machine.state);
  elements.creditValue.textContent = formatCurrency(machine.credit);
  elements.progressBar.style.width = `${Math.min((machine.credit / PRICE_CENTS) * 100, 100)}%`;
  elements.progressBar.parentElement.setAttribute("aria-valuenow", String(Math.min(machine.credit, PRICE_CENTS)));
  elements.screenNote.textContent = copy.screenNote;
  elements.deliveryMessage.textContent = copy.deliveryMessage;

  elements.coinButtons.forEach((button) => {
    button.disabled = wordClosed;
  });
  elements.finishButton.disabled = wordClosed;
  elements.collectButton.hidden = !(wordClosed && machine.accepted);
};

export const renderInputTape = (element, input) => {
  if (input.length === 0) {
    element.innerHTML = '<span class="tape-empty">A fita está vazia. Insira a primeira moeda.</span>';
    return;
  }

  element.innerHTML = input.map((coin, index) => `
    <span class="tape-token ${index === input.length - 1 ? "is-latest" : ""}">
      <strong>${coin}</strong><small>¢</small>
    </span>
    ${index < input.length - 1 ? '<span class="tape-separator">→</span>' : ""}
  `).join("");
};

export const renderHistory = (element, history) => {
  if (history.length === 0) {
    element.innerHTML = '<tr class="empty-row"><td colspan="5">Nenhuma transição registrada ainda.</td></tr>';
    return;
  }

  element.innerHTML = history.map((event, index) => `
    <tr class="${index === history.length - 1 ? "is-latest" : ""}">
      <td>${String(index + 1).padStart(2, "0")}</td>
      <td><span class="table-coin">${event.coin}¢</span></td>
      <td><code>${event.from}</code></td>
      <td><code>${event.to}</code></td>
      <td>${formatCurrency(event.credit)}</td>
    </tr>
  `).join("");
};

export const renderTransitionTable = (elements, currentState) => {
  const rows = STATES.map((state) => `
    <tr class="${state === currentState ? "is-current" : ""}">
      <th scope="row"><code>${state}</code></th>
      ${COINS.map((coin) => `<td>${transition(state, coin)}</td>`).join("")}
    </tr>
  `).join("");

  elements.transitionBody.innerHTML = rows;
  elements.mobileTransitionBody.innerHTML = rows;
};

export const renderCallout = (elements, lastEvent) => {
  if (!lastEvent) {
    elements.diagramCallout.innerHTML = '<span class="callout-arrow">↳</span><span>Escolha uma moeda para destacar a próxima transição.</span>';
    elements.transitionAnnouncement.textContent = "Nenhuma transição executada ainda.";
    return;
  }

  elements.diagramCallout.innerHTML = `
    <span class="callout-arrow">↳</span>
    <span><strong>${lastEvent.from}</strong> + <strong>${lastEvent.coin}¢</strong> → <strong>${lastEvent.to}</strong></span>
  `;
  elements.transitionAnnouncement.textContent = `Transição: ${lastEvent.from} mais ${lastEvent.coin} centavos para ${lastEvent.to}.`;
};

export const renderInterface = ({ elements, machine, lastEvent, wordClosed, finishAttempted }) => {
  renderMachineStatus({ elements, machine, wordClosed, finishAttempted });
  renderInputTape(elements.inputTape, machine.input);
  renderHistory(elements.historyBody, machine.history);
  renderTransitionTable(elements, machine.state);
  renderDiagram({ element: elements.diagram, machine, lastEvent });
  renderCallout(elements, lastEvent);
};
