const GREEK: Record<string, string> = {
  alpha: "α",
  beta: "β",
  gamma: "γ",
  Gamma: "Γ",
  delta: "δ",
  Delta: "Δ",
  epsilon: "ε",
  varepsilon: "ε",
  zeta: "ζ",
  eta: "η",
  theta: "θ",
  Theta: "Θ",
  iota: "ι",
  kappa: "κ",
  lambda: "λ",
  Lambda: "Λ",
  mu: "μ",
  nu: "ν",
  xi: "ξ",
  Xi: "Ξ",
  pi: "π",
  Pi: "Π",
  rho: "ρ",
  sigma: "σ",
  Sigma: "Σ",
  tau: "τ",
  upsilon: "υ",
  phi: "ϕ",
  varphi: "φ",
  Phi: "Φ",
  chi: "χ",
  psi: "ψ",
  Psi: "Ψ",
  omega: "ω",
  Omega: "Ω",
};

const BLACKBOARD: Record<string, string> = {
  A: "𝔸",
  B: "𝔹",
  C: "ℂ",
  D: "𝔻",
  E: "𝔼",
  F: "𝔽",
  G: "𝔾",
  H: "ℍ",
  I: "𝕀",
  J: "𝕁",
  K: "𝕂",
  L: "𝕃",
  M: "𝕄",
  N: "ℕ",
  O: "𝕆",
  P: "ℙ",
  Q: "ℚ",
  R: "ℝ",
  S: "𝕊",
  T: "𝕋",
  U: "𝕌",
  V: "𝕍",
  W: "𝕎",
  X: "𝕏",
  Y: "𝕐",
  Z: "ℤ",
};

const OPERATORS = new Set([
  "arccos",
  "arcsin",
  "arctan",
  "arg",
  "cos",
  "cosh",
  "cot",
  "coth",
  "csc",
  "deg",
  "det",
  "dim",
  "exp",
  "gcd",
  "hom",
  "inf",
  "ker",
  "lg",
  "lim",
  "ln",
  "log",
  "max",
  "min",
  "Pr",
  "sec",
  "sin",
  "sinh",
  "sup",
  "tan",
  "tanh",
]);

const SYMBOLS: Record<string, string> = {
  cdot: "·",
  cdots: "⋯",
  ldots: "…",
  dots: "…",
  times: "×",
  pm: "±",
  mp: "∓",
  infty: "∞",
  leq: "≤",
  geq: "≥",
  neq: "≠",
  approx: "≈",
  sim: "∼",
  to: "→",
  rightarrow: "→",
  leftarrow: "←",
  in: "∈",
  subset: "⊂",
  sum: "∑",
  prod: "∏",
  int: "∫",
  partial: "∂",
  nabla: "∇",
  ell: "ℓ",
  Re: "Re",
  Im: "Im",
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function italic(text: string): string {
  return `<i>${escapeHtml(text)}</i>`;
}

function withOverline(inner: string): string {
  if (!inner) {
    return "&#x0305;";
  }
  const match = inner.match(/^(.*)(<\/[a-z]+>)$/i);
  if (match) {
    return `${match[1]}&#x0305;${match[2]}`;
  }
  return `${inner}&#x0305;`;
}

function skipSpace(input: string, index: number): number {
  while (index < input.length && /\s/.test(input[index])) {
    index += 1;
  }
  return index;
}

function readCommand(
  input: string,
  index: number,
): { name: string; next: number } {
  let next = index + 1;
  if (next >= input.length) {
    return { name: "", next };
  }
  if (/[a-zA-Z]/.test(input[next])) {
    const start = next;
    while (next < input.length && /[a-zA-Z]/.test(input[next])) {
      next += 1;
    }
    return { name: input.slice(start, next), next };
  }
  return { name: input[next], next: next + 1 };
}

function readGroup(
  input: string,
  index: number,
): { body: string; next: number } | null {
  index = skipSpace(input, index);
  if (input[index] !== "{") {
    if (index >= input.length) {
      return null;
    }
    return { body: input[index], next: index + 1 };
  }
  let depth = 0;
  for (let i = index; i < input.length; i += 1) {
    const ch = input[i];
    if (ch === "{") {
      depth += 1;
    } else if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        return { body: input.slice(index + 1, i), next: i + 1 };
      }
    }
  }
  return { body: input.slice(index + 1), next: input.length };
}

function parseRoman(input: string): string {
  const { html } = parseExpr(input, 0, false);
  return html;
}

function parseExpr(
  input: string,
  start: number,
  italicizeLetters: boolean,
): { html: string; next: number } {
  let index = start;
  let html = "";
  while (index < input.length) {
    const beforeSpace = index;
    index = skipSpace(input, index);
    if (index >= input.length || input[index] === "}") {
      break;
    }
    if (index > beforeSpace && html) {
      html += " ";
    }
    const atom = parseAtom(input, index, italicizeLetters);
    html += atom.html;
    index = atom.next;
  }
  return { html, next: index };
}

function parseAtom(
  input: string,
  start: number,
  italicizeLetters: boolean,
): { html: string; next: number } {
  let index = skipSpace(input, start);
  if (index >= input.length) {
    return { html: "", next: index };
  }

  let nucleus = "";
  const ch = input[index];

  if (ch === "{") {
    const group = readGroup(input, index);
    const inner = parseExpr(group?.body || "", 0, italicizeLetters).html;
    nucleus = inner;
    index = group?.next ?? index + 1;
  } else if (ch === "\\") {
    const command = readCommand(input, index);
    index = command.next;
    if (GREEK[command.name] || OPERATORS.has(command.name)) {
      index = skipSpace(input, index);
    }
    const rendered = renderCommand(input, command.name, index, italicizeLetters);
    nucleus = rendered.html;
    index = rendered.next;
  } else if (/[A-Za-z]/.test(ch)) {
    nucleus = italicizeLetters ? italic(ch) : escapeHtml(ch);
    index += 1;
  } else if (ch === "'") {
    nucleus = "′";
    index += 1;
  } else {
    nucleus = escapeHtml(ch);
    index += 1;
  }

  while (index < input.length) {
    const saved = index;
    index = skipSpace(input, index);
    if (input[index] === "'") {
      nucleus += "′";
      index += 1;
      continue;
    }
    if (input[index] !== "_" && input[index] !== "^") {
      index = saved;
      break;
    }
    const isSub = input[index] === "_";
    index += 1;
    const script = parseAtom(input, index, italicizeLetters);
    index = script.next;
    nucleus += isSub ? `<sub>${script.html}</sub>` : `<sup>${script.html}</sup>`;
  }

  return { html: nucleus, next: index };
}

function renderBlackboard(
  input: string,
  index: number,
): { html: string; next: number } {
  const group = readGroup(input, index);
  const body = (group?.body || "").trim();
  const glyph = BLACKBOARD[body] || body;
  return {
    html: escapeHtml(glyph),
    next: group?.next ?? index,
  };
}

function renderCommand(
  input: string,
  name: string,
  index: number,
  italicizeLetters: boolean,
): { html: string; next: number } {
  if (name === "left" || name === "right" || name === "!") {
    return { html: "", next: index };
  }
  if (name === "," || name === ":" || name === ";") {
    return { html: "&thinsp;", next: index };
  }
  if (name === "quad") {
    return { html: "&emsp;", next: index };
  }
  if (name === "qquad") {
    return { html: "&emsp;&emsp;", next: index };
  }
  if (name === " " || name === "\\") {
    return { html: name === "\\" ? "<br/>" : "&nbsp;", next: index };
  }
  if (GREEK[name]) {
    const glyph = GREEK[name];
    const upright = name[0] === name[0].toUpperCase();
    return {
      html: italicizeLetters && !upright ? italic(glyph) : escapeHtml(glyph),
      next: index,
    };
  }
  if (OPERATORS.has(name)) {
    return { html: escapeHtml(name), next: index };
  }
  if (SYMBOLS[name]) {
    return { html: escapeHtml(SYMBOLS[name]), next: index };
  }
  if (name === "mathbb" || name === "mathcal" || name === "mathfrak") {
    return renderBlackboard(input, index);
  }
  if (
    name === "text" ||
    name === "mathrm" ||
    name === "operatorname" ||
    name === "textrm"
  ) {
    const group = readGroup(input, index);
    return {
      html: parseRoman(group?.body || ""),
      next: group?.next ?? index,
    };
  }
  if (name === "mathbf" || name === "textbf") {
    const group = readGroup(input, index);
    return {
      html: `<b>${parseRoman(group?.body || "")}</b>`,
      next: group?.next ?? index,
    };
  }
  if (name === "mathit") {
    const group = readGroup(input, index);
    return {
      html: parseExpr(group?.body || "", 0, true).html,
      next: group?.next ?? index,
    };
  }
  if (name === "bar" || name === "overline") {
    const group = readGroup(input, index);
    const inner = parseExpr(group?.body || "", 0, italicizeLetters).html;
    return {
      html: withOverline(inner),
      next: group?.next ?? index,
    };
  }
  if (name === "hat" || name === "tilde" || name === "vec") {
    const group = readGroup(input, index);
    const inner = parseExpr(group?.body || "", 0, italicizeLetters).html;
    const mark = name === "hat" ? "^" : name === "tilde" ? "~" : "→";
    return {
      html: `${inner}<sup>${mark}</sup>`,
      next: group?.next ?? index,
    };
  }
  if (name === "frac") {
    const num = readGroup(input, index);
    const den = readGroup(input, num?.next ?? index);
    const numHtml = parseExpr(num?.body || "", 0, italicizeLetters).html;
    const denHtml = parseExpr(den?.body || "", 0, italicizeLetters).html;
    return {
      html: `(${numHtml})/(${denHtml})`,
      next: den?.next ?? index,
    };
  }
  if (name === "sqrt") {
    const group = readGroup(input, index);
    const inner = parseExpr(group?.body || "", 0, italicizeLetters).html;
    return { html: `√(${inner})`, next: group?.next ?? index };
  }

  const group = readGroup(input, skipSpace(input, index));
  if (input[skipSpace(input, index)] === "{") {
    const inner = parseExpr(group?.body || "", 0, italicizeLetters).html;
    return { html: inner, next: group?.next ?? index };
  }
  return { html: escapeHtml(`\\${name}`), next: index };
}

export function latexToNoteHtml(latex: string, _displayMode = false): string {
  const inner = parseExpr(latex.trim(), 0, true).html;
  return `<span style="font-family:Times New Roman,serif">${inner}</span>`;
}
