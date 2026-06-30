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
  // Split input text by carriage return/newline to process line-by-line
  const lines = markdown.split(/\r?\n|\r/)
  let html = ""
  
  // Track whether we are currently inside an active list structure (<ul> or <ol>)
  let inList = false
  let listType: "ul" | "ol" | null = null
  
  // Track whether we are inside a multi-line code block (started with ```)
  let inCodeBlock = false
  let codeBlockContent = ""

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Handle code blocks: toggle inCodeBlock when encountering "```"
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        // We reached the end of the code block. Wrap accumulated content in pre & code, escape it, and reset states
        html += `<pre><code>${escapeHtml(codeBlockContent.trim())}</code></pre>\n`
        inCodeBlock = false
        codeBlockContent = ""
      } else {
        // We started a code block
        inCodeBlock = true
      }
      continue
    }

    // If inside a code block, append raw text (without inline parsing) and proceed to next line
    if (inCodeBlock) {
      codeBlockContent += line + "\n"
      continue
    }

    // Check if the current line represents a list item
    const isBulletList = line.startsWith("* ") || line.startsWith("- ")
    const isNumberedList = /^\d+\.\s/.test(line)

    if (isBulletList || isNumberedList) {
      const currentListType = isBulletList ? "ul" : "ol"
      // Remove list markers (e.g. "*", "-", "1.") from the start of the line
      const cleanLine = line.replace(/^[*-\d.]+\s/, "").trim()

      if (!inList) {
        // Open a new list if we weren't in one
        html += `<${currentListType}>\n`
        inList = true
        listType = currentListType
      } else if (listType !== currentListType) {
        // If list type changed (e.g. from ul to ol), close previous and open new list
        html += `</${listType}>\n<${currentListType}>\n`
        listType = currentListType
      }

      // Add item. Parse inline markup within list items
      html += `  <li>${parseInlineMarkdown(cleanLine)}</li>\n`
      continue
    } else if (inList) {
      // If the line is not a list item, but we were inside a list, close the list wrapper
      html += `</${listType}>\n`
      inList = false
      listType = null
    }

    // Skip empty lines to prevent unnecessary empty paragraphs
    if (line.trim() === "") {
      continue
    }

    // Handle Block-level elements (headings, blockquotes, paragraphs)
    if (line.startsWith("# ")) {
      html += `<h1>${parseInlineMarkdown(line.substring(2))}</h1>\n`
    } else if (line.startsWith("## ")) {
      html += `<h2>${parseInlineMarkdown(line.substring(3))}</h2>\n`
    } else if (line.startsWith("### ")) {
      html += `<h3>${parseInlineMarkdown(line.substring(4))}</h3>\n`
    } else if (line.startsWith("> ")) {
      html += `<blockquote>${parseInlineMarkdown(line.substring(2))}</blockquote>\n`
    } else {
      // Standard paragraph for normal text lines
      html += `<p>${parseInlineMarkdown(line)}</p>\n`
    }
  }

  // Ensure any list left unclosed at the end of input is properly closed
  if (inList && listType) {
    html += `</${listType}>\n`
  }

  return html
}

/**
 * Escapes sensitive HTML characters to prevent rendering problems and XSS injections
 * inside code blocks.
 * 
 * @param text - The raw string to escape.
 * @returns The escaped safe HTML string.
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
 * 
 * @param text - The segment of text to apply inline rules to.
 * @returns Parsed inline HTML content.
 */
function parseInlineMarkdown(text: string): string {
  return text
    // Replace double asterisks or double underscores with <strong> tags (Bold)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.*?)__/g, "<strong>$1</strong>")
    // Replace single asterisks or single underscores with <em> tags (Italic)
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    // Replace backticks with <code> tags (Inline code)
    .replace(/`(.*?)`/g, "<code>$1</code>")
}

