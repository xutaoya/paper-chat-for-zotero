import { latexToNoteHtml } from "./latexToNoteHtml";

const PRESERVE_TOKEN_PREFIX = "PAPERCHAT_PRESERVE_";
const PRESERVE_TOKEN_SUFFIX = "_END";

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
    return preserve(latexToNoteHtml(trimmed));
  });

  processed = processed.replace(/\$([^$\n]+?)\$/g, (match, math) => {
    const trimmed = (math as string).trim();
    if (!trimmed) {
      return match;
    }
    return preserve(latexToNoteHtml(trimmed));
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
