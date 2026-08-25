const PRESERVE_TOKEN_PREFIX = "PAPERCHAT_PRESERVE_";
const PRESERVE_TOKEN_SUFFIX = "_END";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Zotero note-editor math_inline serialization. */
function zoteroInlineMathHtml(latex: string): string {
  return `<span class="math">$${escapeHtml(latex)}$</span>`;
}

/** Zotero note-editor math_display serialization. */
function zoteroBlockMathHtml(latex: string): string {
  return `<pre class="math">$$${escapeHtml(latex)}$$</pre>`;
}

export function renderMathInMarkdownForNotes(
  content: string,
  options: {
    renderCodeBlock: (match: string) => string;
    renderInlineCode: (match: string) => string;
  },
): { processed: string; preserved: string[] } {
  const preserved: string[] = [];
  let processed = content;

  const preserve = (html: string): string => {
    preserved.push(html);
    return `${PRESERVE_TOKEN_PREFIX}${preserved.length - 1}${PRESERVE_TOKEN_SUFFIX}`;
  };

  processed = processed.replace(/```[\s\S]*?```/g, (match) => {
    return preserve(options.renderCodeBlock(match));
  });
  processed = processed.replace(/`[^`]+`/g, (match) => {
    return preserve(options.renderInlineCode(match));
  });

  processed = processed.replace(
    /\\\[([\s\S]*?)\\\]/g,
    (_, math) => `$$${math}$$`,
  );
  processed = processed.replace(/\\\((.*?)\\\)/g, (_, math) => `$${math}$`);

  processed = processed.replace(/\$\$([\s\S]+?)\$\$/g, (match, math) => {
    const trimmed = (math as string).trim();
    if (!trimmed) {
      return match;
    }
    // Single-line display math → inline node to avoid block-level gaps between
    // consecutive equations (Zotero pre.math carries large paragraph spacing).
    if (!trimmed.includes("\n")) {
      return preserve(zoteroInlineMathHtml(trimmed));
    }
    return preserve(zoteroBlockMathHtml(trimmed));
  });

  processed = processed.replace(/\$([^$\n]+?)\$/g, (match, math) => {
    const trimmed = (math as string).trim();
    if (!trimmed) {
      return match;
    }
    return preserve(zoteroInlineMathHtml(trimmed));
  });

  return { processed, preserved };
}

export function restorePreservedNoteMarkup(
  html: string,
  preserved: string[],
): string {
  return html.replace(
    new RegExp(`${PRESERVE_TOKEN_PREFIX}(\\d+)${PRESERVE_TOKEN_SUFFIX}`, "g"),
    (_, index) => preserved[parseInt(index, 10)] ?? "",
  );
}

export function unwrapBlockMathParagraphs(html: string): string {
  return html.replace(
    /<p>(\s*(?:<br\s*\/?>\s*)*)(<pre class="math">[\s\S]*?<\/pre>)(\s*(?:<br\s*\/?>\s*)*)<\/p>/gi,
    "$2",
  );
}
