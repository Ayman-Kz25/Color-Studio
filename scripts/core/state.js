import {
    DEFAULT_BASE_COLOR,
    DEFAULT_PALETTE_TYPE,
    DEFAULT_COLOR_FORMAT,
    DEFAULT_CONTRAST_COLORS,
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

        /*
         * One boolean per palette color.
         *
         * Example:
         * [false, true, false, false, true]
         */
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
        foreground:
            DEFAULT_CONTRAST_COLORS.FOREGROUND,

        background:
            DEFAULT_CONTRAST_COLORS.BACKGROUND,

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
   Private Application State
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
   Complete State
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
    if (
        !updates ||
        typeof updates !== "object" ||
        Array.isArray(updates)
    ) {
        return;
    }

    state.palette = {
        ...state.palette,
        ...updates,
    };

    /*
     * Always keep palette size synchronized
     * with the actual colors when colors are supplied.
     */
    if (Array.isArray(updates.colors)) {
        state.palette.size = updates.colors.length;
    }
}


/* =========================================================
   Palette Colors
   ========================================================= */

export function getPaletteColors() {
    return state.palette.colors;
}


export function setPaletteColors(colors) {
    if (!Array.isArray(colors)) {
        return;
    }

    const normalizedColors = colors
        .filter((color) => typeof color === "string")
        .map((color) => color.trim());

    state.palette.colors = [...normalizedColors];

    /*
     * Preserve existing lock state where possible.
     *
     * If the old palette contained:
     *
     * [false, true, false, false, false]
     *
     * and a new palette contains 5 colors,
     * the second color remains locked.
     */
    state.palette.locked = normalizedColors.map(
        (_, index) =>
            Boolean(state.palette.locked[index]),
    );

    state.palette.size = normalizedColors.length;

    /*
     * A selected color that no longer exists
     * must be cleared.
     */
    if (
        state.ui.selectedColorIndex !== null &&
        state.ui.selectedColorIndex >= normalizedColors.length
    ) {
        state.ui.selectedColorIndex = null;
    }
}


export function getPaletteColor(index) {
    if (!Number.isInteger(index)) {
        return null;
    }

    if (
        index < 0 ||
        index >= state.palette.colors.length
    ) {
        return null;
    }

    return state.palette.colors[index];
}


export function setPaletteColor(index, color) {
    if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= state.palette.colors.length
    ) {
        return false;
    }

    if (
        typeof color !== "string" ||
        !color.trim()
    ) {
        return false;
    }

    state.palette.colors[index] = color.trim();

    return true;
}


/* =========================================================
   Locked Colors
   ========================================================= */

export function getLockedColors() {
    return state.palette.locked;
}


export function setLockedColors(locked) {
    if (!Array.isArray(locked)) {
        return;
    }

    const colorCount =
        state.palette.colors.length;

    state.palette.locked = Array.from(
        { length: colorCount },
        (_, index) => Boolean(locked[index]),
    );
}


export function isColorLocked(index) {
    if (!Number.isInteger(index)) {
        return false;
    }

    return Boolean(
        state.palette.locked[index],
    );
}


export function setColorLocked(index, locked) {
    if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= state.palette.colors.length
    ) {
        return false;
    }

    state.palette.locked[index] =
        Boolean(locked);

    return true;
}


export function toggleColorLock(index) {
    if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= state.palette.colors.length
    ) {
        return false;
    }

    state.palette.locked[index] =
        !state.palette.locked[index];

    return state.palette.locked[index];
}


/* =========================================================
   Base Color
   ========================================================= */

export function getBaseColor() {
    return state.palette.baseColor;
}


export function setBaseColor(baseColor) {
    if (
        typeof baseColor !== "string" ||
        !baseColor.trim()
    ) {
        return false;
    }

    state.palette.baseColor =
        baseColor.trim();

    return true;
}


/* =========================================================
   Palette Type
   ========================================================= */

export function getPaletteType() {
    return state.palette.type;
}


export function setPaletteType(type) {
    if (
        typeof type !== "string" ||
        !type.trim()
    ) {
        return false;
    }

    state.palette.type = type.trim();

    return true;
}


/* =========================================================
   Palette Size
   ========================================================= */

export function getPaletteSize() {
    return state.palette.size;
}


export function setPaletteSize(size) {
    const normalizedSize = Number(size);

    if (!Number.isInteger(normalizedSize)) {
        return false;
    }

    if (
        normalizedSize < MIN_PALETTE_SIZE ||
        normalizedSize > MAX_PALETTE_SIZE
    ) {
        return false;
    }

    state.palette.size =
        normalizedSize;

    /*
     * Resize the lock array while preserving
     * existing lock states.
     */
    state.palette.locked =
        Array.from(
            { length: normalizedSize },
            (_, index) =>
                Boolean(
                    state.palette.locked[index],
                ),
        );

    /*
     * If the selected color falls outside
     * the new requested size, clear it.
     */
    if (
        state.ui.selectedColorIndex !== null &&
        state.ui.selectedColorIndex >= normalizedSize
    ) {
        state.ui.selectedColorIndex = null;
    }

    return true;
}


/* =========================================================
   Saved Palettes
   ========================================================= */

export function getSavedPalettes() {
    return state.savedPalettes;
}


export function setSavedPalettes(palettes) {
    if (!Array.isArray(palettes)) {
        return false;
    }

    state.savedPalettes = [
        ...palettes,
    ];

    return true;
}


export function addSavedPalette(palette) {
    if (
        !palette ||
        typeof palette !== "object" ||
        Array.isArray(palette)
    ) {
        return false;
    }

    state.savedPalettes = [
        ...state.savedPalettes,
        palette,
    ];

    return true;
}


export function removeSavedPalette(paletteId) {
    if (
        paletteId === null ||
        paletteId === undefined
    ) {
        return false;
    }

    const previousLength =
        state.savedPalettes.length;

    state.savedPalettes =
        state.savedPalettes.filter(
            (palette) =>
                String(palette.id) !==
                String(paletteId),
        );

    return (
        state.savedPalettes.length !==
        previousLength
    );
}


export function getSavedPaletteById(paletteId) {
    if (
        paletteId === null ||
        paletteId === undefined
    ) {
        return null;
    }

    return (
        state.savedPalettes.find(
            (palette) =>
                String(palette.id) ===
                String(paletteId),
        ) || null
    );
}


/* =========================================================
   Contrast State
   ========================================================= */

export function getContrastState() {
    return state.contrast;
}


export function setContrastState(updates) {
    if (
        !updates ||
        typeof updates !== "object" ||
        Array.isArray(updates)
    ) {
        return false;
    }

    state.contrast = {
        ...state.contrast,
        ...updates,
    };

    return true;
}


export function setContrastColors(
    foreground,
    background,
) {
    let changed = false;

    if (
        typeof foreground === "string" &&
        foreground.trim()
    ) {
        state.contrast.foreground =
            foreground.trim();

        changed = true;
    }

    if (
        typeof background === "string" &&
        background.trim()
    ) {
        state.contrast.background =
            background.trim();

        changed = true;
    }

    return changed;
}


export function setContrastForeground(
    foreground,
) {
    if (
        typeof foreground !== "string" ||
        !foreground.trim()
    ) {
        return false;
    }

    state.contrast.foreground =
        foreground.trim();

    return true;
}


export function setContrastBackground(
    background,
) {
    if (
        typeof background !== "string" ||
        !background.trim()
    ) {
        return false;
    }

    state.contrast.background =
        background.trim();

    return true;
}


export function setContrastResult(
    ratio,
    level,
) {
    if (
        typeof ratio === "number" &&
        Number.isFinite(ratio)
    ) {
        state.contrast.ratio = ratio;
    }

    if (
        typeof level === "string" &&
        level.trim()
    ) {
        state.contrast.level =
            level.trim();
    }
}


/* =========================================================
   Color Format
   ========================================================= */

export function getColorFormat() {
    return state.color.format;
}


export function setColorFormat(format) {
    if (
        typeof format !== "string" ||
        !format.trim()
    ) {
        return false;
    }

    state.color.format =
        format.trim();

    return true;
}


/* =========================================================
   UI State
   ========================================================= */

export function getUIState() {
    return state.ui;
}


export function setUIState(updates) {
    if (
        !updates ||
        typeof updates !== "object" ||
        Array.isArray(updates)
    ) {
        return false;
    }

    state.ui = {
        ...state.ui,
        ...updates,
    };

    return true;
}


/* =========================================================
   Active Module
   ========================================================= */

export function getActiveModule() {
    return state.ui.activeModule;
}


export function setActiveModule(moduleName) {
    if (
        typeof moduleName !== "string" ||
        !moduleName.trim()
    ) {
        return false;
    }

    state.ui.activeModule =
        moduleName.trim();

    return true;
}


/* =========================================================
   Generating State
   ========================================================= */

export function isGenerating() {
    return state.ui.isGenerating;
}


export function setGenerating(
    isGenerating,
) {
    state.ui.isGenerating =
        Boolean(isGenerating);
}


/* =========================================================
   Saving State
   ========================================================= */

export function isSaving() {
    return state.ui.isSaving;
}


export function setSaving(isSaving) {
    state.ui.isSaving =
        Boolean(isSaving);
}


/* =========================================================
   Selected Color
   ========================================================= */

export function getSelectedColorIndex() {
    return state.ui.selectedColorIndex;
}


export function setSelectedColorIndex(index) {
    if (index === null) {
        state.ui.selectedColorIndex =
            null;

        return true;
    }

    if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= state.palette.colors.length
    ) {
        return false;
    }

    state.ui.selectedColorIndex =
        index;

    return true;
}


/* =========================================================
   Palette Reset
   ========================================================= */

/*
 * Resets the current palette settings without
 * deleting saved palettes.
 *
 * This is useful for the Reset button in the HTML.
 */
export function resetPaletteState() {
    state.palette = {
        colors: [],

        locked: [],

        baseColor:
            DEFAULT_BASE_COLOR,

        type:
            DEFAULT_PALETTE_TYPE,

        size:
            PALETTE_SIZE,
    };

    state.ui.selectedColorIndex =
        null;

    state.ui.isGenerating =
        false;

    return state.palette;
}


/* =========================================================
   Contrast Reset
   ========================================================= */

export function resetContrastState() {
    state.contrast = {
        foreground:
            DEFAULT_CONTRAST_COLORS.FOREGROUND,

        background:
            DEFAULT_CONTRAST_COLORS.BACKGROUND,

        ratio: 0,

        level: "fail",
    };

    return state.contrast;
}


/* =========================================================
   Complete State Reset
   ========================================================= */

export function resetState() {
    state = createInitialState();

    return getState();
}