import * as fs from "fs";

export interface PrintStream {
    print(text: string): void;
    println(text: string): void;
    close(): void;
}

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

export class FileUtils {
    static readTextFile(file: string): string {
        return fs.readFileSync(file, "utf8");
    }
}