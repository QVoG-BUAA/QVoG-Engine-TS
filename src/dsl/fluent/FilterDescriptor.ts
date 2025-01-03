import { Table } from "~/dsl/table/Table";
import { isRowPredicate, isValuePredicate, RowPredicate, ValuePredicate } from "~/dsl/Defines";

export interface FilterDescriptor {
    alias: string;
    apply: (table: Table) => Table;
}

function applyImpl(table: Table, predicate: RowPredicate): Table {
    let newTable = table.duplicate();
    for (let row of table) {
        if (predicate(row)) {
            newTable.addRow(row);
        }
    }
    return newTable;
}

export interface IFilterDescriptorBuilder {
    onTable(name: string): ICanSetFilterPredicate;
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

    onTable(name: string): ICanSetFilterPredicate {
        this.alias = name;
        return this;
    }

    where(predicate: ValuePredicate | RowPredicate): ICanBuildFilterDescriptor {
        if (isValuePredicate(predicate)) {
            this.apply = table => applyImpl(table, row => predicate(row.get(this.alias!)));
        } else if (isRowPredicate(predicate)) {
            this.apply = table => applyImpl(table, predicate);
        } else {
            throw new Error("Invalid predicate type");
        }
        return this;
    }

    build(): FilterDescriptor {
        return {
            alias: this.alias!,
            apply: this.apply!
        };
    }
}
