import { getUIState, setActiveModule } from "../core/state.js";

const MODULES = Object.freeze({
  PALETTE: "palette",
  CONTRAST: "contrast",
  SAVED: "saved",
});

const SUPPORTED_MODULES = Object.freeze(Object.values(MODULES));

/* =========================================================
   DOM Elements
   ========================================================= */

let elements = {
  paletteSection: null,
  contrastSection: null,
  savedPalettesButton: null,
};

/* =========================================================
   Initialization
   ========================================================= */

export function initializeModuleUI() {
  cacheElements();

  bindEvents();

  initializeActiveModule();
}

/* =========================================================
   DOM Cache
   ========================================================= */

function cacheElements() {
  elements = {
    paletteSection: document.getElementById("paletteGenerator"),

    contrastSection: document.getElementById("contrastChecker"),

    savedPalettesButton: document.getElementById("savedPalettesButton"),
  };
}

/* =========================================================
   Event Binding
   ========================================================= */

function bindEvents() {
  elements.savedPalettesButton?.addEventListener(
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

  const activeModule = isSupportedModule(uiState.activeModule)
    ? uiState.activeModule
    : MODULES.PALETTE;

  switchModule(activeModule, false);
}

/* =========================================================
   Switch Module
   ========================================================= */

export function switchModule(moduleName, dispatchEvent = true) {
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
   * Palette and Contrast are part of the main page layout.
   * They remain visible regardless of the active logical module.
   *
   * Saved Palettes is displayed through Bootstrap offcanvas.
   */

  showSection(elements.paletteSection);
  showSection(elements.contrastSection);

  /*
   * The active module is still reflected through aria state.
   * This allows other UI code to react to the selected module
   * without hiding the main sections.
   */

  if (elements.paletteSection) {
    const isPaletteActive = activeModule === MODULES.PALETTE;

    elements.paletteSection.classList.toggle(
      "active",
      isPaletteActive,
    );

    elements.paletteSection.setAttribute(
      "aria-hidden",
      String(!isPaletteActive),
    );
  }

  if (elements.contrastSection) {
    const isContrastActive = activeModule === MODULES.CONTRAST;

    elements.contrastSection.classList.toggle(
      "active",
      isContrastActive,
    );

    elements.contrastSection.setAttribute(
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

function updateSavedPalettesButton(activeModule) {
  const button = elements.savedPalettesButton;

  if (!button) {
    return;
  }

  const isActive = activeModule === MODULES.SAVED;

  button.classList.toggle("active", isActive);

  button.setAttribute("aria-current", isActive ? "page" : "false");
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

function dispatchModuleChangeEvent(moduleName) {
  document.dispatchEvent(
    new CustomEvent("colorstudio:modulechange", {
      detail: {
        module: moduleName,
      },
    }),
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