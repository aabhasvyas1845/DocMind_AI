import React, { useMemo } from "react";
import katex from "katex";

/**
 * Formats AI response text with:
 * 1. KaTeX mathematical typesetting ($inline$ and $$display$$)
 * 2. Markdown formatting (### headers, **bold**, lists, paragraphs)
 */
function parseMathAndMarkdown(rawText) {
  if (!rawText) return "";

  const mathPlaceholders = [];

  // Step 1: Extract and pre-render Block Math ($$ ... $$)
  let text = rawText.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
    const id = `___MATH_BLOCK_${mathPlaceholders.length}___`;
    try {
      const rendered = katex.renderToString(formula.trim(), {
        displayMode: true,
        throwOnError: false
      });
      mathPlaceholders.push({ id, html: `<div class="katex-display-wrapper">${rendered}</div>` });
    } catch {
      mathPlaceholders.push({ id, html: match });
    }
    return id;
  });

  // Step 2: Extract and pre-render Inline Math ($ ... $)
  text = text.replace(/(?<!\$)\$(?!\$)((?:[^\$\n]|\\\$)+?)(?<!\$)\$(?!\$)/g, (match, formula) => {
    if (/^\d+(\.\d+)?$/.test(formula.trim())) {
      return match;
    }
    const id = `___MATH_INLINE_${mathPlaceholders.length}___`;
    try {
      const rendered = katex.renderToString(formula.trim(), {
        displayMode: false,
        throwOnError: false
      });
      mathPlaceholders.push({ id, html: `<span class="katex-inline-wrapper">${rendered}</span>` });
    } catch {
      mathPlaceholders.push({ id, html: match });
    }
    return id;
  });

  // Step 3: Markdown line parsing
  const lines = text.split("\n");
  const parsedLines = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Markdown Headings
    if (line.startsWith("#### ")) {
      parsedLines.push(`<h4>${line.slice(5)}</h4>`);
      continue;
    }
    if (line.startsWith("### ")) {
      parsedLines.push(`<h3>${line.slice(4)}</h3>`);
      continue;
    }
    if (line.startsWith("## ")) {
      parsedLines.push(`<h2>${line.slice(3)}</h2>`);
      continue;
    }

    // Markdown Bullet Points (* or -)
    if (/^\s*[\*\-]\s+/.test(line)) {
      const itemContent = line.replace(/^\s*[\*\-]\s+/, "");
      parsedLines.push(`<li class="markdown-bullet">${itemContent}</li>`);
      continue;
    }

    // Empty lines
    if (!line.trim()) {
      parsedLines.push(`<div class="markdown-spacing"></div>`);
      continue;
    }

    // Standard paragraph line
    parsedLines.push(`<p class="markdown-paragraph">${line}</p>`);
  }

  let htmlResult = parsedLines.join("\n");

  // Bold text: **text**
  htmlResult = htmlResult.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Page Citation tags: [Page X] or [PAGE: X]
  htmlResult = htmlResult.replace(/\[(?:PAGE|Page)\s*(\d+)\]/gi, '<span class="citation-tag">📄 Page $1</span>');

  // Step 4: Re-inject the rendered KaTeX math blocks
  mathPlaceholders.forEach(({ id, html }) => {
    htmlResult = htmlResult.split(id).join(html);
  });

  return htmlResult;
}

function FormattedMessage({ text }) {
  const formattedHtml = useMemo(() => parseMathAndMarkdown(text), [text]);

  return (
    <div
      className="formatted-math-content"
      dangerouslySetInnerHTML={{ __html: formattedHtml }}
    />
  );
}

export default FormattedMessage;
