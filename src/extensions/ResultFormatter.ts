import { QueryResult } from '~/engine/Defines';

/**
 * Interface for result formatters. It wraps the result of a query execution by
 * adding descriptive information.
 *
 * @category Extensions
 */
export abstract class IResultFormatter {
    abstract format(result: QueryResult): string;
    abstract formatTotalTime(milliseconds: number): string;
}

/**
 * Default result formatter, output as plain text.
 *
 * @category Extensions
 */
export class DefaultResultFormatter extends IResultFormatter {
    format(result: QueryResult): string {
        return `Query ${result.name} executed in ${result.milliseconds}ms (${result.milliseconds / 1000}s)\n${result.result}\n`;
    }

    formatTotalTime(milliseconds: number): string {
        return `Total time: ${milliseconds}ms`;
    }
}

/**
 * Result formatter that outputs the result as indented JSON.
 *
 * The difference between this and {@link JsonResultFormatter} is that this
 * will parse the query result as JSON, instead of output it as raw text.
 *
 * [!WARNING]
 * This should only be used when style is set to 'json' also.
 *
 * @category Extensions
 */
export class ConsoleJsonResultFormatter extends IResultFormatter {
    format(result: QueryResult): string {
        const json = {
            name: result.name,
            result: JSON.parse(result.result),
            milliseconds: result.milliseconds,
        };
        return JSON.stringify(json, null, 4);
    }

    formatTotalTime(milliseconds: number): string {
        return `"Total execution time: ${milliseconds}`;
    }
}

/**
 * Output as minified JSON.
 *
 * @category Extensions
 */
export class JsonResultFormatter extends IResultFormatter {
    private minify: boolean;

    constructor(minify: boolean = false) {
        super();
        this.minify = minify;
    }

    format(result: QueryResult): string {
        const json = {
            name: result.name,
            result: result.result,
            milliseconds: result.milliseconds,
        };
        return this.minify ? JSON.stringify(json) : JSON.stringify(json, null, 4);
    }

    formatTotalTime(milliseconds: number): string {
        return `"Total execution time: ${milliseconds}`;
    }
}

/**
 * Create a result formatter based on the format.
 *
 * @param format The format of the result.
 * @returns The result formatter.
 */
export function createResultFormatter(format: string): IResultFormatter {
    switch (format) {
        case 'json':
            return new JsonResultFormatter();
        case 'json-min':
            return new JsonResultFormatter(true);
        case 'json-console':
            return new ConsoleJsonResultFormatter();
        default:
            return new DefaultResultFormatter();
    }
}
