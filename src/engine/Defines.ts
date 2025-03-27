import { DatabaseOptions } from '~/db';
import { Query } from '~/dsl/fluent/QueryDescriptor';

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
 * Define a query that can be executed by the engine.
 * [0] - Query name.
 * [1] - Query object.
 *
 * @category Engine
 */
export type Queryable = [string, Query];

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