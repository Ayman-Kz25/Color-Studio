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
   State
   ========================================================= */

let hideTimer = null;

/* =========================================================
   Initialization
   ========================================================= */

export function initializeToastUI() {
  bindEvents();
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
  const message = event.detail?.message;

  if (!message) {
    return;
  }

  showToast(message);
}

/* =========================================================
   Show Toast
   ========================================================= */

export function showToast(
  message,
  duration = 2500,
) {
  showTypedToast(
    message,
    "success",
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

  window.setTimeout(() => {
    appToast?.classList.remove(
      "is-hiding",
    );
  }, 200);
}

/* =========================================================
   Set Toast Icon
   ========================================================= */

function setToastIcon(type) {
  if (!toastIcon) {
    return;
  }

  const icon = toastIcon.querySelector("i");

  if (!icon) {
    return;
  }

  icon.className = "";

  switch (type) {
    case "error":
      icon.className =
        "fa-solid fa-circle-xmark";
      break;

    case "warning":
      icon.className =
        "fa-solid fa-triangle-exclamation";
      break;

    case "info":
      icon.className =
        "fa-solid fa-circle-info";
      break;

    case "success":
    default:
      icon.className =
        "fa-solid fa-circle-check";
      break;
  }
}

/* =========================================================
   Public Toast Types
   ========================================================= */

export function showSuccessToast(
  message,
  duration = 2500,
) {
  showTypedToast(
    message,
    "success",
    duration,
  );
}

export function showErrorToast(
  message,
  duration = 3000,
) {
  showTypedToast(
    message,
    "error",
    duration,
  );
}

export function showWarningToast(
  message,
  duration = 3000,
) {
  showTypedToast(
    message,
    "warning",
    duration,
  );
}

export function showInfoToast(
  message,
  duration = 2500,
) {
  showTypedToast(
    message,
    "info",
    duration,
  );
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
    return;
  }

  clearTimeout(hideTimer);

  if (toastMessage) {
    toastMessage.textContent = message;
  }

  setToastIcon(type);

  appToast.classList.remove(
    "toast-success",
    "toast-error",
    "toast-warning",
    "toast-info",
  );

  appToast.classList.add(
    `toast-${type}`,
  );

  appToast.classList.remove(
    "is-hiding",
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

  hideTimer = window.setTimeout(
    hideToast,
    duration,
  );
}