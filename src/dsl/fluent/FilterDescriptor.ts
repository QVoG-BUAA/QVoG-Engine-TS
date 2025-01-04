import { Table } from "~/dsl/table/Table";
import { RowPredicate, ValuePredicate } from "~/dsl/Defines";

export class FilterDescriptor {
    alias: string;
    apply: (table: Table) => Table;

    constructor(alias: string, apply: (table: Table) => Table) {
        this.alias = alias;
        this.apply = apply;
    }
}

export type FilterClause = (clause: FilterDescriptorBuilder) => ICanBuildFilterDescriptor;

function applyImpl(table: Table, predicate: RowPredicate): Table {
    const newTable = table.duplicate();
    for (const row of table) {
        if (predicate.test(row)) {
            newTable.addRow(row);
        }
    }
    return newTable;
}

export interface IFilterDescriptorBuilder {
    on(alias: string): ICanSetFilterPredicate;
}

export interface ICanSetFilterPredicate {
    where(predicate: ValuePredicate | RowPredicate): ICanBuildFilterDescriptor;
}

export interface ICanBuildFilterDescriptor {
    build(): FilterDescriptor;
}

export class FilterDescriptorBuilder implements IFilterDescriptorBuilder, ICanSetFilterPredicate, ICanBuildFilterDescriptor {
    private alias?: string;
    private apply?: (table: Table) => Table;

    on(alias: string): ICanSetFilterPredicate {
        this.alias = alias;
        return this;
    }

    where(predicate: ValuePredicate | RowPredicate): ICanBuildFilterDescriptor {
        if (predicate instanceof ValuePredicate) {
            this.apply = table => applyImpl(table, new RowPredicate(row => predicate.test(row.get(this.alias!))));
        } else if (predicate instanceof RowPredicate) {
            this.apply = table => applyImpl(table, predicate);
        } else {
            throw new Error("Invalid predicate type");
        }
        return this;
    }

    build(): FilterDescriptor {
        return new FilterDescriptor(this.alias!, this.apply!);
    }
}
