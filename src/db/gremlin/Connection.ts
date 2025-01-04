import { driver, process, structure } from "gremlin";

export class GremlinConnection {
    private connection: driver.DriverRemoteConnection;
    private g: process.GraphTraversalSource;

    /**
     * @param connectionString e.g. ws://localhost:8182/gremlin
     */
    constructor(connectionString: string) {
        const graph = new structure.Graph();
        this.connection = new driver.DriverRemoteConnection(connectionString);
        this.g = graph.traversal().withRemote(this.connection);
    }

    V(): process.GraphTraversal {
        return this.g.V();
    }

    E(): process.GraphTraversal {
        return this.g.E();
    }

    close(): void {
        this.connection.close();
    }
}
