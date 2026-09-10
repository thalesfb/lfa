import { COINS, FINAL_STATE, STATES, isFinalState, transition } from "./automaton.js";

export const groupTransitions = (states, coins, transitionFunction) => {
  const groups = new Map();

  for (const from of states) {
    for (const coin of coins) {
      const to = transitionFunction(from, coin);
      const key = `${from}→${to}`;
      const group = groups.get(key) ?? { from, to, coins: [] };
      group.coins.push(coin);
      groups.set(key, group);
    }
  }

  return [...groups.values()];
};

const STATE_POSITIONS = Object.freeze({
  q0: { x: 70, y: 300 },
  q5: { x: 220, y: 180 },
  q10: { x: 370, y: 300 },
  q15: { x: 520, y: 180 },
  q20: { x: 670, y: 300 },
  q25: { x: 820, y: 180 },
  [FINAL_STATE]: { x: 970, y: 80 },
});

const FINAL_LANES = Object.freeze({ q5: 410, q10: 385, q15: 360, q20: 335, q25: 135 });
const TRANSITION_LANES = Object.freeze({ 5: 24, 10: 52, 25: 82 });

const pointAlongLine = (source, target, distance) => {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const length = Math.hypot(dx, dy);

  return {
    x: source.x + (dx / length) * distance,
    y: source.y + (dy / length) * distance,
  };
};

const edgeGeometry = (from, to, coin) => {
  const source = STATE_POSITIONS[from];
  const target = STATE_POSITIONS[to];

  if (from === FINAL_STATE && to === FINAL_STATE) {
    const loopLane = { 5: -8, 10: 0, 25: 8 }[coin];

    return {
      path: `M ${source.x - 24} ${source.y - 18} C ${source.x - 70} ${8 + loopLane}, ${source.x + 70} ${8 + loopLane}, ${source.x + 24} ${source.y - 18}`,
      label: { x: source.x, y: 22 + loopLane },
    };
  }

  const start = pointAlongLine(source, target, 29);
  const end = pointAlongLine(target, source, 29);

  if (to === FINAL_STATE) {
    const control = {
      x: (start.x + end.x) / 2,
      y: FINAL_LANES[from] ?? 360,
    };

    return {
      path: `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} Q ${control.x.toFixed(1)} ${control.y.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`,
      label: { x: control.x, y: control.y - 7 },
    };
  }

  const midpoint = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
  const curveDirection = target.y - source.y < -1 ? -1 : 1;
  const control = {
    x: midpoint.x,
    y: midpoint.y + curveDirection * TRANSITION_LANES[coin],
  };

  return {
    path: `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} Q ${control.x.toFixed(1)} ${control.y.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`,
    label: { x: control.x, y: control.y + (curveDirection < 0 ? -7 : 14) },
  };
};

const hasVisitedTransition = (history, from, to, coins) => history.some(
  (event) => event.from === from && event.to === to && coins.includes(event.coin),
);

const visitCount = (history, from, to, coins) => history.filter(
  (event) => event.from === from && event.to === to && coins.includes(event.coin),
).length;

const renderEdge = ({ from, to, coins, history, lastEvent }) => {
  const geometry = edgeGeometry(from, to, coins[0]);
  const active = lastEvent?.from === from && lastEvent?.to === to && coins.includes(lastEvent.coin);
  const visits = visitCount(history, from, to, coins);
  const label = coins.map((coin) => `${coin}¢`).join(" · ");
  const labelWidth = label.length * 8 + 14;
  const accessibleLabel = `${from} + ${coins.join(", ")} centavos para ${to}`;

  return `
    <g class="diagram-edge ${hasVisitedTransition(history, from, to, coins) ? "is-visited" : ""} ${active ? "is-active" : ""}" data-from="${from}" data-to="${to}" data-coins="${coins.join(",")}" data-visits="${visits}" role="group" aria-label="${accessibleLabel}">
      <title>${accessibleLabel}</title>
      <path d="${geometry.path}" marker-end="url(#arrow)" />
      <rect class="edge-label-backdrop" x="${geometry.label.x - labelWidth / 2}" y="${geometry.label.y - 16}" width="${labelWidth}" height="22" rx="3" aria-hidden="true" />
      <text x="${geometry.label.x}" y="${geometry.label.y}" text-anchor="middle">${label}</text>
    </g>
  `;
};

const renderNode = (state, currentState) => {
  const position = STATE_POSITIONS[state];
  const final = isFinalState(state);
  const active = state === currentState;

  return `
    <g class="diagram-node ${active ? "is-current" : ""} ${final ? "is-final" : ""}" transform="translate(${position.x} ${position.y})">
      ${final ? '<circle class="node-ring" r="34" />' : ""}
      <circle class="node-circle" r="27" />
      <text class="node-label" text-anchor="middle" dy="5">${state}</text>
    </g>
  `;
};

const describeDiagram = (machine, lastEvent) => {
  if (!lastEvent) {
    return `Diagrama de estados. Estado atual ${machine.state}. Transições acionadas por moedas de 5, 10 e 25 centavos.`;
  }

  return `Diagrama de estados. Estado atual ${machine.state}. Última transição: ${lastEvent.from} mais ${lastEvent.coin} centavos para ${lastEvent.to}.`;
};

export const renderDiagram = ({ element, machine, lastEvent }) => {
  const edges = groupTransitions(STATES, COINS, transition).map((transitionGroup) => renderEdge({
    ...transitionGroup,
    history: machine.history,
    lastEvent,
  }));
  const nodes = STATES.map((state) => renderNode(state, machine.state)).join("");

  element.innerHTML = `
    <title id="diagram-title">Diagrama de estados da vending machine</title>
    <desc id="diagram-description">${describeDiagram(machine, lastEvent)}</desc>
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
    </defs>
    <text class="diagram-axis-label" x="12" y="405">q0 → q30+ · quantidade acumulada de centavos</text>
    ${edges.join("")}
    ${nodes}
  `;
};
