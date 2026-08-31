import { getPref, setPref } from "../../../utils/prefs";

export const CHAT_UI_FONT_SCALE_MIN = 80;
export const CHAT_UI_FONT_SCALE_MAX = 180;
export const CHAT_UI_FONT_SCALE_STEP = 10;
export const DEFAULT_CHAT_UI_FONT_SCALE = 100;

const monitoredRoots = new Set<HTMLElement>();

export function normalizeChatUIFontScale(value: unknown): number {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN;
  if (!Number.isFinite(numeric)) {
    return DEFAULT_CHAT_UI_FONT_SCALE;
  }

  const stepped =
    Math.round(numeric / CHAT_UI_FONT_SCALE_STEP) * CHAT_UI_FONT_SCALE_STEP;
  return Math.min(
    CHAT_UI_FONT_SCALE_MAX,
    Math.max(CHAT_UI_FONT_SCALE_MIN, stepped),
  );
}

export function getChatUIFontScale(): number {
  return normalizeChatUIFontScale(getPref("chatUIFontScale"));
}

export function formatChatUIFontScaleLabel(scale: unknown): string {
  return `${normalizeChatUIFontScale(scale)}%`;
}

export function persistChatUIFontScale(value: unknown): number {
  const normalized = normalizeChatUIFontScale(value);
  setPref("chatUIFontScale", normalized);
  refreshAllChatPanelFontScales();
  return normalized;
}

export function applyChatUIFontScaleToRoot(
  root: HTMLElement | null | undefined,
): void {
  if (!root) {
    return;
  }

  const scale = getChatUIFontScale() / 100;
  root.style.zoom = scale === 1 ? "" : String(scale);
}

export function monitorChatPanelRoot(root: HTMLElement): void {
  monitoredRoots.add(root);
  applyChatUIFontScaleToRoot(root);
}

export function unmonitorChatPanelRoot(root: HTMLElement): void {
  monitoredRoots.delete(root);
}

export function refreshAllChatPanelFontScales(): void {
  for (const win of Zotero.getMainWindows()) {
    for (const root of win.document.querySelectorAll(".chat-panel-root")) {
      applyChatUIFontScaleToRoot(root as HTMLElement);
    }
  }

  for (const root of monitoredRoots) {
    if (root.isConnected) {
      applyChatUIFontScaleToRoot(root);
      continue;
    }
    monitoredRoots.delete(root);
  }
}
