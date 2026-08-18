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
  setGenerating,
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
  generateNewPalette,
  randomizeUnlockedColors,
  resetPalette,
  updateBaseColor,
  updatePaletteType,
  updatePaletteSize,
  toggleColorLock,
  getCurrentPalette,
  setCurrentPalette,
} from "./scripts/modules/palette/manager.js";

import {
  isValidHex,
  normalizeHex,
  hexToRgb,
  hexToHsl,
  getBestTextColor,
} from "./scripts/modules/palette/colorUtils.js";

import { getContrastResults } from "./scripts/modules/contrast/contrastChecker.js";

import {
  initializeToastUI,
  showSuccessToast,
  showErrorToast,
} from "./scripts/ui/toastUI.js";

import { dom } from "./scripts/ui/dom.js";
import { initializeContrastUI } from "./scripts/ui/contrastUI.js";

/* =========================================================
   Runtime State
   ========================================================= */

let saveModal = null;
let statusTimer = null;

/* =========================================================
   Initialization
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

  bindEvents();

  loadPersistedSettings();

  loadSavedPalettes();

  initializePalette();

  renderPalette();

  renderSavedPalettes();

  initializeContrastUI();

  setStatus("Ready to generate a palette.");
}

/* =========================================================
   Current Year
   ========================================================= */

function initializeYear() {
  if (!dom.currentYear) {
    return;
  }

  dom.currentYear.textContent =
    String(new Date().getFullYear());
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
   Event Binding
   ========================================================= */

function bindEvents() {
  /* -------------------------------------------------------
     Brand
     ------------------------------------------------------- */

  dom.brandLink?.addEventListener(
    "click",
    handleBrandClick,
  );

  /* -------------------------------------------------------
     Palette Generation
     ------------------------------------------------------- */

  dom.generatePaletteButton?.addEventListener(
    "click",
    handleGenerate,
  );

  dom.randomizePaletteButton?.addEventListener(
    "click",
    handleRandomize,
  );

  dom.paletteTypeSelect?.addEventListener(
    "change",
    handlePaletteTypeChange,
  );

  dom.colorCountSelect?.addEventListener(
    "change",
    handlePaletteSizeChange,
  );

  /* -------------------------------------------------------
     Base Color
     ------------------------------------------------------- */

  dom.baseColorInput?.addEventListener(
    "change",
    handleBaseColorChange,
  );

  dom.baseColorInput?.addEventListener(
    "keydown",
    handleBaseColorKeydown,
  );

  dom.baseColorPicker?.addEventListener(
    "input",
    handleBaseColorPickerChange,
  );

  /* -------------------------------------------------------
     Palette
     ------------------------------------------------------- */

  dom.currentPalette?.addEventListener(
    "click",
    handlePaletteAction,
  );

  dom.clearPaletteButton?.addEventListener(
    "click",
    handleReset,
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

  dom.swapContrastColorsButton?.addEventListener(
    "click",
    swapContrastColors,
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
   Palette Settings
   ========================================================= */

function loadPersistedSettings() {
  const settings = getSettings();

  const baseColor =
    isValidHex(settings?.baseColor)
      ? normalizeHex(settings.baseColor)
      : DEFAULT_BASE_COLOR;

  const paletteType =
    Object.values(PALETTE_TYPES).includes(
      settings?.paletteType,
    )
      ? settings.paletteType
      : DEFAULT_PALETTE_TYPE;

  const size = normalizeUiSize(
    settings?.paletteSize ?? PALETTE_SIZE,
  );

  syncPaletteControls(
    baseColor,
    paletteType,
    size,
  );

  updateManagerStateWithoutGenerating(
    baseColor,
    paletteType,
    size,
  );
}

function updateManagerStateWithoutGenerating(
  baseColor,
  paletteType,
  size,
) {
  updateBaseColor(baseColor);
  updatePaletteType(paletteType);
  updatePaletteSize(size);
}

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
  const state = getPaletteState();

  const baseColor =
    normalizeHex(state?.baseColor) ||
    DEFAULT_BASE_COLOR;

  const paletteType =
    Object.values(PALETTE_TYPES).includes(
      state?.type,
    )
      ? state.type
      : DEFAULT_PALETTE_TYPE;

  const size = normalizeUiSize(
    state?.size,
  );

  syncPaletteControls(
    baseColor,
    paletteType,
    size,
  );
}

/* =========================================================
   Palette Generation
   ========================================================= */

function handleGenerate() {
  const baseColor =
    readBaseColorFromControls();

  if (!baseColor) {
    showErrorToast(
      MESSAGES.INVALID_COLOR ||
        "Please enter a valid HEX color.",
    );

    dom.baseColorInput?.focus();

    return;
  }

  const paletteType =
    dom.paletteTypeSelect?.value ||
    DEFAULT_PALETTE_TYPE;

  const size = normalizeUiSize(
    dom.colorCountSelect?.value,
  );

  setGenerating(true);

  setButtonBusy(
    dom.generatePaletteButton,
    true,
    "Generating...",
  );

  window.setTimeout(() => {
    try {
      const palette = generateNewPalette(
        baseColor,
        paletteType,
        size,
      );

      renderPalette(palette);

      persistCurrentSettings();

      setStatus(
        MESSAGES.PALETTE_GENERATED ||
          "Palette generated.",
      );
    } catch (error) {
      console.error(
        "Color Studio: palette generation failed.",
        error,
      );

      showErrorToast(
        MESSAGES.PALETTE_GENERATION_ERROR ||
          "Unable to generate palette.",
      );
    } finally {
      setGenerating(false);

      setButtonBusy(
        dom.generatePaletteButton,
        false,
        "Generate Palette",
      );
    }
  }, 0);
}

function handleRandomize() {
  try {
    const palette =
      randomizeUnlockedColors();

    renderPalette(palette);

    persistCurrentSettings();

    setStatus("Unlocked colors randomized.");
  } catch (error) {
    console.error(
      "Color Studio: randomization failed.",
      error,
    );

    showErrorToast(
      "Unable to randomize the palette.",
    );
  }
}

function handlePaletteTypeChange() {
  const paletteType =
    dom.paletteTypeSelect?.value;

  if (!updatePaletteType(paletteType)) {
    return;
  }

  persistCurrentSettings();

  generateFromControls();
}

function handlePaletteSizeChange() {
  const size = normalizeUiSize(
    dom.colorCountSelect?.value,
  );

  if (!updatePaletteSize(size)) {
    return;
  }

  persistCurrentSettings();

  generateFromControls();
}

function handleBaseColorChange() {
  const baseColor =
    readBaseColorFromControls();

  if (!baseColor) {
    dom.baseColorInput?.classList.add(
      "is-invalid",
    );

    showErrorToast(
      MESSAGES.INVALID_COLOR ||
        "Please enter a valid HEX color.",
    );

    return;
  }

  dom.baseColorInput?.classList.remove(
    "is-invalid",
  );

  if (!updateBaseColor(baseColor)) {
    showErrorToast(
      MESSAGES.INVALID_COLOR ||
        "Please enter a valid HEX color.",
    );

    return;
  }

  syncBaseColorControls(baseColor);

  persistCurrentSettings();

  generateFromControls();
}

function handleBaseColorKeydown(event) {
  if (event.key !== "Enter") {
    return;
  }

  event.preventDefault();

  handleBaseColorChange();
}

function handleBaseColorPickerChange(event) {
  const baseColor =
    normalizeHex(event.target.value);

  if (!baseColor) {
    return;
  }

  if (!updateBaseColor(baseColor)) {
    return;
  }

  syncBaseColorControls(baseColor);

  persistCurrentSettings();

  generateFromControls();
}

function generateFromControls() {
  const baseColor =
    readBaseColorFromControls();

  if (!baseColor) {
    return;
  }

  const palette =
    generateNewPalette(
      baseColor,
      dom.paletteTypeSelect?.value ||
        DEFAULT_PALETTE_TYPE,
      normalizeUiSize(
        dom.colorCountSelect?.value,
      ),
    );

  renderPalette(palette);

  setStatus(
    MESSAGES.PALETTE_GENERATED ||
      "Palette generated.",
  );
}

/* =========================================================
   Reset Palette
   ========================================================= */

function handleReset() {
  const palette = resetPalette();

  syncPaletteControlsFromState();

  renderPalette(palette);

  persistCurrentSettings();

  setStatus(
    MESSAGES.PALETTE_RESET ||
      "Palette reset.",
  );

  showSuccessToast(
    MESSAGES.PALETTE_RESET ||
      "Palette reset.",
  );
}

/* =========================================================
   Render Current Palette
   ========================================================= */

function renderPalette(
  palette = getCurrentPalette(),
) {
  if (!dom.currentPalette) {
    return;
  }

  dom.currentPalette.replaceChildren();

  if (
    !palette ||
    !Array.isArray(palette.colors) ||
    palette.colors.length === 0
  ) {
    dom.currentPalette.innerHTML = `
      <div class="alert alert-light border w-100 mb-0">
        No colors in the current palette.
      </div>
    `;

    return;
  }

  palette.colors.forEach(
    (color, index) => {
      dom.currentPalette.append(
        createColorCard(
          color,
          index,
          Boolean(palette.locked?.[index]),
        ),
      );
    },
  );
}

/* =========================================================
   Color Card
   ========================================================= */

function createColorCard(
  color,
  index,
  locked,
) {
  const card =
    document.createElement("article");

  const textColor =
    getBestTextColor(color);

  const rgb = hexToRgb(color);
  const hsl = hexToHsl(color);

  card.className =
    "color-studio-card";

  card.dataset.index =
    String(index);

  card.style.cssText = `
    position: relative;
    min-height: 250px;
    flex: 1 1 180px;
    overflow: hidden;
    border-radius: 16px;
    background: ${color};
    color: ${textColor};
    box-shadow: 0 8px 24px rgba(0,0,0,.08);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  `;

  const details =
    document.createElement("div");

  details.style.cssText =
    "padding:20px;display:flex;flex-direction:column;gap:8px;";

  const indexLabel =
    document.createElement("span");

  indexLabel.textContent =
    `Color ${index + 1}`;

  indexLabel.style.cssText =
    "font-size:.75rem;font-weight:700;text-transform:uppercase;opacity:.75;";

  const hexButton =
    document.createElement("button");

  hexButton.type = "button";
  hexButton.dataset.action = "copy";
  hexButton.dataset.index =
    String(index);
  hexButton.textContent = color;
  hexButton.className =
    "btn btn-link p-0 text-start";

  hexButton.style.cssText = `
    color:${textColor};
    font-size:1.35rem;
    font-weight:700;
    text-decoration:none;
  `;

  const values =
    document.createElement("small");

  values.textContent =
    rgb && hsl
      ? `RGB ${rgb.r}, ${rgb.g}, ${rgb.b} • HSL ${hsl.h}°, ${hsl.s}%, ${hsl.l}%`
      : color;

  values.style.opacity = ".8";

  details.append(
    indexLabel,
    hexButton,
    values,
  );

  const actions =
    document.createElement("div");

  actions.style.cssText =
    "display:flex;gap:8px;padding:16px 20px;background:rgba(0,0,0,.08);";

  const lockButton =
    document.createElement("button");

  lockButton.type = "button";
  lockButton.dataset.action = "lock";
  lockButton.dataset.index =
    String(index);

  lockButton.className =
    "btn btn-sm";

  lockButton.title =
    locked
      ? "Unlock color"
      : "Lock color";

  lockButton.innerHTML = `
    <i class="fa-solid ${
      locked
        ? "fa-lock"
        : "fa-lock-open"
    } me-1"></i>
    ${locked ? "Locked" : "Lock"}
  `;

  lockButton.style.cssText = `
    color:${textColor};
    border:1px solid rgba(255,255,255,.45);
    background:rgba(0,0,0,.12);
  `;

  const contrastButton =
    document.createElement("button");

  contrastButton.type = "button";
  contrastButton.dataset.action =
    "contrast";
  contrastButton.dataset.index =
    String(index);

  contrastButton.className =
    "btn btn-sm";

  contrastButton.innerHTML =
    '<i class="fa-solid fa-circle-half-stroke me-1"></i> Contrast';

  contrastButton.style.cssText = `
    color:${textColor};
    border:1px solid rgba(255,255,255,.45);
    background:rgba(0,0,0,.12);
  `;

  actions.append(
    lockButton,
    contrastButton,
  );

  card.append(
    details,
    actions,
  );

  return card;
}

/* =========================================================
   Palette Actions
   ========================================================= */

async function handlePaletteAction(event) {
  const actionElement =
    event.target.closest(
      "[data-action]",
    );

  if (!actionElement) {
    return;
  }

  const index = Number(
    actionElement.dataset.index,
  );

  if (!Number.isInteger(index)) {
    return;
  }

  const palette =
    getCurrentPalette();

  const color =
    palette?.colors?.[index];

  if (!color) {
    return;
  }

  setSelectedColorIndex(index);

  const action =
    actionElement.dataset.action;

  if (action === "copy") {
    const copied =
      await copyText(color);

    if (copied) {
      showSuccessToast(
        MESSAGES.COLOR_COPIED ||
          `${color} copied to clipboard.`,
      );

      setStatus(
        `${color} copied to clipboard.`,
      );
    } else {
      showErrorToast(
        MESSAGES.COPY_ERROR ||
          "Unable to copy color.",
      );
    }

    return;
  }

  if (action === "lock") {
    const locked =
      toggleColorLock(index);

    renderPalette(
      getCurrentPalette(),
    );

    showSuccessToast(
      locked
        ? MESSAGES.COLOR_LOCKED ||
          "Color locked."
        : MESSAGES.COLOR_UNLOCKED ||
          "Color unlocked.",
    );

    return;
  }

  if (action === "contrast") {
    setContrastBackground(color);

    dom.contrastChecker?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

/* =========================================================
   Save Palette Modal
   ========================================================= */

function openSaveModal() {
  const palette =
    getCurrentPalette();

  if (
    !palette ||
    !Array.isArray(palette.colors) ||
    palette.colors.length === 0
  ) {
    showErrorToast(
      "There is no palette to save.",
    );

    return;
  }

  clearPaletteNameError();

  if (dom.paletteNameInput) {
    dom.paletteNameInput.value = "";
  }

  if (saveModal) {
    saveModal.show();

    window.setTimeout(() => {
      dom.paletteNameInput?.focus();
    }, 150);

    return;
  }

  dom.paletteNameInput?.focus();
}

function handlePaletteNameKeydown(event) {
  if (event.key !== "Enter") {
    return;
  }

  event.preventDefault();

  handleConfirmSave();
}

function handleConfirmSave() {
  const name =
    dom.paletteNameInput?.value
      ?.trim() || "";

  if (!name) {
    showPaletteNameError();

    return;
  }

  const palette =
    getCurrentPalette();

  if (
    !palette ||
    !Array.isArray(palette.colors) ||
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
        colors: palette.colors,
        locked: palette.locked,
        baseColor: palette.baseColor,
        type: palette.type,
        size: palette.size,
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
   Saved Palettes
   ========================================================= */

function loadSavedPalettes() {
  const palettes =
    getStoredPalettes();

  setSavedPalettes(palettes);

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
        createSavedPaletteCard(palette),
      );
    },
  );
}

function createSavedPaletteCard(
  palette,
) {
  const item =
    document.createElement("article");

  item.className =
    "border rounded-3 p-3 mb-3";

  item.dataset.paletteId =
    String(palette.id);

  const titleRow =
    document.createElement("div");

  titleRow.className =
    "d-flex align-items-center justify-content-between gap-2 mb-2";

  const title =
    document.createElement("strong");

  title.textContent =
    palette.name ||
    "Unnamed palette";

  const date =
    document.createElement("small");

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
    document.createElement("div");

  swatches.className =
    "d-flex rounded overflow-hidden mb-3";

  swatches.style.height =
    "48px";

  const colors =
    Array.isArray(palette.colors)
      ? palette.colors
      : [];

  colors.forEach(
    (color) => {
      const swatch =
        document.createElement("span");

      swatch.title = color;

      swatch.style.cssText =
        `flex:1;background:${color};min-width:0;`;

      swatches.append(swatch);
    },
  );

  const actions =
    document.createElement("div");

  actions.className =
    "d-flex gap-2";

  const loadButton =
    document.createElement("button");

  loadButton.type = "button";
  loadButton.className =
    "btn btn-sm btn-primary flex-grow-1";
  loadButton.dataset.action =
    "load";
  loadButton.dataset.id =
    String(palette.id);

  loadButton.innerHTML =
    '<i class="fa-solid fa-arrow-rotate-left me-1"></i> Load';

  const deleteButton =
    document.createElement("button");

  deleteButton.type = "button";
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

function handleSavedPaletteAction(event) {
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
    loadSavedPalette(palette);

    return;
  }

  if (action === "delete") {
    deleteSavedPalette(id);
  }
}

function loadSavedPalette(
  palette,
) {
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

  updateBaseColor(
    palette.baseColor ||
      DEFAULT_BASE_COLOR,
  );

  updatePaletteType(
    palette.type ||
      DEFAULT_PALETTE_TYPE,
  );

  updatePaletteSize(
    normalizeUiSize(
      palette.size ||
        palette.colors?.length ||
        PALETTE_SIZE,
    ),
  );

  syncPaletteControlsFromState();

  renderPalette(
    getCurrentPalette(),
  );

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

function deleteSavedPalette(id) {
  const deleted =
    removeStoredPalette(id);

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
   Settings
   ========================================================= */

function persistCurrentSettings() {
  const state =
    getPaletteState();

  saveSettings({
    baseColor: state.baseColor,
    paletteType: state.type,
    paletteSize: state.size,
  });
}

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

function updateContrastSide(
  side,
  value,
) {
  const normalized =
    normalizeHex(value);

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
    [side]: normalized,
  };

  setContrastColors(
    next.foreground,
    next.background,
  );

  setContrastState(next);

  syncContrastControls(
    next.foreground,
    next.background,
  );

  initializeContrastUI();
}

function setContrastBackground(
  color,
) {
  const normalized =
    normalizeHex(color);

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
    background: normalized,
  });

  syncContrastControls(
    foreground,
    normalized,
  );

  initializeContrastUI();
}

function swapContrastColors() {
  const current =
    getContrastValues();

  const foreground =
    current.background;

  const background =
    current.foreground;

  setContrastColors(
    foreground,
    background,
  );

  setContrastState({
    foreground,
    background,
  });

  syncContrastControls(
    foreground,
    background,
  );

  initializeContrastUI();

  showSuccessToast(
    "Foreground and background swapped.",
  );
}

function getContrastValues() {
  return {
    foreground:
      normalizeHex(
        dom.foregroundHexInput?.value,
      ) || "#FFFFFF",

    background:
      normalizeHex(
        dom.backgroundHexInput?.value,
      ) || DEFAULT_BASE_COLOR,
  };
}

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

function updateResultCard(
  card,
  statusElement,
  levelElement,
  status,
  description,
) {
  if (
    !card ||
    !statusElement ||
    !levelElement
  ) {
    return;
  }

  const normalized =
    typeof status === "string"
      ? status.toLowerCase()
      : "";

  const passed =
    normalized === "pass" ||
    normalized === "aa" ||
    normalized === "aaa" ||
    status === true;

  const isAAA =
    normalized === "aaa";

  const isAA =
    normalized === "aa";

  statusElement.textContent =
    !passed
      ? "Fail"
      : isAAA
        ? "AAA"
        : isAA
          ? "AA"
          : "Pass";

  levelElement.textContent =
    description;

  statusElement.classList.remove(
    "text-success",
    "text-warning",
    "text-danger",
  );

  statusElement.classList.add(
    passed
      ? "text-success"
      : "text-danger",
  );

  card.classList.toggle(
    "is-pass",
    passed,
  );

  card.classList.toggle(
    "is-fail",
    !passed,
  );
}

/* =========================================================
   Utility
   ========================================================= */

function readBaseColorFromControls() {
  const value =
    dom.baseColorInput?.value
      ?.trim();

  return normalizeHex(value);
}

function syncBaseColorControls(
  color,
) {
  if (dom.baseColorInput) {
    dom.baseColorInput.value =
      color;
  }

  if (dom.baseColorPicker) {
    dom.baseColorPicker.value =
      color;
  }
}

function normalizeUiSize(value) {
  const numeric =
    Number(value);

  if (!Number.isFinite(numeric)) {
    return PALETTE_SIZE;
  }

  return Math.max(
    MIN_PALETTE_SIZE,
    Math.min(
      MAX_PALETTE_SIZE,
      Math.floor(numeric),
    ),
  );
}

/* =========================================================
   Status
   ========================================================= */

function setStatus(message) {
  if (!dom.paletteStatus) {
    return;
  }

  window.clearTimeout(
    statusTimer,
  );

  dom.paletteStatus.textContent =
    message;

  statusTimer = window.setTimeout(
    () => {
      dom.paletteStatus.textContent =
        "Ready to generate a palette.";
    },
    3500,
  );
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
   Palette Name Validation
   ========================================================= */

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

  button.disabled = busy;

  if (busy) {
    if (!button.dataset.originalHtml) {
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

  if (button.dataset.originalHtml) {
    button.innerHTML =
      button.dataset.originalHtml;

    delete button.dataset.originalHtml;
  }
}

/* =========================================================
   Date Formatting
   ========================================================= */

function formatSavedDate(value) {
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

/* =========================================================
   Clipboard
   ========================================================= */

async function copyText(value) {
  try {
    if (
      navigator.clipboard?.writeText
    ) {
      await navigator.clipboard.writeText(
        value,
      );

      return true;
    }

    const textarea =
      document.createElement(
        "textarea",
      );

    textarea.value = value;

    textarea.style.position =
      "fixed";

    textarea.style.opacity =
      "0";

    document.body.appendChild(
      textarea,
    );

    textarea.select();

    const copied =
      document.execCommand("copy");

    textarea.remove();

    return copied;
  } catch (error) {
    console.error(
      "Color Studio: copy failed.",
      error,
    );

    return false;
  }
}