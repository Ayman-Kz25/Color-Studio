import { DEFAULT_BASE_COLOR, CONTRAST_LEVELS } from "../core/constants.js";

import {
  getContrastState,
  setContrastColors,
  setContrastState,
} from "../core/state.js";

import { checkContrast } from "../modules/contrast/contrastChecker.js";

import {
  isValidHex,
  normalizeHex,
} from "../modules/palette/colorUtils.js";

import {
  showSuccessToast,
  showErrorToast,
} from "./toastUI.js";

/* =========================================================
   DOM Elements
   ========================================================= */

let elements = {};

/* =========================================================
   Initialization
   ========================================================= */

export function initializeContrastUI() {
  cacheElements();

  bindEvents();

  initializeColors();

  updateContrast();
}

/* =========================================================
   DOM Cache
   ========================================================= */

function cacheElements() {
  elements = {
    foregroundInput: document.querySelector("#foregroundColorInput"),

    foregroundPicker: document.querySelector("#foregroundColorPicker"),

    backgroundInput: document.querySelector("#backgroundColorInput"),

    backgroundPicker: document.querySelector("#backgroundColorPicker"),

    swapButton: document.querySelector("#swapColorsBtn"),

    ratio: document.querySelector("#contrastRatio"),

    level: document.querySelector("#contrastLevel"),

    preview: document.querySelector("#contrastPreview"),

    previewText: document.querySelector("#contrastPreviewText"),

    normalAA: document.querySelector("#normalTextAA"),

    normalAAA: document.querySelector("#normalTextAAA"),

    largeAA: document.querySelector("#largeTextAA"),

    largeAAA: document.querySelector("#largeTextAAA"),
  };
}

/* =========================================================
   Event Binding
   ========================================================= */

function bindEvents() {
  elements.foregroundInput?.addEventListener(
    "input",
    handleForegroundInput,
  );

  elements.foregroundPicker?.addEventListener(
    "input",
    handleForegroundPicker,
  );

  elements.backgroundInput?.addEventListener(
    "input",
    handleBackgroundInput,
  );

  elements.backgroundPicker?.addEventListener(
    "input",
    handleBackgroundPicker,
  );

  elements.swapButton?.addEventListener(
    "click",
    handleSwapColors,
  );
}

/* =========================================================
   Initialize Colors
   ========================================================= */

function initializeColors() {
  const contrastState = getContrastState();

  const foreground = normalizeOrFallback(
    contrastState?.foreground,
    "#FFFFFF",
  );

  const background = normalizeOrFallback(
    contrastState?.background,
    DEFAULT_BASE_COLOR,
  );

  setContrastColors(
    foreground,
    background,
  );

  syncColorControls(
    "foreground",
    foreground,
  );

  syncColorControls(
    "background",
    background,
  );
}

/* =========================================================
   Foreground Text Input
   ========================================================= */

function handleForegroundInput(event) {
  handleColorInput(
    "foreground",
    event.target.value,
  );
}

/* =========================================================
   Foreground Picker
   ========================================================= */

function handleForegroundPicker(event) {
  handleColorInput(
    "foreground",
    event.target.value,
  );
}

/* =========================================================
   Background Text Input
   ========================================================= */

function handleBackgroundInput(event) {
  handleColorInput(
    "background",
    event.target.value,
  );
}

/* =========================================================
   Background Picker
   ========================================================= */

function handleBackgroundPicker(event) {
  handleColorInput(
    "background",
    event.target.value,
  );
}

/* =========================================================
   Handle Color Input
   ========================================================= */

function handleColorInput(type, value) {
  const color = typeof value === "string"
    ? value.trim()
    : "";

  /*
   * Text inputs are allowed to be temporarily invalid
   * while the user is typing. Do not overwrite the input
   * until a complete valid HEX value is available.
   */
  if (!isValidHex(color)) {
    return;
  }

  const normalized = normalizeHex(color);

  if (!normalized) {
    return;
  }

  syncColorControls(
    type,
    normalized,
  );

  updateContrastColors(
    type,
    normalized,
  );

  updateContrast();
}

/* =========================================================
   Swap Colors
   ========================================================= */

function handleSwapColors() {
  const foreground = getForegroundColor();
  const background = getBackgroundColor();

  if (
    !isValidHex(foreground) ||
    !isValidHex(background)
  ) {
    showErrorToast(
      "Please enter valid HEX colors first.",
    );

    return;
  }

  const normalizedForeground =
    normalizeHex(foreground);

  const normalizedBackground =
    normalizeHex(background);

  if (
    !normalizedForeground ||
    !normalizedBackground
  ) {
    showErrorToast(
      "Please enter valid HEX colors first.",
    );

    return;
  }

  syncColorControls(
    "foreground",
    normalizedBackground,
  );

  syncColorControls(
    "background",
    normalizedForeground,
  );

  setContrastColors(
    normalizedBackground,
    normalizedForeground,
  );

  updateContrast();

  showSuccessToast(
    "Foreground and background swapped",
  );
}

/* =========================================================
   Update Contrast Colors
   ========================================================= */

function updateContrastColors(type, color) {
  const currentState = getContrastState();

  if (type === "foreground") {
    setContrastColors(
      color,
      currentState.background,
    );

    return;
  }

  if (type === "background") {
    setContrastColors(
      currentState.foreground,
      color,
    );
  }
}

/* =========================================================
   Update Contrast
   ========================================================= */

export function updateContrast() {
  const foreground = getForegroundColor();
  const background = getBackgroundColor();

  const result = checkContrast(
    foreground,
    background,
  );

  setContrastState({
    foreground:
      result.foreground || foreground,

    background:
      result.background || background,

    ratio:
      result.ratio ?? 0,

    level:
      result.level || CONTRAST_LEVELS.FAIL,
  });

  renderContrastResult(result);
}

/* =========================================================
   Render Contrast Result
   ========================================================= */

function renderContrastResult(result) {
  if (!result || !result.valid) {
    renderInvalidResult();

    return;
  }

  renderRatio(result.formattedRatio);

  renderLevel(result);

  renderWCAGResult(
    elements.normalAA,
    result.normalText.aa,
  );

  renderWCAGResult(
    elements.normalAAA,
    result.normalText.aaa,
  );

  renderWCAGResult(
    elements.largeAA,
    result.largeText.aa,
  );

  renderWCAGResult(
    elements.largeAAA,
    result.largeText.aaa,
  );

  renderPreview(
    result.foreground,
    result.background,
  );
}

/* =========================================================
   Render Ratio
   ========================================================= */

function renderRatio(ratio) {
  if (!elements.ratio) {
    return;
  }

  elements.ratio.textContent = ratio || "N/A";
}

/* =========================================================
   Render Level
   ========================================================= */

function renderLevel(result) {
  if (!elements.level) {
    return;
  }

  const level =
    result.level || CONTRAST_LEVELS.FAIL;

  let label = "Fail";

  if (level === CONTRAST_LEVELS.AAA) {
    label = "AAA";
  } else if (level === CONTRAST_LEVELS.AA) {
    label = "AA";
  }

  elements.level.textContent = label;

  elements.level.classList.remove(
    "is-pass",
    "is-fail",
    "is-aaa",
  );

  if (level === CONTRAST_LEVELS.AAA) {
    elements.level.classList.add("is-aaa");
  } else if (level === CONTRAST_LEVELS.AA) {
    elements.level.classList.add("is-pass");
  } else {
    elements.level.classList.add("is-fail");
  }
}

/* =========================================================
   Render WCAG Result
   ========================================================= */

function renderWCAGResult(element, passed) {
  if (!element) {
    return;
  }

  element.classList.toggle(
    "is-pass",
    Boolean(passed),
  );

  element.classList.toggle(
    "is-fail",
    !passed,
  );

  const icon = element.querySelector("i");

  if (icon) {
    icon.classList.toggle(
      "fa-check",
      Boolean(passed),
    );

    icon.classList.toggle(
      "fa-xmark",
      !passed,
    );
  }

  const status = element.querySelector(
    "[data-status]",
  );

  if (status) {
    status.textContent =
      passed ? "Pass" : "Fail";
  }
}

/* =========================================================
   Render Preview
   ========================================================= */

function renderPreview(
  foreground,
  background,
) {
  if (!elements.preview) {
    return;
  }

  elements.preview.style.backgroundColor =
    background;

  elements.preview.style.color =
    foreground;

  if (elements.previewText) {
    elements.previewText.style.color =
      foreground;
  }
}

/* =========================================================
   Render Invalid Result
   ========================================================= */

function renderInvalidResult() {
  renderRatio("N/A");

  if (elements.level) {
    elements.level.textContent = "Invalid";

    elements.level.classList.remove(
      "is-pass",
      "is-aaa",
    );

    elements.level.classList.add(
      "is-fail",
    );
  }

  [
    elements.normalAA,
    elements.normalAAA,
    elements.largeAA,
    elements.largeAAA,
  ].forEach((element) => {
    renderWCAGResult(
      element,
      false,
    );
  });

  /*
   * Do not leave a previous valid contrast preview
   * visible when the current colors are invalid.
   */
  if (elements.preview) {
    elements.preview.style.removeProperty(
      "background-color",
    );

    elements.preview.style.removeProperty(
      "color",
    );
  }

  if (elements.previewText) {
    elements.previewText.style.removeProperty(
      "color",
    );
  }
}

/* =========================================================
   Sync Color Controls
   ========================================================= */

function syncColorControls(type, color) {
  const normalized = normalizeHex(color);

  if (!normalized) {
    return;
  }

  if (type === "foreground") {
    if (elements.foregroundInput) {
      elements.foregroundInput.value =
        normalized;
    }

    if (elements.foregroundPicker) {
      elements.foregroundPicker.value =
        normalized;
    }

    return;
  }

  if (type === "background") {
    if (elements.backgroundInput) {
      elements.backgroundInput.value =
        normalized;
    }

    if (elements.backgroundPicker) {
      elements.backgroundPicker.value =
        normalized;
    }
  }
}

/* =========================================================
   Get Foreground Color
   ========================================================= */

function getForegroundColor() {
  const contrastState =
    getContrastState();

  const inputValue =
    elements.foregroundInput?.value?.trim();

  if (isValidHex(inputValue)) {
    return normalizeHex(inputValue);
  }

  if (isValidHex(contrastState?.foreground)) {
    return normalizeHex(
      contrastState.foreground,
    );
  }

  return "#FFFFFF";
}

/* =========================================================
   Get Background Color
   ========================================================= */

function getBackgroundColor() {
  const contrastState =
    getContrastState();

  const inputValue =
    elements.backgroundInput?.value?.trim();

  if (isValidHex(inputValue)) {
    return normalizeHex(inputValue);
  }

  if (isValidHex(contrastState?.background)) {
    return normalizeHex(
      contrastState.background,
    );
  }

  return DEFAULT_BASE_COLOR;
}

/* =========================================================
   Normalize Or Fallback
   ========================================================= */

function normalizeOrFallback(
  color,
  fallback,
) {
  const normalized = normalizeHex(color);

  if (normalized) {
    return normalized;
  }

  return normalizeHex(fallback) || fallback;
}