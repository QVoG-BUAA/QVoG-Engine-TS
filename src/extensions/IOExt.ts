import * as fs from 'fs';

/**
 * Print stream interface.
 *
 * @category Extension
 */
export interface PrintStream {
    print(text: string): void;
    println(text: string): void;
    close(): void;
}

/**
 * Print stream that writes to the console.
 *
 * @category Extension
 */
export class ConsolePrintStream implements PrintStream {
    print(text: string): void {
        process.stdout.write(text);
    }

    println(text: string): void {
        this.print(text + '\n');
    }

    close(): void {
        // Do nothing
    }
}

/**
 * Print stream that writes to a file.
 *
 * @category Extension
 */
export class FilePrintStream implements PrintStream {
    private fd: number = 0;

    constructor(file: string, append: boolean = true) {
        this.fd = fs.openSync(file, append ? 'a' : 'w');
    }

    print(text: string): void {
        fs.writeSync(this.fd, text);
    }

    println(text: string): void {
        this.print(text + '\n');
    }

    close(): void {
        fs.closeSync(this.fd);
    }
}

/**
 * Get a print stream for writing to the console.
 * 
 * `append` is not used for console output.
 * 
 * @param file The file path. Use stdout for standard output.
 * @param append Whether to append to the file or overwrite it.
 * @returns A print stream.
 * 
 * @category Extension
 */
export function createPrintStream(file: string, append: boolean = true): PrintStream {
    return file === 'stdout' ? new ConsolePrintStream() : new FilePrintStream(file, append);
}

/**
 * Utility functions for file operations.
 *
 * @category Extension
 */
export class FileUtils {
    static readTextFile(file: string): string {
        return fs.readFileSync(file, 'utf8');
    }
}
