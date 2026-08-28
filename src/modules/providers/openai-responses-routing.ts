import type { ApiKeyProviderConfig } from "../../types/provider";
import type { AIProvider } from "../../types/provider";
import { OpenAIResponsesProvider } from "./OpenAIResponsesProvider";

export function isOfficialOpenAIEndpoint(baseUrl: string): boolean {
  try {
    return new URL(baseUrl).hostname === "api.openai.com";
  } catch {
    return false;
  }
}

export function shouldUseOpenAIResponsesProvider(
  config: Pick<ApiKeyProviderConfig, "baseUrl">,
): boolean {
  return isOfficialOpenAIEndpoint(config.baseUrl);
}

export function modelSupportsHostedWebSearch(modelId: string): boolean {
  const normalized = modelId.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  return /^(?:gpt-4o|gpt-4\.1|gpt-5|o\d)/.test(normalized);
}

export function configureOpenAIResponsesProviderForSession(
  provider: AIProvider,
  sessionId: string,
): void {
  if (!(provider instanceof OpenAIResponsesProvider)) {
    return;
  }

  provider.setRuntimeOptions({
    sessionId,
    hostedWebSearch: provider.supportsHostedWebSearch(),
  });
}
