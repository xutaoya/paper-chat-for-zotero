import { getPref, setPref } from "../../utils/prefs";
import { getString } from "../../utils/locale";
import { getErrorMessage } from "../../utils/common";
import { testExaApiKey } from "../chat/web-search/ExaApi";
import {
  bindExternalPrefLink,
  EXA_API_KEY_APPLY_URL,
} from "./openExternalPrefLink";

const EXA_PREFS_BOUND = Symbol("paperchat.exaPrefsBound");

function bindExaButton(
  doc: Document,
  id: string,
  handler: () => void | Promise<void>,
): void {
  const button = doc.getElementById(id);
  if (!button) {
    return;
  }
  const run = () => {
    void handler();
  };
  button.addEventListener("click", (event) => {
    event.preventDefault();
    run();
  });
  button.addEventListener("command", run);
}

export function initializeExaPrefsUI(doc: Document): void {
  const enableCheckbox = doc.getElementById(
    "pref-exa-enable-checkbox",
  ) as XUL.Checkbox | null;
  if (enableCheckbox) {
    enableCheckbox.checked = getPref("useExaWebSearch") as boolean;
  }

  const apiKeyInput = doc.getElementById(
    "pref-exa-api-key",
  ) as HTMLInputElement | null;
  if (apiKeyInput) {
    apiKeyInput.value = String(getPref("exaApiKey") || "");
  }
}

export function bindExaPrefEvents(doc: Document): void {
  if ((doc as Document & { [EXA_PREFS_BOUND]?: boolean })[EXA_PREFS_BOUND]) {
    return;
  }
  (doc as Document & { [EXA_PREFS_BOUND]?: boolean })[EXA_PREFS_BOUND] = true;

  bindExternalPrefLink(doc, "pref-exa-apply-link", EXA_API_KEY_APPLY_URL);

  const enableCheckbox = doc.getElementById(
    "pref-exa-enable-checkbox",
  ) as XUL.Checkbox | null;
  enableCheckbox?.addEventListener("command", () => {
    setPref("useExaWebSearch", enableCheckbox.checked);
  });

  const apiKeyInput = doc.getElementById(
    "pref-exa-api-key",
  ) as HTMLInputElement | null;
  const persistApiKey = () => {
    if (apiKeyInput) {
      setPref("exaApiKey", apiKeyInput.value.trim());
    }
  };
  apiKeyInput?.addEventListener("change", persistApiKey);
  apiKeyInput?.addEventListener("blur", persistApiKey);

  const testBtn = doc.getElementById(
    "pref-exa-test-btn",
  ) as HTMLButtonElement | null;
  const testResult = doc.getElementById(
    "pref-exa-test-result",
  ) as HTMLElement | null;
  bindExaButton(doc, "pref-exa-test-btn", async () => {
    const apiKey = apiKeyInput?.value.trim() || "";
    setPref("exaApiKey", apiKey);
    if (!testBtn || !testResult) {
      return;
    }
    testBtn.disabled = true;
    testResult.hidden = false;
    testResult.style.color = "#666";
    testResult.textContent = getString("pref-exa-test-running");
    try {
      const result = await testExaApiKey(apiKey);
      testResult.style.color = result.success ? "#2e7d32" : "#c62828";
      testResult.textContent = result.message;
    } catch (error) {
      testResult.style.color = "#c62828";
      testResult.textContent = getErrorMessage(error);
    } finally {
      testBtn.disabled = false;
    }
  });
}

export function registerExaPrefsScripts(window: Window): void {
  const doc = window.document;
  try {
    initializeExaPrefsUI(doc);
  } catch (error) {
    ztoolkit.log("[Exa Preferences] Failed to initialize:", error);
  }
  try {
    bindExaPrefEvents(doc);
  } catch (error) {
    ztoolkit.log("[Exa Preferences] Failed to bind events:", error);
  }
}
