import { ILogObj, Logger } from "tslog";
import { LanguageSpecification, ValueFactory } from "~/graph/Specification";
import { DbContext } from "~/db/DbContext";
import { GraphFilter } from "~/extensions/GraphFilter";
import { Context } from "~/graph/Context";

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
        const level = Configuration.registeredLogs.get(name) || Configuration.defaultLogLevel;
        return new Logger({ name: name, minLevel: LOG_LEVELS.get(level) });
    }

    // ---------------------------------------------------------------
    // Language Specification
    // ---------------------------------------------------------------

    private static specification: LanguageSpecification;

    public static setSpecification(specification: LanguageSpecification): void {
        Configuration.specification = specification;
    }

    public static getSpecification(): LanguageSpecification {
        if (!Configuration.specification) {
            throw new Error("Specification is not set");
        }
        return Configuration.specification;
    }

    // ---------------------------------------------------------------
    // Database
    // ---------------------------------------------------------------

    private static dbContext: DbContext;

    public static setDbContext(dbContext: DbContext): void {
        Configuration.dbContext = dbContext;
    }

    public static getDbContext(): DbContext {
        if (!Configuration.dbContext) {
            throw new Error("Database context is not set");
        }
        return Configuration.dbContext;
    }

    // ---------------------------------------------------------------
    // Components
    // ---------------------------------------------------------------

    private static context: Context;

    public static getContext(): Context {
        if (!Configuration.context) {
            Configuration.context = new Context(new ValueFactory(Configuration.getSpecification()));
        }
        return Configuration.context;
    }

    public static getGraphFilter(): GraphFilter {
        return new GraphFilter(Configuration.getContext());
    }
}
