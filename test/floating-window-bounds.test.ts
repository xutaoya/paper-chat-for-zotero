import { assert } from "chai";
import {
  DEFAULT_FLOATING_WINDOW_HEIGHT,
  DEFAULT_FLOATING_WINDOW_WIDTH,
  MAX_FLOATING_WINDOW_HEIGHT,
  MAX_FLOATING_WINDOW_WIDTH,
  MIN_FLOATING_WINDOW_HEIGHT,
  MIN_FLOATING_WINDOW_WIDTH,
  normalizeFloatingWindowSize,
  resolveFloatingWindowSize,
} from "../src/modules/ui/chat-panel/floatingWindowBounds.ts";

describe("floating window bounds", function () {
  it("returns defaults when saved size is missing or invalid", function () {
    assert.deepEqual(resolveFloatingWindowSize(undefined, undefined), {
      width: DEFAULT_FLOATING_WINDOW_WIDTH,
      height: DEFAULT_FLOATING_WINDOW_HEIGHT,
    });
    assert.deepEqual(resolveFloatingWindowSize(0, -10), {
      width: DEFAULT_FLOATING_WINDOW_WIDTH,
      height: DEFAULT_FLOATING_WINDOW_HEIGHT,
    });
  });

  it("clamps saved size into supported bounds", function () {
    assert.deepEqual(resolveFloatingWindowSize(900, 700), {
      width: 900,
      height: 700,
    });
    assert.deepEqual(resolveFloatingWindowSize(100, 200), {
      width: MIN_FLOATING_WINDOW_WIDTH,
      height: MIN_FLOATING_WINDOW_HEIGHT,
    });
    assert.deepEqual(resolveFloatingWindowSize(2000, 2000), {
      width: MAX_FLOATING_WINDOW_WIDTH,
      height: MAX_FLOATING_WINDOW_HEIGHT,
    });
  });

  it("rounds fractional resize values", function () {
    assert.deepEqual(normalizeFloatingWindowSize(501.6, 612.2), {
      width: 502,
      height: 612,
    });
  });
});
