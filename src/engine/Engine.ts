import { DbContext } from '~/db/DbContext';
import { EngineOptions, Queryable } from '~/engine/Defines';
import { Configuration } from '~/Configuration';
import { TablePrettifier } from '~/extensions/TableExt';
import { Query, QueryDescriptor } from '~/dsl/fluent/QueryDescriptor';
import { ConsolePrintStream, createPrintStream, FileUtils, PrintStream } from '~/extensions/IOExt';
import { createResultFormatter, DefaultResultFormatter, IResultFormatter } from '~/extensions/ResultFormatter';

/**
 * The execution engine of QVoG that runs queries and outputs results.
 *
 * @category Engine
 */
export class QVoGEngine {
    private static instance: QVoGEngine;

    private log = Configuration.getLogger('QVoGEngine');

    // Query output style.
    private style: string = 'markdown';
    // Engine execution result formatter.
    private formatter: IResultFormatter = new DefaultResultFormatter();

    private output: PrintStream = new ConsolePrintStream();

    private totalExecutionTime: number = 0;

    private constructor(filename: string = 'config.json') {
        this.log.info('Initializing QVoG Engine');

        const config: EngineOptions = JSON.parse(FileUtils.readTextFile(filename));
        Configuration.setDbContext(new DbContext(config.database));
        if (config.formatter) {
            this.withFormatter(createResultFormatter(config.formatter));
        }
        if (config.style) {
            this.withStyle(config.style);
        }
        if (config.output) {
            this.withOutput(createPrintStream(config.output));
        }

        this.log.info('QVoG Engine initialized');
    }

    /**
     * Get the engine instance as a singleton.
     *
     * The filename parameter is only used for the first time to initialize the engine.
     * Subsequent calls will return the same instance without re-initializing it.
     *
     * @param filename Configuration file path.
     * @returns The engine instance.
     */
    static getInstance(filename: string = 'config.json'): QVoGEngine {
        if (!QVoGEngine.instance) {
            QVoGEngine.instance = new QVoGEngine(filename);
        }
        return QVoGEngine.instance;
    }

    // ---------------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------------

    /**
     * Set the result formatter for the engine.
     *
     * @param formatter Result formatter, see {@link IResultFormatter | `IResultFormatter`}.
     * @returns Itself for chaining.
     */
    withFormatter(formatter: IResultFormatter): QVoGEngine {
        this.formatter = formatter;
        return this;
    }

    /**
     * Set the query output style, {@link TablePrettifier | `TablePrettifier`} for supported styles.
     *
     * @param style The style of the output.
     * @returns Itself for chaining.
     */
    withStyle(style: string): QVoGEngine {
        this.style = style;
        return this;
    }

    /**
     * Set the output stream for the engine.
     *
     * It provides a flexible way to output result to different destinations,
     * such as console, file, etc.
     *
     * @param output Output stream.
     * @returns Itself for chaining.
     */
    withOutput(output: PrintStream): QVoGEngine {
        this.output.close();
        this.output = output;
        return this;
    }

    /**
     * Execute a query synchronously.
     *
     * @param query Query.
     * @returns Itself for chaining.
     */
    execute(query: Queryable): QVoGEngine {
        this.executeImpl(query[0], query[1]);
        return this;
    }

    /**
     * Execute a query asynchronously.
     *
     * @param query Query.
     * @returns Itself for chaining.
     */
    executeAsync(query: Queryable): Promise<QVoGEngine> {
        return new Promise((resolve, reject) => {
            this.execute(query);
            resolve(this);
        });
    }

    /**
     * Execute a list of queries one-by-one synchronously.
     *
     * @param queries Queries.
     * @returns Itself for chaining.
     */
    submit(queries: Queryable[]): QVoGEngine {
        queries.forEach((query) => this.execute(query));
        return this;
    }

    /**
     * Execute a list of queries one-by-one asynchronously.
     *
     * Note that the queries are executed in sequence, not in parallel.
     *
     * @param queries Queries.
     * @returns Itself for chaining.
     */
    submitAsync(queries: Queryable[]): Promise<QVoGEngine> {
        return new Promise((resolve, reject) => {
            this.submit(queries);
            resolve(this);
        });
    }

    /**
     * Close the engine and release resources.
     */
    close(): void {
        this.log.info(`Total execution time: ${this.totalExecutionTime}ms`);
        this.output.println(`Total execution time: ${this.totalExecutionTime}ms`);
        this.output.close();
        Configuration.getDbContext().close();
        this.log.info('QVoG Engine closed');
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

        this.output.println(
            this.formatter.format({
                name: name,
                result: result,
                milliseconds: executionTime,
            })
        );

        this.totalExecutionTime += executionTime;
    }
}
