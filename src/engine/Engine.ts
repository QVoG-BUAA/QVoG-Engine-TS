import { DbContext } from "~/db/DbContext";
import { Queryable, QueryResult } from "~/engine/Defines";
import { Configuration } from "~/Configuration";
import { Query, QueryDescriptor } from "~/dsl/fluent/QueryDescriptor";
import { ConsolePrintStream, FileUtils, PrintStream } from "~/extensions/IOExt";
import { ConsoleJsonResultFormatter, IResultFormatter } from "~/engine/ResultFormatter";

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
        this.output.close();
        this.output = output;
        return this;
    }

    execute(query: Queryable): QVoGEngine {
        this.executeImpl(query[0], query[1]);
        return this;
    }

    executeAsync(query: Queryable): Promise<QVoGEngine> {
        return new Promise((resolve, reject) => {
            this.execute(query);
            resolve(this);
        });
    }

    submit(queries: Queryable[]): QVoGEngine {
        queries.forEach(query => this.execute(query));
        return this;
    }

    submitAsync(queries: Queryable[]): Promise<QVoGEngine> {
        return new Promise((resolve, reject) => {
            this.submit(queries);
            resolve(this);
        });
    }

    close(): void {
        this.output.println(`Total execution time: ${this.totalExecutionTime}ms`);
        this.output.close();
        Configuration.getDbContext().close();
        this.log.info("QVoG Engine closed");
    }

    private executeImpl(name: string, query: Query): void {
        this.log.info(`Executing query ${name}`);
        const start = Date.now();
        let result: string;
        try {
            result = query(new QueryDescriptor().withDatabase(Configuration.getDbContext())).toString(this.style!);
        } catch (error) {
            this.log.error(`Error executing query "${name}"`, error);
            result = `Error executing query "${name}": ${error}`;
        }
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
}
