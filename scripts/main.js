import { initializeToastUI } from "./ui/toastUI.js";
import { initializeModuleUI } from "./ui/moduleUI.js";
import { initializePaletteUI } from "./ui/paletteUI.js";
import { initializeContrastUI } from "./ui/contrastUI.js";
import { initializeSavedUI } from "./ui/savedPaletteUI.js";
import { initializeState } from "./core/state.js";

/* =========================================================
   Application Initialization
   ========================================================= */

function initializeApp() {
  console.info("Color Studio: starting initialization");

  initializeState()
  console.info("✓ State initialized");

  initializeToastUI();
  console.info("✓ Toast UI initialized");

  initializeModuleUI();
  console.info("✓ Module UI initialized");

  initializePaletteUI();
  console.info("✓ Palette UI initialized");

  initializeContrastUI();
  console.info("✓ Contrast UI initialized");

  initializeSavedUI();
  console.info("✓ Saved palettes UI initialized");

  console.info("Color Studio initialized successfully.");
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
