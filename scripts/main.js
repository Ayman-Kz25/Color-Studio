import { initializeState } from "./core/state.js";

import { initializeToastUI } from "./ui/toastUI.js";
import { initializeModuleUI } from "./ui/moduleUI.js";
import { initializePaletteUI } from "./ui/paletteUI.js";
import { initializeContrastUI } from "./ui/contrastUI.js";
import { initializeSavedUI } from "./ui/savedPaletteUI.js";

/* =========================================================
   Application Initialization
   ========================================================= */

function initializeApp() {
  try {
    initializeState();

    /*
     * Toast must be initialized before the
     * other UI modules.
     */
    initializeToastUI();

    initializeModuleUI();

    initializePaletteUI();

    initializeContrastUI();

    initializeSavedUI();

    console.info("Color Studio initialized successfully.");
  } catch (error) {
    console.error("Color Studio failed to initialize:", error);
  }
}

/* =========================================================
   DOM Ready
   ========================================================= */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp, {
    once: true,
  });
} else {
  initializeApp();
}
