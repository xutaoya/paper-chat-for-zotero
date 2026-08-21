import MarkdownIt from "markdown-it";

const noteMarkdown = new MarkdownIt({
  html: false,
  breaks: true,
  xhtmlOut: true,
  linkify: true,
  typographer: true,
});

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatNoteDateTime(date: Date = new Date()): string {
  return `${pad2(date.getMonth() + 1)}/${pad2(date.getDate())}/${date.getFullYear()}, ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

export function withLeadingNoteHeading(html: string, title: string): string {
  const heading = `<h1>${escapeHtml(title)}</h1>`;
  if (/<h1\b[^>]*>[\s\S]*?<\/h1>/i.test(html)) {
    return html.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/i, heading);
  }
  const trimmed = html.trim();
  return trimmed ? `${heading}\n${trimmed}` : heading;
}

export function markdownToNoteHtml(markdown: string): string {
  const trimmed = markdown.trim();
  if (!trimmed) {
    return "";
  }
  return noteMarkdown.render(trimmed).trim();
}
