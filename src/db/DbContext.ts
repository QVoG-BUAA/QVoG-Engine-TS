import { Configuration } from '~/Configuration';
import { GremlinConnection } from '~/db/gremlin/Connection';

/**
 * Gremlin server connection options.
 *
 * @category Database
 */
export interface GremlinOptions {
    host: string;
    port: number;

    /**
     * Maximum number of vertices to fetch in memory.
     * Default is 1000.
     */
    batchSize?: number;
}

/**
 * Database options. Currently only supports Gremlin.
 *
 * @category Database
 */
export interface DatabaseOptions {
    gremlin: GremlinOptions;
}

/**
 * Database connection context, holding the connection to the database.
 *
 * @category Database
 */
export class DbContext {
    private log = Configuration.getLogger('DbContext');
    private gremlin: GremlinConnection;
    private batchSize: number;

    constructor(options: DatabaseOptions) {
        this.log.info('Creating DbContext');
        this.log.debug('Connecting to Gremlin');
        this.gremlin = new GremlinConnection(`ws://${options.gremlin.host}:${options.gremlin.port}/gremlin`);
        this.batchSize = options.gremlin.batchSize || 1000;
        this.log.trace('DbContext created');
    }

    /**
     * Get the Gremlin connection, see {@link GremlinConnection | `GremlinConnection`}.
     *
     * @returns Gremlin connection.
     */
    getGremlinConnection(): GremlinConnection {
        return this.gremlin;
    }

    /**
     * Get the batch size.
     * 
     * This is the user preference for the maximum number of vertices to fetch in memory.
     * Can be omitted, but is recommended to use this limit.
     * 
     * @returns The batch size.
     */
    getBatchSize(): number {
        return this.batchSize;
    }

    /**
     * Close the DbContext.
     */
    close(): void {
        this.log.info('Closing DbContext');
        this.gremlin.close();
        this.log.trace('DbContext closed');
    }
}
