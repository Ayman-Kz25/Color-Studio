import { MAX_SAVED_PALETTES, STORAGE_KEYS } from "./constants.js";

let storageAvailable = null;

function isStorageAvailable() {
  if (storageAvailable !== null) {
    return storageAvailable;
  }

  try {
    const testKey = "__color_studio_storage_test__";

    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);

    storageAvailable = true;
  } catch (error) {
    storageAvailable = false;

    console.warn("Color Studio: localStorage is unavailable.", error);
  }

  return storageAvailable;
}

/* =========================================================
   Generic Storage Helpers
   ========================================================= */

function readJSON(key, fallback = null) {
  if (!isStorageAvailable()) {
    return fallback;
  }

  try {
    const storedValue = localStorage.getItem(key);

    if (storedValue === null) {
      return fallback;
    }

    return JSON.parse(storedValue);
  } catch (error) {
    console.error(`Color Studio: unable to read "${key}".`, error);

    return fallback;
  }
}

function writeJSON(key, value) {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));

    return true;
  } catch (error) {
    console.error(`Color Studio: unable to write "${key}".`, error);

    return false;
  }
}

function removeItem(key) {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(key);

    return true;
  } catch (error) {
    console.error(`Color Studio: unable to remove "${key}".`, error);

    return false;
  }
}

/* =========================================================
   Saved Palettes
   ========================================================= */

export function getSavedPalettes() {
  const palettes = readJSON(STORAGE_KEYS.SAVED_PALETTES, []);

  if (!Array.isArray(palettes)) {
    return [];
  }

  return palettes;
}

/* =========================================================
   Save Palette
   ========================================================= */

export function savePalette(palette) {
  if (!isValidPaletteObject(palette)) {
    return null;
  }

  const palettes = getSavedPalettes();

  const savedPalette = {
    ...palette,

    id: palette.id || createPaletteId(),

    createdAt: palette.createdAt || new Date().toISOString(),

    updatedAt: new Date().toISOString(),

    colors: [...palette.colors],

    locked: Array.isArray(palette.locked)
      ? [...palette.locked]
      : palette.colors.map(() => false),
  };

  const existingIndex = palettes.findIndex(
    (item) => String(item.id) === String(savedPalette.id),
  );

  if (existingIndex !== -1) {
    palettes[existingIndex] = savedPalette;
  } else {
    palettes.unshift(savedPalette);
  }

  const limitedPalettes = palettes.slice(0, MAX_SAVED_PALETTES);

  const saved = writeJSON(STORAGE_KEYS.SAVED_PALETTES, limitedPalettes);

  if (!saved) {
    return null;
  }

  return savedPalette;
}

/* =========================================================
   Delete Palette
   ========================================================= */

export function deletePalette(paletteId) {
  if (paletteId === null || paletteId === undefined) {
    return false;
  }

  const palettes = getSavedPalettes();

  const filteredPalettes = palettes.filter(
    (palette) => String(palette.id) !== String(paletteId),
  );

  if (filteredPalettes.length === palettes.length) {
    return false;
  }

  return writeJSON(STORAGE_KEYS.SAVED_PALETTES, filteredPalettes);
}

/* =========================================================
   Clear Saved Palettes
   ========================================================= */

export function clearSavedPalettes() {
  return removeItem(STORAGE_KEYS.SAVED_PALETTES);
}

/* =========================================================
   Settings
   ========================================================= */

export function getSettings() {
  const settings = readJSON(STORAGE_KEYS.SETTINGS, {});

  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    return {};
  }

  return settings;
}

export function saveSettings(settings) {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    return false;
  }

  const currentSettings = getSettings();

  return writeJSON(STORAGE_KEYS.SETTINGS, {
    ...currentSettings,
    ...settings,
  });
}

export function updateSetting(key, value) {
  if (typeof key !== "string" || !key.trim()) {
    return false;
  }

  const settings = getSettings();

  settings[key.trim()] = value;

  return writeJSON(STORAGE_KEYS.SETTINGS, settings);
}

export function getSetting(key, fallback = null) {
  if (typeof key !== "string" || !key.trim()) {
    return fallback;
  }

  const settings = getSettings();

  const normalizedKey = key.trim();

  if (!Object.prototype.hasOwnProperty.call(settings, normalizedKey)) {
    return fallback;
  }

  return settings[normalizedKey];
}

export function clearSettings() {
  return removeItem(STORAGE_KEYS.SETTINGS);
}

/* =========================================================
   Clear All Storage
   ========================================================= */

export function clearAllStorage() {
  const palettesCleared = clearSavedPalettes();

  const settingsCleared = clearSettings();

  return palettesCleared && settingsCleared;
}

/* =========================================================
   Storage Size
   ========================================================= */

export function getStorageSize() {
  if (!isStorageAvailable()) {
    return 0;
  }

  let totalSize = 0;

  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index);

    if (!key) {
      continue;
    }

    const value = localStorage.getItem(key) || "";

    /*
     * localStorage uses UTF-16 strings.
     * This provides an approximate byte size.
     */
    totalSize += (key.length + value.length) * 2;
  }

  return totalSize;
}

/* =========================================================
   Palette Validation
   ========================================================= */

function isValidPaletteObject(palette) {
  if (!palette || typeof palette !== "object") {
    return false;
  }

  if (!Array.isArray(palette.colors)) {
    return false;
  }

  if (palette.colors.length === 0) {
    return false;
  }

  return palette.colors.every(
    (color) => typeof color === "string" && color.trim().length > 0,
  );
}

/* =========================================================
   Palette ID Generator
   ========================================================= */

function createPaletteId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return [
    Date.now().toString(36),
    Math.random().toString(36).slice(2, 10),
  ].join("-");
}
