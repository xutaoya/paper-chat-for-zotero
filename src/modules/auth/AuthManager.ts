import type { SubscriptionUsageSummary, UserInfo } from "../../types/auth";

export interface AuthCallbacks {
  onLoginStatusChange?: (isLoggedIn: boolean) => void;
  onUserInfoUpdate?: (user: UserInfo | null) => void;
  onBalanceUpdate?: (quota: number, usedQuota: number) => void;
  onError?: (error: Error) => void;
}

export class AuthManager {
  async initialize(): Promise<void> {}

  isLoggedIn(): boolean {
    return false;
  }

  getUser(): UserInfo | null {
    return null;
  }

  getBalance(): { quota: number; usedQuota: number } {
    return { quota: 0, usedQuota: 0 };
  }

  getApiKey(): string {
    return "";
  }

  formatBalance(): string {
    return "0";
  }

  formatUsedQuota(): string {
    return "0";
  }

  getSubscriptionUsageSummary(): SubscriptionUsageSummary | null {
    return null;
  }

  addListener(_callbacks: AuthCallbacks): () => void {
    return () => {};
  }

  removeListener(_callbacks: AuthCallbacks): void {}

  async refreshUserInfo(): Promise<void> {}

  async logout(): Promise<void> {}

  async fetchCheckinStatus(): Promise<{
    success: boolean;
    enabled: boolean;
    checkedInToday: boolean;
    checkinCount: number;
  }> {
    return {
      success: false,
      enabled: false,
      checkedInToday: false,
      checkinCount: 0,
    };
  }

  async doCheckin(): Promise<{
    success: boolean;
    message?: string;
    quotaAwarded?: number;
  }> {
    return { success: false, message: "disabled" };
  }

  async ensurePluginToken(_forceRefresh?: boolean): Promise<boolean> {
    return false;
  }

  async getPricing(): Promise<{ success: boolean; message?: string }> {
    return { success: false, message: "disabled" };
  }

  applyPaperChatBaseUrlChange(): void {}

  destroy(): void {}
}

let authManager: AuthManager | null = null;
let isAuthManagerDestroyed = false;

export function getAuthManager(): AuthManager {
  if (isAuthManagerDestroyed) {
    isAuthManagerDestroyed = false;
  }
  if (!authManager) {
    authManager = new AuthManager();
  }
  return authManager;
}

export function destroyAuthManager(): void {
  authManager?.destroy();
  authManager = null;
  isAuthManagerDestroyed = true;
}
