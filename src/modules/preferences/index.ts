/**
 * Preferences module
 */

import {
  initializePrefsUI,
  bindPrefEvents,
  refreshPrefsUI as refreshPrefsUIState,
} from "./PreferencesManager";
import type { PrefsRefreshOptions } from "./types";

export async function registerPrefsScripts(_window: Window): Promise<void> {
  addon.data.prefs = {
    window: _window,
  };
  _window.addEventListener(
    "unload",
    () => {
      if (addon.data.prefs?.window === _window) {
        delete addon.data.prefs;
      }
    },
    { once: true },
  );

  try {
    await initializePrefsUI();
  } catch (error) {
    ztoolkit.log("[Preferences] Failed to initialize prefs UI:", error);
  }
  try {
    bindPrefEvents();
  } catch (error) {
    ztoolkit.log("[Preferences] Failed to bind prefs events:", error);
  }
}

export async function refreshPrefsUI(
  options?: PrefsRefreshOptions,
): Promise<void> {
  if (!addon.data.prefs?.window) {
    return;
  }

  await refreshPrefsUIState(options);
}

export function togglePaperChatNoticeUI(_window: Window): void {}
