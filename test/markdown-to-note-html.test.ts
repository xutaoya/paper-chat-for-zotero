import { assert } from "chai";
import {
  formatNoteDateTime,
  markdownToNoteHtml,
  withLeadingNoteHeading,
} from "../src/utils/markdownToNoteHtml.ts";

describe("markdownToNoteHtml", function () {
  it("renders headings, bold, and thematic breaks as Zotero note HTML", function () {
    const html = markdownToNoteHtml(
      "## 核心总结\n\n这是 **MambaDFuse**。\n\n---\n\n### 引言",
    );
    assert.include(html, "<h2>核心总结</h2>");
    assert.include(html, "<strong>MambaDFuse</strong>");
    assert.match(html, /<hr\s*\/>/);
    assert.include(html, "<h3>引言</h3>");
    assert.notInclude(html, "## 核心总结");
  });

  it("escapes raw HTML in markdown", function () {
    const html = markdownToNoteHtml("<script>alert(1)</script>\n\n**ok**");
    assert.notInclude(html, "<script>");
    assert.include(html, "<strong>ok</strong>");
  });

  it("formats note timestamps as MM/DD/YYYY, HH:mm:ss", function () {
    assert.equal(
      formatNoteDateTime(new Date(2026, 7, 20, 17, 20, 40)),
      "08/20/2026, 17:20:40",
    );
  });

  it("replaces PaperChat Notes heading with a datetime heading", function () {
    const html = withLeadingNoteHeading(
      "<h1>PaperChat Notes</h1>\n<p>body</p>",
      "08/21/2026, 15:21:00",
    );
    assert.equal(html, "<h1>08/21/2026, 15:21:00</h1>\n<p>body</p>");
    assert.notInclude(html, "PaperChat Notes");
  });
});
