import type { ChatMessage } from "../../chat";
import {
  attachmentStateFromUserMessage,
  extractEditableUserMessageContent,
} from "../../chat/user-message-edit";
import { getString } from "../../../utils/locale";
import { createElement } from "./ChatPanelBuilder";
import { sessionTurnQueue } from "./SessionTurnQueue";
import type { AttachmentState, ChatPanelContext } from "./types";

const controllers = new WeakMap<HTMLElement, UserMessageEditController>();

function hasComposerDraft(
  messageInput: HTMLTextAreaElement | null,
  attachmentState: AttachmentState,
): boolean {
  return Boolean(
    messageInput?.value.trim() ||
      attachmentState.pendingImages.length ||
      attachmentState.pendingFiles.length ||
      attachmentState.pendingSelectedText ||
      attachmentState.pendingQuotedMessages.length,
  );
}

export class UserMessageEditController {
  private editingUserMessageId: string | null = null;
  private pendingResendUserMessageId: string | null = null;

  constructor(private readonly context: ChatPanelContext) {}

  static attach(context: ChatPanelContext): UserMessageEditController {
    let controller = controllers.get(context.container);
    if (!controller) {
      controller = new UserMessageEditController(context);
      controllers.set(context.container, controller);
    }
    return controller;
  }

  static get(container: HTMLElement): UserMessageEditController | null {
    return controllers.get(container) ?? null;
  }

  getEditingUserMessageId(): string | null {
    return this.editingUserMessageId;
  }

  consumePendingResendUserMessageId(): string | null {
    const messageId = this.pendingResendUserMessageId;
    this.pendingResendUserMessageId = null;
    return messageId;
  }

  beginEdit(message: ChatMessage): boolean {
    if (message.role !== "user" || message.isSystemNotice) {
      return false;
    }

    const session = this.context.chatManager.getActiveSession();
    if (!session) {
      return false;
    }

    const queueSnapshot = sessionTurnQueue.snapshot(session.id);
    if (
      queueSnapshot.status !== "idle" ||
      queueSnapshot.queued.length > 0 ||
      queueSnapshot.failureErrorId
    ) {
      this.context.appendError(getString("chat-edit-message-busy"));
      return false;
    }

    if (this.context.chatManager.hasActiveSessionTurn(session.id)) {
      this.context.appendError(getString("chat-edit-message-busy"));
      return false;
    }

    if (session.userInputRequestState?.pendingRequests.length) {
      this.context.appendError(getString("chat-edit-message-pending-input"));
      return false;
    }

    const container = this.context.container;
    const messageInput = container.querySelector(
      "#chat-message-input",
    ) as HTMLTextAreaElement | null;
    const isSameMessage = this.editingUserMessageId === message.id;
    if (
      !isSameMessage &&
      hasComposerDraft(messageInput, this.context.getAttachmentState())
    ) {
      this.context.appendError(getString("chat-queue-draft-conflict"));
      return false;
    }

    this.editingUserMessageId = message.id;
    if (messageInput) {
      messageInput.value = extractEditableUserMessageContent(message);
      messageInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
    this.context.setAttachmentState(attachmentStateFromUserMessage(message));
    this.context.updateAttachmentsPreview();
    this.syncComposerUi();
    this.context.renderMessages(session.messages);
    messageInput?.focus();
    return true;
  }

  cancelEdit(options: { clearComposer?: boolean } = {}): void {
    if (!this.editingUserMessageId) {
      return;
    }
    this.editingUserMessageId = null;
    this.pendingResendUserMessageId = null;
    if (options.clearComposer) {
      const messageInput = this.context.container.querySelector(
        "#chat-message-input",
      ) as HTMLTextAreaElement | null;
      if (messageInput) {
        messageInput.value = "";
      }
      this.context.clearAttachments();
      this.context.updateAttachmentsPreview();
    }
    this.syncComposerUi();
    const session = this.context.chatManager.getActiveSession();
    if (session) {
      this.context.renderMessages(session.messages);
    }
  }

  async prepareEditResend(): Promise<boolean> {
    const editingUserMessageId = this.editingUserMessageId;
    if (!editingUserMessageId) {
      return true;
    }

    const session = this.context.chatManager.getActiveSession();
    if (!session) {
      return false;
    }

    sessionTurnQueue.clear(session.id);
    const truncated =
      await this.context.chatManager.truncateSessionAfterUserMessage(
        session.id,
        editingUserMessageId,
      );
    if (!truncated) {
      this.context.appendError(getString("chat-edit-message-failed"));
      return false;
    }

    this.pendingResendUserMessageId = editingUserMessageId;
    this.editingUserMessageId = null;
    this.syncComposerUi();
    return true;
  }

  private syncComposerUi(): void {
    const container = this.context.container;
    const inputWrapper = container.querySelector(
      "#chat-input-wrapper",
    ) as HTMLElement | null;
    const banner = this.ensureEditBanner();
    const editing = this.editingUserMessageId !== null;

    inputWrapper?.classList.toggle("chat-composer--editing", editing);
    banner.style.display = editing ? "flex" : "none";
    if (editing) {
      const label = banner.querySelector("span");
      if (label) {
        label.textContent = getString("chat-edit-message-banner");
      }
    }
  }

  private ensureEditBanner(): HTMLElement {
    const container = this.context.container;
    const existing = container.querySelector(
      "#chat-edit-message-banner",
    ) as HTMLElement | null;
    if (existing) {
      return existing;
    }

    const inputWrapper = container.querySelector(
      "#chat-input-wrapper",
    ) as HTMLElement | null;
    const theme = this.context.getTheme();
    const banner = createElement(
      container.ownerDocument!,
      "div",
      {
        display: "none",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        padding: "8px 16px 0",
        fontSize: "12px",
        lineHeight: "1.4",
        color: theme.textSecondary,
      },
      { id: "chat-edit-message-banner" },
    );
    const label = createElement(container.ownerDocument!, "span", {
      flex: "1",
      minWidth: "0",
    });
    banner.appendChild(label);

    const cancelButton = createElement(
      container.ownerDocument!,
      "button",
      {
        flex: "0 0 auto",
        border: "none",
        background: "transparent",
        color: theme.textMuted,
        cursor: "pointer",
        fontSize: "12px",
        padding: "0",
      },
      {
        type: "button",
        "aria-label": getString("chat-edit-message-cancel"),
      },
    );
    cancelButton.textContent = getString("chat-edit-message-cancel");
    cancelButton.addEventListener("click", () => {
      this.cancelEdit({ clearComposer: true });
    });
    banner.appendChild(cancelButton);
    inputWrapper?.insertBefore(
      banner,
      inputWrapper.querySelector("#chat-context-item-banner")?.nextSibling ||
        inputWrapper.querySelector("#chat-message-input"),
    );
    return banner;
  }
}
