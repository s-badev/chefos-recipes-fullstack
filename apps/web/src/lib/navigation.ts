/** Allow only same-origin paths; reject browser-normalized backslashes and controls too. */
export function safeNextPath(value: unknown, fallback = "/"): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020\u007f]/.test(value)) return fallback;
  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(decoded)) return fallback;
    const url = new URL(value, "https://internal.invalid");
    return url.origin === "https://internal.invalid" ? value : fallback;
  } catch { return fallback; }
}

export function loginHref(next: string) {
  return `/login?next=${encodeURIComponent(safeNextPath(next))}`;
}
