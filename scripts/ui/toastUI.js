/* =========================================================
   Color Studio
   Toast UI
   ========================================================= */

import {
  toastContainer,
  appToast,
  toastMessage,
  toastIcon,
} from "./dom.js";

/* =========================================================
   Constants
   ========================================================= */

const DEFAULT_DURATION = 2500;
const ERROR_DURATION = 3000;

const TOAST_TYPES = Object.freeze({
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
});

/* =========================================================
   State
   ========================================================= */

let hideTimer = null;
let removeHidingTimer = null;
let eventsBound = false;

/* =========================================================
   Initialization
   ========================================================= */

export function initializeToastUI() {
  if (eventsBound) {
    return;
  }

  bindEvents();

  eventsBound = true;

  if (appToast) {
    appToast.setAttribute(
      "aria-hidden",
      "true",
    );
  }
}

/* =========================================================
   Event Binding
   ========================================================= */

function bindEvents() {
  document.addEventListener(
    "colorstudio:toast",
    handleToastEvent,
  );
}

/* =========================================================
   Toast Event
   ========================================================= */

function handleToastEvent(event) {
  const detail = event?.detail;

  if (!detail) {
    return;
  }

  const message =
    typeof detail.message === "string"
      ? detail.message.trim()
      : "";

  if (!message) {
    return;
  }

  const type =
    normalizeToastType(detail.type);

  const duration =
    normalizeDuration(
      detail.duration,
      getDefaultDuration(type),
    );

  showTypedToast(
    message,
    type,
    duration,
  );
}

/* =========================================================
   Show Toast
   ========================================================= */

export function showToast(
  message,
  duration = DEFAULT_DURATION,
) {
  showSuccessToast(
    message,
    duration,
  );
}

/* =========================================================
   Success Toast
   ========================================================= */

export function showSuccessToast(
  message,
  duration = DEFAULT_DURATION,
) {
  showTypedToast(
    message,
    TOAST_TYPES.SUCCESS,
    duration,
  );
}

/* =========================================================
   Error Toast
   ========================================================= */

export function showErrorToast(
  message,
  duration = ERROR_DURATION,
) {
  showTypedToast(
    message,
    TOAST_TYPES.ERROR,
    duration,
  );
}

/* =========================================================
   Warning Toast
   ========================================================= */

export function showWarningToast(
  message,
  duration = ERROR_DURATION,
) {
  showTypedToast(
    message,
    TOAST_TYPES.WARNING,
    duration,
  );
}

/* =========================================================
   Info Toast
   ========================================================= */

export function showInfoToast(
  message,
  duration = DEFAULT_DURATION,
) {
  showTypedToast(
    message,
    TOAST_TYPES.INFO,
    duration,
  );
}

/* =========================================================
   Hide Toast
   ========================================================= */

export function hideToast() {
  if (!appToast) {
    return;
  }

  clearTimeout(hideTimer);
  clearTimeout(removeHidingTimer);

  appToast.classList.remove(
    "is-visible",
  );

  appToast.classList.add(
    "is-hiding",
  );

  appToast.setAttribute(
    "aria-hidden",
    "true",
  );

  toastContainer?.classList.remove(
    "is-active",
  );

  removeHidingTimer =
    window.setTimeout(() => {
      appToast?.classList.remove(
        "is-hiding",
      );
    }, 200);
}

/* =========================================================
   Typed Toast
   ========================================================= */

function showTypedToast(
  message,
  type,
  duration,
) {
  if (!appToast) {
    console.warn(
      "[ColorStudio] Toast element not found.",
    );

    return;
  }

  const normalizedMessage =
    normalizeMessage(message);

  if (!normalizedMessage) {
    return;
  }

  const normalizedType =
    normalizeToastType(type);

  const normalizedDuration =
    normalizeDuration(
      duration,
      getDefaultDuration(
        normalizedType,
      ),
    );

  clearTimeout(hideTimer);
  clearTimeout(removeHidingTimer);

  setToastMessage(
    normalizedMessage,
  );

  setToastIcon(
    normalizedType,
  );

  setToastType(
    normalizedType,
  );

  appToast.classList.remove(
    "is-hiding",
  );

  /*
   * Force the browser to recognize the
   * visibility transition when a toast
   * is shown immediately after another one.
   */
  void appToast.offsetWidth;

  appToast.classList.add(
    "is-visible",
  );

  appToast.setAttribute(
    "aria-hidden",
    "false",
  );

  toastContainer?.classList.add(
    "is-active",
  );

  if (normalizedDuration > 0) {
    hideTimer = window.setTimeout(
      hideToast,
      normalizedDuration,
    );
  }
}

/* =========================================================
   Set Toast Message
   ========================================================= */

function setToastMessage(message) {
  if (!toastMessage) {
    return;
  }

  /*
   * textContent prevents HTML injection.
   */
  toastMessage.textContent =
    message;
}

/* =========================================================
   Set Toast Type
   ========================================================= */

function setToastType(type) {
  appToast?.classList.remove(
    "toast-success",
    "toast-error",
    "toast-warning",
    "toast-info",
  );

  appToast?.classList.add(
    `toast-${type}`,
  );
}

/* =========================================================
   Set Toast Icon
   ========================================================= */

function setToastIcon(type) {
  if (!toastIcon) {
    return;
  }

  const icon =
    toastIcon.querySelector("i");

  if (!icon) {
    return;
  }

  icon.className = "";

  switch (type) {
    case TOAST_TYPES.ERROR:
      icon.className =
        "fa-solid fa-circle-xmark";
      break;

    case TOAST_TYPES.WARNING:
      icon.className =
        "fa-solid fa-triangle-exclamation";
      break;

    case TOAST_TYPES.INFO:
      icon.className =
        "fa-solid fa-circle-info";
      break;

    case TOAST_TYPES.SUCCESS:
    default:
      icon.className =
        "fa-solid fa-circle-check";
      break;
  }
}

/* =========================================================
   Normalize Toast Type
   ========================================================= */

function normalizeToastType(type) {
  if (
    typeof type !== "string"
  ) {
    return TOAST_TYPES.SUCCESS;
  }

  const normalized =
    type.trim().toLowerCase();

  return Object.values(
    TOAST_TYPES,
  ).includes(normalized)
    ? normalized
    : TOAST_TYPES.SUCCESS;
}

/* =========================================================
   Normalize Message
   ========================================================= */

function normalizeMessage(message) {
  if (
    typeof message !== "string"
  ) {
    return "";
  }

  return message.trim();
}

/* =========================================================
   Normalize Duration
   ========================================================= */

function normalizeDuration(
  duration,
  fallback,
) {
  const value =
    Number(duration);

  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    return fallback;
  }

  return value;
}

/* =========================================================
   Default Duration
   ========================================================= */

function getDefaultDuration(type) {
  return type === TOAST_TYPES.ERROR ||
    type === TOAST_TYPES.WARNING
    ? ERROR_DURATION
    : DEFAULT_DURATION;
}