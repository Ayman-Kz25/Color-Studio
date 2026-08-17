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
const WARNING_DURATION = 3000;

const HIDE_ANIMATION_DURATION = 200;

const TOAST_TYPES = Object.freeze({
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
});

const TOAST_ICONS = Object.freeze({
  success:
    "fa-solid fa-circle-check",

  error:
    "fa-solid fa-circle-xmark",

  warning:
    "fa-solid fa-triangle-exclamation",

  info:
    "fa-solid fa-circle-info",
});


/* =========================================================
   State
   ========================================================= */

let hideTimer = null;
let animationTimer = null;
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
  const message =
    event?.detail?.message;

  const type =
    event?.detail?.type ||
    TOAST_TYPES.SUCCESS;

  const duration =
    event?.detail?.duration;

  if (!message) {
    return;
  }

  showTypedToast(
    message,
    type,
    duration,
  );
}


/* =========================================================
   Show Toast
   ========================================================= */

/*
 * Kept for backwards compatibility.
 *
 * Existing code can continue using:
 *
 * showToast("Palette generated");
 *
 * It behaves as a success toast.
 */

export function showToast(
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
   Hide Toast
   ========================================================= */

export function hideToast() {
  if (!appToast) {
    return;
  }

  clearToastTimers();

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

  animationTimer =
    window.setTimeout(() => {
      /*
       * Don't assume the DOM node still exists
       * or is still in the same state.
       */
      if (!appToast) {
        return;
      }

      appToast.classList.remove(
        "is-hiding",
      );

      animationTimer = null;
    }, HIDE_ANIMATION_DURATION);
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

  const iconClass =
    TOAST_ICONS[type] ||
    TOAST_ICONS.success;

  icon.className =
    iconClass;
}


/* =========================================================
   Public Toast Types
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


export function showWarningToast(
  message,
  duration = WARNING_DURATION,
) {
  showTypedToast(
    message,
    TOAST_TYPES.WARNING,
    duration,
  );
}


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
   Typed Toast
   ========================================================= */

function showTypedToast(
  message,
  type = TOAST_TYPES.SUCCESS,
  duration = DEFAULT_DURATION,
) {
  if (!appToast) {
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
    normalizeDuration(duration);

  clearToastTimers();

  /*
   * Cancel an unfinished hide animation before
   * showing the toast again.
   */
  appToast.classList.remove(
    "is-hiding",
  );

  /*
   * textContent is intentionally used instead
   * of innerHTML.
   */
  if (toastMessage) {
    toastMessage.textContent =
      normalizedMessage;
  }

  setToastIcon(
    normalizedType,
  );

  updateToastType(
    normalizedType,
  );

  updateToastAccessibility(
    normalizedType,
  );

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

  hideTimer =
    window.setTimeout(
      hideToast,
      normalizedDuration,
    );
}


/* =========================================================
   Toast Type
   ========================================================= */

function updateToastType(type) {
  if (!appToast) {
    return;
  }

  appToast.classList.remove(
    "toast-success",
    "toast-error",
    "toast-warning",
    "toast-info",
  );

  appToast.classList.add(
    `toast-${type}`,
  );
}


/* =========================================================
   Accessibility
   ========================================================= */

function updateToastAccessibility(type) {
  if (!appToast) {
    return;
  }

  /*
   * Errors and warnings should interrupt the user.
   * Success/info messages can use status semantics.
   */
  const role =
    type === TOAST_TYPES.ERROR ||
    type === TOAST_TYPES.WARNING
      ? "alert"
      : "status";

  appToast.setAttribute(
    "role",
    role,
  );

  /*
   * aria-live is useful when the toast is already
   * present in the DOM.
   */
  appToast.setAttribute(
    "aria-live",
    role === "alert"
      ? "assertive"
      : "polite",
  );

  appToast.setAttribute(
    "aria-atomic",
    "true",
  );
}


/* =========================================================
   Validation
   ========================================================= */

function normalizeMessage(message) {
  if (
    typeof message !== "string"
  ) {
    return "";
  }

  return message.trim();
}


function normalizeToastType(type) {
  if (
    typeof type !== "string"
  ) {
    return TOAST_TYPES.SUCCESS;
  }

  return Object.values(
    TOAST_TYPES,
  ).includes(type)
    ? type
    : TOAST_TYPES.SUCCESS;
}


function normalizeDuration(duration) {
  const value =
    Number(duration);

  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return DEFAULT_DURATION;
  }

  /*
   * Prevent absurdly long timers.
   */
  return Math.min(
    value,
    30000,
  );
}


/* =========================================================
   Timer Management
   ========================================================= */

function clearToastTimers() {
  if (hideTimer !== null) {
    window.clearTimeout(
      hideTimer,
    );

    hideTimer = null;
  }

  if (animationTimer !== null) {
    window.clearTimeout(
      animationTimer,
    );

    animationTimer = null;
  }
}