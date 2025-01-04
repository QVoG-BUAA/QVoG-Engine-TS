import { Query, QueryDescriptor } from "~/dsl/fluent/QueryDescriptor";
import { ConsolePrintStream, FileUtils, PrintStream } from "~/extensions/IOExt";
import { ConsoleJsonResultFormatter, IResultFormatter } from "./ResultFormatter";
import { DbContext } from "~/db/DbContext";
import { Configuration } from "~/Configuration";

export class QVoGEngine {
    private static instance: QVoGEngine;

    private log = Configuration.getLogger("QVoGEngine");

    // Query output style.
    private style: string = "json";
    // Engine execution result formatter.
    private formatter: IResultFormatter = new ConsoleJsonResultFormatter();

    private output: PrintStream = new ConsolePrintStream();

    private totalExecutionTime: number = 0;

    private constructor(filename: string = "config.json") {
        this.log.info("Initializing QVoG Engine");

        const config = JSON.parse(FileUtils.readTextFile(filename));
        Configuration.setDbContext(new DbContext(config));

        this.log.info("QVoG Engine initialized");
    }

    static getInstance(filename: string = "config.json"): QVoGEngine {
        if (!QVoGEngine.instance) {
            QVoGEngine.instance = new QVoGEngine(filename);
        }
        return QVoGEngine.instance;
    }

    // ---------------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------------

    withFormatter(formatter: IResultFormatter): QVoGEngine {
        this.formatter = formatter;
        return this;
    }

    withStyle(style: string): QVoGEngine {
        this.style = style;
        return this;
    }

    withOutput(output: PrintStream): QVoGEngine {
        this.output = output;
        return this;
    }

    execute(name: string, query: Query): void {
        this.log.info(`Executing query ${name}`);
        const start = Date.now();
        const result = query(new QueryDescriptor().withDatabase(Configuration.getDbContext())).toString(this.style!);
        const end = Date.now();
        const executionTime = end - start;
        this.log.info(`Query "${name}" executed in ${executionTime}ms`);

        this.output.println(this.formatter.format({
            name: name,
            result: result,
            milliseconds: executionTime
        }));

        this.totalExecutionTime += executionTime;
    }

    executeAsync(name: string, query: Query): Promise<void> {
        return new Promise((resolve, reject) => {
            this.execute(name, query);
            resolve();
        });
    }

    close(): void {
        this.output.println(`Total execution time: ${this.totalExecutionTime}ms`);
        Configuration.getDbContext().close();
        this.log.info("QVoG Engine closed");
    }
}