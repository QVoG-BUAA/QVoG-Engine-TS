import { Configuration } from "~/Configuration";
import { GremlinConnection } from "~/db/gremlin/Connection";

export interface GremlinOptions {
    host: string;
    port: number;
}

export interface DatabaseOptions {
    gremlin: GremlinOptions;
}

export class DbContext {
    private log = Configuration.getLogger("DbContext");
    private gremlin: GremlinConnection;

    constructor(options: DatabaseOptions) {
        this.log.info("Creating DbContext");
        this.log.debug("Connecting to Gremlin");
        this.gremlin = new GremlinConnection(`ws://${options.gremlin.host}:${options.gremlin.port}/gremlin`);
        this.log.trace("DbContext created");
    }

    getGremlinConnection(): GremlinConnection {
        return this.gremlin;
    }
}
