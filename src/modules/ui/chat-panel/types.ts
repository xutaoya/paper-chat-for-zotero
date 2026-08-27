/**
 * Chat Panel Types - Shared interfaces for chat panel modules
 */

import type {
  ChatManager,
  ChatMessage,
  ExecutionPlan,
  QuotedMessageRef,
} from "../../chat";
import type { AuthManager } from "../../auth";

// Theme colors interface
export interface ThemeColors {
  // Backgrounds
  containerBg: string;
  chatHistoryBg: string;
  toolbarBg: string;
  inputAreaBg: string;
  inputBg: string;
  assistantBubbleBg: string;
  attachmentPreviewBg: string;
  buttonBg: string;
  buttonHoverBg: string;
  dropdownBg: string;
  dropdownItemHoverBg: string;
  hoverBg: string;
  // Borders
  borderColor: string;
  inputBorderColor: string;
  inputFocusBorderColor: string;
  inputFocusRingColor: string;
  composerShadow: string;
  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  // Code
  inlineCodeBg: string;
  inlineCodeColor: string;
  codeBlockBg: string;
  codeBlockColor: string;
  // User accent (bar, bubble, send button)
  userBubbleBg: string;
  userBubbleText: string;
  sendButtonBg: string;
  sendButtonText: string;
  // Other
  scrollbarThumb: string;
  scrollbarThumbHover: string;
}

// Session info for history dropdown (matches SessionMeta from chat types)
export interface SessionInfo {
  id: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  lastMessagePreview: string;
  lastMessageTime: number;
  title?: string;
  titleSource?: "generated" | "user";
  titleGeneratedAt?: number;
  titleEditedAt?: number;
  lastActiveItemKey?: string | null;
  lastActiveItemLibraryID?: number;
  scopeLabel?: string;
}

// Attachment state for pending uploads
export interface AttachmentState {
  pendingImages: import("../../../types/chat").ImageAttachment[];
  pendingFiles: import("../../../types/chat").FileAttachment[];
  pendingSelectedText: string | null;
  pendingQuotedMessages: QuotedMessageRef[];
}

// Context passed to event handlers
export interface ChatPanelContext {
  container: HTMLElement;
  chatManager: ChatManager;
  authManager: AuthManager;
  getCurrentItem: () => Zotero.Item | null;
  setCurrentItem: (item: Zotero.Item | null) => void;
  getTheme: () => ThemeColors;
  getAttachmentState: () => AttachmentState;
  setAttachmentState: (state: AttachmentState) => void;
  clearAttachments: () => void;
  updateAttachmentsPreview: () => void;
  updateUserBar: () => void;
  updatePdfCheckboxVisibility: (item: Zotero.Item | null) => Promise<void>;
  summarizeConversationToNote: () => Promise<void>;
  launchPresentation: (assistantMessageId?: string) => Promise<boolean>;
  renderMessages: (
    messages: ChatMessage[],
    onRenderComplete?: () => void,
  ) => void;
  renderExecutionPlan: (plan?: ExecutionPlan) => void;
  appendError: (errorMessage: string) => void;
  appendSuccess: (message: string) => void;
  // Callbacks reference for multi-doc selector
  callbacks?: {
    onMessageUpdate?: (messages: ChatMessage[]) => void;
    onStreamingUpdate?: (content: string, messageId: string) => void;
    onReasoningUpdate?: (
      reasoning: string,
      messageId: string,
      reasoningTokens?: number,
    ) => void;
    onError?: (error: Error) => void;
    onPdfAttached?: () => void;
    onMessageComplete?: () => void;
    onExecutionPlanUpdate?: (plan?: ExecutionPlan) => void;
  };
}

// HTML namespace for XHTML environment
export const HTML_NS = "http://www.w3.org/1999/xhtml";

// Re-export mention types for convenience
export type {
  MentionResource,
  MentionResourceType,
  MentionSelectorState,
  OnMentionSelectCallback,
} from "./MentionSelector";
