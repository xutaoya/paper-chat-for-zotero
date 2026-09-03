import { copyToClipboard } from "./ChatPanelBuilder";
import {
  formatToolDisplayLabel,
  type ParsedToolCallEntry,
} from "./MarkdownRenderer";
import {
  getToolCallCardExpandKey,
  isToolCallGroupExpanded,
  setToolCallGroupExpanded,
} from "./ToolCallGroupExpandState";
import { getString } from "../../../utils/locale";
import { HTML_NS } from "./types";
import type { ThemeColors } from "./types";

export type ToolResultActivityStatus = "complete" | "active";
export type ToolResultStatus = "running" | "success" | "error" | "cancelled";

const TOOL_RESULT_MAX_HEIGHT_PX = 180;
const TOOL_RESULT_USER_OPEN_ATTR = "data-user-open";
const TOOL_RESULT_CONTENT_SIG_ATTR = "data-tool-result-content-sig";

function createElement(
  doc: Document,
  tag: string,
  styles: Record<string, string>,
  attrs?: Record<string, string>,
): HTMLElement {
  const el = doc.createElementNS(HTML_NS, tag) as HTMLElement;
  Object.assign(el.style, styles);
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      el.setAttribute(key, value);
    }
  }
  return el;
}

function prefersReducedMotion(doc: Document): boolean {
  const view = (doc.defaultView ?? Zotero.getMainWindow()) as Window | null;
  return Boolean(view?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
}

export function mapToolCallStatusToResultStatus(
  status: ParsedToolCallEntry["status"],
): ToolResultStatus {
  if (status === "calling") {
    return "running";
  }
  if (status === "error") {
    return "error";
  }
  return "success";
}

export function getToolResultContentSignature(entry: ParsedToolCallEntry): string {
  return `${entry.status}\n${entry.toolArgs ?? ""}\n${entry.toolResult ?? ""}\n${entry.statusText ?? ""}`;
}

export function buildToolResultCopyText(entry: ParsedToolCallEntry): string {
  const parts: string[] = [];
  if (entry.toolArgs?.trim()) {
    parts.push(entry.toolArgs.trim());
  }
  if (entry.toolResult?.trim()) {
    if (parts.length > 0) {
      parts.push("");
    }
    parts.push(entry.toolResult.trim());
  }
  if (!parts.length && entry.statusText?.trim()) {
    parts.push(entry.statusText.trim());
  }
  return parts.join("\n");
}

export function resolveToolResultDefaultOpen(
  resultStatus: ToolResultStatus,
  activityStatus: ToolResultActivityStatus,
  hasDetails: boolean,
): boolean {
  if (!hasDetails) {
    return false;
  }
  if (activityStatus === "active" || resultStatus === "running") {
    return true;
  }
  return false;
}

function getStatusLabel(status: ToolResultStatus): string {
  switch (status) {
    case "running":
      return getString("chat-tool-result-running");
    case "success":
      return getString("chat-tool-result-completed");
    case "error":
      return getString("chat-tool-result-failed");
    default:
      return getString("chat-tool-result-cancelled");
  }
}

function getStatusColor(status: ToolResultStatus): string {
  switch (status) {
    case "running":
      return "#2563eb";
    case "success":
      return "#16a34a";
    case "error":
      return "#dc2626";
    default:
      return "#71717a";
  }
}

function getExpandStateKey(
  messageId: string | undefined,
  itemId: string,
): string | null {
  return getToolCallCardExpandKey(messageId, `activity-${itemId}`);
}

function resolveToolResultOpen(
  root: HTMLElement,
  expandKey: string | null,
  defaultOpen: boolean,
): boolean {
  const userOpen = root.getAttribute(TOOL_RESULT_USER_OPEN_ATTR);
  if (userOpen === "true") {
    return true;
  }
  if (userOpen === "false") {
    return false;
  }
  if (expandKey && isToolCallGroupExpanded(expandKey)) {
    return true;
  }
  return defaultOpen;
}

function applyToolResultOpenUi(root: HTMLElement, open: boolean): void {
  const disclosure = root.querySelector(
    "[data-tool-result-disclosure]",
  ) as HTMLElement | null;
  const chevron = root.querySelector(
    ".paperchat-tool-result-chevron",
  ) as HTMLElement | null;
  const trigger = root.querySelector(
    ".paperchat-tool-result-trigger",
  ) as HTMLElement | null;

  if (disclosure) {
    disclosure.style.maxHeight = open ? `${TOOL_RESULT_MAX_HEIGHT_PX}px` : "0px";
    disclosure.style.opacity = open ? "1" : "0";
    disclosure.style.pointerEvents = open ? "auto" : "none";
  }
  if (chevron) {
    chevron.style.transform = open ? "rotate(180deg)" : "rotate(0deg)";
  }
  trigger?.setAttribute("aria-expanded", open ? "true" : "false");
  root.setAttribute("data-open", open ? "true" : "false");
}

function scrollToolResultViewportToEnd(viewport: HTMLElement, doc: Document): void {
  if (viewport.scrollHeight <= viewport.clientHeight) {
    return;
  }
  const reduce = prefersReducedMotion(doc);
  if (typeof viewport.scrollTo === "function") {
    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: reduce ? "auto" : "smooth",
    });
    return;
  }
  viewport.scrollTop = viewport.scrollHeight;
}

function createStatusIcon(
  doc: Document,
  status: ToolResultStatus,
): HTMLElement {
  const icon = createElement(doc, "span", {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "12px",
    height: "12px",
    flexShrink: "0",
    fontSize: "10px",
    lineHeight: "1",
  });
  icon.setAttribute("data-tool-result-status-icon", status);

  if (status === "running") {
    icon.className = "paperchat-tool-result-spinner";
    icon.textContent = "◌";
    return icon;
  }
  if (status === "success") {
    icon.textContent = "✓";
    return icon;
  }
  if (status === "error") {
    icon.textContent = "✕";
    return icon;
  }
  icon.textContent = "⊘";
  return icon;
}

function createOutputSection(
  doc: Document,
  theme: ThemeColors,
  entry: ParsedToolCallEntry,
  resultStatus: ToolResultStatus,
): HTMLElement {
  const wrap = createElement(doc, "div", {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    minWidth: "0",
  });

  if (entry.toolArgs?.trim()) {
    const argsBlock = createElement(doc, "div", {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      minWidth: "0",
    });
    const argsLabel = createElement(doc, "span", {
      fontSize: "10px",
      fontWeight: "600",
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: theme.textMuted,
      opacity: "0.8",
    });
    argsLabel.textContent = getString("chat-tool-result-args-label");
    argsBlock.appendChild(argsLabel);

    const argsPre = createElement(doc, "pre", {
      margin: "0",
      padding: "0",
      fontFamily: '"SF Mono", Monaco, Consolas, monospace',
      fontSize: "11px",
      lineHeight: "1.45",
      color: theme.textSecondary,
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
    });
    argsPre.setAttribute("data-tool-result-args", "true");
    argsPre.textContent = entry.toolArgs;
    argsBlock.appendChild(argsPre);
    wrap.appendChild(argsBlock);
  }

  const outputText =
    entry.toolResult?.trim() ||
    (resultStatus === "running" ? entry.statusText : "") ||
    "";
  if (outputText) {
    const outputBlock = createElement(doc, "div", {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      minWidth: "0",
    });
    if (entry.toolArgs?.trim() || entry.toolResult?.trim()) {
      const outputLabel = createElement(doc, "span", {
        fontSize: "10px",
        fontWeight: "600",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: theme.textMuted,
        opacity: "0.8",
      });
      outputLabel.textContent = getString("chat-tool-result-output-label");
      outputBlock.appendChild(outputLabel);
    }

    const outputPre = createElement(doc, "pre", {
      margin: "0",
      padding: "0",
      fontFamily: '"SF Mono", Monaco, Consolas, monospace',
      fontSize: "11px",
      lineHeight: "1.45",
      color: resultStatus === "error" ? "#dc2626" : theme.textPrimary,
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      opacity: resultStatus === "error" ? "0.95" : "0.88",
    });
    outputPre.setAttribute("data-tool-result-output", "true");
    outputPre.textContent = outputText;
    outputBlock.appendChild(outputPre);
    wrap.appendChild(outputBlock);
  }

  return wrap;
}

function bindToolResultInteractions(
  root: HTMLElement,
  doc: Document,
  theme: ThemeColors,
  expandKey: string | null,
  canToggle: boolean,
  resultStatus: ToolResultStatus,
): void {
  const trigger = root.querySelector(
    ".paperchat-tool-result-trigger",
  ) as HTMLButtonElement | null;
  const viewport = root.querySelector(
    "[data-tool-result-viewport]",
  ) as HTMLElement | null;
  const copyButton = root.querySelector(
    "[data-tool-result-copy]",
  ) as HTMLButtonElement | null;

  if (trigger && canToggle) {
    trigger.addEventListener("click", () => {
      const nextOpen = root.getAttribute("data-open") !== "true";
      root.setAttribute(TOOL_RESULT_USER_OPEN_ATTR, nextOpen ? "true" : "false");
      if (expandKey) {
        setToolCallGroupExpanded(expandKey, nextOpen);
      }
      applyToolResultOpenUi(root, nextOpen);
      if (nextOpen && viewport) {
        scheduleAfterLayout(doc, () => scrollToolResultViewportToEnd(viewport, doc));
      }
    });
    trigger.addEventListener("mouseenter", () => {
      trigger.style.background = theme.hoverBg;
    });
    trigger.addEventListener("mouseleave", () => {
      trigger.style.background = "transparent";
    });
  }

  if (copyButton) {
    copyButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const argsEl = root.querySelector("[data-tool-result-args]");
      const outputEl = root.querySelector("[data-tool-result-output]");
      const parts: string[] = [];
      if (argsEl?.textContent?.trim()) {
        parts.push(argsEl.textContent.trim());
      }
      if (outputEl?.textContent?.trim()) {
        if (parts.length > 0) {
          parts.push("");
        }
        parts.push(outputEl.textContent.trim());
      }
      const copyText = parts.join("\n");
      if (!copyText) {
        return;
      }
      copyToClipboard(copyText);
      copyButton.textContent = getString("chat-tool-result-copied");
      const win = doc.defaultView ?? Zotero.getMainWindow();
      win?.setTimeout(() => {
        copyButton.textContent = getString("chat-tool-result-copy");
      }, 1600);
    });
  }

  if (viewport && resultStatus === "running") {
    scheduleAfterLayout(doc, () => scrollToolResultViewportToEnd(viewport, doc));
  }
}

function scheduleAfterLayout(doc: Document, callback: () => void): void {
  const win = doc.defaultView;
  if (win?.requestAnimationFrame) {
    win.requestAnimationFrame(() => {
      win.requestAnimationFrame(callback);
    });
    return;
  }
  setTimeout(callback, 0);
}

function populateToolResultElement(
  root: HTMLElement,
  doc: Document,
  theme: ThemeColors,
  entry: ParsedToolCallEntry,
  itemId: string,
  activityStatus: ToolResultActivityStatus,
  messageId?: string,
): void {
  const resultStatus = mapToolCallStatusToResultStatus(entry.status);
  const hasDetails = Boolean(
    entry.toolArgs?.trim() || entry.toolResult?.trim() || entry.statusText?.trim(),
  );
  const canToggle =
    hasDetails &&
    (resultStatus === "running" ||
      resultStatus === "error" ||
      Boolean(entry.toolResult?.trim()) ||
      Boolean(entry.toolArgs?.trim()));
  const expandKey = getExpandStateKey(messageId, itemId);
  const defaultOpen = resolveToolResultDefaultOpen(
    resultStatus,
    activityStatus,
    canToggle,
  );
  const open = resolveToolResultOpen(root, expandKey, defaultOpen);

  root.replaceChildren();
  root.className =
    "paperchat-agent-activity-row paperchat-agent-activity-tool-row paperchat-tool-result";
  root.setAttribute("data-agent-activity-row", "tool");
  root.setAttribute("data-agent-activity-item-id", itemId);
  root.setAttribute(
    "data-agent-step-status",
    activityStatus === "active" ? "active" : "complete",
  );
  root.setAttribute("data-tool-card-status", entry.status);
  root.setAttribute(TOOL_RESULT_CONTENT_SIG_ATTR, getToolResultContentSignature(entry));
  root.setAttribute("data-tool-result-status", resultStatus);

  const trigger = doc.createElementNS(
    HTML_NS,
    "button",
  ) as HTMLButtonElement;
  trigger.type = "button";
  trigger.className = "paperchat-tool-result-trigger";
  Object.assign(trigger.style, {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "100%",
    minHeight: "32px",
    padding: "2px 6px",
    margin: "0",
    border: "none",
    borderRadius: "6px",
    background: "transparent",
    cursor: canToggle ? "pointer" : "default",
    color: theme.textPrimary,
    font: "inherit",
    textAlign: "left",
  });
  trigger.disabled = !canToggle;

  const kindIcon = createElement(doc, "span", {
    width: "16px",
    height: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: "0",
    fontSize: "12px",
    color: theme.textMuted,
    opacity: "0.72",
  });
  kindIcon.textContent = "⚙";
  trigger.appendChild(kindIcon);

  const title = createElement(doc, "span", {
    flex: "1",
    minWidth: "0",
    fontSize: "12px",
    fontWeight: "500",
    color: theme.textPrimary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    opacity: "0.92",
  });
  title.textContent = formatToolDisplayLabel(entry.toolName);
  trigger.appendChild(title);

  const statusBadge = createElement(doc, "span", {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    flexShrink: "0",
    fontSize: "11px",
    fontWeight: "500",
    color: getStatusColor(resultStatus),
  });
  statusBadge.setAttribute("data-tool-result-status-badge", "true");
  statusBadge.appendChild(createStatusIcon(doc, resultStatus));
  const statusText = createElement(doc, "span", {});
  statusText.textContent = getStatusLabel(resultStatus);
  statusBadge.appendChild(statusText);
  trigger.appendChild(statusBadge);

  if (canToggle) {
    const chevron = createElement(doc, "span", {
      flexShrink: "0",
      fontSize: "12px",
      color: theme.textMuted,
      opacity: "0.55",
      transition: "transform 0.18s ease, color 0.18s ease",
      lineHeight: "1",
    });
    chevron.className = "paperchat-tool-result-chevron";
    chevron.textContent = "⌄";
    trigger.appendChild(chevron);
  }

  root.appendChild(trigger);

  if (canToggle) {
    const disclosure = createElement(
      doc,
      "div",
      {
        overflow: "hidden",
        transition: "max-height 0.18s ease, opacity 0.18s ease",
        paddingLeft: "22px",
        paddingRight: "4px",
      },
      { "data-tool-result-disclosure": "true" },
    );

    const panel = createElement(doc, "div", {
      marginTop: "2px",
      marginBottom: "4px",
      borderRadius: "10px",
      background: theme.hoverBg,
      overflow: "hidden",
    });

    const viewport = createElement(
      doc,
      "div",
      {
        maxHeight: `${TOOL_RESULT_MAX_HEIGHT_PX - 36}px`,
        overflowY: "auto",
        padding: "10px 12px",
      },
      { "data-tool-result-viewport": "true" },
    );
    viewport.appendChild(createOutputSection(doc, theme, entry, resultStatus));
    panel.appendChild(viewport);

    const copyText = buildToolResultCopyText(entry);
    if (copyText) {
      const footer = createElement(doc, "div", {
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "0 8px 8px",
      });
      const copyButton = doc.createElementNS(
        HTML_NS,
        "button",
      ) as HTMLButtonElement;
      copyButton.type = "button";
      copyButton.setAttribute("data-tool-result-copy", "true");
      Object.assign(copyButton.style, {
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: "4px 8px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: "500",
        color: theme.textMuted,
      });
      copyButton.textContent = getString("chat-tool-result-copy");
      copyButton.addEventListener("mouseenter", () => {
        copyButton.style.background = theme.buttonHoverBg;
        copyButton.style.color = theme.textPrimary;
      });
      copyButton.addEventListener("mouseleave", () => {
        copyButton.style.background = "transparent";
        copyButton.style.color = theme.textMuted;
      });
      footer.appendChild(copyButton);
      panel.appendChild(footer);
    }

    disclosure.appendChild(panel);
    root.appendChild(disclosure);
  }

  applyToolResultOpenUi(root, open);
  bindToolResultInteractions(
    root,
    doc,
    theme,
    expandKey,
    canToggle,
    resultStatus,
  );
}

export function createToolResultActivityElement(
  doc: Document,
  theme: ThemeColors,
  entry: ParsedToolCallEntry,
  itemId: string,
  activityStatus: ToolResultActivityStatus,
  messageId?: string,
): HTMLElement {
  const root = createElement(doc, "div", {
    display: "flex",
    flexDirection: "column",
    minWidth: "0",
    margin: "2px 0",
  });
  populateToolResultElement(
    root,
    doc,
    theme,
    entry,
    itemId,
    activityStatus,
    messageId,
  );
  return root;
}

export function updateToolResultActivityElement(
  root: HTMLElement,
  doc: Document,
  theme: ThemeColors,
  entry: ParsedToolCallEntry,
  activityStatus: ToolResultActivityStatus,
  messageId?: string,
): boolean {
  const nextSig = getToolResultContentSignature(entry);
  const currentSig = root.getAttribute(TOOL_RESULT_CONTENT_SIG_ATTR) ?? "";
  const previousResultStatus = root.getAttribute("data-tool-result-status");
  const nextResultStatus = mapToolCallStatusToResultStatus(entry.status);
  const itemId = root.getAttribute("data-agent-activity-item-id") ?? "";

  if (currentSig === nextSig) {
    return false;
  }

  const wasRunning = previousResultStatus === "running";
  const isCompleteNow = nextResultStatus !== "running";
  const userOpen = root.getAttribute(TOOL_RESULT_USER_OPEN_ATTR);
  const expandKey = getExpandStateKey(messageId, itemId);

  if (wasRunning && isCompleteNow && userOpen !== "true") {
    root.setAttribute(TOOL_RESULT_USER_OPEN_ATTR, "false");
    if (expandKey) {
      setToolCallGroupExpanded(expandKey, false);
    }
  }

  populateToolResultElement(
    root,
    doc,
    theme,
    entry,
    itemId,
    activityStatus,
    messageId,
  );
  return true;
}

export function getActivityMessageId(list: HTMLElement): string | undefined {
  const panel = list.closest("[data-agent-activity-for]") as HTMLElement | null;
  return panel?.getAttribute("data-agent-activity-for") ?? undefined;
}
