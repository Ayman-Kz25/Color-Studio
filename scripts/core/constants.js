/* =========================================================
   Color Studio
   Application Constants
   ========================================================= */

/* =========================================================
   Application
   ========================================================= */

export const APP_NAME = "Color Studio";

export const APP_VERSION = "1.0.0";

/* =========================================================
   Palette
   ========================================================= */

export const PALETTE_SIZE = 5;

export const MIN_PALETTE_SIZE = 3;

export const MAX_PALETTE_SIZE = 7;

export const DEFAULT_BASE_COLOR = "#6366F1";

export const DEFAULT_PALETTE_TYPE = "random";

/* =========================================================
   Palette Types
   ========================================================= */

export const PALETTE_TYPES = Object.freeze({
  RANDOM: "random",
  MONOCHROMATIC: "monochromatic",
  ANALOGOUS: "analogous",
  COMPLEMENTARY: "complementary",
  TRIADIC: "triadic",
  SPLIT_COMPLEMENTARY: "split-complementary",
  TETRADIC: "tetradic",
});

/* =========================================================
   Color Formats
   ========================================================= */

export const COLOR_FORMATS = Object.freeze({
  HEX: "hex",
  RGB: "rgb",
  HSL: "hsl",
});

export const DEFAULT_COLOR_FORMAT = COLOR_FORMATS.HEX;

/* =========================================================
   Storage
   ========================================================= */

export const STORAGE_KEYS = Object.freeze({
  SAVED_PALETTES: "colorStudio_savedPalettes",
  SETTINGS: "colorStudio_settings",
});

export const MAX_SAVED_PALETTES = 50;

/* =========================================================
   Contrast
   ========================================================= */

export const CONTRAST_RATIOS = Object.freeze({
  AA_NORMAL: 4.5,
  AA_LARGE: 3,
  AAA_NORMAL: 7,
  AAA_LARGE: 4.5,
  UI_COMPONENT: 3,
});

/* =========================================================
   Contrast Levels
   ========================================================= */

export const CONTRAST_LEVELS = Object.freeze({
  FAIL: "fail",
  AA: "aa",
  AAA: "aaa",
});

/* =========================================================
 *  Default Contrast Colors
 *  ========================================================= */

export const DEFAULT_CONTRAST_COLORS = Object.freeze({
    FOREGROUND: "#000000",
    BACKGROUND: "#FFFFFF",
});

/* =========================================================
   UI
   ========================================================= */

export const TOAST_DURATION = 3000;

export const DEBOUNCE_DELAY = 150;

/* =========================================================
   Default UI Messages
   ========================================================= */

export const MESSAGES = Object.freeze({
  PALETTE_GENERATED: "Palette generated",
  COLOR_COPIED: "Color copied to clipboard",
  PALETTE_SAVED: "Palette saved",
  PALETTE_DELETED: "Palette deleted",
  COLOR_LOCKED: "Color locked",
  COLOR_UNLOCKED: "Color unlocked",
  INVALID_COLOR: "Please enter a valid HEX color",
  EMPTY_PALETTE_NAME: "Please enter a palette name",
  STORAGE_ERROR: "Unable to access saved palettes",
  COPY_ERROR: "Unable to copy color",
  PALETTE_GENERATION_ERROR: "Unable to generate palette",
  PALETTE_RESET: "Palette reset",
  PALETTE_LOADED: "Palette loaded",
  PALETTE_NOT_FOUND: "Saved palette not found",
  PALETTE_SAVE_ERROR: "Unable to save palette",
  PALETTE_DELETE_ERROR: "Unable to delete palette",
});

/* =========================================================
   Default Values
   ========================================================= */

export const DEFAULTS = Object.freeze({
  baseColor: DEFAULT_BASE_COLOR,
  paletteType: DEFAULT_PALETTE_TYPE,
  colorFormat: DEFAULT_COLOR_FORMAT,
  paletteSize: PALETTE_SIZE,
});