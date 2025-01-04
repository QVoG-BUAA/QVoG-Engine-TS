import { Table } from "~/dsl/table/Table";
import { Context } from "~/graph/Context";
import { Vertex } from "~/db/gremlin/Defines";
import { ValuePredicate } from "~/dsl/Defines";
import { Configuration } from "~/Configuration";
import { DataColumn } from "~/dsl/table/Column";
import { GremlinConnection } from "~/db/gremlin/Connection";
import deasync from "deasync";


export class GraphFilter {
    private log = Configuration.getLogger("GraphFilter");

    private context: Context;
    private connection?: GremlinConnection;
    private predicate?: ValuePredicate;

    constructor(context: Context) {
        this.context = context;
    }

    withConnection(connection: GremlinConnection) {
        this.connection = connection;
        return this;
    }

    withPredicate(predicate: ValuePredicate) {
        this.predicate = predicate;
        return this;
    }

    filter(name: string): Table {
        if (!this.connection) {
            throw new Error("Connection is not set");
        }
        if (!this.predicate) {
            throw new Error("Predicate is not set");
        }

        const table = new Table(name);
        const column = new DataColumn(name, true);

        let blocked = true;
        this.connection.V().toList().then((vertices: any) => {
            vertices.forEach((vertex: Vertex) => {
                const value = this.context.getValue(vertex);
                if (this.predicate!.test(value)) {
                    column.addValue(value);
                }
            });
        }).catch((e: any) => {
            this.log.error("Failed to get vertices", e);
        }).finally(() => {
            blocked = false;
        });
        deasync.loopWhile(() => blocked);

        table.addColumn(column);

        return table;
    }
};
