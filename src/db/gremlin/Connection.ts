import { driver, process, structure } from "gremlin";

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

    g(): process.GraphTraversalSource {
        return this.source;
    }

    V(): process.GraphTraversal {
        return this.source.V();
    }

    E(): process.GraphTraversal {
        return this.source.E();
    }

    close(): void {
        this.connection.close();
    }
}
