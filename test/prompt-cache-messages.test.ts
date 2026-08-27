import { assert } from "chai";
import {
  buildRuntimeContextMessage,
  formatRuntimeContextUserContent,
  isPaperContextMessage,
} from "../src/modules/chat/prompt-cache-messages.ts";

describe("prompt cache messages", function () {
  it("builds runtime context as a trailing user block", function () {
    const message = buildRuntimeContextMessage("iteration 2");
    assert.equal(message.role, "user");
    assert.equal(message.id, "runtime-context");
    assert.include(message.content, "not a user message");
    assert.include(message.content, "iteration 2");
  });

  it("does not double-prefix runtime context content", function () {
    const prefixed = formatRuntimeContextUserContent(
      "[Agent runtime context — not a user message]\n\niteration 2",
    );
    assert.equal(prefixed.split("not a user message").length - 1, 1);
  });

  it("identifies paper-context messages", function () {
    assert.isTrue(isPaperContextMessage({ id: "paper-context" }));
    assert.isFalse(isPaperContextMessage({ id: "runtime-context" }));
  });
});
