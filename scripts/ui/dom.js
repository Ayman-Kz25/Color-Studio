/*
 * =========================================================
 * Color Studio
 * DOM References
 * =========================================================
 */

export const dom = {
  /*
   * =========================================================
   * Shared
   * =========================================================
   */

  app: document.getElementById("app"),
  appHeader: document.getElementById("appHeader"),
  brandLink: document.getElementById("brandLink"),
  headerNavigation: document.getElementById("headerNavigation"),
  mainContent: document.getElementById("mainContent"),
  appFooter: document.getElementById("appFooter"),
  currentYear: document.getElementById("currentYear"),

  /*
   * =========================================================
   * Palette Generator
   * =========================================================
   */

  paletteGenerator: document.getElementById("paletteGenerator"),
  paletteGeneratorTitle: document.getElementById(
    "paletteGeneratorTitle",
  ),
  paletteGeneratorControls: document.getElementById(
    "paletteGeneratorControls",
  ),

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

  /*
   * =========================================================
   * Contrast Checker
   * =========================================================
   */

  contrastChecker: document.getElementById(
    "contrastChecker",
  ),
  contrastControls: document.getElementById(
    "contrastControls",
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

  /*
   * =========================================================
   * Contrast Preview
   * =========================================================
   */

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

  /*
   * =========================================================
   * Contrast Results
   * =========================================================
   */

  contrastResults: document.getElementById(
    "contrastResults",
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

  /*
   * =========================================================
   * Saved Palettes
   * =========================================================
   */

  savedPalettesButton: document.getElementById(
    "savedPalettesButton",
  ),
  savedPalettesCount: document.getElementById(
    "savedPalettesCount",
  ),

  savedPalettesOffcanvas: document.getElementById(
    "savedPalettesOffcanvas",
  ),
  savedPalettesOffcanvasTitle: document.getElementById(
    "savedPalettesOffcanvasTitle",
  ),

  savedPalettesEmptyState: document.getElementById(
    "savedPalettesEmptyState",
  ),
  savedPalettesList: document.getElementById(
    "savedPalettesList",
  ),

  /*
   * =========================================================
   * Save Palette Modal
   * =========================================================
   */

  savePaletteModal: document.getElementById(
    "savePaletteModal",
  ),
  savePaletteModalTitle: document.getElementById(
    "savePaletteModalTitle",
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

  /*
   * =========================================================
   * Toast
   * =========================================================
   */

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
};