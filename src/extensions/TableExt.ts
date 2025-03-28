/**
 * Format result table into a prettified string.
 *
 * @category Extension
 */
export class TablePrettifier {
    private headers: string[] = [];
    private rows: Array<Array<string>> = [];

    /**
     * Add a header to the table.
     *
     * @param header Header to add.
     */
    addHeader(header: string): void {
        this.headers.push(header);
    }

    /**
     * Add a row to the table. Row size must match header size.
     *
     * @param row Row to add.
     */
    addRow(row: Array<string>): void {
        if (row.length !== this.headers.length) {
            throw new Error('Row size must match header size');
        }
        this.rows.push(row);
    }

    /**
     * Output the table as a string with the specified format.
     *
     * The format can be one of the following:
     *
     * - markdown: Markdown syntax
     * - json: JSON with indentation of 4 spaces
     * - json-min: JSON without indentation and newlines
     *
     * @param format The output format.
     * @returns The table as a string in the specified format.
     */
    toString(format: string): string {
        switch (format) {
            case 'markdown':
                return this.toMarkdown();
            case 'json':
                return this.toJson(false);
            case 'json-min':
                return this.toJson(true);
            default:
                throw new Error(`Invalid format: ${format}`);
        }
    }

    private toMarkdown(): string {
        let result = '\n|';
        for (const header of this.headers) {
            result += ` ${header} |`;
        }
        result += '\n|';
        for (const _ of this.headers) {
            result += ' --- |';
        }
        result += '\n';
        for (const row of this.rows) {
            result += '|';
            for (const cell of row) {
                result += ` ${cell} |`;
            }
            result += '\n';
        }

        return result;
    }

    private toJson(compact: boolean): string {
        const json = { headers: this.headers, rows: this.rows };
        return compact ? JSON.stringify(json) : JSON.stringify(json, null, 4);
    }
}
