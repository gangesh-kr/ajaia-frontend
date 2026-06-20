export function exportTipTapToMarkdown(content: any): string {
  if (!content) return '';

  // Parse if it is a JSON string
  let parsedContent = content;
  if (typeof content === 'string') {
    try {
      parsedContent = JSON.parse(content);
    } catch (err) {
      return content; // Return raw text if not valid JSON
    }
  }

  function extractText(node: any): string {
    if (!node) return '';
    if (node.type === 'text') {
      let text = node.text || '';
      if (node.marks && Array.isArray(node.marks)) {
        for (const mark of node.marks) {
          if (mark.type === 'bold') {
            text = `**${text}**`;
          } else if (mark.type === 'italic') {
            text = `*${text}*`;
          } else if (mark.type === 'underline') {
            text = `<u>${text}</u>`;
          }
        }
      }
      return text;
    }
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(extractText).join('');
    }
    return '';
  }

  const lines: string[] = [];
  if (parsedContent && Array.isArray(parsedContent.content)) {
    for (const node of parsedContent.content) {
      if (node.type === 'heading') {
        const level = node.attrs?.level || 1;
        const hash = '#'.repeat(level);
        lines.push(`${hash} ${extractText(node)}`);
      } else if (node.type === 'bulletList') {
        if (node.content && Array.isArray(node.content)) {
          node.content.forEach((listItem: any) => {
            lines.push(`- ${extractText(listItem).trim()}`);
          });
        }
      } else if (node.type === 'orderedList') {
        if (node.content && Array.isArray(node.content)) {
          node.content.forEach((listItem: any, index: number) => {
            lines.push(`${index + 1}. ${extractText(listItem).trim()}`);
          });
        }
      } else if (node.type === 'paragraph') {
        const text = extractText(node);
        lines.push(text);
      } else {
        const text = extractText(node);
        if (text) {
          lines.push(text);
        }
      }
    }
  }

  return lines.join('\n');
}
