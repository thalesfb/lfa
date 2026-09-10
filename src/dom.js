const getRoot = (root) => root ?? document;

const requiredElement = (root, selector) => {
  const element = root.querySelector(selector);

  if (!element) {
    throw new Error(`Elemento obrigatório não encontrado: ${selector}`);
  }

  return element;
};

export const getElements = (root) => {
  const scope = getRoot(root);

  return Object.freeze({
    machineStatus: requiredElement(scope, "#machine-status"),
    statusText: requiredElement(scope, "#status-text"),
    currentState: requiredElement(scope, "#current-state"),
    stateDescription: requiredElement(scope, "#state-description"),
    creditValue: requiredElement(scope, "#credit-value"),
    progressBar: requiredElement(scope, "#progress-bar"),
    screenNote: requiredElement(scope, "#screen-note"),
    vendingMachine: requiredElement(scope, "#purchase-panel"),
    deliveryMessage: requiredElement(scope, "#delivery-message"),
    collectButton: requiredElement(scope, "#collect-button"),
    inputTape: requiredElement(scope, "#input-tape"),
    historyBody: requiredElement(scope, "#history-body"),
    transitionBody: requiredElement(scope, "#transition-body"),
    diagram: requiredElement(scope, "#automaton-diagram"),
    mobileTransitionBody: requiredElement(scope, "#mobile-transition-body"),
    diagramCallout: requiredElement(scope, "#diagram-callout"),
    transitionAnnouncement: requiredElement(scope, "#transition-announcement"),
    coinButtons: [...scope.querySelectorAll("[data-coin]")],
    finishButton: requiredElement(scope, "#finish-button"),
    resetButton: requiredElement(scope, "#reset-button"),
  });
};
