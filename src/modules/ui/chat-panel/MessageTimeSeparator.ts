import { getString } from "../../../utils/locale";
import { HTML_NS } from "./types";
import type { ThemeColors } from "./types";

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function getLocalDayKey(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function shouldShowMessageTimeSeparator(
  previousTimestamp: number | undefined,
  currentTimestamp: number,
): boolean {
  if (!Number.isFinite(currentTimestamp) || currentTimestamp <= 0) {
    return false;
  }
  if (
    previousTimestamp === undefined ||
    !Number.isFinite(previousTimestamp) ||
    previousTimestamp <= 0
  ) {
    return true;
  }
  return getLocalDayKey(previousTimestamp) !== getLocalDayKey(currentTimestamp);
}

export function formatMessageTimeLabel(
  timestamp: number,
  now: number = Date.now(),
): string {
  const date = new Date(timestamp);
  const time = `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  const month = String(date.getMonth() + 1);
  const day = String(date.getDate());
  const year = String(date.getFullYear());

  if (getLocalDayKey(timestamp) === getLocalDayKey(now)) {
    return getString("chat-time-today", { args: { time } });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (getLocalDayKey(timestamp) === getLocalDayKey(yesterday.getTime())) {
    return getString("chat-time-yesterday", { args: { time } });
  }

  if (date.getFullYear() === new Date(now).getFullYear()) {
    return getString("chat-time-same-year", {
      args: { month, day, time },
    });
  }

  return getString("chat-time-full", {
    args: { year, month, day, time },
  });
}

export function createMessageTimeSeparatorElement(
  doc: Document,
  theme: ThemeColors,
  timestamp: number,
): HTMLElement {
  const label = formatMessageTimeLabel(timestamp);
  const el = doc.createElementNS(HTML_NS, "div") as HTMLElement;
  el.className = "chat-message-time-separator";
  Object.assign(el.style, {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "12px 16px 8px",
    fontSize: "12px",
    lineHeight: "1.35",
    fontWeight: "400",
    color: theme.textMuted,
    userSelect: "none",
    textAlign: "center",
  });
  el.setAttribute("role", "separator");
  el.setAttribute("aria-label", label);
  el.textContent = label;
  return el;
}
