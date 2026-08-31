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

  it("normalizes bold markers with whitespace inside delimiters", function () {
    const html = markdownToNoteHtml(
      "此外，许多研究表明 **图像重建 (IR) ** 可作为辅助任务。",
    );
    assert.include(html, "<strong>图像重建 (IR)</strong>");
    assert.notInclude(html, "**");
  });

  it("normalizes italic markers with whitespace inside delimiters", function () {
    const html = markdownToNoteHtml("这是 *重要结论 * 的说明。");
    assert.include(html, "<em>重要结论</em>");
    assert.notInclude(html, "*重要结论 *");
  });

  it("emits Zotero inline math nodes with LaTeX preserved", function () {
    const html = markdownToNoteHtml(
      "$h'(t) = Ah(t) + Bx(t) \\quad \\text{(Eq. 1)}$",
    );
    assert.include(
      html,
      '<span class="math">$h\'(t) = Ah(t) + Bx(t) \\quad \\text{(Eq. 1)}$</span>',
    );
    assert.notInclude(html, "<i>h</i>");
  });

  it("uses inline math for single-line display delimiters", function () {
    const html = markdownToNoteHtml("$$y(t) = Ch(t)$$");
    assert.include(html, '<span class="math">$y(t) = Ch(t)$</span>');
    assert.notInclude(html, '<pre class="math">');
  });

  it("uses block math only for multi-line display delimiters", function () {
    const html = markdownToNoteHtml("$$y(t) = Ch(t)\nz(t) = Dh(t)$$");
    assert.include(html, '<pre class="math">');
    assert.notMatch(html, /<p>[\s\S]*<pre class="math">/);
  });

  it("preserves apostrophes inside inline math for Zotero", function () {
    const html = markdownToNoteHtml("$h'(t) = Ah(t) + Bx(t)$");
    assert.include(html, "$h'(t) = Ah(t) + Bx(t)$");
    assert.notInclude(html, "&#39;");
  });

  it("uses block math for numbered equations with \\tag", function () {
    const html = markdownToNoteHtml(
      "$h'(t) = Ah(t) + Bx(t), \\tag{1}$\n\n$y(t) = Ch(t), \\tag{2}$",
    );
    assert.include(html, '<pre class="math">$$h\'(t) = Ah(t) + Bx(t), \\tag{1}$$</pre>');
    assert.include(html, '<pre class="math">$$y(t) = Ch(t), \\tag{2}$$</pre>');
    assert.notMatch(html, /<p>[\s\S]*<pre class="math">[\s\S]*<br/);
  });

  it("puts consecutive numbered equations in separate paragraphs", function () {
    const html = markdownToNoteHtml(
      "$h'(t) = Ah(t) + Bx(t) \\quad \\text{(Eq. 1)}$\n\n$y(t) = Ch(t) \\quad \\text{(Eq. 2)}$",
    );
    assert.match(
      html,
      /<p>[\s\S]*\(Eq\. 1\)[\s\S]*<\/p>\s*<p>[\s\S]*\(Eq\. 2\)[\s\S]*<\/p>/,
    );
    assert.notMatch(html, /<br\s*\/?>/);
  });

  it("puts consecutive inline formula lines in separate paragraphs", function () {
    const html = markdownToNoteHtml(
      "intro\n\n$h_t = x_t$\n\n$y_t = z_t$\n\noutro",
    );
    assert.match(
      html,
      /<p>intro<\/p>\s*<p>[\s\S]*<span class="math">[\s\S]*<\/p>\s*<p>[\s\S]*<span class="math">[\s\S]*<\/p>\s*<p>outro<\/p>/,
    );
    assert.notMatch(html, /<br\s*\/?>/);
  });

  it("preserves blackboard bold and membership symbols in inline math", function () {
    const html = markdownToNoteHtml(
      "$A \\in \\mathbb{R}^{N \\times N}, B \\in \\mathbb{R}^{N \\times 1}$",
    );
    assert.include(html, '<span class="math">');
    assert.include(html, "\\mathbb{R}");
    assert.include(html, "\\in");
    assert.notInclude(html, "ℝ");
    assert.notInclude(html, "<sup>");
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
