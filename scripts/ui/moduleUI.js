// scripts/ui/moduleUI.js

import {
  paletteGenerator,
  contrastChecker,
  savedPalettesButton,
} from "./dom.js";

import {
  getUIState,
  setActiveModule,
} from "../core/state.js";


/* =========================================================
   Module Constants
   ========================================================= */

const MODULES = Object.freeze({
  PALETTE: "palette",
  CONTRAST: "contrast",
  SAVED: "saved",
});

const SUPPORTED_MODULES = Object.freeze(
  Object.values(MODULES),
);


/* =========================================================
   Initialization
   ========================================================= */

let eventsBound = false;

export function initializeModuleUI() {
  if (!eventsBound) {
    bindEvents();
    eventsBound = true;
  }

  initializeActiveModule();
}


/* =========================================================
   Event Binding
   ========================================================= */

function bindEvents() {
  savedPalettesButton?.addEventListener(
    "click",
    handleSavedPalettesClick,
  );
}


/* =========================================================
   Saved Palettes
   ========================================================= */

function handleSavedPalettesClick(event) {
  /*
   * Prevent default navigation when the control
   * is implemented as an <a> element.
   */
  event?.preventDefault();

  switchModule(MODULES.SAVED);
}


/* =========================================================
   Initial Module
   ========================================================= */

function initializeActiveModule() {
  const uiState = getUIState();

  const requestedModule =
    uiState?.activeModule;

  const activeModule =
    isSupportedModule(requestedModule)
      ? requestedModule
      : MODULES.PALETTE;

  /*
   * Keep state synchronized when the stored
   * module is invalid.
   */
  if (requestedModule !== activeModule) {
    setActiveModule(activeModule);
  }

  switchModule(
    activeModule,
    false,
  );
}


/* =========================================================
   Switch Module
   ========================================================= */

export function switchModule(
  moduleName,
  dispatchEvent = true,
) {
  if (!isSupportedModule(moduleName)) {
    return false;
  }

  const previousModule =
    getUIState()?.activeModule;

  /*
   * Keep application state as the source
   * of truth.
   */
  setActiveModule(moduleName);

  updateMainSections(moduleName);
  updateSavedPalettesButton(moduleName);

  /*
   * Avoid unnecessary module-change events
   * when the module hasn't actually changed.
   */
  if (
    dispatchEvent &&
    previousModule !== moduleName
  ) {
    dispatchModuleChangeEvent(moduleName);
  }

  return true;
}


/* =========================================================
   Main Sections
   ========================================================= */

function updateMainSections(activeModule) {
  updateSection(
    paletteGenerator,
    activeModule === MODULES.PALETTE,
  );

  updateSection(
    contrastChecker,
    activeModule === MODULES.CONTRAST,
  );
}


/* =========================================================
   Update Section
   ========================================================= */

function updateSection(
  section,
  isActive,
) {
  if (!section) {
    return;
  }

  /*
   * The active class controls visual state.
   */
  section.classList.toggle(
    "active",
    isActive,
  );

  /*
   * Keep Bootstrap-style d-none synchronized
   * with the actual module state.
   */
  section.classList.toggle(
    "d-none",
    !isActive,
  );

  /*
   * aria-hidden communicates the same state
   * to assistive technologies.
   */
  section.setAttribute(
    "aria-hidden",
    String(!isActive),
  );
}


/* =========================================================
   Saved Palettes Button
   ========================================================= */

function updateSavedPalettesButton(
  activeModule,
) {
  if (!savedPalettesButton) {
    return;
  }

  const isActive =
    activeModule === MODULES.SAVED;

  savedPalettesButton.classList.toggle(
    "active",
    isActive,
  );

  if (isActive) {
    savedPalettesButton.setAttribute(
      "aria-current",
      "page",
    );
  } else {
    savedPalettesButton.removeAttribute(
      "aria-current",
    );
  }
}


/* =========================================================
   Module Validation
   ========================================================= */

function isSupportedModule(moduleName) {
  return (
    typeof moduleName === "string" &&
    SUPPORTED_MODULES.includes(moduleName)
  );
}


/* =========================================================
   Custom Module Event
   ========================================================= */

function dispatchModuleChangeEvent(
  moduleName,
) {
  document.dispatchEvent(
    new CustomEvent(
      "colorstudio:modulechange",
      {
        detail: {
          module: moduleName,
        },
      },
    ),
  );
}


/* =========================================================
   Public Helpers
   ========================================================= */

export function getActiveModule() {
  return (
    getUIState()?.activeModule ||
    MODULES.PALETTE
  );
}

export function showModule(moduleName) {
  return switchModule(moduleName);
}


/* =========================================================
   Public Module Constants
   ========================================================= */

export { MODULES };
