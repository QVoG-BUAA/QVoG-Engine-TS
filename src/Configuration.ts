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
 * @description Global configuration for the engine.
 */
export class Configuration {
    // ---------------------------------------------------------------
    // Logging
    // ---------------------------------------------------------------

    private static defaultLogLevel: string = "info";
    private static registeredLogs: Map<string, string> = new Map<string, string>();
    private static loggers: Map<string, Logger<ILogObj>> = new Map<string, Logger<ILogObj>>();

    public static setDefaultLogLevel(level: string): void {
        if (!LOG_LEVELS.has(level.toLowerCase())) {
            throw new Error(`Invalid log level: ${level}`);
        }
        Configuration.defaultLogLevel = level.toLowerCase();
    }

    public static registerLogger(name: string, level: string): void {
        if (!LOG_LEVELS.has(level.toLowerCase())) {
            throw new Error(`Invalid log level: ${level}`);
        }
        Configuration.registeredLogs.set(name, level.toLowerCase());
    }

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

    public static setSpecification(specification: LanguageSpecification): void {
        Configuration.specification = specification;
    }

    /**
     * @warning Use `getSpecificationCallback` to ensure initialization order.
     */
    public static getSpecification(): LanguageSpecification {
        if (!Configuration.specification) {
            throw new Error("Specification is not set");
        }
        return Configuration.specification;
    }

    public static getSpecificationCallback(): () => LanguageSpecification {
        return () => Configuration.getSpecification();
    }

    // ---------------------------------------------------------------
    // Database
    // ---------------------------------------------------------------

    private static dbContext: DbContext;

    public static setDbContext(dbContext: DbContext): void {
        Configuration.dbContext = dbContext;
    }

    /**
     * @warning Use `getDbContextCallback` to ensure initialization order.
     */
    public static getDbContext(): DbContext {
        if (!Configuration.dbContext) {
            throw new Error("Database context is not set");
        }
        return Configuration.dbContext;
    }

    public static getDbContextCallback(): () => DbContext {
        return () => Configuration.getDbContext();
    }

    // ---------------------------------------------------------------
    // Components
    // ---------------------------------------------------------------

    private static context: Context;

    /**
     * @warning Use `getContextCallback` to ensure initialization order.
     */
    public static getContext(): Context {
        if (!Configuration.context) {
            Configuration.context = new Context(new ValueFactory(Configuration.getSpecification()));
        }
        return Configuration.context;
    }

    public static getContextCallback(): () => Context {
        return () => Configuration.getContext();
    }

    public static getGraphFilter(): GraphFilter {
        return new GraphFilter(Configuration.getContext());
    }
}
