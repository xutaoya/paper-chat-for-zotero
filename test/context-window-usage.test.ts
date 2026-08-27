import { assert } from "chai";
import { formatCompactTokenCount } from "../src/modules/ui/chat-panel/ContextWindowIndicator.ts";

describe("context window usage", function () {
  it("formats token counts compactly", function () {
    assert.equal(formatCompactTokenCount(0), "0");
    assert.equal(formatCompactTokenCount(57_000), "57k");
    assert.equal(formatCompactTokenCount(950_000), "950k");
    assert.equal(formatCompactTokenCount(1_200_000), "1.2M");
  });
});
