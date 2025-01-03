import { GremlinConnection } from "~/db/gremlin/Connection";
import { Vertex } from "~/db/gremlin/Defines";
import { ValuePredicate } from "~/dsl/Defines";
import { DataColumn } from "~/dsl/table/Column";
import { Table } from "~/dsl/table/Table";
import { Context } from "~/graph/Context";

export class GraphFilter {
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
            throw new Error('Connection is not set');
        }
        if (!this.predicate) {
            throw new Error('Predicate is not set');
        }

        let table = new Table(name);
        let column = new DataColumn(name, true);

        this.connection.V().toList().then(vertices =>
            vertices.forEach((traverser: any) => {
                const vertex: Vertex = traverser.value();
                const value = this.context.getValue(vertex);
                if (this.predicate!(value)) {
                    column.addValue(value);
                }
            }));
        table.addColumn(column);

        return table;
    }
};
