import { Value } from '~/graph';
import { DbContext } from '~/db/DbContext';
import { AnyColumn } from '~/dsl/table/Column';
import { GraphExt } from '~/extensions/GraphExt';
import { Table, TableSet } from '~/dsl/table/Table';
import { TablePrettifier } from '~/extensions/TableExt';
import { FromClause, FromContext, FromDescriptor, FromDescriptorBuilder } from '~/dsl/fluent/FromDescriptor';
import { FlowClause, FlowDescriptor, IFlowDescriptorBuilder } from '~/dsl/fluent/FlowDescriptor';
import { FilterClause, FilterDescriptor, FilterDescriptorBuilder } from '~/dsl/fluent/FilterDescriptor';
import { Configuration } from '~/Configuration';

export interface ICanConfigure {
    // TODO: Add configuration methods
}

export interface ICanApplyFromClause {
    /**
     * Apply a pre-constructed from descriptor.
     *
     * @param descriptor Pre-built from descriptor.
     */
    from(descriptor: FromDescriptor): SimpleQuery;

    /**
     * Build a from descriptor with the clause and apply it.
     *
     * @param clause From clause.
     */
    from(clause: FromClause): SimpleQuery;
}

export interface ICanApplyWhereClause {
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

    /**
     * Apply a pre-constructed filter descriptor.
     *
     * @param descriptor Pre-built filter descriptor.
     */
    where(descriptor: FilterDescriptor): FilteredQuery;

    /**
     * Build a filter descriptor with the clause and apply it.
     *
     * @param clause Filter clause.
     */
    where(clause: FilterClause): FilteredQuery;

    /**
     * Apply a pre-constructed flow descriptor.
     *
     * @param descriptor Pre-built flow descriptor.
     */
    where(descriptor: FlowDescriptor): FilteredQuery;

    /**
     * Build a flow descriptor with the clause and apply it.
     *
     * Different flow implementation may require different configuration, so you
     * need to specify which flow to use by providing `flow`.
     *
     * @param clause Flow clause.
     * @param flow Flow action builder.
     */
    where(clause: FlowClause, flow: () => IFlowDescriptorBuilder): FilteredQuery;
}

export interface ICanApplySelectClause {
    /**
     * Select columns from the result table.
     *
     * The result column order is the same as the order of the columns in
     * the `columns` array.
     *
     * If there is only one column, you can pass a string instead of an array.
     *
     * > [!WARNING]
     * > Make sure there is only one table left.
     *
     * @param columns Columns to select from the result table.
     */
    select(columns: string | string[]): CompleteQuery;
}

export interface InitialQuery extends ICanConfigure, ICanApplyFromClause { }

export interface SimpleQuery extends ICanApplyFromClause, ICanApplyWhereClause, ICanApplySelectClause { }

export interface FilteredQuery extends ICanApplyWhereClause, ICanApplySelectClause { }

export interface CompleteQuery {
    /**
     * Output the result of the query as a string with the specified style.
     *
     * See the format of {@link TablePrettifier.toString | `TablePrettifier.toString`}
     * for available styles.
     *
     * @param style The output style.
     * @returns The result of the query in the specified style.
     */
    toString(style: string): string;
}

export interface IQueryDescriptor {
    /**
     * Set the database context the query uses.
     *
     * @param dbContext Database context.
     */
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
    private context: FromContext = new FromContext();

    private tables: TableSet = new TableSet();
    private prepared: boolean = false;

    private result?: Table;

    private dbContext?: DbContext;

    /**
     * @inheritDoc IQueryDescriptor.withDatabase
     */
    withDatabase(dbContext: DbContext): InitialQuery {
        this.dbContext = dbContext;
        return this;
    }

    /**
     * See {@link ICanApplyFromClause | `ICanApplyFromClause`}.
     */
    from(param: FromDescriptor | FromClause): SimpleQuery {
        if (param instanceof FromDescriptor) {
            return this.fromDescriptor(param);
        } else {
            return this.fromClause(param);
        }
    }

    private fromDescriptor(descriptor: FromDescriptor): SimpleQuery {
        descriptor.apply(this.context);
        return this;
    }

    private fromClause(clause: FromClause): SimpleQuery {
        return this.fromDescriptor(clause(new FromDescriptorBuilder()).build());
    }

    /**
     * See {@link ICanApplyWhereClause | `ICanApplyWhereClause`}.
     */
    where(
        param: FilterDescriptor | FilterClause | FlowDescriptor | FlowClause,
        flow?: () => IFlowDescriptorBuilder
    ): FilteredQuery {
        this.prepareTables();

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
        const barrier = descriptor.properties.barrierAlias
            ? this.tables.removeTable(descriptor.properties.barrierAlias)
            : undefined;
        this.tables.addTable(descriptor.apply(source, sink, barrier));
        return this;
    }

    private flowClause(clause: FlowClause, flow: () => IFlowDescriptorBuilder): FilteredQuery {
        return this.flowDescriptor(clause(flow()).build());
    }

    /**
     * @inheritDoc ICanApplySelectClause.select
     */
    select(columns: string | string[]): CompleteQuery {
        this.prepareTables();

        if (typeof columns === 'string') {
            columns = [columns];
        }

        const table = this.tables.asTable();
        this.result = new Table('Query Result');

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
     * @inheritDoc CompleteQuery.toString
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
        return row.map((value) => {
            if (value == null || value === undefined) {
                return 'null';
            }
            if (value instanceof Value) {
                return GraphExt.format(value);
            }
            return value.toString();
        });
    }

    private prepareTables(): void {
        if (this.prepared) {
            return;
        }
        this.tables = this.context.apply(this.dbContext || Configuration.getDbContext());
        this.prepared = true;
    }
}

/**
 * Clause to build a query.
 *
 * @category DSL API
 */
export type Query = (descriptor: InitialQuery) => CompleteQuery;
