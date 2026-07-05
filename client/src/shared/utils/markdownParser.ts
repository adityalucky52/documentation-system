/**
 * Simple parser to translate basic Markdown formatting into HTML strings.
 * Used for rendering document previews and diffs in the change request review layout.
 *
 * Supports:
 * - Code Blocks (``` ... ```)
 * - Lists (un-ordered using '*' or '-', and ordered numbers)
 * - Headings (#, ##, ###)
 * - Blockquotes (> )
 * - Paragraphs
 * - Inline formatting (Bold **, Italics *, inline code `)
 */

/**
 * Converts a multi-line markdown string into corresponding HTML output.
 * It loops over each line and maintains state flags to handle block-level elements
 * like code blocks and lists that span multiple lines.
 *
 * @param markdown - The raw markdown text to parse.
 * @returns A string containing raw HTML.
 */
export function parseMarkdownToHtml(markdown: string): string {
  const lines = markdown.split(/\r?\n|\r/)
  let html = ""

  let inList = false
  let listType: "ul" | "ol" | null = null
  let inCodeBlock = false
  let codeBlockContent = ""

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith("```")) {
      if (inCodeBlock) {
        html += `<pre><code>${escapeHtml(codeBlockContent.trim())}</code></pre>\n`
        inCodeBlock = false
        codeBlockContent = ""
      } else {
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeBlockContent += line + "\n"
      continue
    }

    const isBulletList = line.startsWith("* ") || line.startsWith("- ")
    const isNumberedList = /^\d+\.\s/.test(line)

    if (isBulletList || isNumberedList) {
      const currentListType = isBulletList ? "ul" : "ol"
      const cleanLine = line.replace(/^[*-\d.]+\s/, "").trim()

      if (!inList) {
        html += `<${currentListType}>\n`
        inList = true
        listType = currentListType
      } else if (listType !== currentListType) {
        html += `</${listType}>\n<${currentListType}>\n`
        listType = currentListType
      }

      html += `  <li>${parseInlineMarkdown(cleanLine)}</li>\n`
      continue
    } else if (inList) {
      html += `</${listType}>\n`
      inList = false
      listType = null
    }

    if (line.trim() === "") {
      continue
    }

    if (line.startsWith("# ")) {
      html += `<h1>${parseInlineMarkdown(line.substring(2))}</h1>\n`
    } else if (line.startsWith("## ")) {
      html += `<h2>${parseInlineMarkdown(line.substring(3))}</h2>\n`
    } else if (line.startsWith("### ")) {
      html += `<h3>${parseInlineMarkdown(line.substring(4))}</h3>\n`
    } else if (line.startsWith("> ")) {
      html += `<blockquote>${parseInlineMarkdown(line.substring(2))}</blockquote>\n`
    } else {
      html += `<p>${parseInlineMarkdown(line)}</p>\n`
    }
  }

  if (inList && listType) {
    html += `</${listType}>\n`
  }

  return html
}

/**
 * Escapes sensitive HTML characters to prevent rendering problems and XSS injections
 * inside code blocks.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/**
 * Parses inline elements: Bold, Italics, and Inline Code using regex replacements.
 */
function parseInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.*?)__/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
}

/**
 * Converts a limited HTML subset from the rich text editor back into markdown.
 * This keeps editable-reader saves compatible with the existing markdown storage model.
 */
export function parseHtmlToMarkdown(html: string): string {
  return html
    .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, (_, code) => {
      const normalizedCode = decodeHtmlEntities(code).trim()
      return `\n\`\`\`\n${normalizedCode}\n\`\`\`\n`
    })
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/g, "\n# $1\n")
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/g, "\n## $1\n")
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/g, "\n### $1\n")
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/g, "\n> $1\n")
    .replace(/<strong>([\s\S]*?)<\/strong>/g, "**$1**")
    .replace(/<b>([\s\S]*?)<\/b>/g, "**$1**")
    .replace(/<em>([\s\S]*?)<\/em>/g, "*$1*")
    .replace(/<i>([\s\S]*?)<\/i>/g, "*$1*")
    .replace(/<code>([\s\S]*?)<\/code>/g, "`$1`")
    .replace(/<li>([\s\S]*?)<\/li>/g, "- $1\n")
    .replace(/<\/?(ul|ol)[^>]*>/g, "\n")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/g, "$1\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

/**
 * Removes the leading H1 if the stored markdown title matches the page title.
 */
export function stripHeader(markdown: string, title: string): string {
  const normalizedTitle = title.trim()
  const lines = markdown.split(/\r?\n|\r/)

  if (lines.length > 0 && lines[0].trim() === `# ${normalizedTitle}`) {
    return lines.slice(1).join("\n").replace(/^\n+/, "")
  }

  return markdown
}

/**
 * Ensures the stored markdown always starts with the page title as the H1.
 */
export function prependHeader(markdown: string, title: string): string {
  const cleanTitle = title.trim() || "Untitled Page"
  const body = stripHeader(markdown.trim(), cleanTitle).trim()

  return body ? `# ${cleanTitle}\n\n${body}` : `# ${cleanTitle}`
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
}
