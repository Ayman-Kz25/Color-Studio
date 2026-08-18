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
    normalizeHex(
      DEFAULT_CONTRAST_COLORS?.FOREGROUND,
    ) ||
    "#FFFFFF";

  const background =
    normalizeHex(state?.background) ||
    normalizeHex(
      DEFAULT_CONTRAST_COLORS?.BACKGROUND,
    ) ||
    normalizeHex(DEFAULT_BASE_COLOR) ||
    "#000000";

  /*
   * Establish the application state first.
   *
   * The state becomes the single source of truth.
   */
  setContrastColors(
    foreground,
    background,
  );

  /*
   * Synchronize the DOM from state.
   */
  syncColorControls(
    "foreground",
    foreground,
  );

  syncColorControls(
    "background",
    background,
  );

  /*
   * Render contrast using the exact same values.
   */
  updateContrast(
    foreground,
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
   * Allow incomplete HEX values while typing.
   */
  if (!isValidHex(color)) {
    return;
  }

  const normalized =
    normalizeHex(color);

  if (!normalized) {
    return;
  }

  const state =
    getContrastState();

  const currentForeground =
    normalizeHex(state?.foreground) ||
    getDefaultForeground();

  const currentBackground =
    normalizeHex(state?.background) ||
    getDefaultBackground();

  const foreground =
    type === "foreground"
      ? normalized
      : currentForeground;

  const background =
    type === "background"
      ? normalized
      : currentBackground;

  /*
   * Update state first.
   */
  setContrastColors(
    foreground,
    background,
  );

  /*
   * Synchronize both controls.
   */
  syncColorControls(
    "foreground",
    foreground,
  );

  syncColorControls(
    "background",
    background,
  );

  /*
   * Recalculate using the exact current values.
   */
  updateContrast(
    foreground,
    background,
  );
}


/* =========================================================
   Swap Colors
   ========================================================= */

function handleSwapColors(event) {
  event?.preventDefault();

  /*
   * IMPORTANT:
   *
   * Read both colors from application state.
   * Do not read one from the DOM and one from state.
   *
   * Both values are captured before anything changes.
   */
  const state =
    getContrastState();

  const foreground =
    normalizeHex(state?.foreground);

  const background =
    normalizeHex(state?.background);

  if (!foreground || !background) {
    showErrorToast(
      "Please enter valid HEX colors first.",
    );

    return;
  }

  /*
   * Swap the values.
   *
   * Old:
   * foreground = A
   * background = B
   *
   * New:
   * foreground = B
   * background = A
   */
  const swappedForeground =
    background;

  const swappedBackground =
    foreground;

  /*
   * Update application state.
   */
  setContrastColors(
    swappedForeground,
    swappedBackground,
  );

  /*
   * Update the visible controls.
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
   * Calculate and render using the swapped values.
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
  foreground,
  background,
) {
  const normalizedForeground =
    normalizeHex(foreground);

  const normalizedBackground =
    normalizeHex(background);

  /*
   * Invalid colors.
   */
  if (
    !normalizedForeground ||
    !normalizedBackground
  ) {
    setContrastState({
      foreground:
        normalizedForeground,

      background:
        normalizedBackground,

      ratio: 0,

      level:
        CONTRAST_LEVELS.FAIL,
    });

    renderInvalidResult();

    return;
  }

  /*
   * Calculate contrast.
   */
  const result =
    checkContrast(
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
   * Store the complete result.
   */
  setContrastState({
    foreground:
      result.foreground,

    background:
      result.background,

    ratio:
      result.ratio,

    level:
      result.level ||
      CONTRAST_LEVELS.FAIL,
  });

  /*
   * Render from the same result.
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
   Default Foreground
   ========================================================= */

function getDefaultForeground() {
  return (
    normalizeHex(
      DEFAULT_CONTRAST_COLORS?.FOREGROUND,
    ) ||
    "#FFFFFF"
  );
}


/* =========================================================
   Default Background
   ========================================================= */

function getDefaultBackground() {
  return (
    normalizeHex(
      DEFAULT_CONTRAST_COLORS?.BACKGROUND,
    ) ||
    normalizeHex(DEFAULT_BASE_COLOR) ||
    "#000000"
  );
}