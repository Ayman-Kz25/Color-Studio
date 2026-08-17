import {
  DEFAULT_BASE_COLOR,
  DEFAULT_PALETTE_TYPE,
  PALETTE_SIZE,
  MIN_PALETTE_SIZE,
  MAX_PALETTE_SIZE,
  PALETTE_TYPES,
  MESSAGES,
  TOAST_DURATION,
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
  replaceColor,
  getCurrentPalette,
  setCurrentPalette,
} from "./scripts/module/palette/manager.js";

import {
  isValidHex,
  normalizeHex,
  hexToRgb,
  hexToHsl,
  getBestTextColor,
} from "./scripts/module/palette/colorUtils.js";

import { getContrastResults } from "./scripts/module/contrast/contrast.js";

const $ = (id) => document.getElementById(id);

const elements = {
  brandLink: $("brandLink"),
  currentYear: $("currentYear"),

  generatePaletteButton: $("generatePaletteButton"),
  randomizePaletteButton: $("randomizePaletteButton"),
  paletteTypeSelect: $("paletteTypeSelect"),
  colorCountSelect: $("colorCountSelect"),
  baseColorInput: $("baseColorInput"),
  baseColorPicker: $("baseColorPicker"),
  currentPalette: $("currentPalette"),
  paletteStatus: $("paletteStatus"),
  clearPaletteButton: $("clearPaletteButton"),
  saveCurrentPaletteButton: $("saveCurrentPaletteButton"),

  savedPalettesCount: $("savedPalettesCount"),
  savedPalettesEmptyState: $("savedPalettesEmptyState"),
  savedPalettesList: $("savedPalettesList"),

  savePaletteModal: $("savePaletteModal"),
  paletteNameInput: $("paletteNameInput"),
  paletteNameError: $("paletteNameError"),
  confirmSavePaletteButton: $("confirmSavePaletteButton"),

  appToast: $("appToast"),
  toastMessage: $("toastMessage"),
  toastIcon: $("toastIcon"),

  foregroundHexInput: $("foregroundHexInput"),
  foregroundColorPicker: $("foregroundColorPicker"),
  backgroundHexInput: $("backgroundHexInput"),
  backgroundColorPicker: $("backgroundColorPicker"),
  swapContrastColorsButton: $("swapContrastColorsButton"),

  contrastPreview: $("contrastPreview"),
  contrastRatio: $("contrastRatio"),
  normalTextResult: $("normalTextResult"),
  normalTextStatus: $("normalTextStatus"),
  normalTextLevel: $("normalTextLevel"),
  largeTextResult: $("largeTextResult"),
  largeTextStatus: $("largeTextStatus"),
  largeTextLevel: $("largeTextLevel"),
  uiComponentResult: $("uiComponentResult"),
  uiComponentStatus: $("uiComponentStatus"),
  uiComponentLevel: $("uiComponentLevel"),
};

let saveModal;
let toast;
let statusTimer;

document.addEventListener("DOMContentLoaded", initializeApp);

function initializeApp() {
  initializeState();

  if (elements.currentYear) {
    elements.currentYear.textContent = new Date().getFullYear();
  }

  setupBootstrapComponents();
  setupEventListeners();
  addMissingPaletteTypeOptions();
  syncPaletteControlsFromState();
  loadPersistedSettings();
  loadSavedPalettes();
  initializePalette();
  renderPalette();
  renderSavedPalettes();
  initializeContrastFromHtml();
  updateContrastUI();

  setStatus("Ready to generate a palette.");
}

function setupBootstrapComponents() {
  if (window.bootstrap) {
    if (elements.savePaletteModal) {
      saveModal = window.bootstrap.Modal.getOrCreateInstance(
        elements.savePaletteModal,
      );
    }

    if (elements.appToast) {
      toast = window.bootstrap.Toast.getOrCreateInstance(elements.appToast, {
        delay: TOAST_DURATION,
      });
    }
  }
}

function setupEventListeners() {
  elements.brandLink?.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  elements.generatePaletteButton?.addEventListener("click", handleGenerate);

  elements.randomizePaletteButton?.addEventListener("click", handleRandomize);

  elements.paletteTypeSelect?.addEventListener(
    "change",
    handlePaletteTypeChange,
  );

  elements.colorCountSelect?.addEventListener(
    "change",
    handlePaletteSizeChange,
  );

  elements.baseColorInput?.addEventListener("change", handleBaseColorChange);

  elements.baseColorInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleBaseColorChange();
    }
  });

  elements.baseColorPicker?.addEventListener(
    "input",
    handleBaseColorPickerChange,
  );

  elements.clearPaletteButton?.addEventListener("click", handleReset);

  elements.saveCurrentPaletteButton?.addEventListener("click", openSaveModal);

  elements.confirmSavePaletteButton?.addEventListener(
    "click",
    handleConfirmSave,
  );

  elements.paletteNameInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleConfirmSave();
    }
  });

  elements.paletteNameInput?.addEventListener("input", clearPaletteNameError);

  elements.savedPalettesList?.addEventListener(
    "click",
    handleSavedPaletteAction,
  );

  elements.currentPalette?.addEventListener("click", handlePaletteAction);

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

function addMissingPaletteTypeOptions() {
  if (!elements.paletteTypeSelect) return;

  const labels = {
    [PALETTE_TYPES.TETRADIC]: "Tetradic",
  };

  Object.entries(labels).forEach(([value, label]) => {
    if (!elements.paletteTypeSelect.querySelector(`option[value="${value}"]`)) {
      elements.paletteTypeSelect.append(new Option(label, value));
    }
  });
}

function loadPersistedSettings() {
  const settings = getSettings();

  const baseColor = isValidHex(settings.baseColor)
    ? normalizeHex(settings.baseColor)
    : DEFAULT_BASE_COLOR;

  const paletteType = Object.values(PALETTE_TYPES).includes(
    settings.paletteType,
  )
    ? settings.paletteType
    : DEFAULT_PALETTE_TYPE;

  const size = normalizeUiSize(settings.paletteSize ?? PALETTE_SIZE);

  if (elements.baseColorInput) {
    elements.baseColorInput.value = baseColor;
  }

  if (elements.baseColorPicker) {
    elements.baseColorPicker.value = baseColor;
  }

  if (elements.paletteTypeSelect) {
    elements.paletteTypeSelect.value = paletteType;
  }

  if (elements.colorCountSelect) {
    elements.colorCountSelect.value = String(size);
  }

  updateManagerStateWithoutGenerating(baseColor, paletteType, size);
}

function updateManagerStateWithoutGenerating(baseColor, paletteType, size) {
  updateBaseColor(baseColor);
  updatePaletteType(paletteType);
  updatePaletteSize(size);
}

function syncPaletteControlsFromState() {
  const state = getPaletteState();

  const baseColor = normalizeHex(state.baseColor) || DEFAULT_BASE_COLOR;
  const type = Object.values(PALETTE_TYPES).includes(state.type)
    ? state.type
    : DEFAULT_PALETTE_TYPE;
  const size = normalizeUiSize(state.size);

  if (elements.baseColorInput) elements.baseColorInput.value = baseColor;
  if (elements.baseColorPicker) elements.baseColorPicker.value = baseColor;
  if (elements.paletteTypeSelect) elements.paletteTypeSelect.value = type;
  if (elements.colorCountSelect) {
    elements.colorCountSelect.value = String(size);
  }
}

function loadSavedPalettes() {
  const palettes = getStoredPalettes();
  setSavedPalettes(palettes);
  updateSavedPaletteCount(palettes.length);
}

function handleGenerate() {
  const baseColor = readBaseColorFromControls();
  if (!baseColor) {
    showToast(MESSAGES.INVALID_COLOR, "error");
    elements.baseColorInput?.focus();
    return;
  }

  const type = elements.paletteTypeSelect?.value || DEFAULT_PALETTE_TYPE;
  const size = normalizeUiSize(elements.colorCountSelect?.value);

  setGenerating(true);
  setButtonBusy(elements.generatePaletteButton, true, "Generating...");

  window.setTimeout(() => {
    try {
      const palette = generateNewPalette(baseColor, type, size);
      renderPalette(palette);
      persistCurrentSettings();
      setStatus(MESSAGES.PALETTE_GENERATED);
    } catch (error) {
      console.error(error);
      showToast(MESSAGES.PALETTE_GENERATION_ERROR, "error");
    } finally {
      setGenerating(false);
      setButtonBusy(elements.generatePaletteButton, false, "Generate Palette");
    }
  }, 0);
}

function handleRandomize() {
  const palette = randomizeUnlockedColors();
  renderPalette(palette);
  setStatus("Unlocked colors randomized.");
  persistCurrentSettings();
}

function handlePaletteTypeChange() {
  const type = elements.paletteTypeSelect?.value;
  if (!updatePaletteType(type)) return;

  persistCurrentSettings();
  generateFromControls();
}

function handlePaletteSizeChange() {
  const size = normalizeUiSize(elements.colorCountSelect?.value);

  if (!updatePaletteSize(size)) return;

  persistCurrentSettings();
  generateFromControls();
}

function handleBaseColorChange() {
  const baseColor = readBaseColorFromControls();

  if (!baseColor) {
    showToast(MESSAGES.INVALID_COLOR, "error");
    elements.baseColorInput?.classList.add("is-invalid");
    return;
  }

  elements.baseColorInput?.classList.remove("is-invalid");

  if (!updateBaseColor(baseColor)) {
    showToast(MESSAGES.INVALID_COLOR, "error");
    return;
  }

  syncBaseColorControls(baseColor);
  persistCurrentSettings();
  generateFromControls();
}

function handleBaseColorPickerChange(event) {
  const baseColor = normalizeHex(event.target.value);

  if (!baseColor) return;

  if (elements.baseColorInput) {
    elements.baseColorInput.value = baseColor;
  }

  updateBaseColor(baseColor);
  persistCurrentSettings();
  generateFromControls();
}

function generateFromControls() {
  const palette = generateNewPalette(
    readBaseColorFromControls(),
    elements.paletteTypeSelect?.value,
    normalizeUiSize(elements.colorCountSelect?.value),
  );

  renderPalette(palette);
  setStatus(MESSAGES.PALETTE_GENERATED);
}

function handleReset() {
  const palette = resetPalette();

  syncPaletteControlsFromState();
  renderPalette(palette);
  persistCurrentSettings();

  setStatus(MESSAGES.PALETTE_RESET);
  showToast(MESSAGES.PALETTE_RESET);
}

function renderPalette(palette = getCurrentPalette()) {
  if (!elements.currentPalette) return;

  elements.currentPalette.replaceChildren();

  if (!palette?.colors?.length) {
    elements.currentPalette.innerHTML = `
      <div class="alert alert-light border w-100 mb-0">
        No colors in the current palette.
      </div>
    `;
    return;
  }

  palette.colors.forEach((color, index) => {
    elements.currentPalette.append(
      createColorCard(color, index, Boolean(palette.locked[index])),
    );
  });
}

function createColorCard(color, index, locked) {
  const card = document.createElement("article");
  const textColor = getBestTextColor(color);
  const rgb = hexToRgb(color);
  const hsl = hexToHsl(color);

  card.className = "color-studio-card";
  card.dataset.index = String(index);
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

  const details = document.createElement("div");
  details.style.cssText =
    "padding:20px; display:flex; flex-direction:column; gap:8px;";

  const indexLabel = document.createElement("span");
  indexLabel.textContent = `Color ${index + 1}`;
  indexLabel.style.cssText =
    "font-size:.75rem;font-weight:700;text-transform:uppercase;opacity:.75;";

  const hexButton = document.createElement("button");
  hexButton.type = "button";
  hexButton.dataset.action = "copy";
  hexButton.dataset.index = String(index);
  hexButton.textContent = color;
  hexButton.className = "btn btn-link p-0 text-start";
  hexButton.style.cssText = `
    color:${textColor};
    font-size:1.35rem;
    font-weight:700;
    text-decoration:none;
  `;

  const values = document.createElement("small");
  values.textContent =
    rgb && hsl
      ? `RGB ${rgb.r}, ${rgb.g}, ${rgb.b} • HSL ${hsl.h}°, ${hsl.s}%, ${hsl.l}%`
      : color;
  values.style.opacity = ".8";

  details.append(indexLabel, hexButton, values);

  const actions = document.createElement("div");
  actions.style.cssText =
    "display:flex;gap:8px;padding:16px 20px;background:rgba(0,0,0,.08);";

  const lockButton = document.createElement("button");
  lockButton.type = "button";
  lockButton.dataset.action = "lock";
  lockButton.dataset.index = String(index);
  lockButton.className = "btn btn-sm";
  lockButton.title = locked ? "Unlock color" : "Lock color";
  lockButton.innerHTML = `
    <i class="fa-solid ${locked ? "fa-lock" : "fa-lock-open"} me-1"></i>
    ${locked ? "Locked" : "Lock"}
  `;
  lockButton.style.cssText = `
    color:${textColor};
    border:1px solid rgba(255,255,255,.45);
    background:rgba(0,0,0,.12);
  `;

  const contrastButton = document.createElement("button");
  contrastButton.type = "button";
  contrastButton.dataset.action = "contrast";
  contrastButton.dataset.index = String(index);
  contrastButton.className = "btn btn-sm";
  contrastButton.innerHTML =
    '<i class="fa-solid fa-circle-half-stroke me-1"></i> Contrast';
  contrastButton.style.cssText = `
    color:${textColor};
    border:1px solid rgba(255,255,255,.45);
    background:rgba(0,0,0,.12);
  `;

  actions.append(lockButton, contrastButton);
  card.append(details, actions);

  return card;
}

async function handlePaletteAction(event) {
  const actionElement = event.target.closest("[data-action]");
  if (!actionElement) return;

  const index = Number(actionElement.dataset.index);
  if (!Number.isInteger(index)) return;

  const palette = getCurrentPalette();
  const color = palette.colors[index];

  setSelectedColorIndex(index);

  if (actionElement.dataset.action === "copy") {
    const copied = await copyText(color);

    if (copied) {
      showToast(MESSAGES.COLOR_COPIED);
      setStatus(`${color} copied to clipboard.`);
    } else {
      showToast(MESSAGES.COPY_ERROR, "error");
    }

    return;
  }

  if (actionElement.dataset.action === "lock") {
    const locked = toggleColorLock(index);
    renderPalette(getCurrentPalette());
    showToast(locked ? MESSAGES.COLOR_LOCKED : MESSAGES.COLOR_UNLOCKED);
    return;
  }

  if (actionElement.dataset.action === "contrast") {
    setContrastBackground(color);
    document.getElementById("contrastChecker")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

function openSaveModal() {
  if (!getCurrentPalette().colors.length) return;

  clearPaletteNameError();

  if (elements.paletteNameInput) {
    elements.paletteNameInput.value = "";
  }

  if (saveModal) {
    saveModal.show();
  } else {
    elements.paletteNameInput?.focus();
  }
}

function handleConfirmSave() {
  const name = elements.paletteNameInput?.value.trim() || "";

  if (!name) {
    showPaletteNameError();
    return;
  }

  const palette = getCurrentPalette();

  setSaving(true);
  setButtonBusy(elements.confirmSavePaletteButton, true, "Saving...");

  try {
    const saved = persistPalette({
      name,
      colors: palette.colors,
      locked: palette.locked,
      baseColor: palette.baseColor,
      type: palette.type,
      size: palette.size,
    });

    if (!saved) {
      showToast(MESSAGES.PALETTE_SAVE_ERROR, "error");
      return;
    }

    setSavedPalettes(getStoredPalettes());
    updateSavedPaletteCount(getStoredPalettes().length);
    renderSavedPalettes();

    saveModal?.hide();
    showToast(MESSAGES.PALETTE_SAVED);
    setStatus(`Saved "${name}".`);
  } finally {
    setSaving(false);
    setButtonBusy(elements.confirmSavePaletteButton, false, "Save Palette");
  }
}

function renderSavedPalettes() {
  if (!elements.savedPalettesList) return;

  const palettes = getStoredPalettes();

  elements.savedPalettesList.replaceChildren();

  if (!palettes.length) {
    if (elements.savedPalettesEmptyState) {
      elements.savedPalettesEmptyState.hidden = false;
    }
    return;
  }

  if (elements.savedPalettesEmptyState) {
    elements.savedPalettesEmptyState.hidden = true;
  }

  palettes.forEach((palette) => {
    const item = document.createElement("article");
    item.className = "border rounded-3 p-3 mb-3";
    item.dataset.paletteId = palette.id;

    const titleRow = document.createElement("div");
    titleRow.className =
      "d-flex align-items-center justify-content-between gap-2 mb-2";

    const title = document.createElement("strong");
    title.textContent = palette.name || "Unnamed palette";

    const date = document.createElement("small");
    date.className = "text-secondary";
    date.textContent = formatSavedDate(palette.updatedAt || palette.createdAt);

    titleRow.append(title, date);

    const swatches = document.createElement("div");
    swatches.className = "d-flex rounded overflow-hidden mb-3";
    swatches.style.height = "48px";

    palette.colors.forEach((color) => {
      const swatch = document.createElement("span");
      swatch.title = color;
      swatch.style.cssText = `flex:1;background:${color};min-width:0;`;
      swatches.append(swatch);
    });

    const actions = document.createElement("div");
    actions.className = "d-flex gap-2";

    const loadButton = document.createElement("button");
    loadButton.type = "button";
    loadButton.className = "btn btn-sm btn-primary flex-grow-1";
    loadButton.dataset.action = "load";
    loadButton.dataset.id = palette.id;
    loadButton.innerHTML =
      '<i class="fa-solid fa-arrow-rotate-left me-1"></i> Load';

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "btn btn-sm btn-outline-danger";
    deleteButton.dataset.action = "delete";
    deleteButton.dataset.id = palette.id;
    deleteButton.title = "Delete palette";
    deleteButton.innerHTML =
      '<i class="fa-solid fa-trash"></i><span class="visually-hidden"> Delete</span>';

    actions.append(loadButton, deleteButton);
    item.append(titleRow, swatches, actions);
    elements.savedPalettesList.append(item);
  });
}

function handleSavedPaletteAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const id = button.dataset.id;
  const palettes = getStoredPalettes();
  const palette = palettes.find((item) => String(item.id) === String(id));

  if (!palette) {
    showToast(MESSAGES.PALETTE_NOT_FOUND, "error");
    return;
  }

  if (button.dataset.action === "load") {
    const loaded = setCurrentPalette(palette.colors, palette.locked);

    if (!loaded) {
      showToast(MESSAGES.PALETTE_NOT_FOUND, "error");
      return;
    }

    updateBaseColor(palette.baseColor || DEFAULT_BASE_COLOR);
    updatePaletteType(palette.type || DEFAULT_PALETTE_TYPE);
    updatePaletteSize(normalizeUiSize(palette.size || palette.colors.length));

    syncPaletteControlsFromState();
    renderPalette(getCurrentPalette());
    persistCurrentSettings();

    showToast(MESSAGES.PALETTE_LOADED);
    setStatus(`Loaded "${palette.name}".`);

    const offcanvasElement = document.getElementById("savedPalettesOffcanvas");
    if (window.bootstrap && offcanvasElement) {
      window.bootstrap.Offcanvas.getOrCreateInstance(offcanvasElement).hide();
    }

    return;
  }

  if (button.dataset.action === "delete") {
    const deleted = removeStoredPalette(id);

    if (!deleted) {
      showToast(MESSAGES.PALETTE_DELETE_ERROR, "error");
      return;
    }

    loadSavedPalettes();
    renderSavedPalettes();
    showToast(MESSAGES.PALETTE_DELETED);
    setStatus(MESSAGES.PALETTE_DELETED);
  }
}

function persistCurrentSettings() {
  const state = getPaletteState();

  saveSettings({
    baseColor: state.baseColor,
    paletteType: state.type,
    paletteSize: state.size,
  });
}

function initializeContrastFromHtml() {
  const foreground =
    normalizeHex(elements.foregroundHexInput?.value) || "#FFFFFF";

  const background =
    normalizeHex(elements.backgroundHexInput?.value) || DEFAULT_BASE_COLOR;

  setContrastColors(foreground, background);
  setContrastState({ foreground, background });

  syncContrastControls(foreground, background);
}

function bindContrastInput(textInput, picker, side) {
  textInput?.addEventListener("change", () => {
    updateContrastSide(side, textInput.value);
  });

  textInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      updateContrastSide(side, textInput.value);
    }
  });

  picker?.addEventListener("input", () => {
    updateContrastSide(side, picker.value);
  });
}

function updateContrastSide(side, value) {
  const normalized = normalizeHex(value);

  if (!normalized) {
    showToast(MESSAGES.INVALID_COLOR, "error");
    return;
  }

  const current = getContrastValues();
  const next = {
    ...current,
    [side]: normalized,
  };

  setContrastColors(next.foreground, next.background);
  setContrastState(next);
  syncContrastControls(next.foreground, next.background);
  updateContrastUI();
}

function setContrastBackground(color) {
  const normalized = normalizeHex(color);
  if (!normalized) return;

  const current = getContrastValues();
  setContrastColors(current.foreground, normalized);
  setContrastState({
    foreground: current.foreground,
    background: normalized,
  });

  syncContrastControls(current.foreground, normalized);
  updateContrastUI();
}

function swapContrastColors() {
  const current = getContrastValues();

  setContrastColors(current.background, current.foreground);
  setContrastState({
    foreground: current.background,
    background: current.foreground,
  });

  syncContrastControls(current.background, current.foreground);

  updateContrastUI();
}

function getContrastValues() {
  return {
    foreground: normalizeHex(elements.foregroundHexInput?.value) || "#FFFFFF",
    background:
      normalizeHex(elements.backgroundHexInput?.value) || DEFAULT_BASE_COLOR,
  };
}

function syncContrastControls(foreground, background) {
  if (elements.foregroundHexInput) {
    elements.foregroundHexInput.value = foreground;
  }

  if (elements.foregroundColorPicker) {
    elements.foregroundColorPicker.value = foreground;
  }

  if (elements.backgroundHexInput) {
    elements.backgroundHexInput.value = background;
  }

  if (elements.backgroundColorPicker) {
    elements.backgroundColorPicker.value = background;
  }
}

function updateContrastUI() {
  const { foreground, background } = getContrastValues();
  const results = getContrastResults(foreground, background);

  if (!results) return;

  setContrastState(results);

  if (elements.contrastPreview) {
    elements.contrastPreview.style.color = foreground;
    elements.contrastPreview.style.backgroundColor = background;
  }

  if (elements.contrastRatio) {
    elements.contrastRatio.textContent = `${results.ratio.toFixed(2)} : 1`;
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
    results.uiComponent ? "pass" : "fail",
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
  if (!card || !statusElement || !levelElement) return;

  const normalized = String(status).toLowerCase();
  const isFail = normalized === "fail";
  const isAAA = normalized === "aaa";
  const isAA = normalized === "aa";
  const isPass = normalized === "pass";

  statusElement.textContent = isFail
    ? "Fail"
    : isAAA
      ? "AAA"
      : isAA
        ? "AA"
        : "Pass";

  levelElement.textContent = description;

  statusElement.classList.remove("text-success", "text-warning", "text-danger");

  statusElement.classList.add(
    isFail ? "text-danger" : isAA || isPass ? "text-success" : "text-success",
  );
}

function readBaseColorFromControls() {
  const value = elements.baseColorInput?.value?.trim();
  return normalizeHex(value);
}

function syncBaseColorControls(color) {
  if (elements.baseColorInput) elements.baseColorInput.value = color;
  if (elements.baseColorPicker) elements.baseColorPicker.value = color;
}

function normalizeUiSize(value) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) return PALETTE_SIZE;

  return Math.max(
    MIN_PALETTE_SIZE,
    Math.min(MAX_PALETTE_SIZE, Math.floor(numeric)),
  );
}

function setStatus(message) {
  if (!elements.paletteStatus) return;

  window.clearTimeout(statusTimer);
  elements.paletteStatus.textContent = message;

  statusTimer = window.setTimeout(() => {
    elements.paletteStatus.textContent = "Ready to generate a palette.";
  }, 3500);
}

function updateSavedPaletteCount(count) {
  if (elements.savedPalettesCount) {
    elements.savedPalettesCount.textContent = String(count);
  }
}

function showPaletteNameError() {
  elements.paletteNameInput?.classList.add("is-invalid");
  if (elements.paletteNameError) {
    elements.paletteNameError.classList.add("d-block");
  }
  elements.paletteNameInput?.focus();
}

function clearPaletteNameError() {
  elements.paletteNameInput?.classList.remove("is-invalid");
  elements.paletteNameError?.classList.remove("d-block");
}

function showToast(message, type = "success") {
  if (!elements.toastMessage) return;

  elements.toastMessage.textContent = message;

  if (elements.toastIcon) {
    elements.toastIcon.innerHTML =
      type === "error"
        ? '<i class="fa-solid fa-circle-exclamation text-danger"></i>'
        : '<i class="fa-solid fa-circle-check text-success"></i>';
  }

  if (toast) {
    toast.show();
  }
}

function setButtonBusy(button, busy, label) {
  if (!button) return;

  button.disabled = busy;

  if (busy) {
    button.dataset.originalHtml = button.innerHTML;
    button.innerHTML = `<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>${label}`;
  } else if (button.dataset.originalHtml) {
    button.innerHTML = button.dataset.originalHtml;
    delete button.dataset.originalHtml;
  }
}

function formatSavedDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

async function copyText(value) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }

    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();

    const copied = document.execCommand("copy");
    textarea.remove();

    return copied;
  } catch (error) {
    console.error("Color Studio: copy failed.", error);
    return false;
  }
}
