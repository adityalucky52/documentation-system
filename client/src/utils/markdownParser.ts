export function parseMarkdownToHtml(markdown: string): string {
  const lines = markdown.split(/\r?\n|\r/)
  let html = ""
  let inList = false
  let listType: "ul" | "ol" | null = null
  let inCodeBlock = false
  let codeBlockContent = ""

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Handle code blocks
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

    // Handle lists
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

    // Handle empty lines
    if (line.trim() === "") {
      continue
    }

    // Handle headings
    if (line.startsWith("# ")) {
      html += `<h1>${parseInlineMarkdown(line.substring(2))}</h1>\n`
    } else if (line.startsWith("## ")) {
      html += `<h2>${parseInlineMarkdown(line.substring(3))}</h2>\n`
    } else if (line.startsWith("### ")) {
      html += `<h3>${parseInlineMarkdown(line.substring(4))}</h3>\n`
    } else if (line.startsWith("> ")) {
      html += `<blockquote>${parseInlineMarkdown(line.substring(2))}</blockquote>\n`
    } else {
      // Default paragraph
      html += `<p>${parseInlineMarkdown(line)}</p>\n`
    }
  }

  if (inList && listType) {
    html += `</${listType}>\n`
  }

  return html
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function parseInlineMarkdown(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.*?)__/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    // Inline code
    .replace(/`(.*?)`/g, "<code>$1</code>")
}
