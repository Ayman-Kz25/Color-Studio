/* =========================================================
   Color Studio
   Toast UI
   ========================================================= */

/* =========================================================
   DOM Elements
   ========================================================= */

let elements = {};

let hideTimer = null;

/* =========================================================
   Initialization
   ========================================================= */

export function initializeToastUI() {
  cacheElements();

  bindEvents();
}

/* =========================================================
   Cache DOM Elements
   ========================================================= */

function cacheElements() {
  elements = {
    container: document.querySelector("#toastContainer"),

    toast: document.querySelector("#appToast"),

    message: document.querySelector("#toastMessage"),

    icon: document.querySelector("#toastIcon"),

    closeButton: document.querySelector("#toastCloseBtn"),
  };
}

/* =========================================================
   Event Binding
   ========================================================= */

function bindEvents() {
  document.addEventListener("colorstudio:toast", handleToastEvent);

  elements.closeButton?.addEventListener("click", hideToast);
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

export function showToast(message, duration = 2500) {
  if (!elements.toast) {
    return;
  }

  clearTimeout(hideTimer);

  if (elements.message) {
    elements.message.textContent = message;
  }

  setToastIcon("success");

  elements.toast.classList.remove("is-hiding");

  elements.toast.classList.add("is-visible");

  elements.toast.setAttribute("aria-hidden", "false");

  if (elements.container) {
    elements.container.classList.add("is-active");
  }

  hideTimer = window.setTimeout(hideToast, duration);
}

/* =========================================================
   Hide Toast
   ========================================================= */

export function hideToast() {
  if (!elements.toast) {
    return;
  }

  elements.toast.classList.remove("is-visible");

  elements.toast.classList.add("is-hiding");

  elements.toast.setAttribute("aria-hidden", "true");

  if (elements.container) {
    elements.container.classList.remove("is-active");
  }

  window.setTimeout(() => {
    elements.toast?.classList.remove("is-hiding");
  }, 200);
}

/* =========================================================
   Set Toast Icon
   ========================================================= */

function setToastIcon(type) {
  if (!elements.icon) {
    return;
  }

  elements.icon.className = "";

  switch (type) {
    case "error":
      elements.icon.className = "fa-solid fa-circle-xmark";

      break;

    case "warning":
      elements.icon.className = "fa-solid fa-triangle-exclamation";

      break;

    case "info":
      elements.icon.className = "fa-solid fa-circle-info";

      break;

    case "success":

    default:
      elements.icon.className = "fa-solid fa-circle-check";

      break;
  }
}

/* =========================================================
   Public Toast Types
   ========================================================= */

export function showSuccessToast(message, duration = 2500) {
  showTypedToast(message, "success", duration);
}

export function showErrorToast(message, duration = 3000) {
  showTypedToast(message, "error", duration);
}

export function showWarningToast(message, duration = 3000) {
  showTypedToast(message, "warning", duration);
}

export function showInfoToast(message, duration = 2500) {
  showTypedToast(message, "info", duration);
}

/* =========================================================
   Typed Toast
   ========================================================= */

function showTypedToast(message, type, duration) {
  if (!elements.toast) {
    return;
  }

  clearTimeout(hideTimer);

  if (elements.message) {
    elements.message.textContent = message;
  }

  setToastIcon(type);

  elements.toast.classList.remove(
    "toast-success",
    "toast-error",
    "toast-warning",
    "toast-info",
  );

  elements.toast.classList.add(`toast-${type}`);

  elements.toast.classList.remove("is-hiding");

  elements.toast.classList.add("is-visible");

  elements.toast.setAttribute("aria-hidden", "false");

  if (elements.container) {
    elements.container.classList.add("is-active");
  }

  hideTimer = window.setTimeout(hideToast, duration);
}
