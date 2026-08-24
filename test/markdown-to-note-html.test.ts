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

  it("renders inline math without dollar delimiters or raw latex", function () {
    const html = markdownToNoteHtml(
      "$h'(t) = Ah(t) + Bx(t) \\quad \\text{(Eq. 1)}$",
    );
    assert.notInclude(html, "$h'(t)");
    assert.notInclude(html, "\\quad");
    assert.notInclude(html, "\\text");
    assert.include(html, "<i>h</i>");
    assert.include(html, "(Eq. 1)");
  });

  it("renders display math inline without extra block margins", function () {
    const html = markdownToNoteHtml("$$y(t) = Ch(t)$$");
    assert.notInclude(html, "$$");
    assert.notInclude(html, "<div");
    assert.notInclude(html, "margin:");
    assert.include(html, "<i>y</i>");
  });

  it("keeps consecutive formula lines in one paragraph", function () {
    const html = markdownToNoteHtml(
      "intro\n\n$h_t = x_t$\n\n$y_t = z_t$\n\noutro",
    );
    assert.match(
      html,
      /<p>intro<\/p>\s*<p>[\s\S]*<i>h<\/i>[\s\S]*<br[\s\S]*<i>y<\/i>[\s\S]*<\/p>\s*<p>outro<\/p>/,
    );
    assert.notMatch(html, /<p>[\s\S]*<i>h<\/i>[\s\S]*<\/p>\s*<p>[\s\S]*<i>y<\/i>/);
  });

  it("renders blackboard bold and membership symbols", function () {
    const html = markdownToNoteHtml(
      "$A \\in \\mathbb{R}^{N \\times N}, B \\in \\mathbb{R}^{N \\times 1}$",
    );
    assert.notInclude(html, "\\mathbb");
    assert.notInclude(html, "\\in");
    assert.notInclude(html, "<em>");
    assert.include(html, "∈");
    assert.include(html, "ℝ");
    assert.include(html, "<sup>");
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
