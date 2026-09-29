export const getStatusCopy = ({
  inputLength,
  state,
  credit,
  creditLabel,
  missingLabel,
  afterProductLabel,
  productReady,
  lastEvent,
}) => {
  if (productReady) {
    return {
      pillStatus: "vend",
      pillLabel: "Produto disponível",
      screenNote: `${creditLabel} acumulados. Ao retirar, restarão ${afterProductLabel}.`,
      deliveryMessage: "Retire o produto; R$ 0,30 serão descontados.",
    };
  }

  if (lastEvent?.action === "collect-product") {
    return {
      pillStatus: "waiting",
      pillLabel: credit > 0 ? "Crédito restante" : "Produto retirado",
      screenNote: credit > 0
        ? `${creditLabel} continuam disponíveis no estado ${state} para a próxima compra.`
        : "Compra encerrada sem crédito restante. Insira moedas para outra compra.",
      deliveryMessage: credit > 0
        ? `Produto retirado. ${creditLabel} seguem como crédito.`
        : "Produto retirado. Nenhum crédito restante.",
    };
  }

  if (inputLength === 0) {
    return {
      pillStatus: "waiting",
      pillLabel: "Aguardando moedas",
      screenNote: "Insira uma moeda para iniciar a compra.",
      deliveryMessage: "Aguardando crédito",
    };
  }

  return {
    pillStatus: "waiting",
    pillLabel: "Acumulando crédito",
    screenNote: `${creditLabel} acumulados. Faltam ${missingLabel} para liberar um produto.`,
    deliveryMessage: `Faltam ${missingLabel} para o produto.`,
  };
};
