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

export function initializePalette() {
  const paletteState =
    getPaletteState();

  const baseColor =
    normalizeBaseColor(
      paletteState?.baseColor,
    );

  const paletteType =
    normalizePaletteType(
      paletteState?.type,
    );

  const paletteSize =
    normalizePaletteSize(
      paletteState?.size,
    );

  const colors =
    safelyGeneratePalette(
      baseColor,
      paletteType,
      paletteSize,
    );

  if (!colors) {
    return null;
  }

  /*
   * Initialization starts with a completely
   * unlocked palette.
   */
  setBaseColor(baseColor);

  setPaletteType(paletteType);

  setPaletteColors(colors);

  setLockedColors(
    createLockState(
      colors.length,
    ),
  );

  setPaletteState({
    size: colors.length,
  });

  return getCurrentPalette();
}


/* =========================================================
   Generate New Palette
   ========================================================= */

/*
 * Generates a palette while preserving existing
 * locked colors.
 */
export function generateNewPalette(
  baseColor,
  paletteType,
  size,
) {
  const currentState =
    getPaletteState();

  const nextBaseColor =
    normalizeBaseColor(
      baseColor ??
        currentState?.baseColor,
    );

  const nextPaletteType =
    normalizePaletteType(
      paletteType ??
        currentState?.type,
    );

  const nextSize =
    normalizePaletteSize(
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

  const colors =
    applyLockedColors(
      generatedColors,
      currentState?.colors,
      currentState?.locked,
    );

  /*
   * Preserve locks only for indexes that still
   * exist in the new palette.
   */
  const locks =
    createLockState(
      colors.length,
      currentState?.locked,
    );

  setBaseColor(
    nextBaseColor,
  );

  setPaletteType(
    nextPaletteType,
  );

  setPaletteColors(
    colors,
  );

  setLockedColors(
    locks,
  );

  setPaletteState({
    size: colors.length,
  });

  return getCurrentPalette();
}


/* =========================================================
   Randomize Unlocked Colors
   ========================================================= */

export function randomizeUnlockedColors() {
  const currentState =
    getPaletteState();

  if (
    !currentState ||
    !Array.isArray(
      currentState.colors,
    )
  ) {
    return null;
  }

  const colors =
    currentState.colors.map(
      (color, index) => {
        const isLocked =
          Boolean(
            currentState.locked?.[index],
          );

        if (isLocked) {
          return color;
        }

        const randomColor =
          generateRandomColor();

        return normalizeBaseColor(
          randomColor,
        );
      },
    );

  setPaletteColors(
    colors,
  );

  setPaletteState({
    size: colors.length,
  });

  return getCurrentPalette();
}


/* =========================================================
   Regenerate Palette
   ========================================================= */

export function regeneratePalette() {
  const currentState =
    getPaletteState();

  return generateNewPalette(
    currentState?.baseColor,
    currentState?.type,
    currentState?.size,
  );
}


/* =========================================================
   Set Base Color
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

  setBaseColor(
    normalizedColor,
  );

  return true;
}


/* =========================================================
   Set Palette Type
   ========================================================= */

export function updatePaletteType(
  paletteType,
) {
  const normalizedType =
    normalizePaletteType(
      paletteType,
    );

  if (!isSupportedPaletteType(
    paletteType,
  )) {
    return false;
  }

  setPaletteType(
    normalizedType,
  );

  return true;
}


/* =========================================================
   Set Palette Size
   ========================================================= */

/*
 * Changes the palette size and regenerates the palette.
 *
 * Existing locked colors are preserved where possible.
 */
export function updatePaletteSize(
  size,
) {
  const normalizedSize =
    normalizePaletteSize(
      size,
    );

  if (!Number.isInteger(
    normalizedSize,
  )) {
    return false;
  }

  const currentState =
    getPaletteState();

  const palette =
    generateNewPalette(
      currentState?.baseColor,
      currentState?.type,
      normalizedSize,
    );

  return Boolean(palette);
}


/* =========================================================
   Lock Color
   ========================================================= */

export function lockColor(index) {
  const currentState =
    getPaletteState();

  if (
    !isValidIndex(
      index,
      currentState?.colors,
    )
  ) {
    return false;
  }

  const locked =
    createLockState(
      currentState.colors.length,
      currentState.locked,
    );

  locked[index] = true;

  setLockedColors(
    locked,
  );

  return true;
}


/* =========================================================
   Unlock Color
   ========================================================= */

export function unlockColor(index) {
  const currentState =
    getPaletteState();

  if (
    !isValidIndex(
      index,
      currentState?.colors,
    )
  ) {
    return false;
  }

  const locked =
    createLockState(
      currentState.colors.length,
      currentState.locked,
    );

  locked[index] = false;

  setLockedColors(
    locked,
  );

  return true;
}


/* =========================================================
   Toggle Color Lock
   ========================================================= */

export function toggleColorLock(index) {
  const currentState =
    getPaletteState();

  if (
    !isValidIndex(
      index,
      currentState?.colors,
    )
  ) {
    return false;
  }

  const locked =
    createLockState(
      currentState.colors.length,
      currentState.locked,
    );

  locked[index] =
    !locked[index];

  setLockedColors(
    locked,
  );

  return locked[index];
}


/* =========================================================
   Get Current Palette
   ========================================================= */

export function getCurrentPalette() {
  const currentState =
    getPaletteState();

  const colors =
    Array.isArray(
      currentState?.colors,
    )
      ? currentState.colors
      : [];

  return {
    colors: [
      ...colors,
    ],

    locked:
      createLockState(
        colors.length,
        currentState?.locked,
      ),

    baseColor:
      currentState?.baseColor ??
      DEFAULT_BASE_COLOR,

    type:
      currentState?.type ??
      DEFAULT_PALETTE_TYPE,

    size:
      colors.length,
  };
}


/* =========================================================
   Get Colors
   ========================================================= */

export function getPaletteColors() {
  const currentState =
    getPaletteState();

  return Array.isArray(
    currentState?.colors,
  )
    ? [
        ...currentState.colors,
      ]
    : [];
}


/* =========================================================
   Get Locked Color Indexes
   ========================================================= */

export function getLockedColorIndexes() {
  const currentState =
    getPaletteState();

  const colors =
    Array.isArray(
      currentState?.colors,
    )
      ? currentState.colors
      : [];

  const locked =
    createLockState(
      colors.length,
      currentState?.locked,
    );

  return locked
    .map(
      (isLocked, index) =>
        isLocked
          ? index
          : null,
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
    normalizePaletteColors(
      colors,
    );

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
    size:
      normalizedColors.length,
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
  const currentState =
    getPaletteState();

  if (
    !isValidIndex(
      index,
      currentState?.colors,
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
    ...currentState.colors,
  ];

  colors[index] =
    normalizedColor;

  setPaletteColors(
    colors,
  );

  return true;
}


/* =========================================================
   Reset Locks
   ========================================================= */

export function resetLocks() {
  const currentState =
    getPaletteState();

  const colorCount =
    Array.isArray(
      currentState?.colors,
    )
      ? currentState.colors.length
      : 0;

  setLockedColors(
    createLockState(
      colorCount,
    ),
  );

  return true;
}


/* =========================================================
   Reset Palette
   ========================================================= */

/*
 * A real reset:
 *
 * - default base color
 * - default palette type
 * - default size
 * - NEW colors
 * - NO locked colors
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

  setPaletteColors(
    colors,
  );

  setLockedColors(
    createLockState(
      colors.length,
    ),
  );

  setPaletteState({
    size: colors.length,
  });

  return getCurrentPalette();
}


/* =========================================================
   Helpers
   ========================================================= */


/* =========================================================
   Normalize Base Color
   ========================================================= */

function normalizeBaseColor(
  color,
) {
  if (!isValidHex(color)) {
    return DEFAULT_BASE_COLOR;
  }

  return (
    normalizeHex(color) ||
    DEFAULT_BASE_COLOR
  );
}


/* =========================================================
   Normalize Palette Type
   ========================================================= */

function normalizePaletteType(
  type,
) {
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


/* =========================================================
   Normalize Palette Size
   ========================================================= */

function normalizePaletteSize(
  size,
) {
  const numericSize =
    Number(size);

  if (
    !Number.isFinite(
      numericSize,
    )
  ) {
    return PALETTE_SIZE;
  }

  return Math.max(
    MIN_PALETTE_SIZE,
    Math.min(
      MAX_PALETTE_SIZE,
      Math.floor(
        numericSize,
      ),
    ),
  );
}


/* =========================================================
   Normalize Palette Colors
   ========================================================= */

function normalizePaletteColors(
  colors,
) {
  return colors
    .slice(
      0,
      MAX_PALETTE_SIZE,
    )
    .map(
      (color) => {
        if (!isValidHex(color)) {
          return null;
        }

        return normalizeHex(
          color,
        );
      },
    )
    .filter(Boolean);
}


/* =========================================================
   Create Lock State
   ========================================================= */

function createLockState(
  size,
  existingLocks = [],
) {
  const normalizedSize =
    Number.isInteger(size) &&
    size >= 0
      ? size
      : 0;

  return Array.from(
    {
      length:
        normalizedSize,
    },
    (_, index) =>
      Boolean(
        existingLocks?.[index],
      ),
  );
}


/* =========================================================
   Apply Existing Locks
   ========================================================= */

function applyLockedColors(
  generatedColors,
  currentColors = [],
  locked = [],
) {
  return generatedColors.map(
    (
      generatedColor,
      index,
    ) => {
      const isLocked =
        Boolean(
          locked?.[index],
        );

      const existingColor =
        currentColors?.[index];

      if (
        isLocked &&
        isValidHex(existingColor)
      ) {
        return (
          normalizeHex(
            existingColor,
          ) ||
          generatedColor
        );
      }

      return generatedColor;
    },
  );
}


/* =========================================================
   Safe Palette Generation
   ========================================================= */

function safelyGeneratePalette(
  baseColor,
  paletteType,
  size,
) {
  try {
    const colors =
      generatePalette(
        baseColor,
        paletteType,
        size,
      );

    if (!Array.isArray(colors)) {
      return null;
    }

    const normalizedColors =
      normalizePaletteColors(
        colors,
      );

    if (
      normalizedColors.length !==
      size
    ) {
      return null;
    }

    return normalizedColors;
  } catch (error) {
    console.error(
      "Palette generation failed:",
      error,
    );

    return null;
  }
}


/* =========================================================
   Palette Type Validation
   ========================================================= */

function isSupportedPaletteType(
  paletteType,
) {
  return Object.values(
    PALETTE_TYPES,
  ).includes(
    paletteType,
  );
}


/* =========================================================
   Validate Color Index
   ========================================================= */

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