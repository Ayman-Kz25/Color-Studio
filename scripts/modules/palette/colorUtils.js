/* =========================================================
   Color Studio
   Color Utilities
   ========================================================= */

/* =========================================================
   Constants
   ========================================================= */

const HEX_PATTERN = /^#(?:[A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;

/* =========================================================
   HEX Validation
   ========================================================= */

export function isValidHex(hex) {
  if (typeof hex !== "string") {
    return false;
  }

  return HEX_PATTERN.test(hex.trim());
}

/* =========================================================
   HEX Normalization
   ========================================================= */

export function normalizeHex(hex) {
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
        .map((character) => character + character)
        .join("");
  }

  return normalized;
}

/* =========================================================
   HEX -> RGB
   ========================================================= */

export function hexToRgb(hex) {
  const normalized = normalizeHex(hex);

  if (!normalized) {
    return null;
  }

  const value = normalized.slice(1);

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

/* =========================================================
   RGB Validation
   ========================================================= */

export function isValidRgb(rgb) {
  if (!rgb || typeof rgb !== "object") {
    return false;
  }

  return (
    Number.isFinite(rgb.r) &&
    Number.isFinite(rgb.g) &&
    Number.isFinite(rgb.b) &&
    rgb.r >= 0 &&
    rgb.r <= 255 &&
    rgb.g >= 0 &&
    rgb.g <= 255 &&
    rgb.b >= 0 &&
    rgb.b <= 255
  );
}

/* =========================================================
   RGB -> HEX
   ========================================================= */

export function rgbToHex(r, g, b) {
  const rgb = {
    r: Number(r),
    g: Number(g),
    b: Number(b),
  };

  if (!isValidRgb(rgb)) {
    return null;
  }

  const toHex = (value) =>
    Math.round(value).toString(16).padStart(2, "0").toUpperCase();

  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/* =========================================================
   RGB -> HSL
   ========================================================= */

export function rgbToHsl(r, g, b) {
  const rgb = {
    r: Number(r),
    g: Number(g),
    b: Number(b),
  };

  if (!isValidRgb(rgb)) {
    return null;
  }

  const red = rgb.r / 255;
  const green = rgb.g / 255;
  const blue = rgb.b / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);

  const difference = max - min;

  let hue = 0;
  let saturation = 0;

  const lightness = (max + min) / 2;

  if (difference !== 0) {
    const denominator = 1 - Math.abs(2 * lightness - 1);

    if (denominator !== 0) {
      saturation = difference / denominator;
    }

    if (max === red) {
      hue = 60 * (((green - blue) / difference) % 6);
    } else if (max === green) {
      hue = 60 * ((blue - red) / difference + 2);
    } else {
      hue = 60 * ((red - green) / difference + 4);
    }
  }

  hue = normalizeHue(hue);

  return {
    h: Math.round(hue),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
}

/* =========================================================
   HEX -> HSL
   ========================================================= */

export function hexToHsl(hex) {
  const rgb = hexToRgb(hex);

  if (!rgb) {
    return null;
  }

  return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

/* =========================================================
   HSL Validation
   ========================================================= */

function isValidHsl(h, s, l) {
  return (
    Number.isFinite(h) &&
    Number.isFinite(s) &&
    Number.isFinite(l) &&
    s >= 0 &&
    s <= 100 &&
    l >= 0 &&
    l <= 100
  );
}

/* =========================================================
   HSL -> RGB
   ========================================================= */

export function hslToRgb(h, s, l) {
  let hue = Number(h);
  const saturation = Number(s);
  const lightness = Number(l);

  if (!isValidHsl(hue, saturation, lightness)) {
    return null;
  }

  hue = normalizeHue(hue);

  const normalizedSaturation = saturation / 100;

  const normalizedLightness = lightness / 100;

  const chroma =
    (1 - Math.abs(2 * normalizedLightness - 1)) * normalizedSaturation;

  const hueSegment = hue / 60;

  const intermediate = chroma * (1 - Math.abs((hueSegment % 2) - 1));

  let red = 0;
  let green = 0;
  let blue = 0;

  if (hueSegment < 1) {
    red = chroma;
    green = intermediate;
  } else if (hueSegment < 2) {
    red = intermediate;
    green = chroma;
  } else if (hueSegment < 3) {
    green = chroma;
    blue = intermediate;
  } else if (hueSegment < 4) {
    green = intermediate;
    blue = chroma;
  } else if (hueSegment < 5) {
    red = intermediate;
    blue = chroma;
  } else {
    red = chroma;
    blue = intermediate;
  }

  const match = normalizedLightness - chroma / 2;

  return {
    r: Math.round((red + match) * 255),
    g: Math.round((green + match) * 255),
    b: Math.round((blue + match) * 255),
  };
}

/* =========================================================
   HSL -> HEX
   ========================================================= */

export function hslToHex(h, s, l) {
  const rgb = hslToRgb(h, s, l);

  if (!rgb) {
    return null;
  }

  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/* =========================================================
   Clamp
   ========================================================= */

export function clamp(value, min, max) {
  const numericValue = Number(value);
  const numericMin = Number(min);
  const numericMax = Number(max);

  if (
    !Number.isFinite(numericValue) ||
    !Number.isFinite(numericMin) ||
    !Number.isFinite(numericMax)
  ) {
    return null;
  }

  if (numericMin > numericMax) {
    return numericMin;
  }

  return Math.min(Math.max(numericValue, numericMin), numericMax);
}

/* =========================================================
   Normalize Hue
   ========================================================= */

export function normalizeHue(hue) {
  const value = Number(hue);

  if (!Number.isFinite(value)) {
    return 0;
  }

  return ((value % 360) + 360) % 360;
}

/* =========================================================
   Adjust Hue
   ========================================================= */

export function adjustHue(hue, amount) {
  const numericHue = Number(hue);
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericHue) || !Number.isFinite(numericAmount)) {
    return 0;
  }

  return normalizeHue(numericHue + numericAmount);
}

/* =========================================================
   Adjust Lightness
   ========================================================= */

export function adjustLightness(lightness, amount) {
  const numericLightness = Number(lightness);
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericLightness) || !Number.isFinite(numericAmount)) {
    return 0;
  }

  return clamp(numericLightness + numericAmount, 0, 100);
}

/* =========================================================
   Create HSL Color
   ========================================================= */

export function createHslColor(hue, saturation, lightness) {
  const normalizedHue = normalizeHue(hue);

  const normalizedSaturation = clamp(saturation, 0, 100);

  const normalizedLightness = clamp(lightness, 0, 100);

  if (normalizedSaturation === null || normalizedLightness === null) {
    return null;
  }

  return hslToHex(normalizedHue, normalizedSaturation, normalizedLightness);
}

/* =========================================================
   Random Number
   ========================================================= */

export function randomNumber(min, max) {
  const numericMin = Number(min);
  const numericMax = Number(max);

  if (
    !Number.isFinite(numericMin) ||
    !Number.isFinite(numericMax) ||
    numericMin > numericMax
  ) {
    return null;
  }

  return Math.random() * (numericMax - numericMin) + numericMin;
}

/* =========================================================
   Random Integer
   ========================================================= */

export function randomInteger(min, max) {
  const numericMin = Number(min);
  const numericMax = Number(max);

  if (
    !Number.isFinite(numericMin) ||
    !Number.isFinite(numericMax) ||
    numericMin > numericMax
  ) {
    return null;
  }

  return Math.floor(Math.random() * (numericMax - numericMin + 1) + numericMin);
}

/* =========================================================
   Random Color
   ========================================================= */

export function generateRandomColor() {
  const red = randomInteger(0, 255);
  const green = randomInteger(0, 255);
  const blue = randomInteger(0, 255);

  if (red === null || green === null || blue === null) {
    return null;
  }

  return rgbToHex(red, green, blue);
}

/* =========================================================
   Random HSL Color
   ========================================================= */

export function generateRandomHslColor() {
  const hue = randomInteger(0, 359);
  const saturation = randomInteger(45, 90);
  const lightness = randomInteger(35, 75);

  if (hue === null || saturation === null || lightness === null) {
    return null;
  }

  return createHslColor(hue, saturation, lightness);
}

/* =========================================================
   Get Color Brightness
   ========================================================= */

export function getBrightness(hex) {
  const rgb = hexToRgb(hex);

  if (!rgb) {
    return null;
  }

  return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
}

/* =========================================================
   Get Best Text Color
   ========================================================= */

export function getBestTextColor(background) {
  const brightness = getBrightness(background);

  if (brightness === null) {
    return "#FFFFFF";
  }

  return brightness > 155 ? "#111111" : "#FFFFFF";
}

/* =========================================================
   Convert sRGB Channel
   WCAG relative luminance helper
   ========================================================= */

function normalizeRgbChannel(value) {
  const channel = Number(value) / 255;

  if (channel <= 0.03928) {
    return channel / 12.92;
  }

  return Math.pow((channel + 0.055) / 1.055, 2.4);
}

/* =========================================================
   Relative Luminance
   ========================================================= */

export function getRelativeLuminance(hex) {
  const rgb = hexToRgb(hex);

  if (!rgb) {
    return null;
  }

  const red = normalizeRgbChannel(rgb.r);

  const green = normalizeRgbChannel(rgb.g);

  const blue = normalizeRgbChannel(rgb.b);

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/* =========================================================
   WCAG Contrast Ratio
   ========================================================= */

export function getContrastRatio(foreground, background) {
  const foregroundLuminance = getRelativeLuminance(foreground);

  const backgroundLuminance = getRelativeLuminance(background);

  if (foregroundLuminance === null || backgroundLuminance === null) {
    return null;
  }

  const lighter = Math.max(foregroundLuminance, backgroundLuminance);

  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

/* =========================================================
   Color Distance
   ========================================================= */

export function getColorDistance(firstColor, secondColor) {
  const first = hexToRgb(firstColor);

  const second = hexToRgb(secondColor);

  if (!first || !second) {
    return null;
  }

  const redDifference = first.r - second.r;

  const greenDifference = first.g - second.g;

  const blueDifference = first.b - second.b;

  return Math.sqrt(
    Math.pow(redDifference, 2) +
      Math.pow(greenDifference, 2) +
      Math.pow(blueDifference, 2),
  );
}
