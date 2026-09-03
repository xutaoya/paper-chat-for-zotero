import { assert } from "chai";
import {
  getLocalDayKey,
  shouldShowMessageTimeSeparator,
} from "../src/modules/ui/chat-panel/MessageTimeSeparator.ts";

describe("message time separator", function () {
  it("shows separator on first message and day changes", function () {
    const dayOne = Date.parse("2026-03-02T10:00:00");
    const dayTwo = Date.parse("2026-03-03T10:00:00");

    assert.isTrue(shouldShowMessageTimeSeparator(undefined, dayOne));
    assert.isFalse(shouldShowMessageTimeSeparator(dayOne, dayOne + 60_000));
    assert.isTrue(shouldShowMessageTimeSeparator(dayOne, dayTwo));
  });

  it("formats same-day key consistently", function () {
    const morning = Date.parse("2026-03-02T09:00:00");
    const evening = Date.parse("2026-03-02T21:30:00");
    assert.equal(getLocalDayKey(morning), getLocalDayKey(evening));
  });
});
