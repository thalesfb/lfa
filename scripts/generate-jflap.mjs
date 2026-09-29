import { writeFileSync } from "node:fs";

import {
  INITIAL_STATE,
  INPUT_SYMBOLS,
  PRICE_CENTS,
  STATES,
  creditForState,
  transition,
} from "../src/automaton.js";

const coordinates = [
  [80, 170],
  [220, 170],
  [360, 170],
  [500, 170],
  [640, 170],
  [780, 170],
  [920, 170],
  [1060, 170],
  [1200, 170],
  [1340, 170],
  [1480, 170],
  [1640, 170],
];

const ids = new Map(STATES.map((state, index) => [state, String(index)]));
const stateXml = STATES.map((state, index) => {
  const credit = creditForState(state);
  const markers = [
    state === INITIAL_STATE ? "      <initial/>" : "",
    credit !== null && credit >= PRICE_CENTS ? "      <final/>" : "",
  ].filter(Boolean).join("\n");
  const markerXml = markers ? `${markers}\n` : "";

  return `    <state id="${index}" name="${state}">\n`
    + `      <x>${coordinates[index][0]}.0</x>\n`
    + `      <y>${coordinates[index][1]}.0</y>\n`
    + markerXml
    + "    </state>";
});

const transitionXml = STATES.flatMap((state) => INPUT_SYMBOLS.map((input) => {
  const nextState = transition(state, input);

  return `    <transition><from>${ids.get(state)}</from><to>${ids.get(nextState)}</to>`
    + `<read>${input}</read></transition>`;
}));

const xml = [
  '<?xml version="1.0" encoding="UTF-8" standalone="no"?>',
  "<structure>",
  "  <type>fa</type>",
  "  <automaton>",
  ...stateXml,
  ...transitionXml,
  "  </automaton>",
  "</structure>",
  "",
].join("\n");

writeFileSync(new URL("../vending-machine.jff", import.meta.url), xml, "utf8");
console.log(`Generated JFLAP AFD: ${STATES.length} states, ${transitionXml.length} transitions.`);
