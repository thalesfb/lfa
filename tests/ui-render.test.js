import assert from "node:assert/strict";
import test from "node:test";
import { formatCurrency } from "../src/ui-render.js";

test("formata valores internos em centavos como moeda brasileira", () => {
  assert.equal(formatCurrency(0), "R$ 0,00");
  assert.equal(formatCurrency(5), "R$ 0,05");
  assert.equal(formatCurrency(30), "R$ 0,30");
});
