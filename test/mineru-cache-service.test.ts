import { assert } from "chai";
import {
  buildMineruCacheKey,
  isCacheRecordFresh,
  type MineruCacheRecord,
} from "../src/modules/chat/MinerUCacheService.ts";

describe("MinerUCacheService helpers", function () {
  it("builds stable cache keys", function () {
    assert.equal(buildMineruCacheKey(1, "ABCD1234"), "1_ABCD1234");
  });

  it("detects fresh cache records", function () {
    const record: MineruCacheRecord = {
      cacheKey: "1_ABCD1234",
      attachmentKey: "ABCD1234",
      libraryID: 1,
      parentItemKey: "PARENT1",
      title: "Demo",
      fileName: "demo.pdf",
      fileSize: 100,
      fileMtime: 200,
      contentLength: 50,
      parsedAt: 300,
      status: "ready",
    };
    assert.isTrue(isCacheRecordFresh(record, 100, 200));
    assert.isFalse(isCacheRecordFresh(record, 101, 200));
  });
});
