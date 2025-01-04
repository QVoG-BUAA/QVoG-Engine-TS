import { DbContext } from "~/db/DbContext";
import { FilterClause, FilterDescriptor, FilterDescriptorBuilder } from "~/dsl/fluent/FilterDescriptor";
import { FromClause, FromDescriptor, FromDescriptorBuilder } from "~/dsl/fluent/FromDescriptor";
import { Table, TableSet } from "~/dsl/table/Table";
import { Configuration } from "~/Configuration";
import { TextColumn } from "../table/Column";
import { TablePrettifier } from "~/extensions/TableExt";
import { Value } from "~/graph";
import { GraphExt } from "~/extensions/GraphExt";

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

    private dbContext: DbContext = Configuration.getDbContext();

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
        this.tables.addTable(descriptor.apply(this.dbContext));
        return this;
    }

    private fromClause(clause: FromClause): SimpleQuery {
        return this.fromDescriptor(clause(new FromDescriptorBuilder()).build());
    }

    where(param: FilterDescriptor | FilterClause): FilteredQuery {
        if (param instanceof FilterDescriptor) {
            return this.filterDescriptor(param);
        } else {
            return this.filterClause(param);
        }
    }

    private filterDescriptor(descriptor: FilterDescriptor): FilteredQuery {
        this.tables.addTable(descriptor.apply(this.tables.removeTable(descriptor.alias)));
        return this;
    }

    private filterClause(clause: FilterClause): FilteredQuery {
        return this.filterDescriptor(clause(new FilterDescriptorBuilder()).build());
    }

    select(columns: string[]): CompleteQuery {
        const table = this.tables.asTable();
        this.result = new Table("Query Result");

        let i = 0;
        for (const name of columns) {
            if (table.hasColumn(name)) {
                this.result.addColumn(table.getColumn(name));
            } else {
                const column = new TextColumn(`${++i}`);
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
