/* =========================================================
   Color Studio
   Contrast Checker
   ========================================================= */

import { CONTRAST_RATIOS } from "../../core/constants.js";



/* =========================================================
   HEX Validation
   ========================================================= */

export function isValidHex(hex) {
  if (typeof hex !== "string") {
    return false;
  }

  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex.trim());
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
   HEX → RGB
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
   RGB → Relative Luminance
   ========================================================= */

export function getRelativeLuminance(rgb) {
  if (
    !rgb ||
    typeof rgb.r !== "number" ||
    typeof rgb.g !== "number" ||
    typeof rgb.b !== "number"
  ) {
    return null;
  }

  const channels = [rgb.r, rgb.g, rgb.b].map((value) => {
    const channel = value / 255;

    if (channel <= 0.03928) {
      return channel / 12.92;
    }

    return Math.pow((channel + 0.055) / 1.055, 2.4);
  });

  return (
    0.2126 * channels[0] +
    0.7152 * channels[1] +
    0.0722 * channels[2]
  );
}

/* =========================================================
   HEX → Relative Luminance
   ========================================================= */

export function getLuminance(hex) {
  const rgb = hexToRgb(hex);

  if (!rgb) {
    return null;
  }

  return getRelativeLuminance(rgb);
}

/* =========================================================
   Contrast Ratio
   ========================================================= */

export function calculateContrastRatio(foreground, background) {
  const foregroundLuminance = getLuminance(foreground);
  const backgroundLuminance = getLuminance(background);

  if (
    foregroundLuminance === null ||
    backgroundLuminance === null
  ) {
    return null;
  }

  const lighter = Math.max(
    foregroundLuminance,
    backgroundLuminance,
  );

  const darker = Math.min(
    foregroundLuminance,
    backgroundLuminance,
  );

  return (lighter + 0.05) / (darker + 0.05);
}

/* =========================================================
   Formatted Contrast Ratio
   ========================================================= */

export function formatContrastRatio(ratio) {
  if (
    typeof ratio !== "number" ||
    !Number.isFinite(ratio)
  ) {
    return "N/A";
  }

  return `${ratio.toFixed(2)}:1`;
}

/* =========================================================
   WCAG AA
   ========================================================= */

export function passesAA(ratio, isLargeText = false) {
  if (
    typeof ratio !== "number" ||
    !Number.isFinite(ratio)
  ) {
    return false;
  }

  const requiredRatio = isLargeText
    ? CONTRAST_RATIOS.AA_LARGE
    : CONTRAST_RATIOS.AA_NORMAL;

  return ratio >= requiredRatio;
}

/* =========================================================
   WCAG AAA
   ========================================================= */

export function passesAAA(ratio, isLargeText = false) {
  if (
    typeof ratio !== "number" ||
    !Number.isFinite(ratio)
  ) {
    return false;
  }

  const requiredRatio = isLargeText
    ? CONTRAST_RATIOS.AAA_LARGE
    : CONTRAST_RATIOS.AAA_NORMAL;

  return ratio >= requiredRatio;
}

/* =========================================================
   Contrast Level
   ========================================================= */

export function getContrastLevel(ratio) {
  if (
    typeof ratio !== "number" ||
    !Number.isFinite(ratio)
  ) {
    return "fail";
  }

  if (ratio >= CONTRAST_RATIOS.AAA_NORMAL) {
    return "aaa";
  }

  if (ratio >= CONTRAST_RATIOS.AA_NORMAL) {
    return "aa";
  }

  return "fail";
}

/* =========================================================
   Complete Contrast Result
   ========================================================= */
export function checkContrast(foreground, background) {
  const normalizedForeground = normalizeHex(foreground);
  const normalizedBackground = normalizeHex(background);

  if (!normalizedForeground || !normalizedBackground) {
    return {
      valid: false,

      foreground: normalizedForeground,
      background: normalizedBackground,

      ratio: null,
      formattedRatio: "N/A",

      level: "fail",

      normalText: {
        aa: false,
        aaa: false,
      },

      largeText: {
        aa: false,
        aaa: false,
      },

      uiComponent: {
        aa: false,
      },
    };
  }

  const ratio = calculateContrastRatio(
    normalizedForeground,
    normalizedBackground,
  );

  return {
    valid: ratio !== null,

    foreground: normalizedForeground,
    background: normalizedBackground,

    ratio,
    formattedRatio: formatContrastRatio(ratio),

    level: getContrastLevel(ratio),

    normalText: {
      aa: passesAA(ratio),
      aaa: passesAAA(ratio),
    },

    largeText: {
      aa: passesAA(ratio, true),
      aaa: passesAAA(ratio, true),
    },

    uiComponent: {
      aa: ratio !== null && ratio >= 3,
    },
  };
}

/* =========================================================
   Contrast Summary
   ========================================================= */

export function getContrastSummary(result) {
  if (!result || !result.valid) {
    return {
      status: "fail",
      label: "Invalid colors",
    };
  }

  if (result.normalText?.aaa) {
    return {
      status: "aaa",
      label: "AAA",
    };
  }

  if (result.normalText?.aa) {
    return {
      status: "aa",
      label: "AA",
    };
  }

  return {
    status: "fail",
    label: "Fail",
  };
}

/* =========================================================
   Public Thresholds
   ========================================================= */

export function getContrastThresholds() {
  return {
    aaNormal: CONTRAST_RATIOS.AA_NORMAL,
    aaLarge: CONTRAST_RATIOS.AA_LARGE,
    aaaNormal: CONTRAST_RATIOS.AAA_NORMAL,
    aaaLarge: CONTRAST_RATIOS.AAA_LARGE,
  };
}

/* =========================================================
   Contrast Results
   ========================================================= */

export function getContrastResults(foreground, background) {
  return checkContrast(foreground, background);
}