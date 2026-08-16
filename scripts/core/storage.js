import { STORAGE_KEYS, MAX_SAVED_PALETTES } from "./constants.js";

/* Storage Availability */
function isStorageAvailable() {
  try {
    const testKey = "__color_studio_storage_test__";

    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);

    return true;
  } catch (error) {
    console.warn("Local storage is unavailable:", error);

    return false;
  }
}

/* Generic Storage Helpers */
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
    console.error(`Unable to read storage key "${key}":`, error);

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
    console.error(`Unable to write storage key "${key}":`, error);

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
    console.error(`Unable to remove storage key "${key}":`, error);

    return false;
  }
}

/* Saved Palettes */
export function getSavedPalettes() {
  const palettes = readJSON(STORAGE_KEYS.SAVED_PALETTES, []);

  return Array.isArray(palettes) ? palettes : [];
}

export function savePalette(palette) {
  if (!palette || typeof palette !== "object") {
    return false;
  }

  const palettes = getSavedPalettes();

  const paletteWithId = {
    ...palette,

    id: palette.id || createPaletteId(),

    createdAt: palette.createdAt || new Date().toISOString(),
  };

  const existingIndex = palettes.findIndex(
    (item) => item.id === paletteWithId.id,
  );

  if (existingIndex !== -1) {
    palettes[existingIndex] = paletteWithId;
  } else {
    palettes.unshift(paletteWithId);
  }

  const limitedPalettes = palettes.slice(0, MAX_SAVED_PALETTES);

  return writeJSON(STORAGE_KEYS.SAVED_PALETTES, limitedPalettes);
}

export function deletePalette(paletteId) {
  if (paletteId === null || paletteId === undefined) {
    return false;
  }

  const palettes = getSavedPalettes();

  const filteredPalettes = palettes.filter(
    (palette) => palette.id !== paletteId,
  );

  return writeJSON(STORAGE_KEYS.SAVED_PALETTES, filteredPalettes);
}

export function clearSavedPalettes() {
  return removeItem(STORAGE_KEYS.SAVED_PALETTES);
}

/* Settings */
export function getSettings() {
  const settings = readJSON(STORAGE_KEYS.SETTINGS, {});

  return settings && typeof settings === "object" && !Array.isArray(settings)
    ? settings
    : {};
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

  settings[key] = value;

  return writeJSON(STORAGE_KEYS.SETTINGS, settings);
}

export function getSetting(key, fallback = null) {
  if (typeof key !== "string" || !key.trim()) {
    return fallback;
  }

  const settings = getSettings();

  return Object.prototype.hasOwnProperty.call(settings, key)
    ? settings[key]
    : fallback;
}

export function clearSettings() {
  return removeItem(STORAGE_KEYS.SETTINGS);
}

/* Storage Utilities */
export function clearAllStorage() {
  const palettesCleared = clearSavedPalettes();

  const settingsCleared = clearSettings();

  return palettesCleared && settingsCleared;
}

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

    const value = localStorage.getItem(key);

    totalSize += key.length + (value ? value.length : 0);
  }

  return totalSize;
}

/* ID Generator */
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
