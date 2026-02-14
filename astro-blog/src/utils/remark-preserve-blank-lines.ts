/**
 * Remark plugin to preserve multiple blank lines from Obsidian
 *
 * Obsidianで複数の空行を入れた場合、その意図を保持するために
 * 空行を<br>タグとして出力します。
 */
import { visit } from 'unist-util-visit';

export function remarkPreserveBlankLines() {
  return (tree: any) => {
    visit(tree, 'paragraph', (node: any, index: number | undefined, parent: any) => {
      if (index === undefined || !parent) return;

      // Check if paragraph contains only whitespace or is empty
      const isEmptyParagraph = node.children.every((child: any) => {
        if (child.type === 'text') {
          return child.value.trim() === '';
        }
        return false;
      });

      if (isEmptyParagraph) {
        // Replace empty paragraph with a break element
        parent.children[index] = {
          type: 'html',
          value: '<div class="blank-line" style="height: 1.5em;"></div>',
        };
      }
    });

    // Also handle consecutive line breaks in text
    visit(tree, 'text', (node: any) => {
      // Match 2+ consecutive newlines within text
      if (node.value.includes('\n\n')) {
        const parts = node.value.split(/(\n{2,})/);
        if (parts.length > 1) {
          node.value = parts
            .map((part: string) => {
              if (/^\n{2,}$/.test(part)) {
                // Convert each extra newline (beyond the first) to a visual break
                const extraLines = part.length - 1;
                return '\n' + '<br class="extra-break">'.repeat(extraLines);
              }
              return part;
            })
            .join('');
        }
      }
    });
  };
}
