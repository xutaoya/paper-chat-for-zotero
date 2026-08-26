import { assert } from "chai";
import {
  normalizeAnthropicStopReason,
  normalizeOpenAIFinishReason,
} from "../src/modules/providers/stream-stop-reason.ts";

describe("stream-stop-reason", function () {
  it("maps OpenAI length finish reasons to max_tokens", function () {
    assert.equal(normalizeOpenAIFinishReason("length"), "max_tokens");
    assert.equal(normalizeOpenAIFinishReason("tool_calls"), "tool_calls");
    assert.equal(normalizeOpenAIFinishReason("stop"), "stop");
    assert.equal(normalizeOpenAIFinishReason(null), "end_turn");
  });

  it("maps Anthropic max_tokens stop reasons", function () {
    assert.equal(normalizeAnthropicStopReason("max_tokens"), "max_tokens");
    assert.equal(normalizeAnthropicStopReason("tool_use"), "tool_calls");
    assert.equal(normalizeAnthropicStopReason("end_turn"), "end_turn");
  });
});
