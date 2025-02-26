import { Value } from "~/graph";
import { DbContext } from "~/db/DbContext";
import { AnyColumn } from "~/dsl/table/Column";
import { Configuration } from "~/Configuration";
import { GraphExt } from "~/extensions/GraphExt";
import { Table, TableSet } from "~/dsl/table/Table";
import { TablePrettifier } from "~/extensions/TableExt";
import { FromClause, FromDescriptor, FromDescriptorBuilder } from "~/dsl/fluent/FromDescriptor";
import { FlowClause, FlowDescriptor, IFlowDescriptorBuilder } from "~/dsl/fluent/FlowDescriptor";
import { FilterClause, FilterDescriptor, FilterDescriptorBuilder } from "~/dsl/fluent/FilterDescriptor";

export interface ICanConfigure {
    // TODO: Add configuration methods
}

export interface ICanApplyFromClause {
    from(descriptor: FromDescriptor): SimpleQuery;
    from(clause: FromClause): SimpleQuery;
}

export interface ICanApplyWhereClause {
    where(descriptor: FilterDescriptor): FilteredQuery;
    where(clause: FilterClause): FilteredQuery;

    where(descriptor: FlowDescriptor): FilteredQuery;
    where(clause: FlowClause, flow: () => IFlowDescriptorBuilder): FilteredQuery;
}

export interface ICanApplySelectClause {
    select(columns: string[]): CompleteQuery;
}

export interface InitialQuery extends ICanConfigure, ICanApplyFromClause {
}

export interface SimpleQuery extends ICanApplyFromClause, ICanApplyWhereClause, ICanApplySelectClause {
}

export interface FilteredQuery extends ICanApplyWhereClause, ICanApplySelectClause {
}

export interface CompleteQuery {
    toString(style: string): string;
}

export interface IQueryDescriptor {
    withDatabase(dbContext: DbContext): InitialQuery;
}

/**
 * Describes a query, which is used to build complex queries in a fluent manner.
 * 
 * All you need is to combine {@link from | `from`}, {@link where | `where`}, and
 * {@link select | `select`} clauses to build a query.
 * 
 * You can use multiple {@link from | `from`} to fetch tables from the database. Then,
 * use {@link where | `where`} to filter the tables with filter or flow actions. Finally,
 * use {@link select | `select`} to display specific columns from the result table.
 * 
 * > [!WARNING]
 * > Make sure there is only one table left before calling {@link select | `select`}.
 * > You can use flow actions to merge tables into one, see {@link FlowDescriptor | `FlowDescriptor`}
 * > for more information.
 * 
 * @category DSL API
 */
export class QueryDescriptor implements IQueryDescriptor, InitialQuery, SimpleQuery, FilteredQuery, CompleteQuery {
    private tables: TableSet = new TableSet();
    private result?: Table;

    private dbContext?: DbContext;

    /**
     * Set the database context the query uses.
     * 
     * @param dbContext Database context.
     */
    withDatabase(dbContext: DbContext): InitialQuery {
        this.dbContext = dbContext;
        return this;
    }

    /**
     * Add a table to the query.
     * 
     * You can provide a pre-built {@link FromDescriptor | `FromDescriptor`} or use a
     * {@link FromClause | `FromClause`} to build it on demand.
     * 
     * @param param From descriptor or clause.
     */
    from(param: FromDescriptor | FromClause): SimpleQuery {
        if (param instanceof FromDescriptor) {
            return this.fromDescriptor(param);
        } else {
            return this.fromClause(param);
        }
    }

    private fromDescriptor(descriptor: FromDescriptor): SimpleQuery {
        this.tables.addTable(descriptor.apply(this.dbContext ? this.dbContext : Configuration.getDbContext()));
        return this;
    }

    private fromClause(clause: FromClause): SimpleQuery {
        return this.fromDescriptor(clause(new FromDescriptorBuilder()).build());
    }

    /**
     * Apply a filter or flow action to the query.
     * 
     * Use {@link FilterDescriptor | `FilterDescriptor`} to filter tables, or use
     * {@link FlowDescriptor | `FlowDescriptor`} for flow actions to find path problems.
     * 
     * @param param Filter/flow descriptor or clause.
     * @param flow Only required when `param` is {@link FlowDescriptor | `FlowDescriptor`}
     *      or {@link FlowClause | `FlowClause`}.
     */
    where(param: FilterDescriptor | FilterClause | FlowDescriptor | FlowClause, flow?: () => IFlowDescriptorBuilder): FilteredQuery {
        if (param instanceof FilterDescriptor) {
            return this.filterDescriptor(param);
        } else if (param instanceof FlowDescriptor) {
            return this.flowDescriptor(param);
        } else if (flow) {
            return this.flowClause(param as FlowClause, flow);
        } else {
            return this.filterClause(param as FilterClause);
        }
    }

    private filterDescriptor(descriptor: FilterDescriptor): FilteredQuery {
        this.tables.addTable(descriptor.apply(this.tables.removeTable(descriptor.alias)));
        return this;
    }

    private filterClause(clause: FilterClause): FilteredQuery {
        return this.filterDescriptor(clause(new FilterDescriptorBuilder()).build());
    }

    private flowDescriptor(descriptor: FlowDescriptor): FilteredQuery {
        const source = this.tables.removeTable(descriptor.properties.sourceAlias);
        const sink = this.tables.removeTable(descriptor.properties.sinkAlias);
        const barrier = descriptor.properties.barrierAlias ? this.tables.removeTable(descriptor.properties.barrierAlias) : undefined;
        this.tables.addTable(descriptor.apply(source, sink, barrier));
        return this;
    }

    private flowClause(clause: FlowClause, flow: () => IFlowDescriptorBuilder): FilteredQuery {
        return this.flowDescriptor(clause(flow()).build());
    }

    /**
     * Select columns from the result table.
     * 
     * The result column order is the same as the order of the columns in
     * the `columns` array.
     * 
     * > [!WARNING]
     * > Make sure there is only one table left.
     * 
     * @param columns Columns to select from the result table.
     */
    select(columns: string[]): CompleteQuery {
        const table = this.tables.asTable();
        this.result = new Table("Query Result");

        let i = 0;
        for (const name of columns) {
            if (table.hasColumn(name)) {
                this.result.addColumn(table.getColumn(name));
            } else {
                const column = new AnyColumn(`${++i}`);
                column.addValues(new Array(table.getSize()).fill(name));
                this.result.addColumn(column);
            }
        }
        return this;
    }

    /**
     * Output the result of the query as a string with the specified style.
     * 
     * See the format of {@link TablePrettifier.toString | `TablePrettifier.toString`}
     * for available styles.
     * 
     * @param style The output style.
     * @returns The result of the query in the specified style.
     */
    toString(style: string): string {
        const prettifier = new TablePrettifier();
        const table = this.result!;

        for (const header of table.getHeaders()) {
            prettifier.addHeader(header);
        }

        const it = table.iteratorWithoutHeader();
        let value = it.next();
        while (!value.done) {
            prettifier.addRow(this.formatRow(value.value));
            value = it.next();
        }

        return prettifier.toString(style);
    }

    private formatRow(row: any[]): string[] {
        return row.map(value => {
            if (value == null || value === undefined) {
                return "null";
            }
            if (value instanceof Value) {
                return GraphExt.format(value);
            }
            return value.toString();
        });
    }
}

/**
 * Clause to build a query.
 * 
 * @category DSL API
 */
export type Query = (descriptor: InitialQuery) => CompleteQuery;
