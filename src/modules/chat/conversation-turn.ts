import type { ChatMessage } from "../../types/chat";

export function resolveConversationTurnSlice(
  messages: ChatMessage[],
  anchorMessageId: string,
): { start: number; end: number } | null {
  const anchorIndex = messages.findIndex(
    (message) => message.id === anchorMessageId,
  );
  if (anchorIndex < 0) return null;

  let start = anchorIndex;
  while (start > 0 && messages[start].role !== "user") {
    start -= 1;
  }
  if (messages[start].role !== "user") {
    start = anchorIndex;
  }

  let end = start + 1;
  while (end < messages.length && messages[end].role !== "user") {
    end += 1;
  }

  if (end <= start) return null;
  return { start, end };
}
