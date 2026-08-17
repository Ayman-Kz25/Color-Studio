// scripts/ui/dom.js

/* =========================================================
   Shared DOM Elements
   ========================================================= */

export const app = document.getElementById("app");

export const appHeader =
  document.getElementById("appHeader");

export const brandLink =
  document.getElementById("brandLink");

export const headerNavigation =
  document.getElementById("headerNavigation");

export const savedPalettesButton =
  document.getElementById("savedPalettesButton");

export const savedPalettesCount =
  document.getElementById("savedPalettesCount");

/* =========================================================
   Main Content
   ========================================================= */

export const mainContent =
  document.getElementById("mainContent");

/* =========================================================
   Palette Generator
   ========================================================= */

export const paletteGenerator =
  document.getElementById("paletteGenerator");

export const paletteGeneratorTitle =
  document.getElementById("paletteGeneratorTitle");

export const generatePaletteButton =
  document.getElementById("generatePaletteButton");

export const randomizePaletteButton =
  document.getElementById("randomizePaletteButton");

export const paletteGeneratorControls =
  document.getElementById("paletteGeneratorControls");

export const paletteTypeSelect =
  document.getElementById("paletteTypeSelect");

export const colorCountSelect =
  document.getElementById("colorCountSelect");

export const baseColorInput =
  document.getElementById("baseColorInput");

export const baseColorPicker =
  document.getElementById("baseColorPicker");

export const currentPalette =
  document.getElementById("currentPalette");

export const paletteStatus =
  document.getElementById("paletteStatus");

export const clearPaletteButton =
  document.getElementById("clearPaletteButton");

export const saveCurrentPaletteButton =
  document.getElementById(
    "saveCurrentPaletteButton",
  );

/* =========================================================
   Contrast Checker
   ========================================================= */

export const contrastChecker =
  document.getElementById("contrastChecker");

export const contrastControls =
  document.getElementById("contrastControls");

export const foregroundHexInput =
  document.getElementById("foregroundHexInput");

export const foregroundColorPicker =
  document.getElementById("foregroundColorPicker");

export const backgroundHexInput =
  document.getElementById("backgroundHexInput");

export const backgroundColorPicker =
  document.getElementById("backgroundColorPicker");

export const swapContrastColorsButton =
  document.getElementById(
    "swapContrastColorsButton",
  );

export const contrastPreview =
  document.getElementById("contrastPreview");

export const contrastPreviewLabel =
  document.getElementById("contrastPreviewLabel");

export const contrastPreviewHeading =
  document.getElementById(
    "contrastPreviewHeading",
  );

export const contrastPreviewText =
  document.getElementById("contrastPreviewText");

/* =========================================================
   Contrast Results
   ========================================================= */

export const contrastResults =
  document.getElementById("contrastResults");

export const contrastRatio =
  document.getElementById("contrastRatio");

export const normalTextResult =
  document.getElementById("normalTextResult");

export const normalTextStatus =
  document.getElementById("normalTextStatus");

export const normalTextLevel =
  document.getElementById("normalTextLevel");

export const largeTextResult =
  document.getElementById("largeTextResult");

export const largeTextStatus =
  document.getElementById("largeTextStatus");

export const largeTextLevel =
  document.getElementById("largeTextLevel");

export const uiComponentResult =
  document.getElementById("uiComponentResult");

export const uiComponentStatus =
  document.getElementById("uiComponentStatus");

export const uiComponentLevel =
  document.getElementById("uiComponentLevel");

/* =========================================================
   Footer
   ========================================================= */

export const appFooter =
  document.getElementById("appFooter");

export const currentYear =
  document.getElementById("currentYear");

/* =========================================================
   Saved Palettes
   ========================================================= */

export const savedPalettesOffcanvas =
  document.getElementById(
    "savedPalettesOffcanvas",
  );

export const savedPalettesOffcanvasTitle =
  document.getElementById(
    "savedPalettesOffcanvasTitle",
  );

export const savedPalettesEmptyState =
  document.getElementById(
    "savedPalettesEmptyState",
  );

export const savedPalettesList =
  document.getElementById(
    "savedPalettesList",
  );

/* =========================================================
   Save Palette Modal
   ========================================================= */

export const savePaletteModal =
  document.getElementById("savePaletteModal");

export const savePaletteModalTitle =
  document.getElementById(
    "savePaletteModalTitle",
  );

export const paletteNameInput =
  document.getElementById("paletteNameInput");

export const paletteNameError =
  document.getElementById("paletteNameError");

export const confirmSavePaletteButton =
  document.getElementById(
    "confirmSavePaletteButton",
  );

/* =========================================================
   Toast
   ========================================================= */

export const toastContainer =
  document.getElementById("toastContainer");

export const appToast =
  document.getElementById("appToast");

export const toastIcon =
  document.getElementById("toastIcon");

export const toastTitle =
  document.getElementById("toastTitle");

export const toastMessage =
  document.getElementById("toastMessage");

  export const elements = {
  brandLink: document.getElementById("brandLink"),
  currentYear: document.getElementById("currentYear"),

  generatePaletteButton: document.getElementById(
    "generatePaletteButton",
  ),

  randomizePaletteButton: document.getElementById(
    "randomizePaletteButton",
  ),

  paletteTypeSelect: document.getElementById(
    "paletteTypeSelect",
  ),

  colorCountSelect: document.getElementById(
    "colorCountSelect",
  ),

  baseColorInput: document.getElementById(
    "baseColorInput",
  ),

  baseColorPicker: document.getElementById(
    "baseColorPicker",
  ),

  currentPalette: document.getElementById(
    "currentPalette",
  ),

  paletteStatus: document.getElementById(
    "paletteStatus",
  ),

  clearPaletteButton: document.getElementById(
    "clearPaletteButton",
  ),

  saveCurrentPaletteButton: document.getElementById(
    "saveCurrentPaletteButton",
  ),

  savedPalettesButton: document.getElementById(
    "savedPalettesButton",
  ),

  savedPalettesCount: document.getElementById(
    "savedPalettesCount",
  ),

  savedPalettesOffcanvas: document.getElementById(
    "savedPalettesOffcanvas",
  ),

  savedPalettesEmptyState: document.getElementById(
    "savedPalettesEmptyState",
  ),

  savedPalettesList: document.getElementById(
    "savedPalettesList",
  ),

  savePaletteModal: document.getElementById(
    "savePaletteModal",
  ),

  paletteNameInput: document.getElementById(
    "paletteNameInput",
  ),

  paletteNameError: document.getElementById(
    "paletteNameError",
  ),

  confirmSavePaletteButton: document.getElementById(
    "confirmSavePaletteButton",
  ),

  toastContainer: document.getElementById(
    "toastContainer",
  ),

  appToast: document.getElementById(
    "appToast",
  ),

  toastIcon: document.getElementById(
    "toastIcon",
  ),

  toastTitle: document.getElementById(
    "toastTitle",
  ),

  toastMessage: document.getElementById(
    "toastMessage",
  ),

  foregroundHexInput: document.getElementById(
    "foregroundHexInput",
  ),

  foregroundColorPicker: document.getElementById(
    "foregroundColorPicker",
  ),

  backgroundHexInput: document.getElementById(
    "backgroundHexInput",
  ),

  backgroundColorPicker: document.getElementById(
    "backgroundColorPicker",
  ),

  swapContrastColorsButton: document.getElementById(
    "swapContrastColorsButton",
  ),

  contrastChecker: document.getElementById(
    "contrastChecker",
  ),

  contrastPreview: document.getElementById(
    "contrastPreview",
  ),

  contrastPreviewLabel: document.getElementById(
    "contrastPreviewLabel",
  ),

  contrastPreviewHeading: document.getElementById(
    "contrastPreviewHeading",
  ),

  contrastPreviewText: document.getElementById(
    "contrastPreviewText",
  ),

  contrastRatio: document.getElementById(
    "contrastRatio",
  ),

  normalTextResult: document.getElementById(
    "normalTextResult",
  ),

  normalTextStatus: document.getElementById(
    "normalTextStatus",
  ),

  normalTextLevel: document.getElementById(
    "normalTextLevel",
  ),

  largeTextResult: document.getElementById(
    "largeTextResult",
  ),

  largeTextStatus: document.getElementById(
    "largeTextStatus",
  ),

  largeTextLevel: document.getElementById(
    "largeTextLevel",
  ),

  uiComponentResult: document.getElementById(
    "uiComponentResult",
  ),

  uiComponentStatus: document.getElementById(
    "uiComponentStatus",
  ),

  uiComponentLevel: document.getElementById(
    "uiComponentLevel",
  ),
};