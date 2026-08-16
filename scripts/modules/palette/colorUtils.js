const HEX_PATTERN = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;

/* HEX Validation */
export function isValidHex(hex) {
  if (typeof hex !== "string") {
    return false;
  }

  return HEX_PATTERN.test(hex.trim());
}

/* HEX Normalization */
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
        .map((character) => {
          return character + character;
        })
        .join("");
  }

  return normalized;
}

/* HEX → RGB */
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

/* RGB Validation */
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

/* RGB → HEX */
export function rgbToHex(r, g, b) {
  const rgb = {
    r: Number(r),
    g: Number(g),
    b: Number(b),
  };

  if (!isValidRgb(rgb)) {
    return null;
  }

  const toHex = (value) => {
    return Math.round(value).toString(16).padStart(2, "0").toUpperCase();
  };

  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/* RGB → HSL */
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
    saturation = difference / (1 - Math.abs(2 * lightness - 1));

    if (max === red) {
      hue = 60 * (((green - blue) / difference) % 6);
    } else if (max === green) {
      hue = 60 * ((blue - red) / difference + 2);
    } else {
      hue = 60 * ((red - green) / difference + 4);
    }
  }

  if (hue < 0) {
    hue += 360;
  }

  return {
    h: Math.round(hue),

    s: Math.round(saturation * 100),

    l: Math.round(lightness * 100),
  };
}

/* HEX → HSL */
export function hexToHsl(hex) {
  const rgb = hexToRgb(hex);

  if (!rgb) {
    return null;
  }

  return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

/* HSL → RGB */
export function hslToRgb(h, s, l) {
  let hue = Number(h);

  let saturation = Number(s) / 100;

  let lightness = Number(l) / 100;

  if (
    !Number.isFinite(hue) ||
    !Number.isFinite(saturation) ||
    !Number.isFinite(lightness)
  ) {
    return null;
  }

  hue = ((hue % 360) + 360) % 360;

  saturation = Math.max(0, Math.min(1, saturation));

  lightness = Math.max(0, Math.min(1, lightness));

  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;

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

  const match = lightness - chroma / 2;

  return {
    r: Math.round((red + match) * 255),

    g: Math.round((green + match) * 255),

    b: Math.round((blue + match) * 255),
  };
}

/* HSL → HEX */
export function hslToHex(h, s, l) {
  const rgb = hslToRgb(h, s, l);

  if (!rgb) {
    return null;
  }

  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/* Clamp Value */
export function clamp(value, min, max) {
  return Math.min(Math.max(Number(value), min), max);
}

/* Normalize Hue */
export function normalizeHue(hue) {
  const value = Number(hue);

  if (!Number.isFinite(value)) {
    return 0;
  }

  return ((value % 360) + 360) % 360;
}

/* Adjust Hue */
export function adjustHue(hue, amount) {
  return normalizeHue(Number(hue) + Number(amount));
}

/* Adjust Lightness */
export function adjustLightness(lightness, amount) {
  return clamp(Number(lightness) + Number(amount), 0, 100);
}

/* Create HSL Color */
export function createHslColor(hue, saturation, lightness) {
  return hslToHex(
    normalizeHue(hue),
    clamp(saturation, 0, 100),
    clamp(lightness, 0, 100),
  );
}

/* Random Number */
export function randomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

/* Random Integer */
export function randomInteger(min, max) {
  return Math.floor(randomNumber(min, max + 1));
}

/* Random Color */
export function generateRandomColor() {
  const red = randomInteger(0, 255);

  const green = randomInteger(0, 255);

  const blue = randomInteger(0, 255);

  return rgbToHex(red, green, blue);
}

/* Generate Random HSL Color */
export function generateRandomHslColor() {
  const hue = randomInteger(0, 359);

  const saturation = randomInteger(45, 90);

  const lightness = randomInteger(35, 75);

  return createHslColor(hue, saturation, lightness);
}

/* Get Color Brightness */
export function getBrightness(hex) {
  const rgb = hexToRgb(hex);

  if (!rgb) {
    return null;
  }

  return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
}

/* Get Best Text Color */
export function getBestTextColor(background) {
  const brightness = getBrightness(background);

  if (brightness === null) {
    return "#FFFFFF";
  }

  return brightness > 155 ? "#111111" : "#FFFFFF";
}

/* Color Difference */
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
