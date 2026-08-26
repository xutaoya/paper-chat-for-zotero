import { getString } from "../../utils/locale";
import { getErrorMessage } from "../../utils/common";
import type { ApiKeyProviderConfig } from "../../types/provider";
import {
  applyExtraRequestBody,
  shouldUseOpenAIMaxCompletionTokens,
  supportsOpenAITemperature,
} from "../providers/OpenAICompatibleProvider";

export interface ModelSpeedTestResult {
  success: boolean;
  latencyMs: number;
  error?: string;
}

function buildOpenAICompatibleRequestBody(
  config: ApiKeyProviderConfig,
  modelId: string,
): Record<string, unknown> {
  const testConfig = { ...config, defaultModel: modelId };
  const requestBody: Record<string, unknown> = {
    model: modelId,
    messages: [{ role: "user", content: "Hi" }],
    stream: false,
  };

  if (supportsOpenAITemperature(testConfig)) {
    requestBody.temperature = 0;
  }

  if (shouldUseOpenAIMaxCompletionTokens(testConfig)) {
    requestBody.max_completion_tokens = 5;
  } else {
    requestBody.max_tokens = 5;
  }

  applyExtraRequestBody(requestBody, testConfig);
  return requestBody;
}

async function testOpenAICompatibleModel(
  config: ApiKeyProviderConfig,
  modelId: string,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildOpenAICompatibleRequestBody(config, modelId)),
    signal,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      body.trim()
        ? body.trim().slice(0, 240)
        : `HTTP ${response.status} ${response.statusText}`,
    );
  }
}

async function testAnthropicModel(
  config: ApiKeyProviderConfig,
  modelId: string,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(`${config.baseUrl}/messages`, {
    method: "POST",
    headers: {
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: 5,
      messages: [{ role: "user", content: "Hi" }],
    }),
    signal,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      body.trim()
        ? body.trim().slice(0, 240)
        : `HTTP ${response.status} ${response.statusText}`,
    );
  }
}

async function testGeminiModel(
  config: ApiKeyProviderConfig,
  modelId: string,
  signal?: AbortSignal,
): Promise<void> {
  const url = `${config.baseUrl}/models/${modelId}:generateContent?key=${config.apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: "Hi" }] }],
      generationConfig: { maxOutputTokens: 5, temperature: 0 },
    }),
    signal,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      body.trim()
        ? body.trim().slice(0, 240)
        : `HTTP ${response.status} ${response.statusText}`,
    );
  }
}

export async function testModelSpeed(
  config: ApiKeyProviderConfig,
  modelId: string,
  signal?: AbortSignal,
): Promise<ModelSpeedTestResult> {
  if (!config.apiKey?.trim() || !config.baseUrl?.trim()) {
    return {
      success: false,
      latencyMs: 0,
      error: getString("pref-provider-not-ready"),
    };
  }

  const started = Date.now();
  try {
    switch (config.type) {
      case "anthropic":
        await testAnthropicModel(config, modelId, signal);
        break;
      case "gemini":
        await testGeminiModel(config, modelId, signal);
        break;
      case "openai":
      case "openai-compatible":
      case "custom":
        await testOpenAICompatibleModel(config, modelId, signal);
        break;
      default:
        return {
          success: false,
          latencyMs: 0,
          error: getString("pref-model-speed-unsupported"),
        };
    }
    return { success: true, latencyMs: Date.now() - started };
  } catch (error) {
    return {
      success: false,
      latencyMs: Date.now() - started,
      error: getErrorMessage(error),
    };
  }
}
