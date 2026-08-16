import { MESSAGES, PALETTE_TYPES } from "../core/constants.js";

import { getPaletteState, setSelectedColorIndex } from "../core/state.js";

import { copyColor } from "../modules/clipboard/clipboard.js";

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

let elements = {};

/* Initialization */
export function initializePaletteUI() {
  cacheElements();

  bindEvents();

  renderPalette();
}

/* Cache DOM Elements */
function cacheElements() {
  elements = {
    paletteContainer: document.querySelector("#paletteContainer"),

    baseColorInput: document.querySelector("#baseColorInput"),

    baseColorPicker: document.querySelector("#baseColorPicker"),

    paletteType: document.querySelector("#paletteType"),

    generateButton: document.querySelector("#generatePaletteBtn"),

    randomizeButton: document.querySelector("#randomizePaletteBtn"),

    resetButton: document.querySelector("#resetPaletteBtn"),

    paletteSize: document.querySelector("#paletteSize"),

    paletteCount: document.querySelector("#paletteCount"),
  };
}

/* Event Binding */
function bindEvents() {
  elements.generateButton?.addEventListener("click", handleGenerate);

  elements.randomizeButton?.addEventListener("click", handleRandomize);

  elements.resetButton?.addEventListener("click", handleReset);

  elements.baseColorInput?.addEventListener("input", handleBaseColorInput);

  elements.baseColorPicker?.addEventListener("input", handleBaseColorPicker);

  elements.paletteType?.addEventListener("change", handlePaletteTypeChange);

  elements.paletteSize?.addEventListener("change", handlePaletteSizeChange);

  elements.paletteContainer?.addEventListener("click", handlePaletteClick);
}

/* Generate Palette */
function handleGenerate() {
  const baseColor = getBaseColorFromInput();

  const paletteType = getSelectedPaletteType();

  generateNewPalette(baseColor, paletteType);

  renderPalette();

  showMessage(MESSAGES.PALETTE_GENERATED);
}

/* Randomize Palette */
function handleRandomize() {
  const paletteState = getPaletteState();

  generateNewPalette(paletteState.baseColor, PALETTE_TYPES.RANDOM);

  renderPalette();

  showMessage(MESSAGES.PALETTE_GENERATED);
}

/* Reset Palette */
function handleReset() {
  const baseColor = "#E5487A";

  const paletteType = PALETTE_TYPES.RANDOM;

  generateNewPalette(baseColor, paletteType);

  if (elements.baseColorInput) {
    elements.baseColorInput.value = baseColor;
  }

  if (elements.baseColorPicker) {
    elements.baseColorPicker.value = baseColor;
  }

  if (elements.paletteType) {
    elements.paletteType.value = paletteType;
  }

  renderPalette();
}

/* Base Color Input */
function handleBaseColorInput(event) {
  const value = event.target.value.trim();

  if (value.length === 7 && isValidHex(value)) {
    updateBaseColor(value);

    if (elements.baseColorPicker) {
      elements.baseColorPicker.value = normalizeHex(value);
    }
  }
}

/* Base Color Picker */
function handleBaseColorPicker(event) {
  const value = event.target.value;

  if (!isValidHex(value)) {
    return;
  }

  updateBaseColor(value);

  if (elements.baseColorInput) {
    elements.baseColorInput.value = normalizeHex(value);
  }
}

/* Palette Type */
function handlePaletteTypeChange(event) {
  const paletteType = event.target.value;

  updatePaletteType(paletteType);

  const paletteState = getPaletteState();

  generateNewPalette(paletteState.baseColor, paletteType);

  renderPalette();
}

/* Palette Size */
function handlePaletteSizeChange(event) {
  const requestedSize = Number(event.target.value);

  if (!Number.isInteger(requestedSize) || requestedSize < 1) {
    return;
  }

  const paletteState = getPaletteState();

  const colors = generatePaletteWithSize(
    paletteState.baseColor,
    paletteState.type,
    requestedSize,
  );

  if (colors.length > 0) {
    renderPalette();
  }
}

/* Palette Click */
async function handlePaletteClick(event) {
  const colorCard = event.target.closest("[data-color-index]");

  if (!colorCard) {
    return;
  }

  const index = Number(colorCard.dataset.colorIndex);

  if (!Number.isInteger(index)) {
    return;
  }

  const copyButton = event.target.closest("[data-action='copy']");

  const lockButton = event.target.closest("[data-action='lock']");

  if (copyButton) {
    await handleCopyColor(index);

    return;
  }

  if (lockButton) {
    handleToggleLock(index);

    return;
  }

  setSelectedColorIndex(index);

  updateSelectedColor(index);
}

/* Copy Color */
async function handleCopyColor(index) {
  const palette = getCurrentPalette();

  const color = palette.colors[index];

  if (!color) {
    return;
  }

  const copied = await copyColor(color);

  if (copied) {
    showMessage(`${color} copied to clipboard`);

    markCopied(index);
  } else {
    showMessage(MESSAGES.COPY_ERROR);
  }
}

/* Toggle Lock */
function handleToggleLock(index) {
  const isLocked = toggleColorLock(index);

  updateLockButton(index, isLocked);
}

/* Render Palette */
export function renderPalette() {
  if (!elements.paletteContainer) {
    return;
  }

  const palette = getCurrentPalette();

  elements.paletteContainer.innerHTML = "";

  palette.colors.forEach((color, index) => {
    const card = createColorCard(color, index, palette.locked[index]);

    elements.paletteContainer.appendChild(card);
  });

  updatePaletteControls(palette);
}

/* Create Color Card */
function createColorCard(color, index, isLocked) {
  const card = document.createElement("article");

  card.className = "palette-color-card";

  card.dataset.colorIndex = String(index);

  card.style.setProperty("--palette-color", color);

  card.style.color = getBestTextColor(color);

  card.innerHTML = `
        <div class="palette-color-card__preview">
            <span class="palette-color-card__index">
                ${String(index + 1).padStart(2, "0")}
            </span>

            <button
                type="button"
                class="palette-color-card__lock"
                data-action="lock"
                aria-label="${isLocked ? "Unlock" : "Lock"} color"
                title="${isLocked ? "Unlock color" : "Lock color"}"
            >
                <i class="fa-solid ${
                  isLocked ? "fa-lock" : "fa-lock-open"
                }"></i>
            </button>
        </div>

        <div class="palette-color-card__info">

            <strong class="palette-color-card__value">
                ${color}
            </strong>

            <button
                type="button"
                class="palette-color-card__copy"
                data-action="copy"
            >
                <i class="fa-regular fa-copy"></i>
                <span>Copy</span>
            </button>

        </div>
    `;

  return card;
}

/* Update Lock Button */
function updateLockButton(index, isLocked) {
  const card = getColorCard(index);

  if (!card) {
    return;
  }

  const button = card.querySelector("[data-action='lock']");

  if (!button) {
    return;
  }

  const icon = button.querySelector("i");

  button.setAttribute("aria-label", isLocked ? "Unlock color" : "Lock color");

  button.setAttribute("title", isLocked ? "Unlock color" : "Lock color");

  if (icon) {
    icon.classList.toggle("fa-lock", isLocked);

    icon.classList.toggle("fa-lock-open", !isLocked);
  }
}

/* Update Selected Color */
function updateSelectedColor(index) {
  elements.paletteContainer
    ?.querySelectorAll(".palette-color-card")
    .forEach((card) => {
      const cardIndex = Number(card.dataset.colorIndex);

      card.classList.toggle("is-selected", cardIndex === index);
    });
}

/* Update Palette Controls */
function updatePaletteControls(palette) {
  if (elements.baseColorInput) {
    elements.baseColorInput.value = palette.baseColor;
  }

  if (elements.baseColorPicker) {
    elements.baseColorPicker.value = palette.baseColor;
  }

  if (elements.paletteType) {
    elements.paletteType.value = palette.type;
  }

  if (elements.paletteCount) {
    elements.paletteCount.textContent = String(palette.colors.length);
  }
}

/* Get Color Card */
function getColorCard(index) {
  return elements.paletteContainer?.querySelector(
    `[data-color-index="${index}"]`,
  );
}

/* Mark Color As Copied */
function markCopied(index) {
  const card = getColorCard(index);

  if (!card) {
    return;
  }

  const button = card.querySelector("[data-action='copy']");

  if (!button) {
    return;
  }

  const originalHTML = button.innerHTML;

  button.innerHTML = `
        <i class="fa-solid fa-check"></i>
        <span>Copied</span>
    `;

  button.classList.add("is-copied");

  window.setTimeout(() => {
    button.innerHTML = originalHTML;

    button.classList.remove("is-copied");
  }, 1500);
}

/* Message */
function showMessage(message) {
  document.dispatchEvent(
    new CustomEvent("colorstudio:toast", {
      detail: {
        message,
      },
    }),
  );
}

/* Helpers */
function getBaseColorFromInput() {
  const inputValue = elements.baseColorInput?.value?.trim();

  if (inputValue && isValidHex(inputValue)) {
    return normalizeHex(inputValue);
  }

  return getPaletteState().baseColor;
}

function getSelectedPaletteType() {
  return elements.paletteType?.value || PALETTE_TYPES.RANDOM;
}

function generatePaletteWithSize(baseColor, paletteType, size) {

  return Array.from(
    {
      length: Math.min(Math.max(size, 1), 10),
    },
    () => baseColor,
  );
}
