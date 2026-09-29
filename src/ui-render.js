import {
  COLLECT_INPUT,
  INPUT_SYMBOLS,
  PRICE_CENTS,
  REJECT_STATE,
  STATES,
  describeState,
  evaluateTransition,
} from "./automaton.js";
import { renderDiagram } from "./diagram.js";
import { getStatusCopy } from "./ui-copy.js";

export const formatCurrency = (cents) => (cents / 100).toLocaleString("pt-BR", {
  style: "currency",
  currency: "BRL",
}).replace(/\u00a0/g, " ");

export const renderMachineStatus = ({ elements, machine, productReady, lastEvent }) => {
  const copy = getStatusCopy({
    inputLength: machine.input.length,
    state: machine.state,
    credit: machine.credit,
    creditLabel: formatCurrency(machine.credit),
    missingLabel: formatCurrency(Math.max(PRICE_CENTS - machine.credit, 0)),
    afterProductLabel: formatCurrency(Math.max(machine.credit - PRICE_CENTS, 0)),
    productReady,
    lastEvent,
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
    button.disabled = productReady;
  });
  elements.collectButton.hidden = !productReady;
};

export const renderInputTape = (element, input) => {
  if (input.length === 0) {
    element.innerHTML = '<span class="tape-empty">A fita está vazia. Insira a primeira moeda.</span>';
    return;
  }

  element.innerHTML = input.map((symbol, index) => {
    const isCollection = symbol === COLLECT_INPUT;
    const content = isCollection
      ? '<strong>R</strong><small>retirada</small>'
      : `<strong>${symbol}</strong><small>¢</small>`;

    return `
      <span class="tape-token ${index === input.length - 1 ? "is-latest" : ""}">${content}</span>
      ${index < input.length - 1 ? '<span class="tape-separator">→</span>' : ""}
    `;
  }).join("");
};

export const renderHistory = (element, history) => {
  if (history.length === 0) {
    element.innerHTML = '<tr class="empty-row"><td colspan="5">Nenhuma transição registrada ainda.</td></tr>';
    return;
  }

  element.innerHTML = history.map((event, index) => {
    const isCollection = event.action === "collect-product";
    const inputLabel = isCollection ? "R · retirar" : `${event.coin}¢`;
    const stepLabel = isCollection
      ? `Produto retirado · saldo ${formatCurrency(event.credit)}`
      : event.productReady
        ? `Produto disponível · saldo ${formatCurrency(event.credit)}`
        : `Crédito ${formatCurrency(event.credit)}`;

    return `
      <tr class="${index === history.length - 1 ? "is-latest" : ""}">
        <td>${String(index + 1).padStart(2, "0")}</td>
        <td><span class="table-coin">${inputLabel}</span></td>
        <td><code>${event.from}</code></td>
        <td><code>${event.to}</code></td>
        <td>${stepLabel}</td>
      </tr>
    `;
  }).join("");
};

const transitionDescription = (input, result) => {
  if (result.nextState === REJECT_STATE) {
    return "inválido";
  }

  if (input === COLLECT_INPUT) {
    return "retirada";
  }

  return result.productReady ? "produto disponível" : "crédito";
};

export const renderTransitionTable = (elements, currentState) => {
  const rows = STATES.map((state) => `
    <tr class="${state === currentState ? "is-current" : ""}">
      <th scope="row"><code>${state}</code></th>
      ${INPUT_SYMBOLS.map((input) => {
        const result = evaluateTransition(state, input);
        return `<td><code>${result.nextState}</code><small>${transitionDescription(input, result)}</small></td>`;
      }).join("")}
    </tr>
  `).join("");

  elements.transitionBody.innerHTML = rows;
  elements.mobileTransitionBody.innerHTML = rows;
};

const eventDescription = (event) => {
  if (event.action === "collect-product") {
    return `Retirada desconta 30 centavos; ${formatCurrency(event.credit)} continuam como saldo.`;
  }

  if (event.productReady) {
    return `Produto disponível. A retirada desconta 30 centavos; ${formatCurrency(event.credit - PRICE_CENTS)} permanecem.`;
  }

  return `${formatCurrency(event.credit)} acumulados; produto ainda indisponível.`;
};

export const renderCallout = (elements, lastEvent) => {
  if (!lastEvent) {
    elements.diagramCallout.innerHTML = '<span class="callout-label">Última transição</span><span>Insira uma moeda ou retire o produto disponível para acompanhar a mudança de estado.</span>';
    elements.transitionAnnouncement.textContent = "Nenhuma transição executada ainda.";
    return;
  }

  const inputLabel = lastEvent.action === "collect-product"
    ? "retirada R"
    : `moeda ${lastEvent.coin}¢`;
  const description = eventDescription(lastEvent);

  elements.diagramCallout.innerHTML = `
    <span class="callout-label">Última transição</span>
    <span><strong>${lastEvent.from}</strong> + <strong>${inputLabel}</strong> → <strong>${lastEvent.to}</strong>
      <small>${description}</small>
    </span>
  `;
  elements.transitionAnnouncement.textContent = `Transição: ${lastEvent.from}, ${inputLabel}, ${lastEvent.to}. ${description}`;
};

export const renderInterface = ({ elements, machine, lastEvent, productReady }) => {
  renderMachineStatus({ elements, machine, lastEvent, productReady });
  renderInputTape(elements.inputTape, machine.input);
  renderHistory(elements.historyBody, machine.history);
  renderTransitionTable(elements, machine.state);
  renderDiagram({ element: elements.diagram, machine, lastEvent });
  renderCallout(elements, lastEvent);
};
