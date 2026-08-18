// scripts/ui/paletteUI.js

import {
  getPaletteState,
  setSelectedColorIndex,
} from "../core/state.js";

import {
  copyColor,
} from "../modules/clipboard/clipboard.js";

import {
  generateNewPalette,
  updateBaseColor,
  updatePaletteType,
  toggleColorLock,
  getCurrentPalette,
} from "../modules/palette/manager.js";

import {
  isValidHex,
  normalizeHex,
  getBestTextColor,
} from "../modules/palette/colorUtils.js";

import {
  showSuccessToast,
  showErrorToast,
} from "./toastUI.js";

import {
  dom,
} from "./dom.js";

import {
  MESSAGES,
  PALETTE_TYPES,
  DEFAULT_BASE_COLOR,
  PALETTE_SIZE,
  MIN_PALETTE_SIZE,
  MAX_PALETTE_SIZE,
} from "../core/constants.js";


/* =========================================================
   Module State
   ========================================================= */

let eventsBound = false;


/* =========================================================
   Initialization
   ========================================================= */

/**
 * Initialize palette UI.
 *
 * Event listeners are bound only once so this function can
 * safely be called more than once during application startup.
 */
export function initializePaletteUI() {
  if (!eventsBound) {
    bindEvents();
    eventsBound = true;
  }

  renderPalette();
}


/* =========================================================
   Event Binding
   ========================================================= */

function bindEvents() {
  dom.generatePaletteButton?.addEventListener(
    "click",
    handleGenerate,
  );

  dom.randomizePaletteButton?.addEventListener(
    "click",
    handleRandomize,
  );

  dom.clearPaletteButton?.addEventListener(
    "click",
    handleReset,
  );

  dom.baseColorInput?.addEventListener(
    "input",
    handleBaseColorInput,
  );

  dom.baseColorPicker?.addEventListener(
    "input",
    handleBaseColorPicker,
  );

  dom.paletteTypeSelect?.addEventListener(
    "change",
    handlePaletteTypeChange,
  );

  dom.colorCountSelect?.addEventListener(
    "change",
    handlePaletteSizeChange,
  );

  dom.currentPalette?.addEventListener(
    "click",
    handlePaletteClick,
  );
}


/* =========================================================
   Generate
   ========================================================= */

function handleGenerate() {
  const baseColor = getBaseColorFromInput();
  const paletteType = getSelectedPaletteType();

  if (!baseColor) {
    showErrorToast(
      MESSAGES.INVALID_COLOR ||
        "Please enter a valid HEX color.",
    );

    return;
  }

  if (!isSupportedPaletteType(paletteType)) {
    showErrorToast(
      "Please select a valid palette type.",
    );

    return;
  }

  const palette = generateNewPalette(
    baseColor,
    paletteType,
  );

  if (!palette) {
    showPaletteGenerationError();
    return;
  }

  renderPalette();

  showSuccessToast(
    MESSAGES.PALETTE_GENERATED ||
      "Palette generated.",
  );
}


/* =========================================================
   Randomize
   ========================================================= */

function handleRandomize() {
  const paletteState = getPaletteState();

  const baseColor = normalizeOrFallback(
    paletteState?.baseColor,
    DEFAULT_BASE_COLOR,
  );

  const palette = generateNewPalette(
    baseColor,
    PALETTE_TYPES.RANDOM,
  );

  if (!palette) {
    showPaletteGenerationError();
    return;
  }

  renderPalette();

  showSuccessToast(
    "Random palette generated.",
  );
}


/* =========================================================
   Reset
   ========================================================= */

function handleReset() {
  const baseColor = normalizeOrFallback(
    DEFAULT_BASE_COLOR,
    "#000000",
  );

  const palette = generateNewPalette(
    baseColor,
    PALETTE_TYPES.RANDOM,
    PALETTE_SIZE,
  );

  if (!palette) {
    showErrorToast(
      MESSAGES.PALETTE_GENERATION_ERROR ||
        "Unable to reset palette.",
    );

    return;
  }

  renderPalette();

  showSuccessToast(
    MESSAGES.PALETTE_RESET ||
      "Palette reset.",
  );
}


/* =========================================================
   Base Color
   ========================================================= */

function handleBaseColorInput(event) {
  const value = event?.target?.value?.trim();

  /*
   * Do not reject intermediate typing states.
   * State is updated only after a valid HEX is entered.
   */
  if (!isValidHex(value)) {
    return;
  }

  const normalized = normalizeHex(value);

  if (!normalized) {
    return;
  }

  updateBaseColor(normalized);

  syncBaseColorPicker(normalized);
}


function handleBaseColorPicker(event) {
  const value = event?.target?.value;

  if (!isValidHex(value)) {
    return;
  }

  const normalized = normalizeHex(value);

  if (!normalized) {
    return;
  }

  updateBaseColor(normalized);

  syncBaseColorInput(normalized);
}


function syncBaseColorInput(color) {
  if (dom.baseColorInput) {
    dom.baseColorInput.value = color;
  }
}


function syncBaseColorPicker(color) {
  if (dom.baseColorPicker) {
    dom.baseColorPicker.value = color;
  }
}


/* =========================================================
   Palette Type
   ========================================================= */

function handlePaletteTypeChange(event) {
  const paletteType = event?.target?.value;

  if (!isSupportedPaletteType(paletteType)) {
    return;
  }

  updatePaletteType(paletteType);

  const paletteState = getPaletteState();

  const baseColor = normalizeOrFallback(
    paletteState?.baseColor,
    DEFAULT_BASE_COLOR,
  );

  const palette = generateNewPalette(
    baseColor,
    paletteType,
  );

  if (!palette) {
    showPaletteGenerationError();
    return;
  }

  renderPalette();

  showSuccessToast(
    `${getPaletteTypeLabel(paletteType)} palette generated.`,
  );
}


/* =========================================================
   Palette Size
   ========================================================= */

function handlePaletteSizeChange(event) {
  const requestedSize = Number(
    event?.target?.value,
  );

  if (!isValidPaletteSize(requestedSize)) {
    return;
  }

  const paletteState = getPaletteState();

  const baseColor = normalizeOrFallback(
    paletteState?.baseColor,
    DEFAULT_BASE_COLOR,
  );

  const paletteType = getValidPaletteType(
    paletteState?.type,
  );

  const palette = generateNewPalette(
    baseColor,
    paletteType,
    requestedSize,
  );

  if (!palette) {
    showErrorToast(
      MESSAGES.PALETTE_GENERATION_ERROR ||
        "Unable to change palette size.",
    );

    return;
  }

  renderPalette();
}


/* =========================================================
   Palette Click
   ========================================================= */

async function handlePaletteClick(event) {
  const target = event?.target;

  if (!(target instanceof Element)) {
    return;
  }

  const card = target.closest(
    ".palette-color-card",
  );

  if (!card || !dom.currentPalette?.contains(card)) {
    return;
  }

  const index = Number(
    card.dataset.colorIndex,
  );

  if (!isValidColorIndex(index)) {
    return;
  }

  const actionButton = target.closest(
    "[data-action]",
  );

  if (actionButton) {
    const action = actionButton.dataset.action;

    if (action === "copy") {
      await handleCopyColor(index);
      return;
    }

    if (action === "lock") {
      handleToggleLock(index);
      return;
    }
  }

  handleSelectColor(index);
}


/* =========================================================
   Select Color
   ========================================================= */

function handleSelectColor(index) {
  if (!isValidColorIndex(index)) {
    return;
  }

  const selected = setSelectedColorIndex(index);

  if (selected === false) {
    return;
  }

  updateSelectedColor(index);
}


/* =========================================================
   Copy Color
   ========================================================= */

async function handleCopyColor(index) {
  const palette = getCurrentPalette();

  if (!isValidPalette(palette)) {
    return;
  }

  const color = palette.colors[index];

  if (!color) {
    return;
  }

  const copied = await copyColor(color);

  if (!copied) {
    showErrorToast(
      MESSAGES.COPY_ERROR ||
        "Unable to copy color.",
    );

    return;
  }

  showSuccessToast(
    `${color} copied to clipboard.`,
  );

  markCopied(index);
}


/* =========================================================
   Toggle Lock
   ========================================================= */

function handleToggleLock(index) {
  const paletteBeforeToggle = getCurrentPalette();

  if (
    !isValidPalette(paletteBeforeToggle) ||
    !isValidColorIndex(
      index,
      paletteBeforeToggle.colors.length,
    )
  ) {
    return;
  }

  const result = toggleColorLock(index);

  /*
   * toggleColorLock() returns true when the color is locked
   * and false when it is unlocked.
   */
  const isLocked = result === true;

  const palette = getCurrentPalette();

  if (
    !isValidPalette(palette) ||
    !isValidColorIndex(
      index,
      palette.colors.length,
    )
  ) {
    return;
  }

  updateLockButton(
    index,
    isLocked,
  );

  showSuccessToast(
    isLocked
      ? `${palette.colors[index]} locked.`
      : `${palette.colors[index]} unlocked.`,
  );
}


/* =========================================================
   Render
   ========================================================= */

/**
 * Render the complete palette.
 *
 * The palette surface is owned by this function. Individual
 * cards are recreated whenever the palette changes.
 */
export function renderPalette() {
  const container = dom.currentPalette;

  if (!container) {
    return;
  }

  const palette = getCurrentPalette();

  if (!isValidPalette(palette)) {
    container.replaceChildren();
    container.style.removeProperty(
      "--palette-count",
    );
    return;
  }

  container.style.setProperty(
    "--palette-count",
    String(palette.colors.length),
  );

  const fragment = document.createDocumentFragment();

  palette.colors.forEach(
    (color, index) => {
      const card = createColorCard(
        color,
        index,
        Boolean(palette.locked?.[index]),
      );

      fragment.appendChild(card);
    },
  );

  container.replaceChildren(fragment);

  updatePaletteControls(palette);

  const selectedIndex =
    getPaletteState()?.selectedColorIndex;

  if (
    isValidColorIndex(
      selectedIndex,
      palette.colors.length,
    )
  ) {
    updateSelectedColor(selectedIndex);
  }
}


/* =========================================================
   Create Color Card
   ========================================================= */

function createColorCard(
  color,
  index,
  isLocked,
) {
  const card = document.createElement(
    "article",
  );

  card.className =
    "palette-color-card";

  card.dataset.colorIndex =
    String(index);

  card.setAttribute(
    "aria-label",
    `Color ${index + 1}: ${color}`,
  );

  card.style.setProperty(
    "--palette-color",
    color,
  );

  card.style.color =
    getBestTextColor(color);


  /* -------------------------------------------------------
     Preview
     ------------------------------------------------------- */

  const preview = document.createElement(
    "div",
  );

  preview.className =
    "palette-color-card__preview";


  /* -------------------------------------------------------
     Index
     ------------------------------------------------------- */

  const indexLabel = document.createElement(
    "span",
  );

  indexLabel.className =
    "palette-color-card__index";

  indexLabel.textContent =
    String(index + 1).padStart(2, "0");

  preview.appendChild(indexLabel);


  /* -------------------------------------------------------
     Lock Button
     ------------------------------------------------------- */

  const lockButton =
    createLockButton(isLocked);

  preview.appendChild(lockButton);

  card.appendChild(preview);


  /* -------------------------------------------------------
     Information
     ------------------------------------------------------- */

  const info = document.createElement(
    "div",
  );

  info.className =
    "palette-color-card__info";


  /* -------------------------------------------------------
     Color Value
     ------------------------------------------------------- */

  const value = document.createElement(
    "strong",
  );

  value.className =
    "palette-color-card__value";

  value.textContent = color;

  info.appendChild(value);


  /* -------------------------------------------------------
     Copy Button
     ------------------------------------------------------- */

  const copyButton =
    createCopyButton();

  info.appendChild(copyButton);

  card.appendChild(info);

  return card;
}


/* =========================================================
   Create Lock Button
   ========================================================= */

function createLockButton(isLocked) {
  const button = document.createElement(
    "button",
  );

  button.type = "button";

  button.className =
    "palette-color-card__lock";

  button.dataset.action = "lock";

  const label = isLocked
    ? "Unlock color"
    : "Lock color";

  button.setAttribute(
    "aria-label",
    label,
  );

  button.setAttribute(
    "title",
    label,
  );

  const icon = document.createElement(
    "i",
  );

  icon.className = isLocked
    ? "fa-solid fa-lock"
    : "fa-solid fa-lock-open";

  icon.setAttribute(
    "aria-hidden",
    "true",
  );

  button.appendChild(icon);

  return button;
}


/* =========================================================
   Create Copy Button
   ========================================================= */

function createCopyButton() {
  const button = document.createElement(
    "button",
  );

  button.type = "button";

  button.className =
    "palette-color-card__copy";

  button.dataset.action = "copy";

  button.setAttribute(
    "aria-label",
    "Copy color",
  );

  const icon = document.createElement(
    "i",
  );

  icon.className =
    "fa-regular fa-copy";

  icon.setAttribute(
    "aria-hidden",
    "true",
  );

  const label = document.createElement(
    "span",
  );

  label.textContent = "Copy";

  button.append(
    icon,
    label,
  );

  return button;
}


/* =========================================================
   Lock Button UI
   ========================================================= */

function updateLockButton(
  index,
  isLocked,
) {
  const card = getColorCard(index);

  if (!card) {
    return;
  }

  const button = card.querySelector(
    "[data-action='lock']",
  );

  if (!button) {
    return;
  }

  const icon = button.querySelector("i");

  const label = isLocked
    ? "Unlock color"
    : "Lock color";

  button.setAttribute(
    "aria-label",
    label,
  );

  button.setAttribute(
    "title",
    label,
  );

  if (icon) {
    icon.classList.toggle(
      "fa-lock",
      isLocked,
    );

    icon.classList.toggle(
      "fa-lock-open",
      !isLocked,
    );
  }
}


/* =========================================================
   Selected Color UI
   ========================================================= */

function updateSelectedColor(index) {
  const cards =
    dom.currentPalette?.querySelectorAll(
      ".palette-color-card",
    );

  cards?.forEach((card) => {
    const cardIndex = Number(
      card.dataset.colorIndex,
    );

    const selected =
      cardIndex === index;

    card.classList.toggle(
      "is-selected",
      selected,
    );

    card.setAttribute(
      "aria-current",
      selected ? "true" : "false",
    );
  });
}


/* =========================================================
   Palette Controls
   ========================================================= */

function updatePaletteControls(
  palette,
) {
  if (!palette) {
    return;
  }

  syncBaseColorInput(
    palette.baseColor,
  );

  syncBaseColorPicker(
    palette.baseColor,
  );

  if (dom.paletteTypeSelect) {
    dom.paletteTypeSelect.value =
      palette.type;
  }

  if (
    dom.colorCountSelect &&
    Array.isArray(palette.colors)
  ) {
    dom.colorCountSelect.value =
      String(palette.colors.length);
  }
}


/* =========================================================
   DOM Helpers
   ========================================================= */

function getColorCard(index) {
  return dom.currentPalette?.querySelector(
    `.palette-color-card[data-color-index="${index}"]`,
  );
}


function markCopied(index) {
  const card = getColorCard(index);

  if (!card) {
    return;
  }

  const button = card.querySelector(
    "[data-action='copy']",
  );

  if (!button) {
    return;
  }

  const originalHTML =
    button.innerHTML;

  button.innerHTML = `
    <i
      class="fa-solid fa-check"
      aria-hidden="true"
    ></i>
    <span>Copied</span>
  `;

  button.classList.add(
    "is-copied",
  );

  window.setTimeout(() => {
    if (!button.isConnected) {
      return;
    }

    button.innerHTML = originalHTML;

    button.classList.remove(
      "is-copied",
    );
  }, 1500);
}


/* =========================================================
   Validation
   ========================================================= */

function isValidPalette(palette) {
  return Boolean(
    palette &&
    Array.isArray(palette.colors) &&
    palette.colors.length > 0,
  );
}


function isValidColorIndex(
  index,
  length,
) {
  const paletteLength =
    Number.isInteger(length)
      ? length
      : getCurrentPalette()?.colors?.length;

  return (
    Number.isInteger(index) &&
    index >= 0 &&
    Number.isInteger(paletteLength) &&
    index < paletteLength
  );
}


function isValidPaletteSize(size) {
  return (
    Number.isInteger(size) &&
    size >= MIN_PALETTE_SIZE &&
    size <= MAX_PALETTE_SIZE
  );
}


function isSupportedPaletteType(
  paletteType,
) {
  return Object.values(
    PALETTE_TYPES,
  ).includes(paletteType);
}


function getValidPaletteType(
  paletteType,
) {
  return isSupportedPaletteType(paletteType)
    ? paletteType
    : PALETTE_TYPES.RANDOM;
}


/* =========================================================
   Palette Type Helpers
   ========================================================= */

function getPaletteTypeLabel(
  paletteType,
) {
  const labels = {
    [PALETTE_TYPES.RANDOM]:
      "Random",

    [PALETTE_TYPES.MONOCHROMATIC]:
      "Monochromatic",

    [PALETTE_TYPES.ANALOGOUS]:
      "Analogous",

    [PALETTE_TYPES.COMPLEMENTARY]:
      "Complementary",

    [PALETTE_TYPES.TRIADIC]:
      "Triadic",

    [PALETTE_TYPES.SPLIT_COMPLEMENTARY]:
      "Split Complementary",

    [PALETTE_TYPES.TETRADIC]:
      "Tetradic",
  };

  return labels[paletteType] || "Color";
}


/* =========================================================
   Color Helpers
   ========================================================= */

function getBaseColorFromInput() {
  const inputValue =
    dom.baseColorInput?.value?.trim();

  if (
    inputValue &&
    isValidHex(inputValue)
  ) {
    return normalizeHex(inputValue);
  }

  return normalizeOrFallback(
    getPaletteState()?.baseColor,
    DEFAULT_BASE_COLOR,
  );
}


function getSelectedPaletteType() {
  const value =
    dom.paletteTypeSelect?.value;

  return getValidPaletteType(value);
}


function normalizeOrFallback(
  color,
  fallback,
) {
  const normalized =
    normalizeHex(color);

  if (normalized) {
    return normalized;
  }

  return (
    normalizeHex(fallback) ||
    fallback
  );
}


/* =========================================================
   Notifications
   ========================================================= */

function showPaletteGenerationError() {
  showErrorToast(
    MESSAGES.PALETTE_GENERATION_ERROR ||
      "Unable to generate palette.",
  );
}