// JSZip's setImmediate polyfill selects a postMessage strategy that does not
// dispatch in Firefox chrome windows. Esbuild injects this lexical shim into
// plugin bundles that import JSZip, leaving Zotero's window untouched.
export function setImmediate(
  callback: (...args: unknown[]) => void,
  ...args: unknown[]
): ReturnType<typeof setTimeout> {
  return globalThis.setTimeout(callback, 0, ...args);
}
