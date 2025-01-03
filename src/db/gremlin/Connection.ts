import { driver, process, structure } from "gremlin";

export class GremlinConnection {
    g: process.GraphTraversalSource;

    /**
     * @param connectionString e.g. ws://localhost:8182/gremlin
     */
    constructor(connectionString: string) {
        const connection = new driver.DriverRemoteConnection(connectionString);
        const graph = new structure.Graph();

        this.g = graph.traversal().withRemote(connection);
    }

    V(): process.GraphTraversal {
        return this.g.V();
    }

    E(): process.GraphTraversal {
        return this.g.E();
    }
}
