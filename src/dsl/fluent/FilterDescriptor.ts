import { Table } from "~/dsl/table/Table";
import { FlowPredicate, RowPredicate, ValuePredicate } from "~/dsl/Predicates";

/**
 * Defines the behavior of a filter action which is used to filter data in a table.
 * 
 * @category DSL API
 */
export class FilterDescriptor {
    /**
     * The alias of the table to filter.
     */
    alias: string;

    /**
     * The filter action to apply.
     */
    apply: (table: Table) => Table;

    constructor(alias: string, apply: (table: Table) => Table) {
        this.alias = alias;
        this.apply = apply;
    }
}

/**
 * The complete filter action clause, which is a callback to build a
 * {@link FilterDescriptor | `FilterDescriptor`} on demand.
 * 
 * @category DSL API
 */
export type FilterClause = (clause: IFilterDescriptorBuilder) => ICanBuildFilterDescriptor;

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
    where(predicate: ValuePredicate): ICanBuildFilterDescriptor;
    where(predicate: RowPredicate): ICanBuildFilterDescriptor;
    where(predicate: FlowPredicate): ICanBuildFilterDescriptor;
}

export interface ICanBuildFilterDescriptor {
    build(): FilterDescriptor;
}

/**
 * Builder for {@link FilterDescriptor | `FilterDescriptor`}.
 * 
 * @category DSL API
 */
export class FilterDescriptorBuilder implements IFilterDescriptorBuilder, ICanSetFilterPredicate, ICanBuildFilterDescriptor {
    private alias: string = "";
    private apply?: (table: Table) => Table;

    /**
     * Specify the table to filter.
     * 
     * @param alias Alias of the table to filter.
     */
    on(alias: string): ICanSetFilterPredicate {
        this.alias = alias;
        return this;
    }

    /**
     * Specify the predicate to filter the table.
     * 
     * The supported predicate types are:
     * 
     * - {@link RowPredicate | `RowPredicate`}: Use this if all columns of the row
     * are needed to evaluate the predicate. This is the most high-level predicate.
     * However, you need manual type casting to access the values of the row.
     * - {@link ValuePredicate | `ValuePredicate`}: Only checks a single column of the
     * row, and assumes that the column contains {@link Value | `Value`}. The column
     * it checks has the same name as the alias of the table.
     * - {@link FlowPredicate | `FlowPredicate`}: The same as `ValuePredicate`, but the
     * column contains {@link FlowPath | `FlowPath`}.
     * 
     * @param predicate The predicate to filter the table.
     */
    where(predicate: ValuePredicate | RowPredicate | FlowPredicate): ICanBuildFilterDescriptor {
        if (predicate instanceof ValuePredicate) {
            this.apply = table => applyImpl(table, new RowPredicate(row => predicate.test(row.get(this.alias!))));
        } else if (predicate instanceof RowPredicate) {
            this.apply = table => applyImpl(table, predicate);
        } else if (predicate instanceof FlowPredicate) {
            this.apply = table => applyImpl(table, new RowPredicate(row => predicate.test(row.get(this.alias!))));
        } else {
            throw new Error("Invalid predicate type");
        }
        return this;
    }

    /**
     * Build the filter descriptor.
     * 
     * @returns The filter descriptor.
     */
    build(): FilterDescriptor {
        return new FilterDescriptor(this.alias!, this.apply!);
    }
}
