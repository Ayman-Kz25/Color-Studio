import {
  DEFAULT_BASE_COLOR,
  CONTRAST_LEVELS,
  DEFAULT_CONTRAST_COLORS,
} from "../core/constants.js";

import {
  getContrastState,
  setContrastColors,
  setContrastState,
} from "../core/state.js";

import {
  isValidHex,
  normalizeHex,
} from "../modules/palette/colorUtils.js";

import {
  showSuccessToast,
  showErrorToast,
} from "./toastUI.js";

import { dom } from "./dom.js";

import {
  checkContrast,
} from "../modules/contrast/contrastChecker.js";


/* =========================================================
   Initialization
   ========================================================= */

let eventsBound = false;

export function initializeContrastUI() {
  if (!eventsBound) {
    bindEvents();
    eventsBound = true;
  }

  initializeColors();
  updateContrast();
}


/* =========================================================
   Event Binding
   ========================================================= */

function bindEvents() {
  dom.foregroundHexInput?.addEventListener(
    "input",
    handleForegroundInput,
  );

  dom.foregroundColorPicker?.addEventListener(
    "input",
    handleForegroundPicker,
  );

  dom.backgroundHexInput?.addEventListener(
    "input",
    handleBackgroundInput,
  );

  dom.backgroundColorPicker?.addEventListener(
    "input",
    handleBackgroundPicker,
  );

  dom.swapContrastColorsButton?.addEventListener(
    "click",
    handleSwapColors,
  );
}


/* =========================================================
   Initialize Colors
   ========================================================= */

function initializeColors() {
  const state = getContrastState();

  const foreground =
    normalizeHex(state?.foreground) ||
    normalizeHex(DEFAULT_CONTRAST_COLORS?.FOREGROUND) ||
    "#FFFFFF";

  const background =
    normalizeHex(state?.background) ||
    normalizeHex(DEFAULT_CONTRAST_COLORS?.BACKGROUND) ||
    normalizeHex(DEFAULT_BASE_COLOR) ||
    "#000000";

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
   Foreground Input
   ========================================================= */

function handleForegroundInput(event) {
  handleColorInput(
    "foreground",
    event?.target?.value,
  );
}


/* =========================================================
   Foreground Picker
   ========================================================= */

function handleForegroundPicker(event) {
  handleColorInput(
    "foreground",
    event?.target?.value,
  );
}


/* =========================================================
   Background Input
   ========================================================= */

function handleBackgroundInput(event) {
  handleColorInput(
    "background",
    event?.target?.value,
  );
}


/* =========================================================
   Background Picker
   ========================================================= */

function handleBackgroundPicker(event) {
  handleColorInput(
    "background",
    event?.target?.value,
  );
}


/* =========================================================
   Handle Color Input
   ========================================================= */

function handleColorInput(type, value) {
  const color =
    typeof value === "string"
      ? value.trim()
      : "";

  /*
   * Do not update anything while the user is
   * temporarily entering an incomplete HEX value.
   */
  if (!isValidHex(color)) {
    return;
  }

  const normalized = normalizeHex(color);

  if (!normalized) {
    return;
  }

  const state = getContrastState();

  const foreground =
    type === "foreground"
      ? normalized
      : normalizeHex(state?.foreground) ||
        getForegroundColor();

  const background =
    type === "background"
      ? normalized
      : normalizeHex(state?.background) ||
        getBackgroundColor();

  /*
   * Keep both state and controls synchronized.
   */
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

  updateContrast(
    foreground,
    background,
  );
}


/* =========================================================
   Swap Colors
   ========================================================= */

function handleSwapColors(event) {
  /*
   * Prevent form submission if the button happens
   * to be inside a form.
   */
  event?.preventDefault();

  /*
   * Read both values BEFORE changing either input.
   *
   * This is important. We must preserve the original
   * foreground and background before swapping them.
   */
  const foreground = getForegroundColor();
  const background = getBackgroundColor();

  if (!foreground || !background) {
    showErrorToast(
      "Please enter valid HEX colors first.",
    );

    return;
  }

  /*
   * The actual swap.
   *
   * Old:
   * foreground = A
   * background = B
   *
   * New:
   * foreground = B
   * background = A
   */
  const swappedForeground = background;
  const swappedBackground = foreground;

  /*
   * Update the color state first.
   */
  setContrastColors(
    swappedForeground,
    swappedBackground,
  );

  /*
   * Update both HEX inputs and both color pickers.
   */
  syncColorControls(
    "foreground",
    swappedForeground,
  );

  syncColorControls(
    "background",
    swappedBackground,
  );

  /*
   * Calculate using the swapped values directly.
   *
   * Do NOT let updateContrast() read the DOM again here.
   * This prevents stale values from being used.
   */
  updateContrast(
    swappedForeground,
    swappedBackground,
  );

  showSuccessToast(
    "Foreground and background swapped",
  );
}


/* =========================================================
   Update Contrast
   ========================================================= */

export function updateContrast(
  foreground = getForegroundColor(),
  background = getBackgroundColor(),
) {
  const normalizedForeground =
    normalizeHex(foreground);

  const normalizedBackground =
    normalizeHex(background);

  /*
   * Invalid input.
   */
  if (
    !normalizedForeground ||
    !normalizedBackground
  ) {
    setContrastState({
      foreground: normalizedForeground,
      background: normalizedBackground,
      ratio: 0,
      level: CONTRAST_LEVELS.FAIL,
    });

    renderInvalidResult();

    return;
  }

  /*
   * Calculate contrast using the exact colors
   * passed into this function.
   */
  const result = checkContrast(
    normalizedForeground,
    normalizedBackground,
  );

  if (!result || !result.valid) {
    setContrastState({
      foreground:
        result?.foreground ||
        normalizedForeground,

      background:
        result?.background ||
        normalizedBackground,

      ratio:
        result?.ratio ?? 0,

      level:
        result?.level ||
        CONTRAST_LEVELS.FAIL,
    });

    renderInvalidResult();

    return;
  }

  /*
   * Store the complete current result.
   */
  setContrastState({
    foreground: result.foreground,
    background: result.background,
    ratio: result.ratio,
    level:
      result.level ||
      CONTRAST_LEVELS.FAIL,
  });

  /*
   * Render everything from the same result.
   */
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

  renderRatio(
    result.formattedRatio,
  );

  renderNormalTextResult(
    result.normalText,
  );

  renderLargeTextResult(
    result.largeText,
  );

  renderUIComponentResult(
    result.uiComponent,
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
  if (!dom.contrastRatio) {
    return;
  }

  dom.contrastRatio.textContent =
    ratio || "N/A";
}


/* =========================================================
   Render Normal Text Result
   ========================================================= */

function renderNormalTextResult(result) {
  if (!dom.normalTextResult) {
    return;
  }

  const aaPassed =
    Boolean(result?.aa);

  const aaaPassed =
    Boolean(result?.aaa);

  const passed =
    aaPassed || aaaPassed;

  dom.normalTextResult.classList.toggle(
    "is-pass",
    passed,
  );

  dom.normalTextResult.classList.toggle(
    "is-fail",
    !passed,
  );

  if (dom.normalTextStatus) {
    dom.normalTextStatus.textContent =
      aaaPassed
        ? "AAA Pass"
        : aaPassed
          ? "AA Pass"
          : "Fail";
  }

  if (dom.normalTextLevel) {
    dom.normalTextLevel.textContent =
      aaaPassed
        ? "WCAG AAA"
        : aaPassed
          ? "WCAG AA"
          : "WCAG AA / AAA";
  }
}


/* =========================================================
   Render Large Text Result
   ========================================================= */

function renderLargeTextResult(result) {
  if (!dom.largeTextResult) {
    return;
  }

  const aaPassed =
    Boolean(result?.aa);

  const aaaPassed =
    Boolean(result?.aaa);

  const passed =
    aaPassed || aaaPassed;

  dom.largeTextResult.classList.toggle(
    "is-pass",
    passed,
  );

  dom.largeTextResult.classList.toggle(
    "is-fail",
    !passed,
  );

  if (dom.largeTextStatus) {
    dom.largeTextStatus.textContent =
      aaaPassed
        ? "AAA Pass"
        : aaPassed
          ? "AA Pass"
          : "Fail";
  }

  if (dom.largeTextLevel) {
    dom.largeTextLevel.textContent =
      aaaPassed
        ? "WCAG AAA"
        : aaPassed
          ? "WCAG AA"
          : "WCAG AA / AAA";
  }
}


/* =========================================================
   Render UI Component Result
   ========================================================= */

function renderUIComponentResult(result) {
  if (!dom.uiComponentResult) {
    return;
  }

  const passed =
    typeof result === "boolean"
      ? result
      : Boolean(
          result?.aa ??
          result?.pass ??
          result?.passed,
        );

  dom.uiComponentResult.classList.toggle(
    "is-pass",
    passed,
  );

  dom.uiComponentResult.classList.toggle(
    "is-fail",
    !passed,
  );

  if (dom.uiComponentStatus) {
    dom.uiComponentStatus.textContent =
      passed
        ? "Pass"
        : "Fail";
  }

  if (dom.uiComponentLevel) {
    dom.uiComponentLevel.textContent =
      "WCAG 1.4.11";
  }
}


/* =========================================================
   Render Preview
   ========================================================= */

function renderPreview(
  foreground,
  background,
) {
  if (!dom.contrastPreview) {
    return;
  }

  dom.contrastPreview.style.backgroundColor =
    background;

  dom.contrastPreview.style.color =
    foreground;

  if (dom.contrastPreviewLabel) {
    dom.contrastPreviewLabel.style.color =
      foreground;
  }

  if (dom.contrastPreviewHeading) {
    dom.contrastPreviewHeading.style.color =
      foreground;
  }

  if (dom.contrastPreviewText) {
    dom.contrastPreviewText.style.color =
      foreground;
  }
}


/* =========================================================
   Render Invalid Result
   ========================================================= */

function renderInvalidResult() {
  renderRatio("N/A");

  renderResultCardInvalid(
    dom.normalTextResult,
    dom.normalTextStatus,
    dom.normalTextLevel,
    "Fail",
    "WCAG AA / AAA",
  );

  renderResultCardInvalid(
    dom.largeTextResult,
    dom.largeTextStatus,
    dom.largeTextLevel,
    "Fail",
    "WCAG AA / AAA",
  );

  renderResultCardInvalid(
    dom.uiComponentResult,
    dom.uiComponentStatus,
    dom.uiComponentLevel,
    "Fail",
    "WCAG 1.4.11",
  );

  clearPreview();
}


/* =========================================================
   Clear Preview
   ========================================================= */

function clearPreview() {
  if (dom.contrastPreview) {
    dom.contrastPreview.style.removeProperty(
      "background-color",
    );

    dom.contrastPreview.style.removeProperty(
      "color",
    );
  }

  if (dom.contrastPreviewLabel) {
    dom.contrastPreviewLabel.style.removeProperty(
      "color",
    );
  }

  if (dom.contrastPreviewHeading) {
    dom.contrastPreviewHeading.style.removeProperty(
      "color",
    );
  }

  if (dom.contrastPreviewText) {
    dom.contrastPreviewText.style.removeProperty(
      "color",
    );
  }
}


/* =========================================================
   Render Invalid Result Card
   ========================================================= */

function renderResultCardInvalid(
  card,
  status,
  description,
  statusText,
  descriptionText,
) {
  if (card) {
    card.classList.remove("is-pass");
    card.classList.add("is-fail");
  }

  if (status) {
    status.textContent =
      statusText;
  }

  if (description) {
    description.textContent =
      descriptionText;
  }
}


/* =========================================================
   Sync Color Controls
   ========================================================= */

function syncColorControls(
  type,
  color,
) {
  const normalized =
    normalizeHex(color);

  if (!normalized) {
    return;
  }

  if (type === "foreground") {
    if (dom.foregroundHexInput) {
      dom.foregroundHexInput.value =
        normalized;
    }

    if (dom.foregroundColorPicker) {
      dom.foregroundColorPicker.value =
        normalized;
    }

    return;
  }

  if (type === "background") {
    if (dom.backgroundHexInput) {
      dom.backgroundHexInput.value =
        normalized;
    }

    if (dom.backgroundColorPicker) {
      dom.backgroundColorPicker.value =
        normalized;
    }
  }
}


/* =========================================================
   Get Foreground Color
   ========================================================= */

function getForegroundColor() {
  /*
   * The visible HEX input is the primary source.
   */
  const inputValue =
    dom.foregroundHexInput?.value?.trim();

  if (isValidHex(inputValue)) {
    return normalizeHex(inputValue);
  }

  /*
   * Fall back to application state.
   */
  const state =
    getContrastState();

  if (
    isValidHex(
      state?.foreground,
    )
  ) {
    return normalizeHex(
      state.foreground,
    );
  }

  /*
   * Final fallback.
   */
  return (
    normalizeHex(
      DEFAULT_CONTRAST_COLORS?.FOREGROUND,
    ) ||
    "#FFFFFF"
  );
}


/* =========================================================
   Get Background Color
   ========================================================= */

function getBackgroundColor() {
  /*
   * The visible HEX input is the primary source.
   */
  const inputValue =
    dom.backgroundHexInput?.value?.trim();

  if (isValidHex(inputValue)) {
    return normalizeHex(inputValue);
  }

  /*
   * Fall back to application state.
   */
  const state =
    getContrastState();

  if (
    isValidHex(
      state?.background,
    )
  ) {
    return normalizeHex(
      state.background,
    );
  }

  /*
   * Final fallback.
   */
  return (
    normalizeHex(
      DEFAULT_CONTRAST_COLORS?.BACKGROUND,
    ) ||
    normalizeHex(
      DEFAULT_BASE_COLOR,
    ) ||
    "#000000"
  );
}