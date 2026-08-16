/* Clipboard Support */
export function isClipboardSupported() {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  );
}

/* Copy Text */
export async function copyText(text) {
  if (typeof text !== "string" || !text.trim()) {
    return false;
  }

  if (isClipboardSupported()) {
    try {
      await navigator.clipboard.writeText(text);

      return true;
    } catch (error) {
      console.warn("Clipboard API failed. Trying fallback:", error);
    }
  }

  return copyTextFallback(text);
}

/* Copy Color */
export async function copyColor(color) {
  return copyText(color);
}

/* Fallback Clipboard Method */
function copyTextFallback(text) {
  const textarea = document.createElement("textarea");

  textarea.value = text;

  textarea.setAttribute("readonly", "");

  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";

  document.body.appendChild(textarea);

  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  let copied = false;

  try {
    copied = document.execCommand("copy");
  } catch (error) {
    console.error("Clipboard fallback failed:", error);
    copied = false;
  }

  document.body.removeChild(textarea);
  return copied;
}
