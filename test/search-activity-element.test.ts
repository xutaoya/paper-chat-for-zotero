import { assert } from "chai";
import {
  parseSearchQueryFromEntry,
  parseSearchSources,
} from "../src/modules/ui/chat-panel/SearchActivityElement.ts";
import type { ParsedToolCallEntry } from "../src/modules/ui/chat-panel/MarkdownRenderer.ts";

describe("search activity element", function () {
  it("parses hosted web search sources with title and url", function () {
    const sources = parseSearchSources(
      [
        "query: accessible animation patterns for React",
        "sources:",
        "- Google for Developers — https://developers.google.com",
        "- GitHub — https://github.com",
      ].join("\n"),
    );

    assert.equal(sources.length, 2);
    assert.equal(sources[0].title, "Google for Developers");
    assert.equal(sources[0].domain, "developers.google.com");
    assert.equal(sources[1].url, "https://github.com");
  });

  it("reads query from tool args", function () {
    const entry: ParsedToolCallEntry = {
      status: "calling",
      toolName: "web_search",
      statusText: "Calling...",
      toolArgs: JSON.stringify({ query: "transformer attention" }),
    };
    assert.equal(parseSearchQueryFromEntry(entry), "transformer attention");
  });

  it("reads query from display-format tool args", function () {
    const entry: ParsedToolCallEntry = {
      status: "calling",
      toolName: "web_search",
      statusText: "Calling...",
      toolArgs: 'query="transformer attention", source="web"',
    };
    assert.equal(parseSearchQueryFromEntry(entry), "transformer attention");
  });

  it("reads query from tool result when args are empty", function () {
    const entry: ParsedToolCallEntry = {
      status: "calling",
      toolName: "web_search",
      statusText: "Searching...",
      toolArgs: "",
      toolResult: "query: accessible animation patterns for React\nsources:",
    };
    assert.equal(
      parseSearchQueryFromEntry(entry),
      "accessible animation patterns for React",
    );
  });

  it("prefers full tool-result query over truncated tool args", function () {
    const entry: ParsedToolCallEntry = {
      status: "completed",
      toolName: "web_search",
      statusText: "Done",
      toolArgs: 'query="short tru..."',
      toolResult:
        'query: MambaDFuse github repository code repository full query text\nsources:\n- GitHub — https://github.com',
    };
    assert.equal(
      parseSearchQueryFromEntry(entry),
      "MambaDFuse github repository code repository full query text",
    );
  });

  it("reads query from raw json tool args", function () {
    const longQuery =
      "MambaDFuse github repository code Mamba-based Dual-phase Multimodal Fusion";
    const entry: ParsedToolCallEntry = {
      status: "calling",
      toolName: "web_search",
      statusText: "Calling...",
      toolArgs: JSON.stringify({ query: longQuery, source: "web" }),
    };
    assert.equal(parseSearchQueryFromEntry(entry), longQuery);
  });
});
