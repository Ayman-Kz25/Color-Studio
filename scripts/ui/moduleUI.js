import { setActiveModule, getUIState } from "../core/state.js";

let elements = {};

/* Initialization */
export function initializeModuleUI() {
  cacheElements();

  bindEvents();

  initializeActiveModule();
}

/* DOM Cache */
function cacheElements() {
  elements = {
    moduleButtons: document.querySelectorAll("[data-module]"),

    modules: document.querySelectorAll("[data-module-content]"),
  };
}

/* Event Binding */
function bindEvents() {
  elements.moduleButtons.forEach((button) => {
    button.addEventListener("click", handleModuleClick);
  });
}

/* Module Click */
function handleModuleClick(event) {
  const button = event.currentTarget;

  const moduleName = button.dataset.module;

  if (!moduleName) {
    return;
  }

  switchModule(moduleName);
}

/* Switch Module */
export function switchModule(moduleName) {
  if (!moduleName) {
    return;
  }

  setActiveModule(moduleName);

  updateModuleButtons(moduleName);

  updateModuleContent(moduleName);

  dispatchModuleChangeEvent(moduleName);
}

/* Module Buttons */
function updateModuleButtons(activeModule) {
  elements.moduleButtons.forEach((button) => {
    const isActive = button.dataset.module === activeModule;

    button.classList.toggle("active", isActive);

    button.setAttribute("aria-selected", String(isActive));

    if (isActive) {
      button.setAttribute("tabindex", "0");
    } else {
      button.setAttribute("tabindex", "-1");
    }
  });
}

/* Module Content */
function updateModuleContent(activeModule) {
  elements.modules.forEach((module) => {
    const moduleName = module.dataset.moduleContent;

    const isActive = moduleName === activeModule;

    module.classList.toggle("active", isActive);

    module.classList.toggle("d-none", !isActive);

    module.setAttribute("aria-hidden", String(!isActive));
  });
}

/* Initial Module */
function initializeActiveModule() {
  const uiState = getUIState();

  const activeModule = uiState.activeModule || "palette";

  updateModuleButtons(activeModule);

  updateModuleContent(activeModule);
}

/* Custom Module Event */
function dispatchModuleChangeEvent(moduleName) {
  document.dispatchEvent(
    new CustomEvent("colorstudio:modulechange", {
      detail: {
        module: moduleName,
      },
    }),
  );
}

/* Public Helpers */
export function getActiveModule() {
  const uiState = getUIState();

  return uiState.activeModule;
}

export function showModule(moduleName) {
  switchModule(moduleName);
}
