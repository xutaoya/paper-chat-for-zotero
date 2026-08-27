import assert from "node:assert/strict";
import { estimateTextTokens } from "../src/utils/tokens.ts";

describe("estimateTextTokens", function () {
  it("returns 0 for empty text", function () {
    assert.equal(estimateTextTokens(""), 0);
  });

  it("estimates English text roughly by character count", function () {
    assert.equal(estimateTextTokens("abcd"), 1);
    assert.equal(estimateTextTokens("hello world"), 3);
  });

  it("estimates CJK text with a denser token ratio", function () {
    assert.equal(estimateTextTokens("你好"), 2);
  });
});
