import { loopWhile } from '@kaciras/deasync';

import { Table } from '~/dsl/table/Table';
import { Context } from '~/graph/Context';
import { Vertex } from '~/db/gremlin/Defines';
import { Configuration } from '~/Configuration';
import { DataColumn } from '~/dsl/table/Column';
import { ValuePredicateFn } from '~/dsl/Predicates';
import { GremlinConnection } from '~/db/gremlin/Connection';
import { Value } from '~/graph';

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
    private batchSize: number = 1000;
    private actions: [string, ValuePredicateFn][] = [];

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

    withBatchSize(batchSize: number): GraphFilter {
        this.batchSize = batchSize;
        return this;
    }

    /**
     * Set the predicate to use for filtering. After filtering, only vertices that
     * satisfy the predicate will be included in the result.
     *
     * @param action [alias, predicate][]
     * @returns Itself for chaining.
     */
    addAction(action: [string, ValuePredicateFn]): GraphFilter {
        this.actions.push(action);
        return this;
    }

    addActions(actions: [string, ValuePredicateFn][]): GraphFilter {
        this.actions.push(...actions);
        return this;
    }

    /**
     * Filter the graph using the set connection and predicate.
     *
     * @returns The filtered tables.
     */
    filter(): Table[] {
        if (!this.connection) {
            throw new Error('Connection is not set');
        }

        const columns: Map<string, DataColumn> = new Map();
        this.actions.forEach(([alias, _]) => {
            columns.set(alias, new DataColumn(alias, true));
        });

        let offset = 0;
        let hasNext = true;
        while (hasNext) {
            let blocked = true;
            this.connection.V().range(offset, offset + this.batchSize).toList()
                .then((vertices: any) => {
                    if (vertices.length === 0) {
                        hasNext = false;
                    } else {
                        vertices.forEach((vertex: Vertex) => {
                            const value = this.context.getValue(vertex, false);
                            this.applyActions(value, columns);
                        });
                        offset += vertices.length;
                    }
                }).catch((e: any) => {
                    this.log.error('Failed to get vertices', e);
                }).finally(() => {
                    blocked = false;
                });
            loopWhile(() => blocked);
        }

        const tables: Table[] = [];
        for (const column of columns.values()) {
            const table = new Table(column.getName());
            table.addColumn(column);
            tables.push(table);
        }

        return tables;
    }

    private applyActions(value: Value, columns: Map<string, DataColumn>): void {
        this.actions.forEach(([alias, predicate]) => {
            if (predicate(value)) {
                columns.get(alias)!.addValue(value);
            }
        });
    }
}
