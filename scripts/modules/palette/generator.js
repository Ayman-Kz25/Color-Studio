import {
  PALETTE_SIZE,
  MIN_PALETTE_SIZE,
  MAX_PALETTE_SIZE,
  PALETTE_TYPES,
} from "../../core/constants.js";

import {
  generateRandomColor,
  generateRandomHslColor,
  hexToHsl,
  createHslColor,
  adjustHue,
  clamp,
  normalizeHex,
} from "./colorUtils.js";

/* =========================================================
   Palette Generation
   ========================================================= */

/**
 * Generate a palette based on the selected palette type.
 *
 * @param {string} baseColor
 * @param {string} paletteType
 * @param {number} size
 * @returns {string[]}
 */
export function generatePalette(
  baseColor,
  paletteType = PALETTE_TYPES.RANDOM,
  size = PALETTE_SIZE,
) {
  const paletteSize = normalizePaletteSize(size);
  const normalizedBaseColor = normalizeHex(baseColor);

  switch (paletteType) {
    case PALETTE_TYPES.MONOCHROMATIC:
      return generateMonochromaticPalette(
        normalizedBaseColor,
        paletteSize,
      );

    case PALETTE_TYPES.ANALOGOUS:
      return generateAnalogousPalette(
        normalizedBaseColor,
        paletteSize,
      );

    case PALETTE_TYPES.COMPLEMENTARY:
      return generateComplementaryPalette(
        normalizedBaseColor,
        paletteSize,
      );

    case PALETTE_TYPES.TRIADIC:
      return generateTriadicPalette(
        normalizedBaseColor,
        paletteSize,
      );

    case PALETTE_TYPES.SPLIT_COMPLEMENTARY:
      return generateSplitComplementaryPalette(
        normalizedBaseColor,
        paletteSize,
      );

    case PALETTE_TYPES.TETRADIC:
      return generateTetradicPalette(
        normalizedBaseColor,
        paletteSize,
      );

    case PALETTE_TYPES.RANDOM:
    default:
      return generateRandomPalette(paletteSize);
  }
}

/* =========================================================
   Random Palette
   ========================================================= */

/**
 * Generate completely random colors.
 *
 * @param {number} size
 * @returns {string[]}
 */
export function generateRandomPalette(size = PALETTE_SIZE) {
  const paletteSize = normalizePaletteSize(size);

  return Array.from(
    { length: paletteSize },
    () => generateRandomColor(),
  );
}

/**
 * Generate random HSL-based colors.
 *
 * @param {number} size
 * @returns {string[]}
 */
export function generateRandomHslPalette(size = PALETTE_SIZE) {
  const paletteSize = normalizePaletteSize(size);

  return Array.from(
    { length: paletteSize },
    () => generateRandomHslColor(),
  );
}

/* =========================================================
   Monochromatic Palette
   ========================================================= */

/**
 * Generate colors from the same hue while
 * varying lightness.
 *
 * @param {string} baseColor
 * @param {number} size
 * @returns {string[]}
 */
export function generateMonochromaticPalette(
  baseColor,
  size = PALETTE_SIZE,
) {
  const paletteSize = normalizePaletteSize(size);
  const hsl = hexToHsl(baseColor);

  if (!hsl) {
    return generateRandomPalette(paletteSize);
  }

  const lightnessValues =
    createLightnessScale(paletteSize);

  return lightnessValues.map((lightness) =>
    createHslColor(
      hsl.h,
      hsl.s,
      lightness,
    ),
  );
}

/* =========================================================
   Analogous Palette
   ========================================================= */

/**
 * Generate colors around the base hue.
 *
 * @param {string} baseColor
 * @param {number} size
 * @returns {string[]}
 */
export function generateAnalogousPalette(
  baseColor,
  size = PALETTE_SIZE,
) {
  const paletteSize = normalizePaletteSize(size);
  const hsl = hexToHsl(baseColor);

  if (!hsl) {
    return generateRandomPalette(paletteSize);
  }

  const offsets = [-40, -20, 0, 20, 40];

  return createHuePalette(
    hsl,
    offsets,
    paletteSize,
  );
}

/* =========================================================
   Complementary Palette
   ========================================================= */

/**
 * Generate a complementary palette.
 *
 * @param {string} baseColor
 * @param {number} size
 * @returns {string[]}
 */
export function generateComplementaryPalette(
  baseColor,
  size = PALETTE_SIZE,
) {
  const paletteSize = normalizePaletteSize(size);
  const hsl = hexToHsl(baseColor);

  if (!hsl) {
    return generateRandomPalette(paletteSize);
  }

  const offsets = [0, 180, 180, 0, 180];

  const lightnessAdjustments = [
    0,
    0,
    15,
    -15,
    30,
  ];

  return createHueLightnessPalette(
    hsl,
    offsets,
    lightnessAdjustments,
    paletteSize,
  );
}

/* =========================================================
   Triadic Palette
   ========================================================= */

/**
 * Generate a triadic palette.
 *
 * @param {string} baseColor
 * @param {number} size
 * @returns {string[]}
 */
export function generateTriadicPalette(
  baseColor,
  size = PALETTE_SIZE,
) {
  const paletteSize = normalizePaletteSize(size);
  const hsl = hexToHsl(baseColor);

  if (!hsl) {
    return generateRandomPalette(paletteSize);
  }

  const offsets = [0, 120, 240, 120, 240];

  const lightnessAdjustments = [
    0,
    0,
    0,
    15,
    -15,
  ];

  return createHueLightnessPalette(
    hsl,
    offsets,
    lightnessAdjustments,
    paletteSize,
  );
}

/* =========================================================
   Split Complementary Palette
   ========================================================= */

/**
 * Generate a split-complementary palette.
 *
 * @param {string} baseColor
 * @param {number} size
 * @returns {string[]}
 */
export function generateSplitComplementaryPalette(
  baseColor,
  size = PALETTE_SIZE,
) {
  const paletteSize = normalizePaletteSize(size);
  const hsl = hexToHsl(baseColor);

  if (!hsl) {
    return generateRandomPalette(paletteSize);
  }

  const offsets = [0, 150, 210, 150, 210];

  const lightnessAdjustments = [
    0,
    0,
    0,
    15,
    -15,
  ];

  return createHueLightnessPalette(
    hsl,
    offsets,
    lightnessAdjustments,
    paletteSize,
  );
}

/* =========================================================
   Tetradic Palette
   ========================================================= */

/**
 * Generate a tetradic palette.
 *
 * This export is retained for compatibility even though
 * the current HTML does not expose a tetradic option.
 *
 * @param {string} baseColor
 * @param {number} size
 * @returns {string[]}
 */
export function generateTetradicPalette(
  baseColor,
  size = PALETTE_SIZE,
) {
  const paletteSize = normalizePaletteSize(size);
  const hsl = hexToHsl(baseColor);

  if (!hsl) {
    return generateRandomPalette(paletteSize);
  }

  const offsets = [0, 90, 180, 270, 90];

  const lightnessAdjustments = [
    0,
    0,
    0,
    0,
    15,
  ];

  return createHueLightnessPalette(
    hsl,
    offsets,
    lightnessAdjustments,
    paletteSize,
  );
}

/* =========================================================
   Hue Palette
   ========================================================= */

function createHuePalette(
  hsl,
  offsets,
  size,
) {
  const palette = [];

  for (let index = 0; index < size; index++) {
    const offset =
      offsets[index % offsets.length];

    const hue = adjustHue(
      hsl.h,
      offset,
    );

    const saturation = clamp(
      hsl.s + getSaturationVariation(index),
      15,
      100,
    );

    const lightness = clamp(
      hsl.l + getLightnessVariation(index),
      8,
      92,
    );

    const color = createHslColor(
      hue,
      saturation,
      lightness,
    );

    if (color) {
      palette.push(color);
    }
  }

  return ensurePaletteSize(
    palette,
    size,
  );
}

/* =========================================================
   Hue + Lightness Palette
   ========================================================= */

function createHueLightnessPalette(
  hsl,
  offsets,
  lightnessAdjustments,
  size,
) {
  const palette = [];

  for (let index = 0; index < size; index++) {
    const offset =
      offsets[index % offsets.length];

    const lightnessAdjustment =
      lightnessAdjustments[
        index % lightnessAdjustments.length
      ];

    const hue = adjustHue(
      hsl.h,
      offset,
    );

    const saturation = clamp(
      hsl.s + getSaturationVariation(index),
      15,
      100,
    );

    const lightness = clamp(
      hsl.l + lightnessAdjustment,
      8,
      92,
    );

    const color = createHslColor(
      hue,
      saturation,
      lightness,
    );

    if (color) {
      palette.push(color);
    }
  }

  return ensurePaletteSize(
    palette,
    size,
  );
}

/* =========================================================
   Lightness Scale
   ========================================================= */

function createLightnessScale(size) {
  const paletteSize = normalizePaletteSize(size);

  if (paletteSize === 1) {
    return [50];
  }

  const minimum = 20;
  const maximum = 80;

  const step =
    (maximum - minimum) /
    (paletteSize - 1);

  return Array.from(
    { length: paletteSize },
    (_, index) =>
      Math.round(
        minimum + step * index,
      ),
  );
}

/* =========================================================
   Saturation Variation
   ========================================================= */

function getSaturationVariation(index) {
  const variations = [
    0,
    5,
    -5,
    8,
    -8,
  ];

  return variations[
    index % variations.length
  ];
}

/* =========================================================
   Lightness Variation
   ========================================================= */

function getLightnessVariation(index) {
  const variations = [
    0,
    8,
    -8,
    12,
    -12,
  ];

  return variations[
    index % variations.length
  ];
}

/* =========================================================
   Palette Size
   ========================================================= */

function normalizePaletteSize(size) {
  const numericSize = Number(size);

  if (!Number.isFinite(numericSize)) {
    return PALETTE_SIZE;
  }

  return Math.max(
    MIN_PALETTE_SIZE,
    Math.min(
      MAX_PALETTE_SIZE,
      Math.floor(numericSize),
    ),
  );
}

/* =========================================================
   Ensure Palette Size
   ========================================================= */

function ensurePaletteSize(
  palette,
  size,
) {
  const normalizedSize =
    normalizePaletteSize(size);

  const result = [...palette];

  while (result.length < normalizedSize) {
    const fallback =
      generateRandomHslColor();

    if (fallback) {
      result.push(fallback);
    }
  }

  return result.slice(
    0,
    normalizedSize,
  );
}

/* =========================================================
   Color Variations
   ========================================================= */

/**
 * Generate controlled color variations.
 *
 * @param {string} baseColor
 * @param {number} count
 * @returns {string[]}
 */
export function generateColorVariations(
  baseColor,
  count = PALETTE_SIZE,
) {
  const paletteSize =
    normalizePaletteSize(count);

  const hsl = hexToHsl(baseColor);

  if (!hsl) {
    return generateRandomPalette(
      paletteSize,
    );
  }

  const palette = [];

  for (
    let index = 0;
    index < paletteSize;
    index++
  ) {
    const hue = adjustHue(
      hsl.h,
      index * 12,
    );

    const saturation = clamp(
      hsl.s +
        getSaturationVariation(index),
      15,
      100,
    );

    const lightness = clamp(
      hsl.l +
        getLightnessVariation(index),
      8,
      92,
    );

    const color = createHslColor(
      hue,
      saturation,
      lightness,
    );

    if (color) {
      palette.push(color);
    }
  }

  return ensurePaletteSize(
    palette,
    paletteSize,
  );
}