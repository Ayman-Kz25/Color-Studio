import {
  DEFAULT_BASE_COLOR,
  DEFAULT_PALETTE_TYPE,
  DEFAULT_COLOR_FORMAT,
  PALETTE_SIZE,
  MIN_PALETTE_SIZE,
  MAX_PALETTE_SIZE,
} from "./constants.js";

/* =========================================================
   Initial State
   ========================================================= */

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

/* =========================================================
   App State
   ========================================================= */

let state = createInitialState();

/* =========================================================
   State Creation
   ========================================================= */

function createInitialState() {
  return structuredClone(initialState);
}

/* =========================================================
   State Initialization
   ========================================================= */

export function initializeState() {
  state = createInitialState();

  return getState();
}

/* =========================================================
   Get Complete State
   ========================================================= */

export function getState() {
  return state;
}

/* =========================================================
   Palette State
   ========================================================= */

export function getPaletteState() {
  return state.palette;
}

export function setPaletteState(updates) {
  if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
    return;
  }

  state.palette = {
    ...state.palette,
    ...updates,
  };
}

/* =========================================================
   Palette Colors
   ========================================================= */

export function setPaletteColors(colors) {
  if (!Array.isArray(colors)) {
    return;
  }

  state.palette.colors = [...colors];

  /*
   * Keep the locked state aligned with the
   * current number of palette colors.
   */

  state.palette.locked = colors.map((_, index) =>
    Boolean(state.palette.locked[index]),
  );

  state.palette.size = colors.length;

  /*
   * Clear the selected color if it no longer
   * exists in the new palette.
   */

  const selectedIndex = state.ui.selectedColorIndex;

  if (selectedIndex !== null && selectedIndex >= colors.length) {
    state.ui.selectedColorIndex = null;
  }
}

/* =========================================================
   Locked Colors
   ========================================================= */

export function setLockedColors(locked) {
  if (!Array.isArray(locked)) {
    return;
  }

  const colorCount = state.palette.colors.length;

  state.palette.locked = Array.from({ length: colorCount }, (_, index) =>
    Boolean(locked[index]),
  );
}

/* =========================================================
   Base Color
   ========================================================= */

export function setBaseColor(baseColor) {
  if (typeof baseColor !== "string" || !baseColor.trim()) {
    return;
  }

  state.palette.baseColor = baseColor.trim();
}

/* =========================================================
   Palette Type
   ========================================================= */

export function setPaletteType(type) {
  if (typeof type !== "string" || !type.trim()) {
    return;
  }

  state.palette.type = type.trim();
}

/* =========================================================
   Palette Size
   ========================================================= */

export function setPaletteSize(size) {
  const normalizedSize = Number(size);

  if (!Number.isInteger(normalizedSize)) {
    return;
  }

  if (normalizedSize < MIN_PALETTE_SIZE || normalizedSize > MAX_PALETTE_SIZE) {
    return;
  }

  state.palette.size = normalizedSize;

  /*
   * Keep locked colors aligned with
   * the requested palette size.
   */

  state.palette.locked = Array.from({ length: normalizedSize }, (_, index) =>
    Boolean(state.palette.locked[index]),
  );

  /*
   * A selected color outside the new
   * palette size is no longer valid.
   */

  if (
    state.ui.selectedColorIndex !== null &&
    state.ui.selectedColorIndex >= normalizedSize
  ) {
    state.ui.selectedColorIndex = null;
  }
}

/* =========================================================
   Saved Palettes State
   ========================================================= */

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
  if (!palette || typeof palette !== "object") {
    return;
  }

  state.savedPalettes = [...state.savedPalettes, palette];
}

export function removeSavedPalette(paletteId) {
  if (paletteId === null || paletteId === undefined) {
    return;
  }

  state.savedPalettes = state.savedPalettes.filter(
    (palette) => String(palette.id) !== String(paletteId),
  );
}

/* =========================================================
   Contrast State
   ========================================================= */

export function getContrastState() {
  return state.contrast;
}

export function setContrastState(updates) {
  if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
    return;
  }

  state.contrast = {
    ...state.contrast,
    ...updates,
  };
}

export function setContrastColors(foreground, background) {
  if (typeof foreground === "string" && foreground.trim()) {
    state.contrast.foreground = foreground.trim();
  }

  if (typeof background === "string" && background.trim()) {
    state.contrast.background = background.trim();
  }
}

/* =========================================================
   Color State
   ========================================================= */

export function getColorFormat() {
  return state.color.format;
}

export function setColorFormat(format) {
  if (typeof format !== "string" || !format.trim()) {
    return;
  }

  state.color.format = format.trim();
}

/* =========================================================
   UI State
   ========================================================= */

export function getUIState() {
  return state.ui;
}

export function setUIState(updates) {
  if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
    return;
  }

  state.ui = {
    ...state.ui,
    ...updates,
  };
}

/* =========================================================
   Active Module
   ========================================================= */

export function setActiveModule(moduleName) {
  if (typeof moduleName !== "string" || !moduleName.trim()) {
    return;
  }

  state.ui.activeModule = moduleName.trim();
}

/* =========================================================
   Generating State
   ========================================================= */

export function setGenerating(isGenerating) {
  state.ui.isGenerating = Boolean(isGenerating);
}

/* =========================================================
   Saving State
   ========================================================= */

export function setSaving(isSaving) {
  state.ui.isSaving = Boolean(isSaving);
}

/* =========================================================
   Selected Color
   ========================================================= */

export function setSelectedColorIndex(index) {
  if (index === null) {
    state.ui.selectedColorIndex = null;

    return;
  }

  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= state.palette.colors.length
  ) {
    return;
  }

  state.ui.selectedColorIndex = index;
}

/* =========================================================
   State Reset
   ========================================================= */

export function resetState() {
  state = createInitialState();

  return getState();
}
