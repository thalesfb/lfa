import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  COINS,
  FINAL_STATE,
  INITIAL_STATE,
  PRICE_CENTS,
  STATES,
  applyCoin,
  createInitialMachine,
  isFinalState,
  runSequence,
  transition,
} from "../src/automaton.js";

test("declares the assignment contract", () => {
  assert.deepEqual(COINS, [5, 10, 25]);
  assert.equal(PRICE_CENTS, 30);
  assert.equal(INITIAL_STATE, "q0");
  assert.equal(FINAL_STATE, "q30+");
});

test("starts at q0 without accepting", () => {
  const machine = createInitialMachine();

  assert.equal(machine.state, "q0");
  assert.equal(machine.credit, 0);
  assert.equal(machine.accepted, false);
  assert.deepEqual(machine.input, []);
});

test("moves to the exact amount states while credit is below 30", () => {
  assert.equal(transition("q0", 5), "q5");
  assert.equal(transition("q0", 10), "q10");
  assert.equal(transition("q0", 25), "q25");
  assert.equal(transition("q5", 10), "q15");
  assert.equal(transition("q15", 5), "q20");
  assert.equal(transition("q20", 5), "q25");
});

test("defines one valid deterministic transition for every state and coin", () => {
  for (const state of STATES) {
    for (const coin of COINS) {
      const nextState = transition(state, coin);

      assert.ok(STATES.includes(nextState), `${state} + ${coin} produced an unknown state`);
    }
  }
});

test("enters the final state as soon as the accumulated credit reaches 30", () => {
  assert.equal(transition("q5", 25), FINAL_STATE);
  assert.equal(transition("q10", 25), FINAL_STATE);
  assert.equal(transition("q20", 10), FINAL_STATE);
  assert.equal(transition("q25", 5), FINAL_STATE);
  assert.equal(transition("q25", 25), FINAL_STATE);
});

test("accepts exact-price sequences", () => {
  for (const sequence of [[5, 25], [25, 5], [10, 10, 10], [5, 5, 10, 10]]) {
    const result = runSequence(sequence);

    assert.equal(result.accepted, true, sequence.join(" + "));
    assert.equal(result.state, FINAL_STATE, sequence.join(" + "));
    assert.equal(result.credit, 30, sequence.join(" + "));
  }
});

test("accepts sequences that exceed the price", () => {
  const result = runSequence([25, 25]);

  assert.equal(result.accepted, true);
  assert.equal(result.state, FINAL_STATE);
  assert.equal(result.credit, 50);
});

test("rejects sequences whose accumulated value is below 30", () => {
  for (const sequence of [[], [5], [10], [25], [5, 10], [10, 10], [5, 5, 5, 5]]) {
    const result = runSequence(sequence);

    assert.equal(result.accepted, false, sequence.join(" + ") || "empty sequence");
    assert.notEqual(result.state, FINAL_STATE, sequence.join(" + ") || "empty sequence");
  }
});

test("keeps the accepting state after another valid input", () => {
  assert.equal(transition(FINAL_STATE, 5), FINAL_STATE);
  assert.equal(transition(FINAL_STATE, 10), FINAL_STATE);
  assert.equal(transition(FINAL_STATE, 25), FINAL_STATE);
});

test("records each applied transition", () => {
  const first = createInitialMachine();
  const second = applyCoin(first, 10);
  const third = applyCoin(second, 25);

  assert.deepEqual(third.input, [10, 25]);
  assert.deepEqual(third.history, [
    { coin: 10, from: "q0", to: "q10", credit: 10 },
    { coin: 25, from: "q10", to: FINAL_STATE, credit: 35 },
  ]);
});

test("rejects unknown states and invalid coins", () => {
  assert.throws(() => transition("q99", 5), /Estado inválido/);
  assert.throws(() => transition("q0", 1), /Moeda inválida/);
  assert.throws(() => applyCoin(createInitialMachine(), 50), /Moeda inválida/);
});

test("identifies the accepting state", () => {
  assert.equal(isFinalState(FINAL_STATE), true);
  assert.equal(isFinalState("q25"), false);
});

test("keeps the JFLAP artifact equivalent to the JavaScript transition function", () => {
  const jff = readFileSync(new URL("../vending-machine.jff", import.meta.url), "utf8");
  const statesById = new Map(
    [...jff.matchAll(/<state id="(\d+)" name="([^"]+)">/g)].map((match) => [match[1], match[2]]),
  );
  const transitions = [
    ...jff.matchAll(/<transition>\s*<from>(\d+)<\/from>\s*<to>(\d+)<\/to>\s*<read>(5|10|25)<\/read>\s*<\/transition>/g),
  ];

  assert.equal(statesById.size, STATES.length);
  assert.equal(transitions.length, STATES.length * COINS.length);
  assert.match(jff, /<initial\/>/);
  assert.match(jff, /<final\/>/);

  for (const [, fromId, toId, coin] of transitions) {
    const from = statesById.get(fromId);
    const to = statesById.get(toId);

    assert.equal(transition(from, Number(coin)), to, `${from} + ${coin}`);
  }
});
