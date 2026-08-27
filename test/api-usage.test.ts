import assert from "node:assert/strict";
import { extractReasoningTokensFromUsage } from "../src/utils/apiUsage.ts";

describe("extractReasoningTokensFromUsage", function () {
  it("reads reasoning_tokens from completion_tokens_details", function () {
    assert.equal(
      extractReasoningTokensFromUsage({
        completion_tokens: 600,
        completion_tokens_details: { reasoning_tokens: 576 },
      }),
      576,
    );
  });

  it("reads top-level reasoning_tokens", function () {
    assert.equal(
      extractReasoningTokensFromUsage({ reasoning_tokens: 128 }),
      128,
    );
  });

  it("reads thinking_tokens from Anthropic output_tokens_details", function () {
    assert.equal(
      extractReasoningTokensFromUsage({
        output_tokens: 3800,
        output_tokens_details: { thinking_tokens: 2100 },
      }),
      2100,
    );
  });

  it("returns undefined when usage is missing", function () {
    assert.equal(extractReasoningTokensFromUsage(null), undefined);
    assert.equal(extractReasoningTokensFromUsage({}), undefined);
  });
});
