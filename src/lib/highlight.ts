/**
 * A deliberately small, dependency-free highlighter for the short TS/TSX/CSS
 * samples in this lab. It is a tokenizer, not a parser: it colours comments,
 * strings, keywords, numbers, tags/types, and function calls, which is enough
 * to make short examples easier to scan.
 */

export type TokenKind =
  | "plain"
  | "comment"
  | "string"
  | "keyword"
  | "number"
  | "type"
  | "function";

export type Token = { text: string; kind: TokenKind };

const KEYWORDS = new Set([
  "as", "async", "await", "break", "case", "catch", "const", "default",
  "else", "export", "extends", "false", "finally", "for", "from", "function",
  "if", "import", "in", "instanceof", "let", "new", "null", "of", "return",
  "switch", "throw", "true", "try", "type", "typeof", "undefined", "var",
  "void", "while",
]);

const TOKEN_PATTERN = new RegExp(
  [
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/.source, // 1: comments
    /("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)/.source, // 2: strings
    /(<\/?)([A-Za-z][\w.]*)/.source, // 3 + 4: JSX tags / generic types
    /(\b\d+(?:\.\d+)?(?:px|ms|%)?)/.source, // 5: numbers
    /([A-Za-z_$][\w$]*)(?=\s*\()/.source, // 6: function calls
    /([A-Za-z_$][\w$]*)/.source, // 7: identifiers
  ].join("|"),
  "g",
);

export function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let lastIndex = 0;

  for (const match of code.matchAll(TOKEN_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      tokens.push({ text: code.slice(lastIndex, index), kind: "plain" });
    }

    const [whole, comment, string, tagOpen, tagName, number, fn, identifier] = match;

    if (comment) tokens.push({ text: comment, kind: "comment" });
    else if (string) tokens.push({ text: string, kind: "string" });
    else if (tagName) {
      tokens.push({ text: tagOpen, kind: "plain" });
      tokens.push({ text: tagName, kind: "type" });
    } else if (number) tokens.push({ text: number, kind: "number" });
    else if (fn) {
      tokens.push({ text: fn, kind: KEYWORDS.has(fn) ? "keyword" : "function" });
    } else if (identifier) {
      const kind: TokenKind = KEYWORDS.has(identifier)
        ? "keyword"
        : /^[A-Z]/.test(identifier)
          ? "type"
          : "plain";
      tokens.push({ text: identifier, kind });
    } else {
      tokens.push({ text: whole, kind: "plain" });
    }

    lastIndex = index + whole.length;
  }

  if (lastIndex < code.length) {
    tokens.push({ text: code.slice(lastIndex), kind: "plain" });
  }

  return tokens;
}

/** Splits tokens into lines so multi-line tokens (block comments, template strings) render correctly. */
export function tokenizeLines(code: string): Token[][] {
  const lines: Token[][] = [[]];

  for (const token of tokenize(code)) {
    const parts = token.text.split("\n");
    parts.forEach((part, index) => {
      if (index > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ text: part, kind: token.kind });
    });
  }

  return lines;
}
