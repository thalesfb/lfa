import assert from "node:assert/strict";
import test from "node:test";
import { getStatusCopy } from "../src/ui-copy.js";

test("a máquina começa aguardando a primeira moeda", () => {
  assert.deepEqual(
    getStatusCopy({ inputLength: 0, accepted: false, wordClosed: false, missingLabel: "R$ 0,30" }),
    {
      pillStatus: "waiting",
      pillLabel: "Aguardando moedas",
      screenNote: "Insira uma moeda para iniciar a palavra.",
      deliveryMessage: "Aguardando crédito",
    },
  );
});

test("crédito suficiente comunica que a compra pode ser concluída", () => {
  assert.deepEqual(
    getStatusCopy({ inputLength: 2, accepted: true, wordClosed: false, missingLabel: "R$ 0,00" }),
    {
      pillStatus: "accepted",
      pillLabel: "Crédito suficiente",
      screenNote: "Estado final alcançado. Conclua a compra ou observe os laços absorventes.",
      deliveryMessage: "Crédito suficiente — conclua a compra",
    },
  );
});

test("saldo insuficiente mantém a máquina disponível para novas moedas", () => {
  assert.deepEqual(
    getStatusCopy({ inputLength: 2, accepted: false, wordClosed: false, finishAttempted: true, missingLabel: "R$ 0,15" }),
    {
      pillStatus: "rejected",
      pillLabel: "Saldo insuficiente",
      screenNote: "Saldo insuficiente. Insira mais moedas para continuar.",
      deliveryMessage: "Saldo insuficiente — insira mais moedas",
    },
  );
});
