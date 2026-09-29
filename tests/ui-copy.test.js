import assert from "node:assert/strict";
import test from "node:test";
import { getStatusCopy } from "../src/ui-copy.js";

test("a máquina começa aguardando moedas", () => {
  assert.deepEqual(
    getStatusCopy({
      inputLength: 0,
      state: "q0",
      credit: 0,
      creditLabel: "R$ 0,00",
      missingLabel: "R$ 0,30",
      afterProductLabel: "R$ 0,00",
      productReady: false,
      lastEvent: null,
    }),
    {
      pillStatus: "waiting",
      pillLabel: "Aguardando moedas",
      screenNote: "Insira uma moeda para iniciar a compra.",
      deliveryMessage: "Aguardando crédito",
    },
  );
});

test("q30+ mostra produto disponível e saldo que ficará após a retirada", () => {
  assert.deepEqual(
    getStatusCopy({
      inputLength: 3,
      state: "q30+",
      credit: 30,
      creditLabel: "R$ 0,30",
      missingLabel: "R$ 0,00",
      afterProductLabel: "R$ 0,00",
      productReady: true,
      lastEvent: { action: "insert-coin" },
    }),
    {
      pillStatus: "vend",
      pillLabel: "Produto disponível",
      screenNote: "R$ 0,30 acumulados. Ao retirar, restarão R$ 0,00.",
      deliveryMessage: "Retire o produto; R$ 0,30 serão descontados.",
    },
  );
});

test("q30+20 informa que retirar o produto deixa R$ 0,20", () => {
  const copy = getStatusCopy({
    inputLength: 2,
    state: "q30+20",
    credit: 50,
    creditLabel: "R$ 0,50",
    missingLabel: "R$ 0,00",
    afterProductLabel: "R$ 0,20",
    productReady: true,
    lastEvent: { action: "insert-coin" },
  });

  assert.equal(copy.screenNote, "R$ 0,50 acumulados. Ao retirar, restarão R$ 0,20.");
  assert.equal(copy.deliveryMessage, "Retire o produto; R$ 0,30 serão descontados.");
});

test("após retirar, mostra o saldo residual para a próxima compra", () => {
  assert.deepEqual(
    getStatusCopy({
      inputLength: 3,
      state: "q20",
      credit: 20,
      creditLabel: "R$ 0,20",
      missingLabel: "R$ 0,10",
      afterProductLabel: "R$ 0,00",
      productReady: false,
      lastEvent: { action: "collect-product" },
    }),
    {
      pillStatus: "waiting",
      pillLabel: "Crédito restante",
      screenNote: "R$ 0,20 continuam disponíveis no estado q20 para a próxima compra.",
      deliveryMessage: "Produto retirado. R$ 0,20 seguem como crédito.",
    },
  );
});

test("informa quanto falta enquanto o crédito está abaixo de 30 centavos", () => {
  const copy = getStatusCopy({
    inputLength: 2,
    state: "q15",
    credit: 15,
    creditLabel: "R$ 0,15",
    missingLabel: "R$ 0,15",
    afterProductLabel: "R$ 0,00",
    productReady: false,
    lastEvent: { action: "insert-coin" },
  });

  assert.equal(copy.pillLabel, "Acumulando crédito");
  assert.equal(copy.screenNote, "R$ 0,15 acumulados. Faltam R$ 0,15 para liberar um produto.");
  assert.equal(copy.deliveryMessage, "Faltam R$ 0,15 para o produto.");
});
