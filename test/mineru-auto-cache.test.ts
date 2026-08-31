import { assert } from "chai";
import {
  collectPdfAttachmentsFromAddedItem,
  isMineruAutoCacheOnImportEnabled,
  isMineruAutoCacheReady,
} from "../src/modules/chat/MinerUAutoCacheService.ts";
import { config } from "../package.json";

describe("MinerU auto cache on import", function () {
  let originalZotero: unknown;
  let originalZtoolkit: unknown;
  let prefStore: Map<string, unknown>;

  beforeEach(function () {
    originalZotero = (globalThis as any).Zotero;
    originalZtoolkit = (globalThis as any).ztoolkit;
    prefStore = new Map();
    (globalThis as any).ztoolkit = { log: () => undefined };
    (globalThis as any).Zotero = {
      Prefs: {
        get: (key: string) => prefStore.get(key),
        set: (key: string, value: unknown) => {
          prefStore.set(key, value);
          return true;
        },
      },
    };
  });

  afterEach(function () {
    (globalThis as any).Zotero = originalZotero;
    (globalThis as any).ztoolkit = originalZtoolkit;
  });

  it("requires both the pref and a MinerU token", function () {
    assert.isFalse(isMineruAutoCacheOnImportEnabled());
    assert.isFalse(isMineruAutoCacheReady());

    prefStore.set(`${config.prefsPrefix}.mineruAutoCacheOnImport`, true);
    assert.isTrue(isMineruAutoCacheOnImportEnabled());
    assert.isFalse(isMineruAutoCacheReady());

    prefStore.set(`${config.prefsPrefix}.mineruApiToken`, "token");
    assert.isTrue(isMineruAutoCacheReady());
  });

  it("collects PDF attachments from added parent items and standalone PDFs", function () {
    const parent = {
      id: 1,
      key: "PARENT1",
      libraryID: 1,
      isNote: () => false,
      isAttachment: () => false,
      isPDFAttachment: () => false,
      getAttachments: () => [2, 3],
    } as unknown as Zotero.Item;
    const pdfChild = {
      id: 2,
      key: "PDFCHILD",
      libraryID: 1,
      isNote: () => false,
      isAttachment: () => true,
      isPDFAttachment: () => true,
    } as unknown as Zotero.Item;
    const standalonePdf = {
      id: 4,
      key: "PDFONLY",
      libraryID: 1,
      isNote: () => false,
      isAttachment: () => true,
      isPDFAttachment: () => true,
    } as unknown as Zotero.Item;

    (globalThis as any).Zotero.Items = {
      get: (id: number) => {
        if (id === 1) return parent;
        if (id === 2) return pdfChild;
        if (id === 3) return false;
        if (id === 4) return standalonePdf;
        return false;
      },
    };

    const parentAttachments = collectPdfAttachmentsFromAddedItem(1);
    assert.lengthOf(parentAttachments, 1);
    assert.equal(parentAttachments[0].key, "PDFCHILD");

    const standaloneAttachments = collectPdfAttachmentsFromAddedItem(4);
    assert.lengthOf(standaloneAttachments, 1);
    assert.equal(standaloneAttachments[0].key, "PDFONLY");
  });
});
