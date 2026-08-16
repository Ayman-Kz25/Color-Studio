
import { PALETTE_SIZE, PALETTE_TYPES } from "../../core/constants.js";
import {
  generateRandomColor,
  generateRandomHslColor,
  hexToHsl,
  createHslColor,
  adjustHue,
  clamp,
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

  switch (paletteType) {
    case PALETTE_TYPES.MONOCHROMATIC:
      return generateMonochromaticPalette(baseColor, paletteSize);

    case PALETTE_TYPES.ANALOGOUS:
      return generateAnalogousPalette(baseColor, paletteSize);

    case PALETTE_TYPES.COMPLEMENTARY:
      return generateComplementaryPalette(baseColor, paletteSize);

    case PALETTE_TYPES.TRIADIC:
      return generateTriadicPalette(baseColor, paletteSize);

    case PALETTE_TYPES.SPLIT_COMPLEMENTARY:
      return generateSplitComplementaryPalette(baseColor, paletteSize);

    case PALETTE_TYPES.TETRADIC:
      return generateTetradicPalette(baseColor, paletteSize);

    case PALETTE_TYPES.RANDOM:
    default:
      return generateRandomPalette(paletteSize);
  }
}

/* =========================================================
   Random Palette
   ========================================================= */

/**
 * Generate completely random RGB colors.
 *
 * @param {number} size
 * @returns {string[]}
 */
export function generateRandomPalette(size = PALETTE_SIZE) {
  const paletteSize = normalizePaletteSize(size);
  const palette = [];

  for (let index = 0; index < paletteSize; index++) {
    palette.push(generateRandomColor());
  }

  return palette;
}

/**
 * Generate random HSL-based colors.
 *
 * @param {number} size
 * @returns {string[]}
 */
export function generateRandomHslPalette(size = PALETTE_SIZE) {
  const paletteSize = normalizePaletteSize(size);
  const palette = [];

  for (let index = 0; index < paletteSize; index++) {
    palette.push(generateRandomHslColor());
  }

  return palette;
}

/* =========================================================
   Monochromatic Palette
   ========================================================= */

/**
 * Generate colors using the base color's hue and saturation
 * while varying lightness.
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

  const palette = [];
  const lightnessValues = createLightnessScale(paletteSize);

  lightnessValues.forEach((lightness) => {
    palette.push(
      createHslColor(
        hsl.h,
        hsl.s,
        lightness,
      ),
    );
  });

  return palette;
}

/* =========================================================
   Analogous Palette
   ========================================================= */

/**
 * Generate an analogous palette around the base hue.
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

  return createHuePalette(hsl, offsets, paletteSize);
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

  const lightnessAdjustments = [0, 0, 15, -15, 30];

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

  const lightnessAdjustments = [0, 0, 0, 15, -15];

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

  const lightnessAdjustments = [0, 0, 0, 15, -15];

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

  const lightnessAdjustments = [0, 0, 0, 0, 15];

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

function createHuePalette(hsl, offsets, size) {
  const palette = [];

  for (let index = 0; index < size; index++) {
    const offset = offsets[index % offsets.length];

    const saturationVariation = getSaturationVariation(index);

    const lightnessVariation = getLightnessVariation(index);

    const hue = adjustHue(hsl.h, offset);

    const saturation = clamp(
      hsl.s + saturationVariation,
      15,
      100,
    );

    const lightness = clamp(
      hsl.l + lightnessVariation,
      8,
      92,
    );

    palette.push(
      createHslColor(
        hue,
        saturation,
        lightness,
      ),
    );
  }

  return palette;
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
    const offset = offsets[index % offsets.length];

    const lightnessAdjustment =
      lightnessAdjustments[
        index % lightnessAdjustments.length
      ];

    const saturationVariation =
      getSaturationVariation(index);

    const hue = adjustHue(hsl.h, offset);

    const saturation = clamp(
      hsl.s + saturationVariation,
      15,
      100,
    );

    const lightness = clamp(
      hsl.l + lightnessAdjustment,
      8,
      92,
    );

    palette.push(
      createHslColor(
        hue,
        saturation,
        lightness,
      ),
    );
  }

  return palette;
}

/* =========================================================
   Lightness Scale
   ========================================================= */

function createLightnessScale(size) {
  if (size <= 1) {
    return [50];
  }

  const values = [];

  const minimum = 20;
  const maximum = 80;

  const step = (maximum - minimum) / (size - 1);

  for (let index = 0; index < size; index++) {
    values.push(
      Math.round(minimum + step * index),
    );
  }

  return values;
}

/* =========================================================
   Saturation Variation
   ========================================================= */

function getSaturationVariation(index) {
  const variations = [0, 5, -5, 8, -8];

  return variations[index % variations.length];
}

/* =========================================================
   Lightness Variation
   ========================================================= */

function getLightnessVariation(index) {
  const variations = [0, 8, -8, 12, -12];

  return variations[index % variations.length];
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
    1,
    Math.min(10, Math.floor(numericSize)),
  );
}

/* =========================================================
   Color Variations
   ========================================================= */

/**
 * Generate controlled variations from a base color.
 *
 * @param {string} baseColor
 * @param {number} count
 * @returns {string[]}
 */
export function generateColorVariations(
  baseColor,
  count = PALETTE_SIZE,
) {
  const paletteSize = normalizePaletteSize(count);
  const hsl = hexToHsl(baseColor);

  if (!hsl) {
    return generateRandomPalette(paletteSize);
  }

  const palette = [];

  for (let index = 0; index < paletteSize; index++) {
    const hue = adjustHue(
      hsl.h,
      index * 12,
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

    palette.push(
      createHslColor(
        hue,
        saturation,
        lightness,
      ),
    );
  }

  return palette;
}