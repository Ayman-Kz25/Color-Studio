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

import { elements } from "./scripts/ui/dom.js";
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

  initializeContrast();

  updateContrastUI();

  setStatus("Ready to generate a palette.");
}

/* =========================================================
   Current Year
   ========================================================= */

function initializeYear() {
  if (!elements.currentYear) {
    return;
  }

  elements.currentYear.textContent =
    String(new Date().getFullYear());
}

/* =========================================================
   Bootstrap
   ========================================================= */

function initializeBootstrap() {
  if (!window.bootstrap) {
    return;
  }

  if (elements.savePaletteModal) {
    saveModal =
      window.bootstrap.Modal.getOrCreateInstance(
        elements.savePaletteModal,
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

  elements.brandLink?.addEventListener(
    "click",
    handleBrandClick,
  );

  /* -------------------------------------------------------
     Palette Generation
     ------------------------------------------------------- */

  elements.generatePaletteButton?.addEventListener(
    "click",
    handleGenerate,
  );

  elements.randomizePaletteButton?.addEventListener(
    "click",
    handleRandomize,
  );

  elements.paletteTypeSelect?.addEventListener(
    "change",
    handlePaletteTypeChange,
  );

  elements.colorCountSelect?.addEventListener(
    "change",
    handlePaletteSizeChange,
  );

  /* -------------------------------------------------------
     Base Color
     ------------------------------------------------------- */

  elements.baseColorInput?.addEventListener(
    "change",
    handleBaseColorChange,
  );

  elements.baseColorInput?.addEventListener(
    "keydown",
    handleBaseColorKeydown,
  );

  elements.baseColorPicker?.addEventListener(
    "input",
    handleBaseColorPickerChange,
  );

  /* -------------------------------------------------------
     Palette
     ------------------------------------------------------- */

  elements.currentPalette?.addEventListener(
    "click",
    handlePaletteAction,
  );

  elements.clearPaletteButton?.addEventListener(
    "click",
    handleReset,
  );

  /* -------------------------------------------------------
     Save Palette
     ------------------------------------------------------- */

  elements.saveCurrentPaletteButton?.addEventListener(
    "click",
    openSaveModal,
  );

  elements.confirmSavePaletteButton?.addEventListener(
    "click",
    handleConfirmSave,
  );

  elements.paletteNameInput?.addEventListener(
    "keydown",
    handlePaletteNameKeydown,
  );

  elements.paletteNameInput?.addEventListener(
    "input",
    clearPaletteNameError,
  );

  /* -------------------------------------------------------
     Saved Palettes
     ------------------------------------------------------- */

  elements.savedPalettesList?.addEventListener(
    "click",
    handleSavedPaletteAction,
  );

  /* -------------------------------------------------------
     Contrast
     ------------------------------------------------------- */

  bindContrastInput(
    elements.foregroundHexInput,
    elements.foregroundColorPicker,
    "foreground",
  );

  bindContrastInput(
    elements.backgroundHexInput,
    elements.backgroundColorPicker,
    "background",
  );

  elements.swapContrastColorsButton?.addEventListener(
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
  if (elements.baseColorInput) {
    elements.baseColorInput.value =
      baseColor;
  }

  if (elements.baseColorPicker) {
    elements.baseColorPicker.value =
      baseColor;
  }

  if (elements.paletteTypeSelect) {
    elements.paletteTypeSelect.value =
      paletteType;
  }

  if (elements.colorCountSelect) {
    elements.colorCountSelect.value =
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

    elements.baseColorInput?.focus();

    return;
  }

  const paletteType =
    elements.paletteTypeSelect?.value ||
    DEFAULT_PALETTE_TYPE;

  const size = normalizeUiSize(
    elements.colorCountSelect?.value,
  );

  setGenerating(true);

  setButtonBusy(
    elements.generatePaletteButton,
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
        elements.generatePaletteButton,
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
    elements.paletteTypeSelect?.value;

  if (!updatePaletteType(paletteType)) {
    return;
  }

  persistCurrentSettings();

  generateFromControls();
}

function handlePaletteSizeChange() {
  const size = normalizeUiSize(
    elements.colorCountSelect?.value,
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
    elements.baseColorInput?.classList.add(
      "is-invalid",
    );

    showErrorToast(
      MESSAGES.INVALID_COLOR ||
        "Please enter a valid HEX color.",
    );

    return;
  }

  elements.baseColorInput?.classList.remove(
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
      elements.paletteTypeSelect?.value ||
        DEFAULT_PALETTE_TYPE,
      normalizeUiSize(
        elements.colorCountSelect?.value,
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
  if (!elements.currentPalette) {
    return;
  }

  elements.currentPalette.replaceChildren();

  if (
    !palette ||
    !Array.isArray(palette.colors) ||
    palette.colors.length === 0
  ) {
    elements.currentPalette.innerHTML = `
      <div class="alert alert-light border w-100 mb-0">
        No colors in the current palette.
      </div>
    `;

    return;
  }

  palette.colors.forEach(
    (color, index) => {
      elements.currentPalette.append(
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

    elements.contrastChecker?.scrollIntoView({
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

  if (elements.paletteNameInput) {
    elements.paletteNameInput.value = "";
  }

  if (saveModal) {
    saveModal.show();

    window.setTimeout(() => {
      elements.paletteNameInput?.focus();
    }, 150);

    return;
  }

  elements.paletteNameInput?.focus();
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
    elements.paletteNameInput?.value
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
    elements.confirmSavePaletteButton,
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
      elements.confirmSavePaletteButton,
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
  if (!elements.savedPalettesList) {
    return;
  }

  const palettes =
    getStoredPalettes();

  elements.savedPalettesList.replaceChildren();

  if (palettes.length === 0) {
    if (elements.savedPalettesEmptyState) {
      elements.savedPalettesEmptyState.hidden =
        false;
    }

    return;
  }

  if (elements.savedPalettesEmptyState) {
    elements.savedPalettesEmptyState.hidden =
      true;
  }

  palettes.forEach(
    (palette) => {
      elements.savedPalettesList.append(
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
    !elements.savedPalettesOffcanvas
  ) {
    return;
  }

  window.bootstrap.Offcanvas
    .getOrCreateInstance(
      elements.savedPalettesOffcanvas,
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

/* =========================================================
   Contrast Initialization
   ========================================================= */

function initializeContrast() {
  const foreground =
    normalizeHex(
      elements.foregroundHexInput?.value,
    ) || "#FFFFFF";

  const background =
    normalizeHex(
      elements.backgroundHexInput?.value,
    ) || DEFAULT_BASE_COLOR;

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

  updateContrastUI();
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

  updateContrastUI();
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

  updateContrastUI();

  showSuccessToast(
    "Foreground and background swapped.",
  );
}

function getContrastValues() {
  return {
    foreground:
      normalizeHex(
        elements.foregroundHexInput?.value,
      ) || "#FFFFFF",

    background:
      normalizeHex(
        elements.backgroundHexInput?.value,
      ) || DEFAULT_BASE_COLOR,
  };
}

function syncContrastControls(
  foreground,
  background,
) {
  if (elements.foregroundHexInput) {
    elements.foregroundHexInput.value =
      foreground;
  }

  if (elements.foregroundColorPicker) {
    elements.foregroundColorPicker.value =
      foreground;
  }

  if (elements.backgroundHexInput) {
    elements.backgroundHexInput.value =
      background;
  }

  if (elements.backgroundColorPicker) {
    elements.backgroundColorPicker.value =
      background;
  }
}

/* =========================================================
   Contrast UI
   ========================================================= */

function updateContrastUI() {
  const {
    foreground,
    background,
  } = getContrastValues();

  const results =
    getContrastResults(
      foreground,
      background,
    );

  if (!results) {
    return;
  }

  setContrastState({
    ...results,
    foreground,
    background,
  });

  if (elements.contrastPreview) {
    elements.contrastPreview.style.color =
      foreground;

    elements.contrastPreview.style.backgroundColor =
      background;
  }

  if (elements.contrastPreviewText) {
    elements.contrastPreviewText.style.color =
      foreground;
  }

  if (elements.contrastRatio) {
    elements.contrastRatio.textContent =
      `${Number(results.ratio || 0).toFixed(2)} : 1`;
  }

  updateResultCard(
    elements.normalTextResult,
    elements.normalTextStatus,
    elements.normalTextLevel,
    results.normalText,
    "WCAG AA / AAA",
  );

  updateResultCard(
    elements.largeTextResult,
    elements.largeTextStatus,
    elements.largeTextLevel,
    results.largeText,
    "WCAG AA / AAA",
  );

  updateResultCard(
    elements.uiComponentResult,
    elements.uiComponentStatus,
    elements.uiComponentLevel,
    results.uiComponent
      ? "pass"
      : "fail",
    "WCAG 1.4.11",
  );
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
    elements.baseColorInput?.value
      ?.trim();

  return normalizeHex(value);
}

function syncBaseColorControls(
  color,
) {
  if (elements.baseColorInput) {
    elements.baseColorInput.value =
      color;
  }

  if (elements.baseColorPicker) {
    elements.baseColorPicker.value =
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
  if (!elements.paletteStatus) {
    return;
  }

  window.clearTimeout(
    statusTimer,
  );

  elements.paletteStatus.textContent =
    message;

  statusTimer = window.setTimeout(
    () => {
      elements.paletteStatus.textContent =
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
  if (!elements.savedPalettesCount) {
    return;
  }

  elements.savedPalettesCount.textContent =
    String(count);
}

/* =========================================================
   Palette Name Validation
   ========================================================= */

function showPaletteNameError() {
  elements.paletteNameInput?.classList.add(
    "is-invalid",
  );

  elements.paletteNameError?.classList.add(
    "d-block",
  );

  elements.paletteNameInput?.focus();
}

function clearPaletteNameError() {
  elements.paletteNameInput?.classList.remove(
    "is-invalid",
  );

  elements.paletteNameError?.classList.remove(
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