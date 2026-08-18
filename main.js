/* =========================================================
   Color Studio
   Application Entry Point
   ========================================================= */

import {
  DEFAULT_BASE_COLOR,
  DEFAULT_PALETTE_TYPE,
  PALETTE_SIZE,
  MIN_PALETTE_SIZE,
  MAX_PALETTE_SIZE,
  PALETTE_TYPES,
  MESSAGES,
} from "./scripts/core/constants.js";

import {
  initializeState,
  getPaletteState,
  setSavedPalettes,
  setContrastColors,
  setContrastState,
  setSelectedColorIndex,
  setSaving,
} from "./scripts/core/state.js";

import {
  getSavedPalettes as getStoredPalettes,
  savePalette as persistPalette,
  deletePalette as removeStoredPalette,
  getSettings,
  saveSettings,
} from "./scripts/core/storage.js";

import {
  initializePalette,
  getCurrentPalette,
  setCurrentPalette,
  updateBaseColor,
  updatePaletteType,
  updatePaletteSize,
} from "./scripts/modules/palette/manager.js";

import {
  isValidHex,
  normalizeHex,
} from "./scripts/modules/palette/colorUtils.js";

import {
  initializeToastUI,
  showSuccessToast,
  showErrorToast,
} from "./scripts/ui/toastUI.js";

import { dom } from "./scripts/ui/dom.js";

import {
  initializeContrastUI,
} from "./scripts/ui/contrastUI.js";

import {
  initializePaletteUI,
} from "./scripts/ui/paletteUI.js";


/* =========================================================
   Runtime State
   ========================================================= */

let saveModal = null;
let statusTimer = null;


/* =========================================================
   Application Startup
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  initializeApp,
);


function initializeApp() {
  initializeState();

  initializeYear();

  initializeBootstrap();

  initializeToastUI();

  loadPersistedSettings();

  loadSavedPalettes();

  /*
   * Palette UI owns:
   *
   * - palette rendering
   * - palette cards
   * - palette interactions
   * - palette generation controls
   * - copy
   * - lock state
   */
  initializePaletteUI();

  /*
   * Initialize the palette state after settings have
   * been loaded.
   */
  initializePalette();

  /*
   * paletteUI renders the cards.
   * main.js deliberately does NOT render them.
   */

  renderSavedPalettes();

  initializeContrastUI();

  bindApplicationEvents();

  setStatus(
    "Ready to generate a palette.",
  );
}


/* =========================================================
   Current Year
   ========================================================= */

function initializeYear() {
  if (!dom.currentYear) {
    return;
  }

  dom.currentYear.textContent =
    String(
      new Date().getFullYear(),
    );
}


/* =========================================================
   Bootstrap
   ========================================================= */

function initializeBootstrap() {
  if (!window.bootstrap) {
    return;
  }

  if (dom.savePaletteModal) {
    saveModal =
      window.bootstrap.Modal.getOrCreateInstance(
        dom.savePaletteModal,
      );
  }
}


/* =========================================================
   Application Events
   ========================================================= */

function bindApplicationEvents() {
  /*
   * IMPORTANT:
   *
   * Palette events are intentionally NOT registered here.
   *
   * paletteUI.js owns:
   *
   * - generate
   * - randomize
   * - reset
   * - base color
   * - palette type
   * - palette size
   * - palette cards
   * - copy
   * - lock
   *
   * This prevents main.js from rendering the old card design.
   */


  /* -------------------------------------------------------
     Brand
     ------------------------------------------------------- */

  dom.brandLink?.addEventListener(
    "click",
    handleBrandClick,
  );


  /* -------------------------------------------------------
     Save Palette
     ------------------------------------------------------- */

  dom.saveCurrentPaletteButton?.addEventListener(
    "click",
    openSaveModal,
  );

  dom.confirmSavePaletteButton?.addEventListener(
    "click",
    handleConfirmSave,
  );

  dom.paletteNameInput?.addEventListener(
    "keydown",
    handlePaletteNameKeydown,
  );

  dom.paletteNameInput?.addEventListener(
    "input",
    clearPaletteNameError,
  );


  /* -------------------------------------------------------
     Saved Palettes
     ------------------------------------------------------- */

  dom.savedPalettesList?.addEventListener(
    "click",
    handleSavedPaletteAction,
  );


  /* -------------------------------------------------------
     Contrast
     ------------------------------------------------------- */

  bindContrastInput(
    dom.foregroundHexInput,
    dom.foregroundColorPicker,
    "foreground",
  );

  bindContrastInput(
    dom.backgroundHexInput,
    dom.backgroundColorPicker,
    "background",
  );
}


/* =========================================================
   Brand
   ========================================================= */

function handleBrandClick(event) {
  event.preventDefault();

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}


/* =========================================================
   Persisted Settings
   ========================================================= */

function loadPersistedSettings() {
  const settings =
    getSettings();


  const baseColor =
    isValidHex(
      settings?.baseColor,
    )
      ? (
          normalizeHex(
            settings.baseColor,
          ) ||
          DEFAULT_BASE_COLOR
        )
      : DEFAULT_BASE_COLOR;


  const paletteType =
    Object.values(
      PALETTE_TYPES,
    ).includes(
      settings?.paletteType,
    )
      ? settings.paletteType
      : DEFAULT_PALETTE_TYPE;


  const size =
    normalizeUiSize(
      settings?.paletteSize ??
        PALETTE_SIZE,
    );


  /*
   * Put persisted settings into the palette manager.
   *
   * paletteUI will synchronize the controls when it renders.
   */
  updateBaseColor(
    baseColor,
  );

  updatePaletteType(
    paletteType,
  );

  updatePaletteSize(
    size,
  );


  syncPaletteControls(
    baseColor,
    paletteType,
    size,
  );


  return {
    baseColor,
    paletteType,
    size,
  };
}


/* =========================================================
   Palette Controls
   ========================================================= */

function syncPaletteControls(
  baseColor,
  paletteType,
  size,
) {
  if (dom.baseColorInput) {
    dom.baseColorInput.value =
      baseColor;
  }

  if (dom.baseColorPicker) {
    dom.baseColorPicker.value =
      baseColor;
  }

  if (dom.paletteTypeSelect) {
    dom.paletteTypeSelect.value =
      paletteType;
  }

  if (dom.colorCountSelect) {
    dom.colorCountSelect.value =
      String(size);
  }
}


function syncPaletteControlsFromState() {
  const state =
    getPaletteState();


  const baseColor =
    normalizeHex(
      state?.baseColor,
    ) ||
    DEFAULT_BASE_COLOR;


  const paletteType =
    Object.values(
      PALETTE_TYPES,
    ).includes(
      state?.type,
    )
      ? state.type
      : DEFAULT_PALETTE_TYPE;


  const size =
    normalizeUiSize(
      state?.size,
    );


  syncPaletteControls(
    baseColor,
    paletteType,
    size,
  );
}


/* =========================================================
   Saved Palettes
   ========================================================= */

function loadSavedPalettes() {
  const palettes =
    getStoredPalettes();


  setSavedPalettes(
    palettes,
  );


  updateSavedPaletteCount(
    palettes.length,
  );
}


function renderSavedPalettes() {
  if (!dom.savedPalettesList) {
    return;
  }


  const palettes =
    getStoredPalettes();


  dom.savedPalettesList.replaceChildren();


  if (palettes.length === 0) {
    if (dom.savedPalettesEmptyState) {
      dom.savedPalettesEmptyState.hidden =
        false;
    }

    return;
  }


  if (dom.savedPalettesEmptyState) {
    dom.savedPalettesEmptyState.hidden =
      true;
  }


  palettes.forEach(
    (palette) => {
      dom.savedPalettesList.append(
        createSavedPaletteCard(
          palette,
        ),
      );
    },
  );
}


/* =========================================================
   Saved Palette Card
   ========================================================= */

function createSavedPaletteCard(
  palette,
) {
  const item =
    document.createElement(
      "article",
    );


  item.className =
    "border rounded-3 p-3 mb-3";


  item.dataset.paletteId =
    String(palette.id);


  const titleRow =
    document.createElement(
      "div",
    );


  titleRow.className =
    "d-flex align-items-center justify-content-between gap-2 mb-2";


  const title =
    document.createElement(
      "strong",
    );


  title.textContent =
    palette.name ||
    "Unnamed palette";


  const date =
    document.createElement(
      "small",
    );


  date.className =
    "text-secondary";


  date.textContent =
    formatSavedDate(
      palette.updatedAt ||
        palette.createdAt,
    );


  titleRow.append(
    title,
    date,
  );


  const swatches =
    document.createElement(
      "div",
    );


  swatches.className =
    "d-flex rounded overflow-hidden mb-3";


  swatches.style.height =
    "48px";


  const colors =
    Array.isArray(
      palette.colors,
    )
      ? palette.colors
      : [];


  colors.forEach(
    (color) => {
      const swatch =
        document.createElement(
          "span",
        );


      swatch.title =
        color;


      swatch.style.cssText =
        `flex:1;background:${color};min-width:0;`;


      swatches.append(
        swatch,
      );
    },
  );


  const actions =
    document.createElement(
      "div",
    );


  actions.className =
    "d-flex gap-2";


  const loadButton =
    document.createElement(
      "button",
    );


  loadButton.type =
    "button";

  loadButton.className =
    "btn btn-sm btn-primary flex-grow-1";

  loadButton.dataset.action =
    "load";

  loadButton.dataset.id =
    String(palette.id);

  loadButton.innerHTML =
    '<i class="fa-solid fa-arrow-rotate-left me-1"></i> Load';


  const deleteButton =
    document.createElement(
      "button",
    );


  deleteButton.type =
    "button";

  deleteButton.className =
    "btn btn-sm btn-outline-danger";

  deleteButton.dataset.action =
    "delete";

  deleteButton.dataset.id =
    String(palette.id);

  deleteButton.title =
    "Delete palette";

  deleteButton.innerHTML =
    '<i class="fa-solid fa-trash"></i><span class="visually-hidden"> Delete</span>';


  actions.append(
    loadButton,
    deleteButton,
  );


  item.append(
    titleRow,
    swatches,
    actions,
  );


  return item;
}


/* =========================================================
   Saved Palette Actions
   ========================================================= */

function handleSavedPaletteAction(
  event,
) {
  const button =
    event.target.closest(
      "[data-action]",
    );


  if (!button) {
    return;
  }


  const id =
    button.dataset.id;


  if (!id) {
    return;
  }


  const palettes =
    getStoredPalettes();


  const palette =
    palettes.find(
      (item) =>
        String(item.id) ===
        String(id),
    );


  if (!palette) {
    showErrorToast(
      MESSAGES.PALETTE_NOT_FOUND ||
        "Saved palette not found.",
    );

    return;
  }


  const action =
    button.dataset.action;


  if (action === "load") {
    loadSavedPalette(
      palette,
    );

    return;
  }


  if (action === "delete") {
    deleteSavedPalette(
      id,
    );
  }
}


/* =========================================================
   Load Saved Palette
   ========================================================= */

function loadSavedPalette(
  palette,
) {
  if (
    !Array.isArray(
      palette.colors,
    )
  ) {
    showErrorToast(
      MESSAGES.PALETTE_NOT_FOUND ||
        "Unable to load palette.",
    );

    return;
  }


  /*
   * First restore the actual colors and locks.
   *
   * This does NOT render anything itself.
   * paletteUI owns rendering.
   */
  const loaded =
    setCurrentPalette(
      palette.colors,
      palette.locked,
    );


  if (!loaded) {
    showErrorToast(
      MESSAGES.PALETTE_NOT_FOUND ||
        "Unable to load palette.",
    );

    return;
  }


  /*
   * Restore palette metadata.
   */
  updateBaseColor(
    palette.baseColor ||
      DEFAULT_BASE_COLOR,
  );


  updatePaletteType(
    palette.type ||
      DEFAULT_PALETTE_TYPE,
  );


  /*
   * IMPORTANT:
   *
   * Do not call updatePaletteSize() here.
   *
   * updatePaletteSize() regenerates the palette.
   * That would destroy the colors we just loaded.
   *
   * setCurrentPalette() already established the correct
   * palette size.
   */


  syncPaletteControlsFromState();


  /*
   * Ask paletteUI to render the current state using
   * the NEW card design.
   *
   * initializePaletteUI() is safe because it binds events
   * only once.
   */
  initializePaletteUI();


  persistCurrentSettings();


  showSuccessToast(
    MESSAGES.PALETTE_LOADED ||
      "Palette loaded.",
  );


  setStatus(
    `Loaded "${palette.name || "Unnamed palette"}".`,
  );


  closeSavedPalettes();
}


/* =========================================================
   Delete Saved Palette
   ========================================================= */

function deleteSavedPalette(
  id,
) {
  const deleted =
    removeStoredPalette(
      id,
    );


  if (!deleted) {
    showErrorToast(
      MESSAGES.PALETTE_DELETE_ERROR ||
        "Unable to delete palette.",
    );

    return;
  }


  loadSavedPalettes();

  renderSavedPalettes();


  showSuccessToast(
    MESSAGES.PALETTE_DELETED ||
      "Palette deleted.",
  );


  setStatus(
    MESSAGES.PALETTE_DELETED ||
      "Palette deleted.",
  );
}


/* =========================================================
   Close Saved Palettes
   ========================================================= */

function closeSavedPalettes() {
  if (
    !window.bootstrap ||
    !dom.savedPalettesOffcanvas
  ) {
    return;
  }


  window.bootstrap.Offcanvas
    .getOrCreateInstance(
      dom.savedPalettesOffcanvas,
    )
    .hide();
}


/* =========================================================
   Settings Persistence
   ========================================================= */

export function persistCurrentSettings() {
  const state =
    getPaletteState();


  if (!state) {
    return;
  }


  saveSettings({
    baseColor:
      state.baseColor,

    paletteType:
      state.type,

    paletteSize:
      state.size,
  });
}


/* =========================================================
   Contrast Input
   ========================================================= */

function bindContrastInput(
  textInput,
  picker,
  side,
) {
  textInput?.addEventListener(
    "change",
    () => {
      updateContrastSide(
        side,
        textInput.value,
      );
    },
  );


  textInput?.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Enter") {
        return;
      }


      event.preventDefault();


      updateContrastSide(
        side,
        textInput.value,
      );
    },
  );


  picker?.addEventListener(
    "input",
    () => {
      updateContrastSide(
        side,
        picker.value,
      );
    },
  );
}


/* =========================================================
   Contrast State
   ========================================================= */

function updateContrastSide(
  side,
  value,
) {
  const normalized =
    normalizeHex(
      value,
    );


  if (!normalized) {
    showErrorToast(
      MESSAGES.INVALID_COLOR ||
        "Please enter a valid HEX color.",
    );

    return;
  }


  const current =
    getContrastValues();


  const next = {
    ...current,
    [side]:
      normalized,
  };


  setContrastColors(
    next.foreground,
    next.background,
  );


  setContrastState(
    next,
  );


  syncContrastControls(
    next.foreground,
    next.background,
  );


  initializeContrastUI();
}


/* =========================================================
   Set Contrast Background
   ========================================================= */

export function setContrastBackground(
  color,
) {
  const normalized =
    normalizeHex(
      color,
    );


  if (!normalized) {
    return;
  }


  const current =
    getContrastValues();


  const foreground =
    current.foreground;


  setContrastColors(
    foreground,
    normalized,
  );


  setContrastState({
    foreground,
    background:
      normalized,
  });


  syncContrastControls(
    foreground,
    normalized,
  );


  initializeContrastUI();
}


/* =========================================================
   Contrast Values
   ========================================================= */

function getContrastValues() {
  return {
    foreground:
      normalizeHex(
        dom.foregroundHexInput?.value,
      ) ||
      "#FFFFFF",

    background:
      normalizeHex(
        dom.backgroundHexInput?.value,
      ) ||
      DEFAULT_BASE_COLOR,
  };
}


/* =========================================================
   Contrast Controls
   ========================================================= */

function syncContrastControls(
  foreground,
  background,
) {
  if (dom.foregroundHexInput) {
    dom.foregroundHexInput.value =
      foreground;
  }


  if (dom.foregroundColorPicker) {
    dom.foregroundColorPicker.value =
      foreground;
  }


  if (dom.backgroundHexInput) {
    dom.backgroundHexInput.value =
      background;
  }


  if (dom.backgroundColorPicker) {
    dom.backgroundColorPicker.value =
      background;
  }
}


/* =========================================================
   Saved Palette Count
   ========================================================= */

function updateSavedPaletteCount(
  count,
) {
  if (!dom.savedPalettesCount) {
    return;
  }


  dom.savedPalettesCount.textContent =
    String(count);
}


/* =========================================================
   Palette Name
   ========================================================= */

function handlePaletteNameKeydown(
  event,
) {
  if (event.key !== "Enter") {
    return;
  }


  event.preventDefault();


  handleConfirmSave();
}


function showPaletteNameError() {
  dom.paletteNameInput?.classList.add(
    "is-invalid",
  );


  dom.paletteNameError?.classList.add(
    "d-block",
  );


  dom.paletteNameInput?.focus();
}


function clearPaletteNameError() {
  dom.paletteNameInput?.classList.remove(
    "is-invalid",
  );


  dom.paletteNameError?.classList.remove(
    "d-block",
  );
}


/* =========================================================
   Save Palette Modal
   ========================================================= */

function openSaveModal() {
  const palette =
    getCurrentPalette();


  if (
    !palette ||
    !Array.isArray(
      palette.colors,
    ) ||
    palette.colors.length === 0
  ) {
    showErrorToast(
      "There is no palette to save.",
    );

    return;
  }


  clearPaletteNameError();


  if (dom.paletteNameInput) {
    dom.paletteNameInput.value =
      "";
  }


  if (saveModal) {
    saveModal.show();


    window.setTimeout(
      () => {
        dom.paletteNameInput?.focus();
      },
      150,
    );


    return;
  }


  dom.paletteNameInput?.focus();
}


/* =========================================================
   Confirm Save
   ========================================================= */

function handleConfirmSave() {
  const name =
    dom.paletteNameInput?.value
      ?.trim() ||
    "";


  if (!name) {
    showPaletteNameError();

    return;
  }


  const palette =
    getCurrentPalette();


  if (
    !palette ||
    !Array.isArray(
      palette.colors,
    ) ||
    palette.colors.length === 0
  ) {
    showErrorToast(
      "There is no palette to save.",
    );

    return;
  }


  setSaving(true);


  setButtonBusy(
    dom.confirmSavePaletteButton,
    true,
    "Saving...",
  );


  try {
    const saved =
      persistPalette({
        name,

        colors:
          palette.colors,

        locked:
          palette.locked,

        baseColor:
          palette.baseColor,

        type:
          palette.type,

        size:
          palette.size,
      });


    if (!saved) {
      showErrorToast(
        MESSAGES.PALETTE_SAVE_ERROR ||
          "Unable to save palette.",
      );

      return;
    }


    loadSavedPalettes();

    renderSavedPalettes();


    saveModal?.hide();


    showSuccessToast(
      MESSAGES.PALETTE_SAVED ||
        "Palette saved.",
    );


    setStatus(
      `Saved "${name}".`,
    );
  } finally {
    setSaving(false);


    setButtonBusy(
      dom.confirmSavePaletteButton,
      false,
      "Save Palette",
    );
  }
}


/* =========================================================
   Button State
   ========================================================= */

function setButtonBusy(
  button,
  busy,
  label,
) {
  if (!button) {
    return;
  }


  button.disabled =
    busy;


  if (busy) {
    if (
      !button.dataset.originalHtml
    ) {
      button.dataset.originalHtml =
        button.innerHTML;
    }


    button.innerHTML = `
      <span
        class="spinner-border spinner-border-sm me-2"
        aria-hidden="true"
      ></span>
      ${label}
    `;


    return;
  }


  if (
    button.dataset.originalHtml
  ) {
    button.innerHTML =
      button.dataset.originalHtml;


    delete button.dataset.originalHtml;
  }
}


/* =========================================================
   Normalize UI Size
   ========================================================= */

function normalizeUiSize(
  value,
) {
  const numeric =
    Number(value);


  if (
    !Number.isFinite(
      numeric,
    )
  ) {
    return PALETTE_SIZE;
  }


  return Math.max(
    MIN_PALETTE_SIZE,
    Math.min(
      MAX_PALETTE_SIZE,
      Math.floor(
        numeric,
      ),
    ),
  );
}


/* =========================================================
   Status
   ========================================================= */

function setStatus(
  message,
) {
  if (!dom.paletteStatus) {
    return;
  }


  window.clearTimeout(
    statusTimer,
  );


  dom.paletteStatus.textContent =
    message;


  statusTimer =
    window.setTimeout(
      () => {
        if (dom.paletteStatus) {
          dom.paletteStatus.textContent =
            "Ready to generate a palette.";
        }
      },
      3500,
    );
}


/* =========================================================
   Date Formatting
   ========================================================= */

function formatSavedDate(
  value,
) {
  if (!value) {
    return "";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }


  return new Intl.DateTimeFormat(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(date);
}