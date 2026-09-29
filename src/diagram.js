import {
  CREDIT_STATES,
  PRICE_CENTS,
  creditForState,
} from "./automaton.js";

const X_START = 72;
const X_END = 1008;
const NODE_Y = 120;
const STEP = (X_END - X_START) / (CREDIT_STATES.length - 1);
const STATE_POSITIONS = Object.freeze(Object.fromEntries(
  CREDIT_STATES.map((state, index) => [state, { x: X_START + STEP * index, y: NODE_Y }]),
));

const renderNode = (state, currentState, previousState) => {
  const position = STATE_POSITIONS[state];
  const credit = creditForState(state);
  const ready = credit >= PRICE_CENTS;
  const active = state === currentState;
  const previous = state === previousState && !active;

  return `
    <g class="diagram-node ${ready ? "is-ready" : ""} ${active ? "is-current" : ""} ${previous ? "is-previous" : ""}"
      transform="translate(${position.x} ${position.y})">
      <circle class="node-circle" r="40" />
      <text class="node-label" text-anchor="middle" dy="5">${state}</text>
      <text class="node-credit" text-anchor="middle" y="56">${credit}¢</text>
    </g>
  `;
};

const renderLastTransition = (event) => {
  if (!event) {
    return "";
  }

  const source = STATE_POSITIONS[event.from];
  const target = STATE_POSITIONS[event.to];

  if (!source || !target) {
    return "";
  }

  const middleX = (source.x + target.x) / 2;
  const inputLabel = event.action === "collect-product"
    ? "retirar / −30¢"
    : `${event.coin}¢`;
  const labelWidth = Math.max(inputLabel.length * 9 + 20, 58);
  const accessibleLabel = event.action === "collect-product"
    ? `Retirada: ${event.from} para ${event.to}; descontados 30 centavos.`
    : `Moeda de ${event.coin} centavos: ${event.from} para ${event.to}.`;

  return `
    <g class="last-transition" role="group" aria-label="${accessibleLabel}">
      <title>${accessibleLabel}</title>
      <path d="M ${source.x} 91 Q ${middleX} 30 ${target.x} 91" marker-end="url(#arrow)" />
      <rect class="last-transition-label-backdrop" x="${middleX - labelWidth / 2}" y="12" width="${labelWidth}" height="24" rx="4" />
      <text class="last-transition-label" x="${middleX}" y="29" text-anchor="middle">${inputLabel}</text>
    </g>
  `;
};

const describeDiagram = (machine, lastEvent) => {
  const readyStates = CREDIT_STATES.filter((state) => creditForState(state) >= PRICE_CENTS);
  const readyRange = `${readyStates[0]} a ${readyStates.at(-1)}`;
  const scaleDescription = "Escala de saldos: moedas de 5, 10 e 25 centavos saltam diretamente ao total; a posição horizontal representa saldo, não transições. q_rej está na tabela completa.";

  if (!lastEvent) {
    return `${scaleDescription} Estados de q0 a ${readyStates.at(-1)}. Produto disponível nos estados ${readyRange}. Saldo máximo antes da retirada: 50 centavos.`;
  }

  if (lastEvent.action === "collect-product") {
    return `${scaleDescription} Estado atual ${machine.state}. Retirada de produto descontou 30 centavos e deixou ${lastEvent.credit} centavos.`;
  }

  return `${scaleDescription} Estado atual ${machine.state}. Inserida moeda de ${lastEvent.coin} centavos; saldo ${lastEvent.credit} centavos.`;
};

export const renderDiagram = ({ element, machine, lastEvent }) => {
  const nodes = CREDIT_STATES.map((state) => renderNode(state, machine.state, lastEvent?.from)).join("");
  const firstReadyX = STATE_POSITIONS["q30+"].x - STEP / 2;

  element.innerHTML = `
    <title id="diagram-title">Escala de estados de saldo e retirada</title>
    <desc id="diagram-description">${describeDiagram(machine, lastEvent)}</desc>
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
    </defs>
    <rect class="ready-state-band" x="${firstReadyX}" y="43" width="${X_END + STEP / 2 - firstReadyX}" height="139" rx="18" />
    <text class="ready-band-label" x="${(firstReadyX + X_END + STEP / 2) / 2}" y="58" text-anchor="middle">produto disponível · retirar para descontar 30¢</text>
    ${renderLastTransition(lastEvent)}
    ${nodes}
    <text class="scale-label" x="${(X_START + X_END) / 2}" y="222" text-anchor="middle">escala de saldos · moedas de 5, 10 e 25 centavos saltam diretamente ao total</text>
  `;
};
