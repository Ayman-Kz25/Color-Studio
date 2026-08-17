// scripts/ui/moduleUI.js

import {
  getUIState,
  setActiveModule,
} from "../core/state.js";

import {
  paletteGenerator,
  contrastChecker,
  savedPalettesButton,
} from "./dom.js";

/* =========================================================
   Modules
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

export function initializeModuleUI() {
  bindEvents();

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

function handleSavedPalettesClick() {
  switchModule(MODULES.SAVED);
}

/* =========================================================
   Initial Module
   ========================================================= */

function initializeActiveModule() {
  const uiState = getUIState();

  const activeModule = isSupportedModule(
    uiState?.activeModule,
  )
    ? uiState.activeModule
    : MODULES.PALETTE;

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

  setActiveModule(moduleName);

  updateMainSections(moduleName);

  updateSavedPalettesButton(moduleName);

  if (dispatchEvent) {
    dispatchModuleChangeEvent(moduleName);
  }

  return true;
}

/* =========================================================
   Main Sections
   ========================================================= */

function updateMainSections(activeModule) {
  /*
   * Palette and Contrast are both part of the main page.
   * They remain visible regardless of the active logical
   * module.
   *
   * Saved Palettes is displayed through Bootstrap's
   * offcanvas component.
   */

  showSection(paletteGenerator);
  showSection(contrastChecker);

  /*
   * Keep the active module reflected in the DOM so other
   * UI code can determine which module is currently active.
   */

  if (paletteGenerator) {
    const isPaletteActive =
      activeModule === MODULES.PALETTE;

    paletteGenerator.classList.toggle(
      "active",
      isPaletteActive,
    );

    paletteGenerator.setAttribute(
      "aria-hidden",
      String(!isPaletteActive),
    );
  }

  if (contrastChecker) {
    const isContrastActive =
      activeModule === MODULES.CONTRAST;

    contrastChecker.classList.toggle(
      "active",
      isContrastActive,
    );

    contrastChecker.setAttribute(
      "aria-hidden",
      String(!isContrastActive),
    );
  }
}

/* =========================================================
   Show Section
   ========================================================= */

function showSection(section) {
  if (!section) {
    return;
  }

  section.classList.remove("d-none");
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

  savedPalettesButton.setAttribute(
    "aria-current",
    isActive ? "page" : "false",
  );
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
  return getUIState().activeModule;
}

export function showModule(moduleName) {
  return switchModule(moduleName);
}