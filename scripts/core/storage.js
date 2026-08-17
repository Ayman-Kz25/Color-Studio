import {
    MAX_SAVED_PALETTES,
    STORAGE_KEYS,
    MIN_PALETTE_SIZE,
    MAX_PALETTE_SIZE,
} from "./constants.js";


/* =========================================================
   Storage Availability
   ========================================================= */

let storageAvailable = null;


function isStorageAvailable() {
    if (storageAvailable !== null) {
        return storageAvailable;
    }

    try {
        const testKey =
            "__color_studio_storage_test__";

        localStorage.setItem(
            testKey,
            "test",
        );

        localStorage.removeItem(
            testKey,
        );

        storageAvailable = true;
    } catch (error) {
        storageAvailable = false;

        console.warn(
            "Color Studio: localStorage is unavailable.",
            error,
        );
    }

    return storageAvailable;
}


/* =========================================================
   Generic JSON Helpers
   ========================================================= */

function readJSON(key, fallback = null) {
    if (!isStorageAvailable()) {
        return fallback;
    }

    try {
        const storedValue =
            localStorage.getItem(key);

        if (storedValue === null) {
            return fallback;
        }

        const parsedValue =
            JSON.parse(storedValue);

        return parsedValue;
    } catch (error) {
        console.error(
            `Color Studio: unable to read "${key}".`,
            error,
        );

        return fallback;
    }
}


function writeJSON(key, value) {
    if (!isStorageAvailable()) {
        return false;
    }

    try {
        localStorage.setItem(
            key,
            JSON.stringify(value),
        );

        return true;
    } catch (error) {
        console.error(
            `Color Studio: unable to write "${key}".`,
            error,
        );

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
        console.error(
            `Color Studio: unable to remove "${key}".`,
            error,
        );

        return false;
    }
}


/* =========================================================
   Saved Palettes
   ========================================================= */

/**
 * Returns every saved palette.
 *
 * Invalid storage data is ignored safely.
 */
export function getSavedPalettes() {
    const palettes = readJSON(
        STORAGE_KEYS.SAVED_PALETTES,
        [],
    );

    if (!Array.isArray(palettes)) {
        return [];
    }

    return palettes
        .filter(isValidPaletteObject)
        .map(normalizeSavedPalette);
}


/* =========================================================
   Get Single Saved Palette
   ========================================================= */

export function getSavedPaletteById(
    paletteId,
) {
    if (
        paletteId === null ||
        paletteId === undefined
    ) {
        return null;
    }

    const palettes =
        getSavedPalettes();

    return (
        palettes.find(
            (palette) =>
                String(palette.id) ===
                String(paletteId),
        ) || null
    );
}


/* =========================================================
   Save Palette
   ========================================================= */

export function savePalette(palette) {
    if (!isValidPaletteObject(palette)) {
        return null;
    }

    const palettes =
        getSavedPalettes();

    const now =
        new Date().toISOString();

    const savedPalette =
        normalizeSavedPalette({
            ...palette,

            id:
                palette.id ||
                createPaletteId(),

            createdAt:
                palette.createdAt ||
                now,

            updatedAt:
                now,
        });

    const existingIndex =
        palettes.findIndex(
            (item) =>
                String(item.id) ===
                String(savedPalette.id),
        );

    if (existingIndex !== -1) {
        /*
         * Update an existing palette while
         * preserving its original creation date.
         */
        savedPalette.createdAt =
            palettes[existingIndex].createdAt ||
            savedPalette.createdAt;

        palettes[existingIndex] =
            savedPalette;
    } else {
        /*
         * Newest palettes appear first.
         */
        palettes.unshift(
            savedPalette,
        );
    }

    /*
     * Keep storage bounded.
     */
    const limitedPalettes =
        palettes.slice(
            0,
            MAX_SAVED_PALETTES,
        );

    const saved =
        writeJSON(
            STORAGE_KEYS.SAVED_PALETTES,
            limitedPalettes,
        );

    if (!saved) {
        return null;
    }

    return savedPalette;
}


/* =========================================================
   Delete Palette
   ========================================================= */

export function deletePalette(
    paletteId,
) {
    if (
        paletteId === null ||
        paletteId === undefined
    ) {
        return false;
    }

    const palettes =
        getSavedPalettes();

    const filteredPalettes =
        palettes.filter(
            (palette) =>
                String(palette.id) !==
                String(paletteId),
        );

    /*
     * Nothing was deleted.
     */
    if (
        filteredPalettes.length ===
        palettes.length
    ) {
        return false;
    }

    return writeJSON(
        STORAGE_KEYS.SAVED_PALETTES,
        filteredPalettes,
    );
}


/* =========================================================
   Clear Saved Palettes
   ========================================================= */

export function clearSavedPalettes() {
    return removeItem(
        STORAGE_KEYS.SAVED_PALETTES,
    );
}


/* =========================================================
   Settings
   ========================================================= */

export function getSettings() {
    const settings =
        readJSON(
            STORAGE_KEYS.SETTINGS,
            {},
        );

    if (
        !settings ||
        typeof settings !== "object" ||
        Array.isArray(settings)
    ) {
        return {};
    }

    return settings;
}


export function saveSettings(settings) {
    if (
        !settings ||
        typeof settings !== "object" ||
        Array.isArray(settings)
    ) {
        return false;
    }

    const currentSettings =
        getSettings();

    return writeJSON(
        STORAGE_KEYS.SETTINGS,
        {
            ...currentSettings,
            ...settings,
        },
    );
}


export function updateSetting(
    key,
    value,
) {
    if (
        typeof key !== "string" ||
        !key.trim()
    ) {
        return false;
    }

    const settings =
        getSettings();

    settings[key.trim()] =
        value;

    return writeJSON(
        STORAGE_KEYS.SETTINGS,
        settings,
    );
}


export function getSetting(
    key,
    fallback = null,
) {
    if (
        typeof key !== "string" ||
        !key.trim()
    ) {
        return fallback;
    }

    const settings =
        getSettings();

    const normalizedKey =
        key.trim();

    if (
        !Object.prototype.hasOwnProperty.call(
            settings,
            normalizedKey,
        )
    ) {
        return fallback;
    }

    return settings[
        normalizedKey
    ];
}


export function clearSettings() {
    return removeItem(
        STORAGE_KEYS.SETTINGS,
    );
}


/* =========================================================
   Clear Everything
   ========================================================= */

export function clearAllStorage() {
    const palettesCleared =
        clearSavedPalettes();

    const settingsCleared =
        clearSettings();

    return (
        palettesCleared &&
        settingsCleared
    );
}


/* =========================================================
   Storage Size
   ========================================================= */

export function getStorageSize() {
    if (!isStorageAvailable()) {
        return 0;
    }

    let totalSize = 0;

    for (
        let index = 0;
        index < localStorage.length;
        index += 1
    ) {
        const key =
            localStorage.key(index);

        if (!key) {
            continue;
        }

        const value =
            localStorage.getItem(key) ||
            "";

        /*
         * localStorage stores strings.
         *
         * This is an approximate UTF-16
         * byte count.
         */
        totalSize +=
            (key.length + value.length) * 2;
    }

    return totalSize;
}


/* =========================================================
   Palette Validation
   ========================================================= */

function isValidPaletteObject(
    palette,
) {
    if (
        !palette ||
        typeof palette !== "object" ||
        Array.isArray(palette)
    ) {
        return false;
    }

    if (
        !Array.isArray(palette.colors)
    ) {
        return false;
    }

    if (
        palette.colors.length < MIN_PALETTE_SIZE ||
        palette.colors.length > MAX_PALETTE_SIZE
    ) {
        return false;
    }

    const validColors =
        palette.colors.every(
            (color) =>
                typeof color === "string" &&
                color.trim().length > 0,
        );

    if (!validColors) {
        return false;
    }

    /*
     * A saved palette from the current UI
     * should have a name.
     *
     * We allow old palettes without names
     * so existing localStorage data does
     * not suddenly become unusable.
     */
    if (
        palette.name !== undefined &&
        typeof palette.name !== "string"
    ) {
        return false;
    }

    return true;
}


/* =========================================================
   Palette Normalization
   ========================================================= */

function normalizeSavedPalette(
    palette,
) {
    const colors =
        Array.isArray(palette.colors)
            ? palette.colors
                  .filter(
                      (color) =>
                          typeof color ===
                          "string",
                  )
                  .map(
                      (color) =>
                          color.trim(),
                  )
            : [];

    const locked =
        Array.from(
            {
                length:
                    colors.length,
            },
            (_, index) =>
                Boolean(
                    Array.isArray(
                        palette.locked,
                    )
                        ? palette.locked[
                              index
                          ]
                        : false,
                ),
        );

    const normalizedSize =
        Number(palette.size);

    const size =
        Number.isInteger(
            normalizedSize,
        ) &&
        normalizedSize >=
            MIN_PALETTE_SIZE &&
        normalizedSize <=
            MAX_PALETTE_SIZE
            ? normalizedSize
            : colors.length;

    return {
        id:
            palette.id ||
            createPaletteId(),

        name:
            typeof palette.name ===
            "string"
                ? palette.name.trim()
                : "Untitled Palette",

        colors: [
            ...colors,
        ],

        locked: [
            ...locked,
        ],

        baseColor:
            typeof palette.baseColor ===
            "string"
                ? palette.baseColor.trim()
                : null,

        type:
            typeof palette.type ===
            "string"
                ? palette.type.trim()
                : "random",

        size,

        createdAt:
            palette.createdAt ||
            new Date().toISOString(),

        updatedAt:
            palette.updatedAt ||
            new Date().toISOString(),
    };
}


/* =========================================================
   Palette ID
   ========================================================= */

function createPaletteId() {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID ===
            "function"
    ) {
        return crypto.randomUUID();
    }

    return [
        Date.now().toString(36),

        Math.random()
            .toString(36)
            .slice(2, 10),
    ].join("-");
}