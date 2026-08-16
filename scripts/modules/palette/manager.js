import {
  PALETTE_SIZE,
  DEFAULT_BASE_COLOR,
  DEFAULT_PALETTE_TYPE,
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

import { isValidHex, normalizeHex, generateRandomColor } from "./colorUtils.js";

/* Initialize Palette */
export function initializePalette() {
  const paletteState = getPaletteState();

  const baseColor = isValidHex(paletteState.baseColor)
    ? normalizeHex(paletteState.baseColor)
    : DEFAULT_BASE_COLOR;

  const paletteType = paletteState.type || DEFAULT_PALETTE_TYPE;

  setBaseColor(baseColor);

  setPaletteType(paletteType);

  const colors = generatePalette(baseColor, paletteType, PALETTE_SIZE);

  setPaletteColors(colors);

  setLockedColors(createLockState(colors.length));

  return getCurrentPalette();
}

/* Generate New Palette */
export function generateNewPalette(baseColor, paletteType) {
  const currentState = getPaletteState();

  const nextBaseColor = normalizeBaseColor(baseColor || currentState.baseColor);

  const nextPaletteType =
    paletteType || currentState.type || DEFAULT_PALETTE_TYPE;

  const generatedColors = generatePalette(
    nextBaseColor,
    nextPaletteType,
    PALETTE_SIZE,
  );

  const colors = applyLockedColors(
    generatedColors,
    currentState.colors,
    currentState.locked,
  );

  setBaseColor(nextBaseColor);

  setPaletteType(nextPaletteType);

  setPaletteColors(colors);

  return getCurrentPalette();
}

/* Randomize Unlocked Colors */
export function randomizeUnlockedColors() {
  const currentState = getPaletteState();

  const colors = currentState.colors.map((color, index) => {
    if (currentState.locked[index]) {
      return color;
    }

    return generateRandomColor();
  });

  setPaletteColors(colors);

  return getCurrentPalette();
}

/* Regenerate While Preserving Locks */
export function regeneratePalette() {
  const currentState = getPaletteState();

  return generateNewPalette(currentState.baseColor, currentState.type);
}

/* Set Base Color */
export function updateBaseColor(baseColor) {
  if (!isValidHex(baseColor)) {
    return false;
  }

  const normalizedColor = normalizeHex(baseColor);

  setBaseColor(normalizedColor);

  return true;
}

/* Set Palette Type */
export function updatePaletteType(paletteType) {
  if (typeof paletteType !== "string" || !paletteType.trim()) {
    return false;
  }

  setPaletteType(paletteType);

  return true;
}

/* Lock Color */
export function lockColor(index) {
  const currentState = getPaletteState();

  if (!isValidIndex(index)) {
    return false;
  }

  const locked = [...currentState.locked];

  locked[index] = true;

  setLockedColors(locked);

  return true;
}

/* Unlock Color */
export function unlockColor(index) {
  const currentState = getPaletteState();

  if (!isValidIndex(index)) {
    return false;
  }

  const locked = [...currentState.locked];

  locked[index] = false;

  setLockedColors(locked);

  return true;
}

/* Toggle Color Lock */
export function toggleColorLock(index) {
  const currentState = getPaletteState();

  if (!isValidIndex(index)) {
    return false;
  }

  const locked = [...currentState.locked];

  locked[index] = !locked[index];

  setLockedColors(locked);

  return locked[index];
}

/* Get Current Palette */
export function getCurrentPalette() {
  const currentState = getPaletteState();

  return {
    colors: [...currentState.colors],

    locked: [...currentState.locked],

    baseColor: currentState.baseColor,

    type: currentState.type,

    size: currentState.size,
  };
}

/* Get Colors */
export function getPaletteColors() {
  const currentState = getPaletteState();

  return [...currentState.colors];
}

/* Get Locked Colors */
export function getLockedColorIndexes() {
  const currentState = getPaletteState();

  return currentState.locked
    .map((isLocked, index) => (isLocked ? index : null))
    .filter((index) => index !== null);
}

/* Set Palette */
export function setCurrentPalette(colors, locked = []) {
  if (!Array.isArray(colors)) {
    return false;
  }

  const normalizedColors = normalizePaletteColors(colors);

  if (normalizedColors.length === 0) {
    return false;
  }

  const normalizedLocks = createLockState(normalizedColors.length, locked);

  setPaletteColors(normalizedColors);

  setLockedColors(normalizedLocks);

  setPaletteState({
    size: normalizedColors.length,
  });

  return true;
}

/* Replace Color */
export function replaceColor(index, color) {
  if (!isValidIndex(index) || !isValidHex(color)) {
    return false;
  }

  const currentState = getPaletteState();

  const colors = [...currentState.colors];

  colors[index] = normalizeHex(color);

  setPaletteColors(colors);

  return true;
}

/* Reset Locks */
export function resetLocks() {
  const currentState = getPaletteState();

  setLockedColors(createLockState(currentState.colors.length));
}

/* Reset Palette */
export function resetPalette() {
  setBaseColor(DEFAULT_BASE_COLOR);

  setPaletteType(DEFAULT_PALETTE_TYPE);

  const colors = generatePalette(
    DEFAULT_BASE_COLOR,
    DEFAULT_PALETTE_TYPE,
    PALETTE_SIZE,
  );

  setPaletteColors(colors);

  setLockedColors(createLockState(colors.length));

  return getCurrentPalette();
}

/* Helpers */
function normalizeBaseColor(color) {
  if (isValidHex(color)) {
    return normalizeHex(color);
  }

  return DEFAULT_BASE_COLOR;
}

function normalizePaletteColors(colors) {
  return colors
    .slice(0, PALETTE_SIZE)
    .map((color) => {
      if (isValidHex(color)) {
        return normalizeHex(color);
      }

      return null;
    })
    .filter(Boolean);
}

function createLockState(size, existingLocks = []) {
  return Array.from({ length: size }, (_, index) =>
    Boolean(existingLocks[index]),
  );
}

function applyLockedColors(generatedColors, currentColors, locked) {
  return generatedColors.map((generatedColor, index) => {
    if (locked[index] && isValidHex(currentColors[index])) {
      return currentColors[index];
    }

    return generatedColor;
  });
}

function isValidIndex(index) {
  return Number.isInteger(index) && index >= 0 && index < PALETTE_SIZE;
}
