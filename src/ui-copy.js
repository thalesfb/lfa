export const getStatusCopy = ({ inputLength, accepted, wordClosed, finishAttempted = false, missingLabel }) => {
  if (wordClosed) {
    return accepted
      ? {
          pillStatus: "accepted",
          pillLabel: "Palavra aceita",
          screenNote: "Palavra encerrada em estado final: condição de aceitação satisfeita.",
          deliveryMessage: "Produto liberado — retire aqui",
        }
      : {
          pillStatus: "rejected",
          pillLabel: "Palavra rejeitada",
          screenNote: "Palavra encerrada sem alcançar um estado final.",
          deliveryMessage: "Crédito insuficiente",
        };
  }

  if (inputLength === 0) {
    return {
      pillStatus: "waiting",
      pillLabel: "Aguardando moedas",
      screenNote: "Insira uma moeda para iniciar a palavra.",
      deliveryMessage: "Aguardando crédito",
    };
  }

  if (finishAttempted && !accepted) {
    return {
      pillStatus: "rejected",
      pillLabel: "Saldo insuficiente",
      screenNote: "Tentativa rejeitada: saldo insuficiente. Insira mais moedas para continuar.",
      deliveryMessage: "Saldo insuficiente — insira mais moedas",
    };
  }

  if (accepted) {
    return {
      pillStatus: "accepted",
      pillLabel: "Crédito suficiente",
      screenNote: "Estado final alcançado. Conclua a compra ou observe os laços absorventes.",
      deliveryMessage: "Crédito suficiente — conclua a compra",
    };
  }

  return {
    pillStatus: "waiting",
    pillLabel: "Processando entrada",
    screenNote: `Prefixo em processamento. Faltam ${missingLabel} para alcançar q30+.`,
    deliveryMessage: "Aguardando crédito",
  };
};
