/* =========================================================
   Color Studio
   Palette Manager
   ========================================================= */

import {
  PALETTE_SIZE,
  MIN_PALETTE_SIZE,
  MAX_PALETTE_SIZE,
  DEFAULT_BASE_COLOR,
  DEFAULT_PALETTE_TYPE,
  PALETTE_TYPES,
} from "../../core/constants.js";

import {
  getPaletteState,
  setPaletteState,
  setPaletteColors,
  setLockedColors,
  setBaseColor,
  setPaletteType,
} from "../../core/state.js";

import { generatePalette } from "./generator.js";

import {
  isValidHex,
  normalizeHex,
  generateRandomColor,
} from "./colorUtils.js";


/* =========================================================
   Initialize Palette
   ========================================================= */

/**
 * Creates the initial palette state.
 *
 * This function does NOT render anything and does NOT touch
 * the DOM. UI initialization belongs to main.js / paletteUI.js.
 *
 * If the state already contains a valid palette, it is kept.
 * Otherwise a new palette is generated from the current
 * state/settings or defaults.
 */
export function initializePalette() {
  const state = getPaletteState();

  const baseColor = normalizeBaseColor(
    state?.baseColor,
  );

  const paletteType = normalizePaletteType(
    state?.type,
  );

  const size = normalizePaletteSize(
    state?.size ?? PALETTE_SIZE,
  );

  /*
   * If a valid palette already exists, keep it.
   *
   * This is important during application startup because
   * initialization should not unnecessarily generate a new
   * palette every time the page loads.
   */
  if (
    hasValidPalette(
      state?.colors,
      size,
    )
  ) {
    const colors = normalizePaletteColors(
      state.colors,
    );

    const locked = createLockState(
      colors.length,
      state.locked,
    );

    setBaseColor(baseColor);
    setPaletteType(paletteType);
    setPaletteColors(colors);
    setLockedColors(locked);

    setPaletteState({
      size: colors.length,
    });

    return getCurrentPalette();
  }

  /*
   * No usable palette exists, so create one.
   */
  const colors = safelyGeneratePalette(
    baseColor,
    paletteType,
    size,
  );

  if (!colors) {
    return null;
  }

  setBaseColor(baseColor);
  setPaletteType(paletteType);
  setPaletteColors(colors);

  setLockedColors(
    createLockState(colors.length),
  );

  setPaletteState({
    size: colors.length,
  });

  return getCurrentPalette();
}


/* =========================================================
   Generate New Palette
   ========================================================= */

/**
 * Generates a new palette while preserving existing
 * locked colors by index.
 */
export function generateNewPalette(
  baseColor,
  paletteType,
  size,
) {
  const currentState = getPaletteState();

  const nextBaseColor = normalizeBaseColor(
    baseColor ?? currentState?.baseColor,
  );

  const nextPaletteType = normalizePaletteType(
    paletteType ?? currentState?.type,
  );

  const nextSize = normalizePaletteSize(
    size ??
      currentState?.size ??
      PALETTE_SIZE,
  );

  const generatedColors =
    safelyGeneratePalette(
      nextBaseColor,
      nextPaletteType,
      nextSize,
    );

  if (!generatedColors) {
    return null;
  }

  const colors = applyLockedColors(
    generatedColors,
    currentState?.colors,
    currentState?.locked,
  );

  const locked = createLockState(
    colors.length,
    currentState?.locked,
  );

  setBaseColor(nextBaseColor);
  setPaletteType(nextPaletteType);
  setPaletteColors(colors);
  setLockedColors(locked);

  setPaletteState({
    size: colors.length,
  });

  return getCurrentPalette();
}


/* =========================================================
   Randomize Unlocked Colors
   ========================================================= */

export function randomizeUnlockedColors() {
  const currentState = getPaletteState();

  if (
    !Array.isArray(
      currentState?.colors,
    )
  ) {
    return null;
  }

  const colors = currentState.colors.map(
    (color, index) => {
      if (
        Boolean(
          currentState.locked?.[index],
        )
      ) {
        return color;
      }

      return normalizeBaseColor(
        generateRandomColor(),
      );
    },
  );

  setPaletteColors(colors);

  setPaletteState({
    size: colors.length,
  });

  return getCurrentPalette();
}


/* =========================================================
   Regenerate Palette
   ========================================================= */

export function regeneratePalette() {
  const state = getPaletteState();

  return generateNewPalette(
    state?.baseColor,
    state?.type,
    state?.size,
  );
}


/* =========================================================
   Base Color
   ========================================================= */

export function updateBaseColor(
  baseColor,
) {
  if (!isValidHex(baseColor)) {
    return false;
  }

  const normalizedColor =
    normalizeHex(baseColor);

  if (!normalizedColor) {
    return false;
  }

  setBaseColor(normalizedColor);

  return true;
}


/* =========================================================
   Palette Type
   ========================================================= */

export function updatePaletteType(
  paletteType,
) {
  if (
    !isSupportedPaletteType(
      paletteType,
    )
  ) {
    return false;
  }

  setPaletteType(
    normalizePaletteType(
      paletteType,
    ),
  );

  return true;
}


/* =========================================================
   Palette Size
   ========================================================= */

export function updatePaletteSize(
  size,
) {
  const normalizedSize =
    normalizePaletteSize(size);

  if (
    !Number.isInteger(
      normalizedSize,
    )
  ) {
    return false;
  }

  const state = getPaletteState();

  const palette = generateNewPalette(
    state?.baseColor,
    state?.type,
    normalizedSize,
  );

  return Boolean(palette);
}


/* =========================================================
   Lock Color
   ========================================================= */

export function lockColor(index) {
  const state = getPaletteState();

  if (
    !isValidIndex(
      index,
      state?.colors,
    )
  ) {
    return false;
  }

  const locked = createLockState(
    state.colors.length,
    state.locked,
  );

  locked[index] = true;

  setLockedColors(locked);

  return true;
}


/* =========================================================
   Unlock Color
   ========================================================= */

export function unlockColor(index) {
  const state = getPaletteState();

  if (
    !isValidIndex(
      index,
      state?.colors,
    )
  ) {
    return false;
  }

  const locked = createLockState(
    state.colors.length,
    state.locked,
  );

  locked[index] = false;

  setLockedColors(locked);

  return true;
}


/* =========================================================
   Toggle Color Lock
   ========================================================= */

export function toggleColorLock(index) {
  const state = getPaletteState();

  if (
    !isValidIndex(
      index,
      state?.colors,
    )
  ) {
    return false;
  }

  const locked = createLockState(
    state.colors.length,
    state.locked,
  );

  locked[index] = !locked[index];

  setLockedColors(locked);

  return locked[index];
}


/* =========================================================
   Current Palette
   ========================================================= */

export function getCurrentPalette() {
  const state = getPaletteState();

  const colors = Array.isArray(
    state?.colors,
  )
    ? [...state.colors]
    : [];

  return {
    colors,

    locked: createLockState(
      colors.length,
      state?.locked,
    ),

    baseColor:
      normalizeBaseColor(
        state?.baseColor,
      ),

    type:
      normalizePaletteType(
        state?.type,
      ),

    size: colors.length,
  };
}


/* =========================================================
   Palette Colors
   ========================================================= */

export function getPaletteColors() {
  const state = getPaletteState();

  return Array.isArray(
    state?.colors,
  )
    ? [...state.colors]
    : [];
}


/* =========================================================
   Locked Color Indexes
   ========================================================= */

export function getLockedColorIndexes() {
  const state = getPaletteState();

  const colors = Array.isArray(
    state?.colors,
  )
    ? state.colors
    : [];

  const locked = createLockState(
    colors.length,
    state?.locked,
  );

  return locked
    .map(
      (isLocked, index) =>
        isLocked ? index : null,
    )
    .filter(
      (index) =>
        index !== null,
    );
}


/* =========================================================
   Set Current Palette
   ========================================================= */

export function setCurrentPalette(
  colors,
  locked = [],
) {
  if (!Array.isArray(colors)) {
    return false;
  }

  const normalizedColors =
    normalizePaletteColors(colors);

  if (
    normalizedColors.length <
    MIN_PALETTE_SIZE
  ) {
    return false;
  }

  const normalizedLocks =
    createLockState(
      normalizedColors.length,
      locked,
    );

  setPaletteColors(
    normalizedColors,
  );

  setLockedColors(
    normalizedLocks,
  );

  setPaletteState({
    size: normalizedColors.length,
  });

  return true;
}


/* =========================================================
   Replace Color
   ========================================================= */

export function replaceColor(
  index,
  color,
) {
  const state = getPaletteState();

  if (
    !isValidIndex(
      index,
      state?.colors,
    ) ||
    !isValidHex(color)
  ) {
    return false;
  }

  const normalizedColor =
    normalizeHex(color);

  if (!normalizedColor) {
    return false;
  }

  const colors = [
    ...state.colors,
  ];

  colors[index] = normalizedColor;

  setPaletteColors(colors);

  return true;
}


/* =========================================================
   Reset Locks
   ========================================================= */

export function resetLocks() {
  const state = getPaletteState();

  const size = Array.isArray(
    state?.colors,
  )
    ? state.colors.length
    : 0;

  setLockedColors(
    createLockState(size),
  );

  return true;
}


/* =========================================================
   Reset Palette
   ========================================================= */

/**
 * Resets the palette to application defaults.
 *
 * Reset intentionally generates fresh colors and clears
 * all locks.
 */
export function resetPalette() {
  const colors =
    safelyGeneratePalette(
      DEFAULT_BASE_COLOR,
      DEFAULT_PALETTE_TYPE,
      PALETTE_SIZE,
    );

  if (!colors) {
    return null;
  }

  setBaseColor(
    DEFAULT_BASE_COLOR,
  );

  setPaletteType(
    DEFAULT_PALETTE_TYPE,
  );

  setPaletteColors(colors);

  setLockedColors(
    createLockState(colors.length),
  );

  setPaletteState({
    size: colors.length,
  });

  return getCurrentPalette();
}


/* =========================================================
   Helpers
   ========================================================= */

/* ---------------------------------------------------------
   Base Color
   --------------------------------------------------------- */

function normalizeBaseColor(color) {
  if (!isValidHex(color)) {
    return DEFAULT_BASE_COLOR;
  }

  return (
    normalizeHex(color) ||
    DEFAULT_BASE_COLOR
  );
}


/* ---------------------------------------------------------
   Palette Type
   --------------------------------------------------------- */

function normalizePaletteType(type) {
  if (
    typeof type !== "string" ||
    !type.trim()
  ) {
    return DEFAULT_PALETTE_TYPE;
  }

  const normalizedType =
    type.trim();

  return isSupportedPaletteType(
    normalizedType,
  )
    ? normalizedType
    : DEFAULT_PALETTE_TYPE;
}


/* ---------------------------------------------------------
   Palette Size
   --------------------------------------------------------- */

function normalizePaletteSize(size) {
  const numericSize = Number(size);

  if (
    !Number.isFinite(numericSize)
  ) {
    return PALETTE_SIZE;
  }

  return Math.max(
    MIN_PALETTE_SIZE,
    Math.min(
      MAX_PALETTE_SIZE,
      Math.floor(numericSize),
    ),
  );
}


/* ---------------------------------------------------------
   Palette Colors
   --------------------------------------------------------- */

function normalizePaletteColors(colors) {
  if (!Array.isArray(colors)) {
    return [];
  }

  return colors
    .slice(0, MAX_PALETTE_SIZE)
    .map((color) => {
      if (!isValidHex(color)) {
        return null;
      }

      return normalizeHex(color);
    })
    .filter(Boolean);
}


/* ---------------------------------------------------------
   Lock State
   --------------------------------------------------------- */

function createLockState(
  size,
  existingLocks = [],
) {
  const normalizedSize =
    Number.isInteger(size) && size >= 0
      ? size
      : 0;

  return Array.from(
    {
      length: normalizedSize,
    },
    (_, index) =>
      Boolean(
        existingLocks?.[index],
      ),
  );
}


/* ---------------------------------------------------------
   Apply Existing Locks
   --------------------------------------------------------- */

function applyLockedColors(
  generatedColors,
  currentColors = [],
  locked = [],
) {
  return generatedColors.map(
    (generatedColor, index) => {
      const isLocked =
        Boolean(locked?.[index]);

      const existingColor =
        currentColors?.[index];

      if (
        isLocked &&
        isValidHex(existingColor)
      ) {
        return (
          normalizeHex(existingColor) ||
          generatedColor
        );
      }

      return generatedColor;
    },
  );
}


/* ---------------------------------------------------------
   Safe Palette Generation
   --------------------------------------------------------- */

function safelyGeneratePalette(
  baseColor,
  paletteType,
  size,
) {
  try {
    const colors = generatePalette(
      baseColor,
      paletteType,
      size,
    );

    if (!Array.isArray(colors)) {
      return null;
    }

    const normalizedColors =
      normalizePaletteColors(colors);

    if (
      normalizedColors.length !== size
    ) {
      return null;
    }

    return normalizedColors;
  } catch (error) {
    console.error(
      "Color Studio: palette generation failed.",
      error,
    );

    return null;
  }
}


/* ---------------------------------------------------------
   Existing Palette Validation
   --------------------------------------------------------- */

function hasValidPalette(
  colors,
  expectedSize,
) {
  if (!Array.isArray(colors)) {
    return false;
  }

  if (
    colors.length !== expectedSize
  ) {
    return false;
  }

  return colors.every(
    (color) =>
      Boolean(
        normalizeHex(color),
      ),
  );
}


/* ---------------------------------------------------------
   Palette Type Validation
   --------------------------------------------------------- */

function isSupportedPaletteType(
  paletteType,
) {
  return Object.values(
    PALETTE_TYPES,
  ).includes(
    paletteType,
  );
}


/* ---------------------------------------------------------
   Color Index Validation
   --------------------------------------------------------- */

function isValidIndex(
  index,
  colors,
) {
  return (
    Number.isInteger(index) &&
    Array.isArray(colors) &&
    index >= 0 &&
    index < colors.length
  );
}