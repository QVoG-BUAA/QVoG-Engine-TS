import * as fs from 'fs';

export interface PrintStream {
    print(text: string): void;
    println(text: string): void;
}

export class ConsolePrintStream implements PrintStream {
    print(text: string): void {
        process.stdout.write(text);
    }

    println(text: string): void {
        this.print(text + '\n');
    }
}

export class FilePrintStream implements PrintStream {
    private readonly file: string;
    private readonly append: boolean;

    constructor(file: string, append: boolean) {
        this.file = file;
        this.append = append;
    }

    print(text: string): void {
        fs.writeFile(this.file, text, { flag: this.append ? 'a' : 'w' }, (err) => {
            if (err) {
                console.error(err);
            }
        });
    }

    println(text: string): void {
        this.print(text + '\n');
    }
}
