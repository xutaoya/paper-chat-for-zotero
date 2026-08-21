import { getPref, setPref } from "../../../utils/prefs";
import { createDefaultQuickActions } from "./defaultQuickActions";
import type { QuickAction } from "./types";

const QUICK_ACTIONS_PREF_KEY = "quickActions" as const;

function normalizeQuickAction(value: unknown): QuickAction | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const label = typeof record.label === "string" ? record.label.trim() : "";
  const prompt = typeof record.prompt === "string" ? record.prompt.trim() : "";
  const id =
    typeof record.id === "string" && record.id.trim()
      ? record.id.trim()
      : label
        ? `action-${label}`
        : "";
  if (!id || !label || !prompt) {
    return null;
  }
  return { id, label, prompt };
}

export function loadQuickActions(): QuickAction[] {
  const raw = getPref(QUICK_ACTIONS_PREF_KEY);
  if (typeof raw !== "string" || !raw.trim()) {
    return createDefaultQuickActions();
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return createDefaultQuickActions();
    }
    const actions = parsed
      .map(normalizeQuickAction)
      .filter((action): action is QuickAction => action !== null);
    return actions;
  } catch {
    return createDefaultQuickActions();
  }
}

export function saveQuickActions(actions: QuickAction[]): void {
  setPref(QUICK_ACTIONS_PREF_KEY, JSON.stringify(actions));
}

export function upsertQuickAction(action: QuickAction): QuickAction[] {
  const actions = loadQuickActions();
  const index = actions.findIndex((candidate) => candidate.id === action.id);
  if (index >= 0) {
    actions[index] = action;
  } else {
    actions.push(action);
  }
  saveQuickActions(actions);
  return actions;
}

export function reorderQuickActionsByIds(orderedIds: string[]): QuickAction[] {
  const current = loadQuickActions();
  const byId = new Map(current.map((action) => [action.id, action]));
  const next: QuickAction[] = [];
  const seen = new Set<string>();
  for (const id of orderedIds) {
    const action = byId.get(id);
    if (!action || seen.has(id)) {
      continue;
    }
    next.push(action);
    seen.add(id);
  }
  for (const action of current) {
    if (!seen.has(action.id)) {
      next.push(action);
    }
  }
  saveQuickActions(next);
  return next;
}

export function deleteQuickAction(id: string): QuickAction[] {
  const actions = loadQuickActions().filter((action) => action.id !== id);
  saveQuickActions(actions);
  return actions;
}

export function createQuickActionId(label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u4e00-\u9fff-]/g, "");
  return slug ? `action-${slug}-${Date.now()}` : `action-${Date.now()}`;
}
