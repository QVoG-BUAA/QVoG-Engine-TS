import * as fs from "fs";

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
        this.print(text + "\n");
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
    private append: boolean;

    constructor(file: string, append: boolean) {
        this.fd = fs.openSync(file, append ? "a" : "w");
        this.append = append;
    }

    print(text: string): void {
        fs.writeSync(this.fd, text);
    }

    println(text: string): void {
        this.print(text + "\n");
    }

    close(): void {
        fs.closeSync(this.fd);
    }
}

/**
 * Utility functions for file operations.
 * 
 * @category Extension
 */
export class FileUtils {
    static readTextFile(file: string): string {
        return fs.readFileSync(file, "utf8");
    }
}