import assert from "node:assert/strict";
import test from "node:test";
import { COINS, STATES, transition } from "../src/automaton.js";
import { groupTransitions } from "../src/diagram.js";

test("agrupa transições que compartilham a mesma origem e destino", () => {
  const groups = groupTransitions(STATES, COINS, transition);
  const finalLoop = groups.find(({ from, to }) => from === "q30+" && to === "q30+");
  const q20Final = groups.find(({ from, to }) => from === "q20" && to === "q30+");

  assert.deepEqual(finalLoop.coins, [5, 10, 25]);
  assert.deepEqual(q20Final.coins, [10, 25]);
  assert.equal(groups.filter(({ from }) => from === "q0").length, 3);
});
