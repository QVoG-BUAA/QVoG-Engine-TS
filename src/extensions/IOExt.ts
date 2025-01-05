import * as fs from "fs";

export interface PrintStream {
    print(text: string): void;
    println(text: string): void;
}

export class ConsolePrintStream implements PrintStream {
    print(text: string): void {
        process.stdout.write(text);
    }

    println(text: string): void {
        this.print(text + "\n");
    }
}

export class FilePrintStream implements PrintStream {
    private fd: number = 0;
    private append: boolean;

    constructor(file: string, append: boolean) {
        fs.open(file, append ? "a" : "w", (err, fd) => {
            if (err) {
                throw new Error(`Cannot open file ${file}`);
            } else {
                this.fd = fd;
            }
        });
        this.append = append;
    }

    print(text: string): void {
        fs.write(this.fd, text, (err) => {
            if (err) {
                throw new Error("Cannot write to file");
            }
        });
    }

    println(text: string): void {
        this.print(text + "\n");
    }
}

export class FileUtils {
    static readTextFile(file: string): string {
        return fs.readFileSync(file, "utf8");
    }
}