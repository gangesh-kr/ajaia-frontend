export function convertTipTapToMarkdown(jsonString: string): string {
  if (!jsonString) return '';
  try {
    const doc = JSON.parse(jsonString);
    if (doc.type !== 'doc' || !doc.content) return '';
    
    let markdown = '';
    
    for (const node of doc.content) {
      if (node.type === 'heading') {
        const level = node.attrs?.level || 1;
        const text = node.content?.map((c: any) => c.text).join('') || '';
        markdown += `${'#'.repeat(level)} ${text}\n\n`;
      } else if (node.type === 'paragraph') {
        const text = node.content?.map((c: any) => c.text).join('') || '';
        markdown += `${text}\n\n`;
      } else if (node.type === 'bulletList') {
        for (const item of node.content || []) {
          const p = item.content?.[0];
          const text = p?.content?.map((c: any) => c.text).join('') || '';
          markdown += `- ${text}\n`;
        }
        markdown += '\n';
      } else if (node.type === 'orderedList') {
        let index = 1;
        for (const item of node.content || []) {
          const p = item.content?.[0];
          const text = p?.content?.map((c: any) => c.text).join('') || '';
          markdown += `${index}. ${text}\n`;
          index++;
        }
        markdown += '\n';
      }
    }
    
    return markdown.trim();
  } catch (e) {
    console.error('Failed to convert to Markdown:', e);
    return '';
  }
}
