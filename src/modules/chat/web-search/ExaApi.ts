import { getErrorMessage } from "../../../utils/common";
import { getPref } from "../../../utils/prefs";
import { requestJsonPost } from "./WebSearchHttp";

const EXA_SEARCH_URL = "https://api.exa.ai/search";
const EXA_TEST_QUERY = "large language models";

export interface ExaSearchResult {
  title?: string;
  url?: string;
  publishedDate?: string;
  author?: string;
  text?: string;
  highlights?: string[];
  summary?: string;
}

export interface ExaSearchResponse {
  results?: ExaSearchResult[];
  requestId?: string;
}

export function getExaApiKey(): string {
  return String(getPref("exaApiKey") || "").trim();
}

export function isExaWebSearchEnabled(): boolean {
  return getPref("useExaWebSearch") === true && getExaApiKey().length > 0;
}

export async function searchExa(
  body: Record<string, unknown>,
  timeoutMs = 12000,
): Promise<ExaSearchResponse> {
  const apiKey = getExaApiKey();
  if (!apiKey) {
    throw new Error("Exa API key is not configured");
  }

  return requestJsonPost<ExaSearchResponse>(EXA_SEARCH_URL, body, {
    timeoutMs,
    headers: {
      "x-api-key": apiKey,
    },
  });
}

export async function testExaApiKey(
  apiKeyInput?: string,
): Promise<{ success: boolean; message: string }> {
  const apiKey = (apiKeyInput ?? getExaApiKey()).trim();
  if (!apiKey) {
    return { success: false, message: "请先填写 Exa API Key" };
  }

  try {
    const response = await requestJsonPost<ExaSearchResponse>(
      EXA_SEARCH_URL,
      {
        query: EXA_TEST_QUERY,
        numResults: 1,
        contents: {
          highlights: { maxCharacters: 120 },
        },
      },
      {
        timeoutMs: 15000,
        headers: {
          "x-api-key": apiKey,
        },
      },
    );

    const count = response.results?.length ?? 0;
    return {
      success: true,
      message:
        count > 0
          ? `API Key 有效，测试搜索返回 ${count} 条结果`
          : "API Key 有效，测试搜索已完成（无结果）",
    };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
}
