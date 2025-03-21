import { loopWhile } from '@kaciras/deasync';

import { Table } from '~/dsl/table/Table';
import { Context } from '~/graph/Context';
import { Vertex } from '~/db/gremlin/Defines';
import { Configuration } from '~/Configuration';
import { DataColumn } from '~/dsl/table/Column';
import { ValuePredicate } from '~/dsl/Predicates';
import { GremlinConnection } from '~/db/gremlin/Connection';

/**
 * Filter the graph database to get table of {@link Value | `Value`} that
 * satisfy the predicate.
 *
 * @category Extension
 */
export class GraphFilter {
    private log = Configuration.getLogger('GraphFilter');

    private context: Context;
    private connection?: GremlinConnection;
    private predicate?: ValuePredicate;

    constructor(context: Context) {
        this.context = context;
    }

    /**
     * Set the connection to use for filtering.
     *
     * @param connection Gremlin connection.
     * @returns Itself for chaining.
     */
    withConnection(connection: GremlinConnection): GraphFilter {
        this.connection = connection;
        return this;
    }

    /**
     * Set the predicate to use for filtering. After filtering, only vertices that
     * satisfy the predicate will be included in the result.
     *
     * @param predicate Filter predicate.
     * @returns Itself for chaining.
     */
    withPredicate(predicate: ValuePredicate): GraphFilter {
        this.predicate = predicate;
        return this;
    }

    /**
     * Filter the graph using the set connection and predicate.
     *
     * > [!WARNING]
     * > This method has serious performance issue and should be improved
     * > in the future.
     *
     * @param name Name of the filtered table.
     * @returns The filtered table.
     */
    filter(name: string): Table {
        if (!this.connection) {
            throw new Error('Connection is not set');
        }
        if (!this.predicate) {
            throw new Error('Predicate is not set');
        }

        const table = new Table(name);
        const column = new DataColumn(name, true);

        // FIXME: Currently, all vertices will be fetched into memory then filtered.
        // Therefore, this method is not suitable for large graphs.
        let blocked = true;
        this.connection
            .V()
            .toList()
            .then((vertices: any) => {
                vertices.forEach((vertex: Vertex) => {
                    const value = this.context.getValue(vertex);
                    if (this.predicate!.test(value)) {
                        column.addValue(value);
                    }
                });
            })
            .catch((e: any) => {
                this.log.error('Failed to get vertices', e);
            })
            .finally(() => {
                blocked = false;
            });
        loopWhile(() => blocked);

        table.addColumn(column);

        return table;
    }
}
