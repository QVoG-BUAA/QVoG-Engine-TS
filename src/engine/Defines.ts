import { DatabaseOptions } from '~/db';

/**
 * Result of a query execution.
 *
 * @category Engine
 */
export interface QueryResult {
    /**
     * Name of the query.
     */
    name: string;

    /**
     * Formatted result of the query.
     */
    result: string;

    /**
     * Execution time in milliseconds.
     */
    milliseconds: number;
}

/**
 * Options for the engine.
 * 
 * @category Engine
 */
export interface EngineOptions {
    database: DatabaseOptions;

    /**
     * 'default' | 'json' | 'json-min' | 'json-console'
     */
    formatter?: string;

    /**
     * 'stdout' | file path
     */
    output?: string;

    /**
     * 'default' | 'json' | 'json-min' | 'markdown'
     */
    style?: string;
}