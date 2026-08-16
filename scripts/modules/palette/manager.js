import {
  PALETTE_SIZE,
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
  const paletteState = getPaletteState();

  const baseColor = normalizeBaseColor(
    paletteState.baseColor,
  );

  const paletteType = normalizePaletteType(
    paletteState.type,
  );

  const paletteSize = normalizePaletteSize(
    paletteState.size,
  );

  const colors = generatePalette(
    baseColor,
    paletteType,
    paletteSize,
  );

  setPaletteState({
    baseColor,
    type: paletteType,
    size: colors.length,
  });

  setPaletteColors(colors);

  setLockedColors(
    createLockState(colors.length),
  );

  return getCurrentPalette();
}

/* =========================================================
   Generate New Palette
   ========================================================= */

export function generateNewPalette(
  baseColor,
  paletteType,
  size,
) {
  const currentState = getPaletteState();

  const nextBaseColor = normalizeBaseColor(
    baseColor ?? currentState.baseColor,
  );

  const nextPaletteType = normalizePaletteType(
    paletteType ?? currentState.type,
  );

  const nextSize = normalizePaletteSize(
    size ?? currentState.size ?? PALETTE_SIZE,
  );

  const generatedColors = generatePalette(
    nextBaseColor,
    nextPaletteType,
    nextSize,
  );

  const colors = applyLockedColors(
    generatedColors,
    currentState.colors,
    currentState.locked,
  );

  setBaseColor(nextBaseColor);

  setPaletteType(nextPaletteType);

  setPaletteColors(colors);

  setLockedColors(
    createLockState(
      colors.length,
      currentState.locked,
    ),
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
  const currentState = getPaletteState();

  if (!Array.isArray(currentState.colors)) {
    return getCurrentPalette();
  }

  const colors = currentState.colors.map(
    (color, index) => {
      if (currentState.locked[index]) {
        return color;
      }

      return generateRandomColor();
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
  const currentState = getPaletteState();

  return generateNewPalette(
    currentState.baseColor,
    currentState.type,
    currentState.size,
  );
}

/* =========================================================
   Set Base Color
   ========================================================= */

export function updateBaseColor(baseColor) {
  if (!isValidHex(baseColor)) {
    return false;
  }

  const normalizedColor = normalizeHex(
    baseColor,
  );

  if (!normalizedColor) {
    return false;
  }

  setBaseColor(normalizedColor);

  return true;
}

/* =========================================================
   Set Palette Type
   ========================================================= */

export function updatePaletteType(paletteType) {
  const normalizedType =
    normalizePaletteType(paletteType);

  if (!normalizedType) {
    return false;
  }

  setPaletteType(normalizedType);

  return true;
}

/* =========================================================
   Set Palette Size
   ========================================================= */

export function updatePaletteSize(size) {
  const normalizedSize =
    normalizePaletteSize(size);

  if (!Number.isInteger(normalizedSize)) {
    return false;
  }

  setPaletteState({
    size: normalizedSize,
  });

  return true;
}

/* =========================================================
   Lock Color
   ========================================================= */

export function lockColor(index) {
  const currentState = getPaletteState();

  if (!isValidIndex(index, currentState.colors)) {
    return false;
  }

  const locked = createLockState(
    currentState.colors.length,
    currentState.locked,
  );

  locked[index] = true;

  setLockedColors(locked);

  return true;
}

/* =========================================================
   Unlock Color
   ========================================================= */

export function unlockColor(index) {
  const currentState = getPaletteState();

  if (!isValidIndex(index, currentState.colors)) {
    return false;
  }

  const locked = createLockState(
    currentState.colors.length,
    currentState.locked,
  );

  locked[index] = false;

  setLockedColors(locked);

  return true;
}

/* =========================================================
   Toggle Color Lock
   ========================================================= */

export function toggleColorLock(index) {
  const currentState = getPaletteState();

  if (!isValidIndex(index, currentState.colors)) {
    return false;
  }

  const locked = createLockState(
    currentState.colors.length,
    currentState.locked,
  );

  locked[index] = !locked[index];

  setLockedColors(locked);

  return locked[index];
}

/* =========================================================
   Get Current Palette
   ========================================================= */

export function getCurrentPalette() {
  const currentState = getPaletteState();

  return {
    colors: [...currentState.colors],

    locked: createLockState(
      currentState.colors.length,
      currentState.locked,
    ),

    baseColor: currentState.baseColor,

    type: currentState.type,

    size: currentState.colors.length,
  };
}

/* =========================================================
   Get Colors
   ========================================================= */

export function getPaletteColors() {
  const currentState = getPaletteState();

  return [...currentState.colors];
}

/* =========================================================
   Get Locked Color Indexes
   ========================================================= */

export function getLockedColorIndexes() {
  const currentState = getPaletteState();

  return currentState.locked
    .map((isLocked, index) =>
      isLocked ? index : null,
    )
    .filter((index) => index !== null);
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

  if (normalizedColors.length === 0) {
    return false;
  }

  const normalizedLocks = createLockState(
    normalizedColors.length,
    locked,
  );

  setPaletteColors(normalizedColors);

  setLockedColors(normalizedLocks);

  setPaletteState({
    size: normalizedColors.length,
  });

  return true;
}

/* =========================================================
   Replace Color
   ========================================================= */

export function replaceColor(index, color) {
  const currentState = getPaletteState();

  if (
    !isValidIndex(index, currentState.colors) ||
    !isValidHex(color)
  ) {
    return false;
  }

  const normalizedColor = normalizeHex(color);

  if (!normalizedColor) {
    return false;
  }

  const colors = [...currentState.colors];

  colors[index] = normalizedColor;

  setPaletteColors(colors);

  return true;
}

/* =========================================================
   Reset Locks
   ========================================================= */

export function resetLocks() {
  const currentState = getPaletteState();

  setLockedColors(
    createLockState(
      currentState.colors.length,
    ),
  );
}

/* =========================================================
   Reset Palette
   ========================================================= */

export function resetPalette() {
  return generateNewPalette(
    DEFAULT_BASE_COLOR,
    DEFAULT_PALETTE_TYPE,
    PALETTE_SIZE,
  );
}

/* =========================================================
   Helpers
   ========================================================= */

/* Normalize Base Color */

function normalizeBaseColor(color) {
  if (isValidHex(color)) {
    return normalizeHex(color);
  }

  return DEFAULT_BASE_COLOR;
}

/* Normalize Palette Type */

function normalizePaletteType(type) {
  if (
    typeof type !== "string" ||
    !type.trim()
  ) {
    return DEFAULT_PALETTE_TYPE;
  }

  const normalizedType = type.trim();

  const validTypes = Object.values(
    PALETTE_TYPES,
  );

  return validTypes.includes(normalizedType)
    ? normalizedType
    : DEFAULT_PALETTE_TYPE;
}

/* Normalize Palette Size */

function normalizePaletteSize(size) {
  const numericSize = Number(size);

  if (!Number.isFinite(numericSize)) {
    return PALETTE_SIZE;
  }

  return Math.max(
    1,
    Math.min(10, Math.floor(numericSize)),
  );
}

/* Normalize Palette Colors */

function normalizePaletteColors(colors) {
  return colors
    .slice(0, 10)
    .map((color) => {
      if (!isValidHex(color)) {
        return null;
      }

      return normalizeHex(color);
    })
    .filter(Boolean);
}

/* Create Lock State */

function createLockState(
  size,
  existingLocks = [],
) {
  return Array.from(
    { length: size },
    (_, index) =>
      Boolean(existingLocks[index]),
  );
}

/* Apply Existing Locks */

function applyLockedColors(
  generatedColors,
  currentColors,
  locked,
) {
  return generatedColors.map(
    (generatedColor, index) => {
      const isLocked = Boolean(locked[index]);

      const existingColor =
        currentColors[index];

      if (
        isLocked &&
        isValidHex(existingColor)
      ) {
        return normalizeHex(existingColor);
      }

      return generatedColor;
    },
  );
}

/* Validate Color Index */

function isValidIndex(index, colors) {
  return (
    Number.isInteger(index) &&
    Array.isArray(colors) &&
    index >= 0 &&
    index < colors.length
  );
}