/* =========================================================
   Color Studio
   Saved Palettes UI
   ========================================================= */

import {
  getCurrentPalette,
  setCurrentPalette,
} from "../modules/palette/manager.js";

import {
  savePalette,
  getSavedPalettes,
  deletePalette,
} from "../core/storage.js";

import { showSuccessToast, showErrorToast } from "./toastUI.js";

/* =========================================================
   DOM Elements
   ========================================================= */

let elements = {};

/* =========================================================
   Initialization
   ========================================================= */

export function initializeSavedUI() {
  cacheElements();

  bindEvents();

  renderSavedPalettes();
}

/* =========================================================
   Cache DOM Elements
   ========================================================= */

function cacheElements() {
  elements = {
    savedContainer: document.querySelector("#savedPalettesContainer"),

    saveButton: document.querySelector("#savePaletteBtn"),

    emptyState: document.querySelector("#savedPalettesEmpty"),
  };
}

/* =========================================================
   Event Binding
   ========================================================= */

function bindEvents() {
  elements.saveButton?.addEventListener("click", handleSavePalette);

  elements.savedContainer?.addEventListener("click", handleSavedPaletteClick);
}

/* =========================================================
   Save Current Palette
   ========================================================= */

function handleSavePalette() {
  const palette = getCurrentPalette();

  if (
    !palette ||
    !Array.isArray(palette.colors) ||
    palette.colors.length === 0
  ) {
    showErrorToast("There is no palette to save.");

    return;
  }

  const savedPalette = savePalette({
    colors: palette.colors,
    locked: palette.locked,
    baseColor: palette.baseColor,
    type: palette.type,
  });

  if (!savedPalette) {
    showErrorToast("Unable to save palette.");

    return;
  }

  renderSavedPalettes();

  showSuccessToast("Palette saved.");
}

/* =========================================================
   Saved Palette Click
   ========================================================= */

function handleSavedPaletteClick(event) {
  const card = event.target.closest("[data-saved-palette-id]");

  if (!card) {
    return;
  }

  const paletteId = card.dataset.savedPaletteId;

  if (!paletteId) {
    return;
  }

  const action = event.target.closest("[data-action]");

  if (!action) {
    return;
  }

  const actionType = action.dataset.action;

  switch (actionType) {
    case "load":
      loadSavedPalette(paletteId);
      break;

    case "delete":
      removeSavedPalette(paletteId);
      break;

    default:
      break;
  }
}

/* =========================================================
   Load Saved Palette
   ========================================================= */

function loadSavedPalette(paletteId) {
  const savedPalettes = getSavedPalettes();

  const savedPalette = savedPalettes.find(
    (palette) => String(palette.id) === String(paletteId),
  );

  if (!savedPalette) {
    showErrorToast("Saved palette not found.");

    return;
  }

  const loaded = setCurrentPalette(savedPalette.colors, savedPalette.locked);

  if (!loaded) {
    showErrorToast("Unable to load palette.");

    return;
  }

  document.dispatchEvent(
    new CustomEvent("colorstudio:palettechange", {
      detail: {
        palette: getCurrentPalette(),
      },
    }),
  );

  showSuccessToast("Palette loaded.");
}

/* =========================================================
   Delete Saved Palette
   ========================================================= */

function removeSavedPalette(paletteId) {
  const deleted = deletePalette(paletteId);

  if (!deleted) {
    showErrorToast("Unable to delete palette.");

    return;
  }

  renderSavedPalettes();

  showSuccessToast("Palette deleted.");
}

/* =========================================================
   Render Saved Palettes
   ========================================================= */

export function renderSavedPalettes() {
  if (!elements.savedContainer) {
    return;
  }

  const savedPalettes = getSavedPalettes();

  elements.savedContainer.innerHTML = "";

  if (savedPalettes.length === 0) {
    renderEmptyState();

    return;
  }

  hideEmptyState();

  savedPalettes.forEach((palette) => {
    const card = createSavedPaletteCard(palette);

    elements.savedContainer.appendChild(card);
  });
}

/* =========================================================
   Create Saved Palette Card
   ========================================================= */

function createSavedPaletteCard(palette) {
  const card = document.createElement("article");

  card.className = "saved-palette-card";

  card.dataset.savedPaletteId = String(palette.id);

  const colors = Array.isArray(palette.colors) ? palette.colors : [];

  const swatches = colors
    .map(
      (color) => `
          <span
            class="saved-palette-card__swatch"
            style="background-color: ${escapeHTML(color)};"
            title="${escapeHTML(color)}"
          ></span>
        `,
    )
    .join("");

  const paletteName = palette.name || "Untitled Palette";

  card.innerHTML = `
    <div class="saved-palette-card__preview">
      ${swatches}
    </div>

    <div class="saved-palette-card__content">

      <div class="saved-palette-card__header">

        <h3 class="saved-palette-card__name">
          ${escapeHTML(paletteName)}
        </h3>

        <button
          type="button"
          class="saved-palette-card__delete"
          data-action="delete"
          aria-label="Delete saved palette"
          title="Delete palette"
        >
          <i
            class="fa-regular fa-trash-can"
            aria-hidden="true"
          ></i>
        </button>

      </div>

      <div class="saved-palette-card__meta">

        <span>
          ${colors.length} colors
        </span>

        <span>
          ${formatDate(palette.createdAt)}
        </span>

      </div>

      <button
        type="button"
        class="saved-palette-card__load"
        data-action="load"
      >
        <i
          class="fa-solid fa-arrow-up-right-from-square"
          aria-hidden="true"
        ></i>

        Load Palette
      </button>

    </div>
  `;

  return card;
}

/* =========================================================
   Empty State
   ========================================================= */

function renderEmptyState() {
  if (elements.emptyState) {
    elements.emptyState.classList.remove("d-none");

    return;
  }

  elements.savedContainer.innerHTML = `
    <div class="saved-palettes-empty">

      <i
        class="fa-regular fa-folder-open"
        aria-hidden="true"
      ></i>

      <h3>No saved palettes</h3>

      <p>
        Save a palette and it will appear here.
      </p>

    </div>
  `;
}

/* =========================================================
   Hide Empty State
   ========================================================= */

function hideEmptyState() {
  elements.emptyState?.classList.add("d-none");
}

/* =========================================================
   Format Date
   ========================================================= */

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/* =========================================================
   Escape HTML
   ========================================================= */

function escapeHTML(value) {
  const element = document.createElement("div");

  element.textContent = String(value);

  return element.innerHTML;
}
