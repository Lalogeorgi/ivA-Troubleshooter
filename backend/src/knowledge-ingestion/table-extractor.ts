export interface ExtractedTable {
  title?: string;
  headers: string[];
  rows: string[][];
  markdown: string;
}

export class TableExtractor {
  /**
   * Convert header and row arrays into standard Markdown table format
   */
  static formatToMarkdown(headers: string[], rows: string[][]): string {
    if (headers.length === 0) return '';

    const headerLine = `| ${headers.join(' | ')} |`;
    const separatorLine = `| ${headers.map(() => '---').join(' | ')} |`;
    const rowLines = rows.map((row) => `| ${row.join(' | ')} |`);

    return [headerLine, separatorLine, ...rowLines].join('\n');
  }

  /**
   * Detect and parse structured tabular data from text lines
   */
  static parseDelimitedTable(lines: string[], delimiter: RegExp = /\s{2,}|\t/): ExtractedTable | null {
    if (lines.length < 2) return null;

    const headers = lines[0].split(delimiter).map((h) => h.trim()).filter(Boolean);
    if (headers.length < 2) return null;

    const rows: string[][] = [];
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(delimiter).map((c) => c.trim()).filter(Boolean);
      if (cells.length > 0) {
        rows.push(cells);
      }
    }

    if (rows.length === 0) return null;

    return {
      headers,
      rows,
      markdown: this.formatToMarkdown(headers, rows),
    };
  }
}
