import { QueryResult } from "~/engine/Defines";

export abstract class IResultFormatter {
    abstract format(result: QueryResult): string;
    abstract formatTotalTime(milliseconds: number): string;
}

export class DefaultResultFormatter extends IResultFormatter {
    format(result: QueryResult): string {
        return `Query ${result.name} executed in ${result.milliseconds}ms (${result.milliseconds / 1000}s)\n${result.result}\n`;
    }

    formatTotalTime(milliseconds: number): string {
        return `Total time: ${milliseconds}ms`;
    }
}

export class ConsoleJsonResultFormatter extends IResultFormatter {
    format(result: QueryResult): string {
        const json = {
            name: result.name,
            result: JSON.parse(result.result),
            milliseconds: result.milliseconds
        };
        return JSON.stringify(json, null, 4);
    }

    formatTotalTime(milliseconds: number): string {
        return `"Total execution time: ${milliseconds}`;
    }
}

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
            milliseconds: result.milliseconds
        };
        return this.minify ? JSON.stringify(json) : JSON.stringify(json, null, 4);
    }

    formatTotalTime(milliseconds: number): string {
        return `"Total execution time: ${milliseconds}`;
    }
}