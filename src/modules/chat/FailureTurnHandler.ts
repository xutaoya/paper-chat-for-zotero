import type { ChatMessage, ChatSession } from "../../types/chat";
import { stripPendingAndIncompleteToolCallContent } from "./interrupted-message";
import { retainCompletedApiOnlyModelContextMessagesForTurn } from "./agent-runtime/AgentRuntime";
import type { SessionStorageService } from "./SessionStorageService";

export type FailedAssistantSnapshot = Pick<
  ChatMessage,
  | "content"
  | "reasoning"
  | "evidence"
  | "sourceItemKeys"
  | "presentationArtifacts"
>;

export function selectMoreSubstantialSnapshot(
  current: FailedAssistantSnapshot | null,
  previous: FailedAssistantSnapshot | null,
): FailedAssistantSnapshot | null {
  if (!current) return previous;
  if (!previous) return current;
  const preferred =
    current.content.length >= previous.content.length ? current : previous;
  const artifacts = mergePresentationArtifacts(
    previous.presentationArtifacts,
    current.presentationArtifacts,
  );
  return {
    ...preferred,
    presentationArtifacts: artifacts.length ? artifacts : undefined,
  };
}

function mergePresentationArtifacts(
  previous: ChatMessage["presentationArtifacts"],
  current: ChatMessage["presentationArtifacts"],
): NonNullable<ChatMessage["presentationArtifacts"]> {
  const merged = new Map<
    string,
    NonNullable<ChatMessage["presentationArtifacts"]>[number]
  >();
  for (const artifact of [...(previous || []), ...(current || [])]) {
    const key = artifact.localId || artifact.toolCallId;
    const existing = merged.get(key);
    merged.set(
      key,
      existing
        ? {
            ...existing,
            ...artifact,
            path: artifact.path || existing.path,
            previewPaths: artifact.previewPaths || existing.previewPaths,
            attachmentItemID:
              artifact.attachmentItemID || existing.attachmentItemID,
          }
        : artifact,
    );
  }
  return [...merged.values()];
}

export function clearRetryableFailureState(session: ChatSession): void {
  session.lastRetryableUserMessageId = undefined;
  session.lastRetryableErrorMessageId = undefined;
  session.lastRetryableFailedModelId = undefined;
}

export class FailureTurnHandler {
  constructor(
    private readonly getSessionStorage: () => SessionStorageService,
  ) {}

  createFailedAssistantSnapshot(
    assistantMessage: ChatMessage,
  ): FailedAssistantSnapshot | null {
    const content = stripPendingAndIncompleteToolCallContent(
      assistantMessage.content,
    );
    const reasoning = assistantMessage.reasoning?.trim() || undefined;
    const evidence = assistantMessage.evidence?.length
      ? assistantMessage.evidence
      : undefined;
    const sourceItemKeys = assistantMessage.sourceItemKeys?.length
      ? assistantMessage.sourceItemKeys
      : undefined;
    const presentationArtifacts = assistantMessage.presentationArtifacts?.length
      ? assistantMessage.presentationArtifacts
      : undefined;
    return content || reasoning || evidence || presentationArtifacts
      ? {
          content,
          reasoning,
          evidence,
          sourceItemKeys,
          presentationArtifacts,
        }
      : null;
  }

  resetAssistantForRetry(assistantMessage: ChatMessage): void {
    assistantMessage.content = "";
    delete assistantMessage.reasoning;
    delete assistantMessage.evidence;
    delete assistantMessage.tool_calls;
    delete assistantMessage.presentationArtifacts;
    assistantMessage.streamingState = "in_progress";
  }

  private clearFailedTurnRuntimeState(session: ChatSession): void {
    session.executionPlan = undefined;
    if (!session.toolExecutionState?.results.length) {
      session.toolExecutionState = undefined;
    }
    session.toolApprovalState = undefined;
  }

  async finalizeFailedAssistantMessage(
    session: ChatSession,
    assistantMessage: ChatMessage,
    fallbackSnapshot: FailedAssistantSnapshot | null,
  ): Promise<boolean> {
    const toolContextChanged =
      retainCompletedApiOnlyModelContextMessagesForTurn(
        session,
        assistantMessage.id,
      );
    this.clearFailedTurnRuntimeState(session);

    const snapshot = selectMoreSubstantialSnapshot(
      this.createFailedAssistantSnapshot(assistantMessage),
      fallbackSnapshot,
    );
    if (!snapshot) {
      const assistantIndex = session.messages.findIndex(
        (message) => message.id === assistantMessage.id,
      );
      if (assistantIndex >= 0) {
        session.messages.splice(assistantIndex, 1);
        await this.getSessionStorage().deleteMessage(
          session.id,
          assistantMessage.id,
        );
      }
      if (toolContextChanged) {
        await this.getSessionStorage().saveSession(session);
      }
      return false;
    }

    assistantMessage.content = snapshot.content;
    assistantMessage.reasoning = snapshot.reasoning;
    assistantMessage.evidence = snapshot.evidence;
    assistantMessage.sourceItemKeys = snapshot.sourceItemKeys;
    assistantMessage.presentationArtifacts = snapshot.presentationArtifacts;
    assistantMessage.streamingState = "interrupted";
    assistantMessage.timestamp = Date.now();
    delete assistantMessage.tool_calls;
    await this.getSessionStorage().updateMessageContent(
      session.id,
      assistantMessage.id,
      snapshot.content,
      snapshot.reasoning,
      {
        streamingState: "interrupted",
        evidence: snapshot.evidence || [],
        sourceItemKeys: snapshot.sourceItemKeys || [],
        presentationArtifacts: snapshot.presentationArtifacts || [],
      },
    );
    if (toolContextChanged) {
      await this.getSessionStorage().saveSession(session);
    }
    return true;
  }
}
