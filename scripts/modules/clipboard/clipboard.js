/* =========================================================
   Clipboard Support
   ========================================================= */

export function isClipboardSupported() {
  return (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  );
}

/* =========================================================
   Copy Text
   ========================================================= */

export async function copyText(text) {
  if (typeof text !== "string") {
    return false;
  }

  const value = text.trim();

  if (!value) {
    return false;
  }

  /* Modern Clipboard API */
  if (isClipboardSupported()) {
    try {
      await navigator.clipboard.writeText(value);

      return true;
    } catch (error) {
      console.warn(
        "Color Studio: Clipboard API failed. Trying fallback.",
        error,
      );
    }
  }

  /* Legacy Fallback */
  return copyTextFallback(value);
}

/* =========================================================
   Copy Color
   ========================================================= */

export async function copyColor(color) {
  if (typeof color !== "string" || !color.trim()) {
    return false;
  }

  return copyText(color);
}

/* =========================================================
   Fallback Clipboard Method
   ========================================================= */

function copyTextFallback(text) {
  if (
    typeof document === "undefined" ||
    !document.body
  ) {
    return false;
  }

  const textarea = document.createElement("textarea");

  textarea.value = text;

  textarea.setAttribute("readonly", "");

  textarea.setAttribute("aria-hidden", "true");

  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "-9999px";
  textarea.style.width = "1px";
  textarea.style.height = "1px";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";

  document.body.appendChild(textarea);

  let copied = false;

  try {
    textarea.focus();

    textarea.select();

    textarea.setSelectionRange(0, textarea.value.length);

    copied = document.execCommand("copy");
  } catch (error) {
    console.error(
      "Color Studio: Clipboard fallback failed.",
      error,
    );

    copied = false;
  } finally {
    textarea.remove();
  }

  return copied;
}