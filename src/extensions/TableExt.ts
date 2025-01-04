export class TablePrettifier {
    private headers: string[] = [];
    private rows: Array<Array<string>> = [];

    addHeader(header: string): void {
        this.headers.push(header);
    }

    addRow(row: Array<string>): void {
        if (row.length !== this.headers.length) {
            throw new Error("Row size must match header size");
        }
        this.rows.push(row);
    }

    /**
     * 
     * @param format Can be one of the following:
     * -     markdown: Markdown syntax
     * -         json: JSON with indentation of 4 spaces
     * - json-compact: JSON without indentation and newlines
     */
    toString(format: string) {
        switch (format) {
            case "markdown":
                return this.toMarkdown();
            case "json":
                return this.toJson(false);
            case "json-compact":
                return this.toJson(true);
            default:
                throw new Error(`Invalid format: ${format}`);
        }
    }

    private toMarkdown(): string {
        let result = "\n|";
        for (const header of this.headers) {
            result += ` ${header} |`;
        }
        result += "\n|";
        for (const header of this.headers) {
            result += " --- |";
        }
        result += "\n";
        for (const row of this.rows) {
            result += "|";
            for (const cell of row) {
                result += ` ${cell} |`;
            }
            result += "\n";
        }
        result += "\n";
        return result;
    }

    private toJson(compact: boolean): string {
        const json = { "headers": this.headers, "rows": this.rows };
        return compact ? JSON.stringify(json) : JSON.stringify(json, null, 4);
    }
}