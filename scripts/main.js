import { initializeState } from "./core/state.js";
import { initializeContrastUI } from "./ui/contrastUI.js";
import { initializeModuleUI } from "./ui/moduleUI.js";
import { initializePaletteUI } from "./ui/paletteUI.js";

function initializeApp() {
  try {
    initializeState();

    initializeModuleUI();

    initializePaletteUI();

    initializeContrastUI();

    /*
     * Initialize saved palettes UI.
     */
    // initializeSavedPalettesUI();

    console.info("Color Studio initialized successfully.");
  } catch (error) {
    console.error("Color Studio failed to initialize: ", error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
