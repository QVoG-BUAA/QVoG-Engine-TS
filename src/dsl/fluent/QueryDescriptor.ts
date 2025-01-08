import { Value } from "~/graph";
import { DbContext } from "~/db/DbContext";
import { Configuration } from "~/Configuration";
import { AnyColumn } from "~/dsl/table/Column";
import { GraphExt } from "~/extensions/GraphExt";
import { Table, TableSet } from "~/dsl/table/Table";
import { TablePrettifier } from "~/extensions/TableExt";
import { FlowClause, FlowDescriptor, IFlowDescriptorBuilder } from "~/dsl/fluent/FlowDescriptor";
import { FromClause, FromDescriptor, FromDescriptorBuilder } from "~/dsl/fluent/FromDescriptor";
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

export class QueryDescriptor implements IQueryDescriptor, InitialQuery, SimpleQuery, FilteredQuery, CompleteQuery {
    private tables: TableSet = new TableSet();
    private result?: Table;

    private dbContext?: DbContext;

    withDatabase(dbContext: DbContext): InitialQuery {
        this.dbContext = dbContext;
        return this;
    }

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
     * @param style @see TablePrettifier
     * @returns The result of the query in the specified style
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
            if (value instanceof Value) {
                return GraphExt.format(value);
            }
            return value.toString();
        });
    }
}

export type Query = (descriptor: InitialQuery) => CompleteQuery;
