import { assert } from "chai";
import {
  destroyAnalyticsService,
  getAnalyticsService,
} from "../src/modules/analytics/index.ts";

describe("analytics fork policy", function () {
  afterEach(async function () {
    await destroyAnalyticsService();
  });

  it("does not initialize upstream telemetry in the PaperMind fork", async function () {
    const service = getAnalyticsService();
    let fetchCalled = false;
    const originalFetch = globalThis.fetch;

    globalThis.fetch = (async () => {
      fetchCalled = true;
      return new Response("{}", { status: 200 });
    }) as typeof fetch;

    try {
      service.track("plugin_started", { source: "test" });
      await service.destroy();
      assert.isFalse(fetchCalled);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
