import {
  DEFAULT_BASE_COLOR,
  DEFAULT_PALETTE_TYPE,
  DEFAULT_COLOR_FORMAT,
  PALETTE_SIZE,
} from "./constants.js";

/* Initial State */
const initialState = {

  palette: {
    colors: [],
    locked: [],
    baseColor: DEFAULT_BASE_COLOR,
    type: DEFAULT_PALETTE_TYPE,
    size: PALETTE_SIZE,
  },

  color: {
    format: DEFAULT_COLOR_FORMAT,
  },

  savedPalettes: [],

  contrast: {
    foreground: "#FFFFFF",
    background: DEFAULT_BASE_COLOR,
    ratio: 0,
    level: "fail",
  },

  ui: {
    activeModule: "palette",
    isGenerating: false,
    isSaving: false,
    selectedColorIndex: null,
  },
};

/* App State  */
let state = createInitialState();

/* State Creation */
function createInitialState() {
  return structuredClone(initialState);
}

/* State Initialization */
export function initializeState() {
  state = createInitialState();

  return getState();
}

/* Get State */
export function getState() {
  return state;
}

/* Palette State */
export function getPaletteState() {
  return state.palette;
}

export function setPaletteState(updates) {
  if (!updates || typeof updates !== "object") {
    return;
  }

  state.palette = {
    ...state.palette,
    ...updates,
  };
}

export function setPaletteColors(colors) {
  if (!Array.isArray(colors)) {
    return;
  }

  state.palette.colors = [...colors];
}

export function setLockedColors(locked) {
  if (!Array.isArray(locked)) {
    return;
  }

  state.palette.locked = [...locked];
}

export function setBaseColor(baseColor) {
  if (typeof baseColor !== "string" || !baseColor.trim()) {
    return;
  }

  state.palette.baseColor = baseColor;
}

export function setPaletteType(type) {
  if (typeof type !== "string" || !type.trim()) {
    return;
  }

  state.palette.type = type;
}

/* Saved Palettes State */
export function getSavedPalettes() {
  return state.savedPalettes;
}

export function setSavedPalettes(palettes) {
  if (!Array.isArray(palettes)) {
    return;
  }

  state.savedPalettes = [...palettes];
}

export function addSavedPalette(palette) {
  if (!palette) {
    return;
  }

  state.savedPalettes = [...state.savedPalettes, palette];
}

export function removeSavedPalette(paletteId) {
  state.savedPalettes = state.savedPalettes.filter(
    (palette) => palette.id !== paletteId,
  );
}

/* Contrast State */
export function getContrastState() {
  return state.contrast;
}

export function setContrastState(updates) {
  if (!updates || typeof updates !== "object") {
    return;
  }

  state.contrast = {
    ...state.contrast,
    ...updates,
  };
}

export function setContrastColors(foreground, background) {
  if (typeof foreground === "string" && foreground.trim()) {
    state.contrast.foreground = foreground;
  }

  if (typeof background === "string" && background.trim()) {
    state.contrast.background = background;
  }
}

/* Color State */
export function getColorFormat() {
  return state.color.format;
}

export function setColorFormat(format) {
  if (typeof format !== "string" || !format.trim()) {
    return;
  }

  state.color.format = format;
}

/* UI State */
export function getUIState() {
  return state.ui;
}

export function setUIState(updates) {
  if (!updates || typeof updates !== "object") {
    return;
  }

  state.ui = {
    ...state.ui,
    ...updates,
  };
}

export function setActiveModule(moduleName) {
  if (typeof moduleName !== "string" || !moduleName.trim()) {
    return;
  }

  state.ui.activeModule = moduleName;
}

export function setGenerating(isGenerating) {
  state.ui.isGenerating = Boolean(isGenerating);
}

export function setSaving(isSaving) {
  state.ui.isSaving = Boolean(isSaving);
}

export function setSelectedColorIndex(index) {
  if (index !== null && (!Number.isInteger(index) || index < 0)) {
    return;
  }

  state.ui.selectedColorIndex = index;
}

/* State Reset */
export function resetState() {
  state = createInitialState();

  return getState();
}
