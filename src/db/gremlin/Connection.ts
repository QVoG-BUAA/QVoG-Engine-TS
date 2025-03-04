import { driver, process, structure } from 'gremlin';

/**
 * Connection to gremlin server.
 * 
 * @category Database
 */
export class GremlinConnection {
    private connection: driver.DriverRemoteConnection;
    private source: process.GraphTraversalSource;

    /**
     * @param connectionString e.g. ws://localhost:8182/gremlin
     */
    constructor(connectionString: string) {
        const graph = new structure.Graph();
        this.connection = new driver.DriverRemoteConnection(connectionString);
        this.source = graph.traversal().withRemote(this.connection);
    }

    /**
     * Get the graph traversal source.
     */
    g(): process.GraphTraversalSource {
        return this.source;
    }

    /**
     * Equivalent to g.V()
     */
    V(): process.GraphTraversal {
        return this.source.V();
    }

    /**
     * Equivalent to g.E()
     */
    E(): process.GraphTraversal {
        return this.source.E();
    }

    /**
     * Close the connection.
     */
    close(): void {
        this.connection.close();
    }
}
