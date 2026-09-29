import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  COINS,
  COLLECT_INPUT,
  CREDIT_STATES,
  INITIAL_STATE,
  INPUT_SYMBOLS,
  MAX_BALANCE_CENTS,
  PRICE_CENTS,
  REJECT_STATE,
  STATES,
  applyCoin,
  collectProduct,
  createInitialMachine,
  creditForState,
  evaluateTransition,
  runSequence,
  transition,
} from "../src/automaton.js";

const EXPECTED_TRANSITIONS = {
  q0: { 5: "q5", 10: "q10", 25: "q25", R: REJECT_STATE },
  q5: { 5: "q10", 10: "q15", 25: "q30+", R: REJECT_STATE },
  q10: { 5: "q15", 10: "q20", 25: "q30+5", R: REJECT_STATE },
  q15: { 5: "q20", 10: "q25", 25: "q30+10", R: REJECT_STATE },
  q20: { 5: "q25", 10: "q30+", 25: "q30+15", R: REJECT_STATE },
  q25: { 5: "q30+", 10: "q30+5", 25: "q30+20", R: REJECT_STATE },
  "q30+": { 5: REJECT_STATE, 10: REJECT_STATE, 25: REJECT_STATE, R: "q0" },
  "q30+5": { 5: REJECT_STATE, 10: REJECT_STATE, 25: REJECT_STATE, R: "q5" },
  "q30+10": { 5: REJECT_STATE, 10: REJECT_STATE, 25: REJECT_STATE, R: "q10" },
  "q30+15": { 5: REJECT_STATE, 10: REJECT_STATE, 25: REJECT_STATE, R: "q15" },
  "q30+20": { 5: REJECT_STATE, 10: REJECT_STATE, 25: REJECT_STATE, R: "q20" },
  [REJECT_STATE]: { 5: REJECT_STATE, 10: REJECT_STATE, 25: REJECT_STATE, R: REJECT_STATE },
};

test("declares finite balance states, inputs, price, and initial state", () => {
  assert.deepEqual(COINS, [5, 10, 25]);
  assert.equal(COLLECT_INPUT, "R");
  assert.deepEqual(INPUT_SYMBOLS, [5, 10, 25, "R"]);
  assert.equal(PRICE_CENTS, 30);
  assert.equal(MAX_BALANCE_CENTS, 50);
  assert.equal(INITIAL_STATE, "q0");
  assert.deepEqual(CREDIT_STATES, [
    "q0", "q5", "q10", "q15", "q20", "q25",
    "q30+", "q30+5", "q30+10", "q30+15", "q30+20",
  ]);
  assert.deepEqual(STATES, [...CREDIT_STATES, REJECT_STATE]);
});

test("starts with zero credit, no pending product, and empty history", () => {
  const machine = createInitialMachine();

  assert.equal(machine.state, "q0");
  assert.equal(machine.credit, 0);
  assert.equal(machine.productReady, false);
  assert.equal(machine.productsCollected, 0);
  assert.deepEqual(machine.input, []);
  assert.deepEqual(machine.history, []);
});

test("defines a deterministic total transition for every state and input", () => {
  for (const state of STATES) {
    for (const input of INPUT_SYMBOLS) {
      const result = evaluateTransition(state, input);

      assert.ok(STATES.includes(result.nextState), `${state} + ${input} produced an unknown state`);
      assert.equal(transition(state, input), result.nextState);
    }
  }
});

test("matches every transition, including blocked coins and the reject state", () => {
  for (const state of STATES) {
    for (const input of INPUT_SYMBOLS) {
      assert.equal(
        transition(state, input),
        EXPECTED_TRANSITIONS[state][input],
        `${state} + ${input}`,
      );
    }
  }
});

test("three 10-cent coins reach q30+ and product removal returns to q0", () => {
  const ready = runSequence([10, 10, 10]);

  assert.equal(ready.state, "q30+");
  assert.equal(ready.credit, 30);
  assert.equal(ready.productReady, true);
  assert.equal(ready.productsCollected, 0);

  const collected = collectProduct(ready);
  assert.equal(collected.state, "q0");
  assert.equal(collected.credit, 0);
  assert.equal(collected.productReady, false);
  assert.equal(collected.productsCollected, 1);
});

test("25 plus 10 reaches q30+5, then withdrawal preserves q5", () => {
  const ready = runSequence([25, 10]);
  const collected = collectProduct(ready);

  assert.equal(ready.state, "q30+5");
  assert.equal(ready.credit, 35);
  assert.equal(ready.productReady, true);
  assert.equal(collected.state, "q5");
  assert.equal(collected.credit, 5);
  assert.equal(collected.productsCollected, 1);
});

test("two 25-cent coins reach q30+20, then withdrawal preserves q20", () => {
  const ready = runSequence([25, 25]);
  const collected = collectProduct(ready);

  assert.equal(ready.state, "q30+20");
  assert.equal(ready.credit, 50);
  assert.equal(ready.productReady, true);
  assert.equal(collected.state, "q20");
  assert.equal(collected.credit, 20);
  assert.equal(collected.productsCollected, 1);
});

test("credit cannot exceed 50 because coin inputs stop at product readiness", () => {
  assert.equal(MAX_BALANCE_CENTS, 50);
  assert.equal(transition("q25", 25), "q30+20");
  assert.equal(transition("q30+20", 5), REJECT_STATE);
  assert.throws(() => applyCoin(runSequence([25, 25]), 10), /retire o produto/i);
});

test("residual credit can start another purchase after withdrawal", () => {
  const result = runSequence([25, 25, "R", 10, "R"]);

  assert.equal(result.state, "q0");
  assert.equal(result.credit, 0);
  assert.equal(result.productReady, false);
  assert.equal(result.productsCollected, 2);
});

test("records coin and withdrawal transitions separately", () => {
  const machine = runSequence([25, 25]);
  const collected = collectProduct(machine);

  assert.deepEqual(collected.input, [25, 25, "R"]);
  assert.deepEqual(collected.history.at(-1), {
    input: "R",
    action: "collect-product",
    from: "q30+20",
    to: "q20",
    creditBefore: 50,
    credit: 20,
    productReady: false,
  });
});

test("rejects collection before the product is ready and invalid coins", () => {
  assert.throws(() => collectProduct(createInitialMachine()), /produto ainda não está disponível/i);
  assert.throws(() => transition("q0", 1), /entrada inválida/i);
  assert.throws(() => applyCoin(createInitialMachine(), 50), /moeda inválida/i);
  assert.equal(transition("q0", "R"), REJECT_STATE);
});

test("keeps the JFLAP AFD equivalent to every code transition", () => {
  const jff = readFileSync(new URL("../vending-machine.jff", import.meta.url), "utf8");
  const statesById = new Map(
    [...jff.matchAll(/<state id="(\d+)" name="([^"]+)">/g)].map((match) => [match[1], match[2]]),
  );
  const transitions = [
    ...jff.matchAll(/<transition>\s*<from>(\d+)<\/from>\s*<to>(\d+)<\/to>\s*<read>([^<]+)<\/read>\s*<\/transition>/g),
  ];

  assert.equal(statesById.size, STATES.length);
  assert.deepEqual([...statesById.values()].sort(), [...STATES].sort());
  assert.match(jff, /<type>fa<\/type>/);
  assert.equal(transitions.length, STATES.length * INPUT_SYMBOLS.length);

  const stateBlocks = [...jff.matchAll(/<state id="(\d+)" name="([^"]+)">([\s\S]*?)<\/state>/g)];
  assert.deepEqual(
    stateBlocks.filter(([, , , block]) => block.includes("<initial/>" )).map(([, , name]) => name),
    [INITIAL_STATE],
  );
  assert.deepEqual(
    stateBlocks.filter(([, , , block]) => block.includes("<final/>" )).map(([, , name]) => name).sort(),
    CREDIT_STATES.filter((state) => creditForState(state) >= PRICE_CENTS).sort(),
  );

  const pairKeys = transitions.map(([, fromId, , input]) => `${fromId}:${input}`);
  assert.equal(new Set(pairKeys).size, pairKeys.length);

  for (const [, fromId, toId, input] of transitions) {
    const from = statesById.get(fromId);

    assert.equal(transition(from, input === "R" ? input : Number(input)), statesById.get(toId));
  }
});
