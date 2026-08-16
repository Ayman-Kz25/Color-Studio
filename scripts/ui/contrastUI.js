import { checkContrast } from "../modules/contrast/contrastChecker.js";

/* DOM Elements */
let elements = {};

/* Initialization */
export function initializeContrastUI() {
  cacheElements();

  bindEvents();

  updateContrast();
}

/* Cache DOM Elements */
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

/* Event Binding */
function bindEvents() {
  elements.foregroundInput?.addEventListener("input", handleForegroundInput);

  elements.foregroundPicker?.addEventListener("input", handleForegroundPicker);

  elements.backgroundInput?.addEventListener("input", handleBackgroundInput);

  elements.backgroundPicker?.addEventListener("input", handleBackgroundPicker);

  elements.swapButton?.addEventListener("click", handleSwapColors);
}

/* Foreground Text Input */
function handleForegroundInput(event) {
  const color = event.target.value.trim();

  if (!isValidHex(color)) {
    return;
  }

  syncColorControls("foreground", color);

  updateContrast();
}

/* Foreground Picker */
function handleForegroundPicker(event) {
  const color = event.target.value;

  syncColorControls("foreground", color);

  updateContrast();
}

/* Background Text Input */
function handleBackgroundInput(event) {
  const color = event.target.value.trim();

  if (!isValidHex(color)) {
    return;
  }

  syncColorControls("background", color);

  updateContrast();
}

/* Background Picker */
function handleBackgroundPicker(event) {
  const color = event.target.value;

  syncColorControls("background", color);

  updateContrast();
}

/* Swap Colors */
function handleSwapColors() {
  const foreground = getForegroundColor();

  const background = getBackgroundColor();

  if (!isValidHex(foreground) || !isValidHex(background)) {
    return;
  }

  syncColorControls("foreground", background);

  syncColorControls("background", foreground);

  updateContrast();
}

/* Update Contrast */
export function updateContrast() {
  const foreground = getForegroundColor();

  const background = getBackgroundColor();

  const result = checkContrast(foreground, background);

  renderContrastResult(result);
}

/* Render Contrast Result */
function renderContrastResult(result) {
  if (!result.valid) {
    renderInvalidResult();

    return;
  }

  renderRatio(result.formattedRatio);

  renderLevel(result);

  renderWCAGResult(elements.normalAA, result.normalText.aa);

  renderWCAGResult(elements.normalAAA, result.normalText.aaa);

  renderWCAGResult(elements.largeAA, result.largeText.aa);

  renderWCAGResult(elements.largeAAA, result.largeText.aaa);

  renderPreview(result.foreground, result.background);
}

/* Render Ratio */
function renderRatio(ratio) {
  if (!elements.ratio) {
    return;
  }

  elements.ratio.textContent = ratio;
}

/* Render Level */
function renderLevel(result) {
  if (!elements.level) {
    return;
  }

  let label = "Fail";

  if (result.normalText.aaa) {
    label = "AAA";
  } else if (result.normalText.aa) {
    label = "AA";
  }

  elements.level.textContent = label;

  elements.level.classList.remove("is-pass", "is-fail", "is-aaa");

  if (result.normalText.aaa) {
    elements.level.classList.add("is-aaa");
  } else if (result.normalText.aa) {
    elements.level.classList.add("is-pass");
  } else {
    elements.level.classList.add("is-fail");
  }
}

/* Render WCAG Result */
function renderWCAGResult(element, passed) {
  if (!element) {
    return;
  }

  element.classList.toggle("is-pass", passed);

  element.classList.toggle("is-fail", !passed);

  const icon = element.querySelector("i");

  if (icon) {
    icon.classList.toggle("fa-check", passed);

    icon.classList.toggle("fa-xmark", !passed);
  }

  const status = element.querySelector("[data-status]");

  if (status) {
    status.textContent = passed ? "Pass" : "Fail";
  }
}

/* Render Preview */
function renderPreview(foreground, background) {
  if (!elements.preview) {
    return;
  }

  elements.preview.style.backgroundColor = background;

  elements.preview.style.color = foreground;

  if (elements.previewText) {
    elements.previewText.style.color = foreground;
  }
}

/* Invalid Result */
function renderInvalidResult() {
  if (elements.ratio) {
    elements.ratio.textContent = "N/A";
  }

  if (elements.level) {
    elements.level.textContent = "Invalid";

    elements.level.classList.remove("is-pass", "is-aaa");

    elements.level.classList.add("is-fail");
  }

  [
    elements.normalAA,
    elements.normalAAA,
    elements.largeAA,
    elements.largeAAA,
  ].forEach((element) => {
    renderWCAGResult(element, false);
  });
}

/* Sync Color Controls */
function syncColorControls(type, color) {
  const normalized = normalizeHex(color);

  if (!normalized) {
    return;
  }

  if (type === "foreground") {
    if (elements.foregroundInput) {
      elements.foregroundInput.value = normalized;
    }

    if (elements.foregroundPicker) {
      elements.foregroundPicker.value = normalized;
    }
  }

  if (type === "background") {
    if (elements.backgroundInput) {
      elements.backgroundInput.value = normalized;
    }

    if (elements.backgroundPicker) {
      elements.backgroundPicker.value = normalized;
    }
  }
}

/* Get Foreground Color */
function getForegroundColor() {
  return (
    elements.foregroundInput?.value?.trim() ||
    elements.foregroundPicker?.value ||
    "#111111"
  );
}

/* Get Background Color */
function getBackgroundColor() {
  return (
    elements.backgroundInput?.value?.trim() ||
    elements.backgroundPicker?.value ||
    "#FFFFFF"
  );
}

/* HEX Validation */
function isValidHex(hex) {
  if (typeof hex !== "string") {
    return false;
  }

  return /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(hex.trim());
}

/* HEX Normalization */
function normalizeHex(hex) {
  if (!isValidHex(hex)) {
    return null;
  }

  let normalized = hex.trim().toUpperCase();

  if (normalized.length === 4) {
    normalized =
      "#" +
      normalized
        .slice(1)
        .split("")
        .map((character) => {
          return character + character;
        })
        .join("");
  }

  return normalized;
}
