import assert from "node:assert/strict";
import test from "node:test";
import { CREDIT_STATES } from "../src/automaton.js";
import { renderDiagram } from "../src/diagram.js";

test("mostra saldos antes e depois da faixa de produto disponível", () => {
  const element = { innerHTML: "" };

  renderDiagram({
    element,
    machine: { state: "q20", credit: 20 },
    lastEvent: {
      action: "collect-product",
      from: "q30+20",
      to: "q20",
      credit: 20,
    },
  });

  for (const state of CREDIT_STATES) {
    assert.ok(element.innerHTML.includes(`>${state}<`), `estado ausente: ${state}`);
  }
  assert.match(element.innerHTML, /ready-state-band/);
  assert.equal((element.innerHTML.match(/class="last-transition"/g) ?? []).length, 1);
  assert.match(element.innerHTML, /retirar \/ −30¢/);
  assert.match(element.innerHTML, /Retirada: q30\+20 para q20/);
});

test("explica faixa q30+ e limite de 50 centavos no estado inicial", () => {
  const element = { innerHTML: "" };

  renderDiagram({ element, machine: { state: "q0", credit: 0 }, lastEvent: null });

  assert.match(element.innerHTML, /produto disponível nos estados q30\+ a q30\+20/i);
  assert.match(element.innerHTML, /Saldo máximo antes da retirada: 50 centavos/);
  assert.match(element.innerHTML, /escala de saldos.*moedas de 5, 10 e 25 centavos saltam diretamente/i);
  assert.doesNotMatch(element.innerHTML, /class="credit-scale"/);
  assert.doesNotMatch(element.innerHTML, /class="last-transition"/);
});

test("mostra uma moeda de 25 centavos como salto direto entre estados", () => {
  const element = { innerHTML: "" };

  renderDiagram({
    element,
    machine: { state: "q30+20", credit: 50 },
    lastEvent: {
      action: "insert-coin",
      coin: 25,
      from: "q25",
      to: "q30+20",
      credit: 50,
    },
  });

  assert.match(element.innerHTML, /Moeda de 25 centavos: q25 para q30\+20/);
  assert.match(element.innerHTML, />25¢<\/text>/);
});
