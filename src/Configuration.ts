import { ILogObj, Logger } from "tslog";

import { Context } from "~/graph/Context";
import { DbContext } from "~/db/DbContext";
import { GraphFilter } from "~/extensions/GraphFilter";
import { LanguageSpecification, ValueFactory } from "~/graph/Specification";

const LOG_LEVELS: Map<string, number> = new Map<string, number>([
    ["trace", 0],
    ["debug", 1],
    ["info", 2],
    ["warn", 3],
    ["error", 4],
    ["fatal", 5],
]);

/**
 * Global configuration for the engine.
 * 
 * @category Configuration
 */
export class Configuration {
    // ---------------------------------------------------------------
    // Logging
    // ---------------------------------------------------------------

    private static defaultLogLevel: string = "info";
    private static registeredLogs: Map<string, string> = new Map<string, string>();
    private static loggers: Map<string, Logger<ILogObj>> = new Map<string, Logger<ILogObj>>();

    /**
     * Set the default log level for loggers.
     * 
     * @param level Default log level.
     */
    public static setDefaultLogLevel(level: string): void {
        if (!LOG_LEVELS.has(level.toLowerCase())) {
            throw new Error(`Invalid log level: ${level}`);
        }
        Configuration.defaultLogLevel = level.toLowerCase();
    }

    /**
     * Register a logger with the specified name and log level.
     * 
     * If you want custom log levels, you can register them here.
     * Call it before {@link getLogger | `getLogger`} to use the custom log level.
     * 
     * @param name Name of the logger.
     * @param level Log level for the logger.
     */
    public static registerLogger(name: string, level: string): void {
        if (!LOG_LEVELS.has(level.toLowerCase())) {
            throw new Error(`Invalid log level: ${level}`);
        }
        Configuration.registeredLogs.set(name, level.toLowerCase());
    }

    /**
     * Get a logger instance with the specified name.
     * 
     * If the logger is not registered, it will be created with the default log level.
     * 
     * @param name Name of the logger.
     * @returns The logger instance.
     */
    public static getLogger(name: string): Logger<ILogObj> {
        let logger = Configuration.loggers.get(name);
        if (!logger) {
            const level = Configuration.registeredLogs.get(name) || Configuration.defaultLogLevel;
            logger = new Logger({ name: name, minLevel: LOG_LEVELS.get(level) });
            Configuration.loggers.set(name, logger);
        }
        return logger;
    }

    // ---------------------------------------------------------------
    // Language Specification
    // ---------------------------------------------------------------

    private static specification: LanguageSpecification;

    /**
     * Set the language specification.
     * 
     * This tells the engine how to interpret the language.
     * 
     * @param specification Language specification.
     */
    public static setSpecification(specification: LanguageSpecification): void {
        Configuration.specification = specification;
    }

    /**
     * Get the language specification.
     * 
     * > [!WARNING]
     * > Use {@link getSpecificationCallback | `getSpecificationCallback`} to ensure initialization order.
     */
    public static getSpecification(): LanguageSpecification {
        if (!Configuration.specification) {
            throw new Error("Specification is not set");
        }
        return Configuration.specification;
    }

    /**
     * Get a callback function that returns the language specification.
     * 
     * When constructing queries, the engine may not be fully initialized.
     * So you should use callback to get the specification when used during
     * query execution.
     * 
     * @returns A callback function that returns the language specification.
     */
    public static getSpecificationCallback(): () => LanguageSpecification {
        return () => Configuration.getSpecification();
    }

    // ---------------------------------------------------------------
    // Database
    // ---------------------------------------------------------------

    private static dbContext: DbContext;

    /**
     * Set the database context.
     * 
     * @param dbContext The database context.
     */
    public static setDbContext(dbContext: DbContext): void {
        Configuration.dbContext = dbContext;
    }

    /**
     * > [!WARNING]
     * > Use {@link getDbContextCallback | `getDbContextCallback`} to ensure initialization order.
     */
    public static getDbContext(): DbContext {
        if (!Configuration.dbContext) {
            throw new Error("Database context is not set");
        }
        return Configuration.dbContext;
    }

    /**
     * Get a callback function that returns the database context.
     * 
     * See {@link getSpecificationCallback | `getSpecificationCallback`} for
     * reasons why you should use a callback function.
     * 
     * @returns A callback function that returns the database context.
     */
    public static getDbContextCallback(): () => DbContext {
        return () => Configuration.getDbContext();
    }

    // ---------------------------------------------------------------
    // Components
    // ---------------------------------------------------------------

    private static context: Context;

    /**
     * > [!WARNING]
     * > Use {@link getContextCallback | `getContextCallback`} to ensure initialization order.
     */
    public static getContext(): Context {
        if (!Configuration.context) {
            Configuration.context = new Context(new ValueFactory(Configuration.getSpecification()));
        }
        return Configuration.context;
    }

    /**
     * Get a callback function that returns the context.
     * 
     * See {@link getSpecificationCallback | `getSpecificationCallback`} for
     * reasons why you should use a callback function.
     * 
     * @returns A callback function that returns the context.
     */
    public static getContextCallback(): () => Context {
        return () => Configuration.getContext();
    }

    /**
     * Get a graph filter instance.
     * 
     * @returns Graph filter instance.
     */
    public static getGraphFilter(): GraphFilter {
        return new GraphFilter(Configuration.getContext());
    }
}
