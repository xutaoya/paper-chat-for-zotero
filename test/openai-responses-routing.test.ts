import { assert } from "chai";
import {
  configureOpenAIResponsesProviderForSession,
  isOfficialOpenAIEndpoint,
  modelSupportsHostedWebSearch,
  shouldUseOpenAIResponsesProvider,
} from "../src/modules/providers/openai-responses-routing.ts";
import { OpenAIResponsesProvider } from "../src/modules/providers/OpenAIResponsesProvider.ts";
import type { ApiKeyProviderConfig } from "../src/types/provider";

function createOpenAIProvider(
  overrides: Partial<ApiKeyProviderConfig> = {},
): OpenAIResponsesProvider {
  return new OpenAIResponsesProvider({
    id: "openai",
    name: "OpenAI",
    type: "openai",
    enabled: true,
    isBuiltin: true,
    order: 0,
    apiKey: "test-key",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o",
    availableModels: ["gpt-4o"],
    temperature: 0.7,
    maxTokens: 4096,
    ...overrides,
  } satisfies ApiKeyProviderConfig);
}

describe("openai-responses-routing", function () {
  it("detects the official OpenAI endpoint", function () {
    assert.isTrue(isOfficialOpenAIEndpoint("https://api.openai.com/v1"));
    assert.isFalse(isOfficialOpenAIEndpoint("https://api.deepseek.com/v1"));
  });

  it("routes only official OpenAI configs to the Responses provider", function () {
    assert.isTrue(
      shouldUseOpenAIResponsesProvider({
        baseUrl: "https://api.openai.com/v1",
      }),
    );
    assert.isFalse(
      shouldUseOpenAIResponsesProvider({
        baseUrl: "https://openrouter.ai/api/v1",
      }),
    );
  });

  it("recognizes hosted-search-capable OpenAI models", function () {
    assert.isTrue(modelSupportsHostedWebSearch("gpt-4o"));
    assert.isTrue(modelSupportsHostedWebSearch("gpt-4o-mini"));
    assert.isTrue(modelSupportsHostedWebSearch("gpt-5.4"));
    assert.isTrue(modelSupportsHostedWebSearch("o3-mini"));
    assert.isFalse(modelSupportsHostedWebSearch("deepseek-chat"));
  });

  it("configures hosted web search runtime options for OpenAI sessions", function () {
    const provider = createOpenAIProvider({ defaultModel: "gpt-4o" });
    configureOpenAIResponsesProviderForSession(provider, "session-123");

    assert.isTrue(provider.supportsHostedWebSearch());
  });

  it("disables hosted web search for unsupported models", function () {
    const provider = createOpenAIProvider({
      defaultModel: "text-embedding-3-large",
      availableModels: ["text-embedding-3-large"],
    });

    assert.isFalse(provider.supportsHostedWebSearch());
  });
});
