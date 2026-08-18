// scripts/ui/paletteUI.js

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
   State
   ========================================================= */

let eventsBound = false;


/* =========================================================
   Initialization
   ========================================================= */

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
   Generate Palette
   ========================================================= */

function handleGenerate() {
  const baseColor =
    getBaseColorFromInput();

  const paletteType =
    getSelectedPaletteType();

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

  const palette =
    generateNewPalette(
      baseColor,
      paletteType,
    );

  if (!palette) {
    showErrorToast(
      MESSAGES.PALETTE_GENERATION_ERROR ||
        "Unable to generate palette.",
    );

    return;
  }

  renderPalette();

  showSuccessToast(
    MESSAGES.PALETTE_GENERATED ||
      "Palette generated.",
  );
}


/* =========================================================
   Randomize Palette
   ========================================================= */

function handleRandomize() {
  const paletteState =
    getPaletteState();

  const baseColor =
    normalizeOrFallback(
      paletteState?.baseColor,
      DEFAULT_BASE_COLOR,
    );

  const palette =
    generateNewPalette(
      baseColor,
      PALETTE_TYPES.RANDOM,
    );

  if (!palette) {
    showErrorToast(
      MESSAGES.PALETTE_GENERATION_ERROR ||
        "Unable to generate palette.",
    );

    return;
  }

  renderPalette();

  showSuccessToast(
    "Random palette generated.",
  );
}


/* =========================================================
   Reset Palette
   ========================================================= */

function handleReset() {
  const baseColor =
    normalizeOrFallback(
      DEFAULT_BASE_COLOR,
      "#000000",
    );

  const paletteType =
    PALETTE_TYPES.RANDOM;

  const palette =
    generateNewPalette(
      baseColor,
      paletteType,
      PALETTE_SIZE,
    );

  if (!palette) {
    showErrorToast(
      MESSAGES.PALETTE_GENERATION_ERROR ||
        "Unable to reset palette.",
    );

    return;
  }

  syncControlsFromPalette(
    palette,
  );

  renderPalette();

  showSuccessToast(
    MESSAGES.PALETTE_RESET ||
      "Palette reset.",
  );
}


/* =========================================================
   Base Color Input
   ========================================================= */

function handleBaseColorInput(event) {
  const value =
    event?.target?.value?.trim();

  /*
   * Allow the user to type freely.
   * Only update application state once the
   * value becomes a valid HEX color.
   */
  if (!isValidHex(value)) {
    return;
  }

  const normalized =
    normalizeHex(value);

  if (!normalized) {
    return;
  }

  updateBaseColor(
    normalized,
  );

  if (dom.baseColorPicker) {
    dom.baseColorPicker.value =
      normalized;
  }
}


/* =========================================================
   Base Color Picker
   ========================================================= */

function handleBaseColorPicker(event) {
  const value =
    event?.target?.value;

  if (!isValidHex(value)) {
    return;
  }

  const normalized =
    normalizeHex(value);

  if (!normalized) {
    return;
  }

  updateBaseColor(
    normalized,
  );

  if (dom.baseColorInput) {
    dom.baseColorInput.value =
      normalized;
  }
}


/* =========================================================
   Palette Type
   ========================================================= */

function handlePaletteTypeChange(event) {
  const paletteType =
    event?.target?.value;

  if (!isSupportedPaletteType(
    paletteType,
  )) {
    return;
  }

  updatePaletteType(
    paletteType,
  );

  const paletteState =
    getPaletteState();

  const baseColor =
    normalizeOrFallback(
      paletteState?.baseColor,
      DEFAULT_BASE_COLOR,
    );

  const palette =
    generateNewPalette(
      baseColor,
      paletteType,
    );

  if (!palette) {
    showErrorToast(
      MESSAGES.PALETTE_GENERATION_ERROR ||
        "Unable to generate palette.",
    );

    return;
  }

  renderPalette();

  showSuccessToast(
    `${getPaletteTypeLabel(
      paletteType,
    )} palette generated.`,
  );
}


/* =========================================================
   Palette Size
   ========================================================= */

function handlePaletteSizeChange(event) {
  const requestedSize =
    Number(
      event?.target?.value,
    );

  if (
    !Number.isInteger(
      requestedSize,
    ) ||
    requestedSize < MIN_PALETTE_SIZE ||
    requestedSize > MAX_PALETTE_SIZE
  ) {
    return;
  }

  const paletteState =
    getPaletteState();

  const baseColor =
    normalizeOrFallback(
      paletteState?.baseColor,
      DEFAULT_BASE_COLOR,
    );

  const paletteType =
    isSupportedPaletteType(
      paletteState?.type,
    )
      ? paletteState.type
      : PALETTE_TYPES.RANDOM;

  const palette =
    generateNewPalette(
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
  const target =
    event?.target;

  if (!(target instanceof Element)) {
    return;
  }

  const colorCard =
    target.closest(
      "[data-color-index]",
    );

  if (!colorCard) {
    return;
  }

  const index =
    Number(
      colorCard.dataset.colorIndex,
    );

  if (
    !Number.isInteger(index) ||
    index < 0
  ) {
    return;
  }

  const copyButton =
    target.closest(
      "[data-action='copy']",
    );

  const lockButton =
    target.closest(
      "[data-action='lock']",
    );

  if (copyButton) {
    await handleCopyColor(index);
    return;
  }

  if (lockButton) {
    handleToggleLock(index);
    return;
  }

  const selected =
    setSelectedColorIndex(index);

  if (selected === false) {
    return;
  }

  updateSelectedColor(index);
}


/* =========================================================
   Copy Color
   ========================================================= */

async function handleCopyColor(index) {
  const palette =
    getCurrentPalette();

  const color =
    palette?.colors?.[index];

  if (!color) {
    return;
  }

  const copied =
    await copyColor(color);

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
  const result = toggleColorLock(index);

  /*
   * toggleColorLock() returns false both when:
   * 1. the color was successfully unlocked
   * 2. the index was invalid
   *
   * Therefore, validate the index before displaying
   * the notification.
   */
  const palette = getCurrentPalette();

  if (
    !palette ||
    !Array.isArray(palette.colors) ||
    !Number.isInteger(index) ||
    index < 0 ||
    index >= palette.colors.length
  ) {
    return;
  }

  const isLocked = result === true;

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
   Render Palette
   ========================================================= */

export function renderPalette() {
  if (!dom.currentPalette) {
    return;
  }

  const palette =
    getCurrentPalette();

  if (
    !palette ||
    !Array.isArray(
      palette.colors,
    )
  ) {
    dom.currentPalette.innerHTML =
      "";

    return;
  }

  dom.currentPalette.innerHTML =
    "";

  palette.colors.forEach(
    (color, index) => {
      const card =
        createColorCard(
          color,
          index,
          Boolean(
            palette.locked?.[index],
          ),
        );

      dom.currentPalette.appendChild(
        card,
      );
    },
  );

  updatePaletteControls(
    palette,
  );

  /*
   * Restore the visual selected state
   * after rebuilding the cards.
   */
  const selectedIndex =
    getPaletteState()
      ?.selectedColorIndex;

  if (
    Number.isInteger(selectedIndex)
  ) {
    updateSelectedColor(
      selectedIndex,
    );
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
  const card =
    document.createElement(
      "article",
    );

  card.className =
    "palette-color-card";

  card.dataset.colorIndex =
    String(index);

  card.style.setProperty(
    "--palette-color",
    color,
  );

  card.style.color =
    getBestTextColor(color);

  /*
   * The color is produced by the palette
   * generator and should already be normalized.
   *
   * Escape it before putting it into HTML
   * anyway so this UI layer does not rely
   * on that assumption.
   */
  const safeColor =
    escapeHTML(color);

  const lockLabel =
    isLocked
      ? "Unlock color"
      : "Lock color";

  const lockTitle =
    isLocked
      ? "Unlock color"
      : "Lock color";

  card.innerHTML = `
    <div class="palette-color-card__preview">

      <span class="palette-color-card__index">
        ${String(index + 1).padStart(2, "0")}
      </span>

      <button
        type="button"
        class="palette-color-card__lock"
        data-action="lock"
        aria-label="${lockLabel}"
        title="${lockTitle}"
      >
        <i
          class="fa-solid ${
            isLocked
              ? "fa-lock"
              : "fa-lock-open"
          }"
          aria-hidden="true"
        ></i>
      </button>

    </div>

    <div class="palette-color-card__info">

      <strong class="palette-color-card__value">
        ${safeColor}
      </strong>

      <button
        type="button"
        class="palette-color-card__copy"
        data-action="copy"
      >
        <i
          class="fa-regular fa-copy"
          aria-hidden="true"
        ></i>

        <span>Copy</span>
      </button>

    </div>
  `;

  return card;
}


/* =========================================================
   Update Lock Button
   ========================================================= */

function updateLockButton(
  index,
  isLocked,
) {
  const card =
    getColorCard(index);

  if (!card) {
    return;
  }

  const button =
    card.querySelector(
      "[data-action='lock']",
    );

  if (!button) {
    return;
  }

  const icon =
    button.querySelector("i");

  const label =
    isLocked
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
   Update Selected Color
   ========================================================= */

function updateSelectedColor(index) {
  dom.currentPalette
    ?.querySelectorAll(
      ".palette-color-card",
    )
    .forEach((card) => {
      const cardIndex =
        Number(
          card.dataset.colorIndex,
        );

      card.classList.toggle(
        "is-selected",
        cardIndex === index,
      );
    });
}


/* =========================================================
   Update Palette Controls
   ========================================================= */

function updatePaletteControls(
  palette,
) {
  if (dom.baseColorInput) {
    dom.baseColorInput.value =
      palette.baseColor;
  }

  if (dom.baseColorPicker) {
    dom.baseColorPicker.value =
      palette.baseColor;
  }

  if (dom.paletteTypeSelect) {
    dom.paletteTypeSelect.value =
      palette.type;
  }

  if (
    dom.colorCountSelect &&
    Array.isArray(palette.colors)
  ) {
    dom.colorCountSelect.value =
      String(
        palette.colors.length,
      );
  }
}


/* =========================================================
   Sync Controls From Palette
   ========================================================= */

function syncControlsFromPalette(
  palette,
) {
  if (!palette) {
    return;
  }

  updatePaletteControls(
    palette,
  );
}


/* =========================================================
   Get Color Card
   ========================================================= */

function getColorCard(index) {
  return dom.currentPalette?.querySelector(
    `[data-color-index="${index}"]`,
  );
}


/* =========================================================
   Mark Color As Copied
   ========================================================= */

function markCopied(index) {
  const card =
    getColorCard(index);

  if (!card) {
    return;
  }

  const button =
    card.querySelector(
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

  window.setTimeout(
    () => {
      /*
       * The card may have been removed because
       * the palette was regenerated. Only restore
       * the button if it is still connected.
       */
      if (!button.isConnected) {
        return;
      }

      button.innerHTML =
        originalHTML;

      button.classList.remove(
        "is-copied",
      );
    },
    1500,
  );
}


/* =========================================================
   Palette Type Helpers
   ========================================================= */

function isSupportedPaletteType(
  paletteType,
) {
  return Object.values(
    PALETTE_TYPES,
  ).includes(paletteType);
}


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

  return (
    labels[paletteType] ||
    "Color"
  );
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
    return normalizeHex(
      inputValue,
    );
  }

  return normalizeOrFallback(
    getPaletteState()?.baseColor,
    DEFAULT_BASE_COLOR,
  );
}


function getSelectedPaletteType() {
  const value =
    dom.paletteTypeSelect?.value;

  return isSupportedPaletteType(value)
    ? value
    : PALETTE_TYPES.RANDOM;
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


function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}