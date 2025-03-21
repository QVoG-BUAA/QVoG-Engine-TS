import { Table } from '~/dsl/table/Table';
import { FlowPredicate, RowPredicate, ValuePredicate } from '~/dsl/Predicates';

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
    /**
     * Specify the table to filter.
     *
     * @param alias Alias of the table to filter.
     */
    on(alias: string): ICanSetFilterPredicate;
}

export interface ICanSetFilterPredicate {
    /**
     * Filter the table using {@link ValuePredicate | `ValuePredicate`}.
     *
     * It will apply the predicate on the column with the same name as the alias of the
     * table, and assumes that the column contains {@link Value | `Value`}.
     */
    where(predicate: ValuePredicate): ICanBuildFilterDescriptor;

    /**
     * Filter the table using {@link RowPredicate | `RowPredicate`}.
     *
     * This is the most high-level predicate where you can access all columns of the row.
     * However, you need manual type casting for each column to access the values.
     */
    where(predicate: RowPredicate): ICanBuildFilterDescriptor;

    /**
     * Filter the table using {@link FlowPredicate | `FlowPredicate`}.
     *
     * It will apply the predicate on the column with the same name as the alias of the
     * table, and assumes that the column contains {@link FlowPath | `FlowPath`}.
     */
    where(predicate: FlowPredicate): ICanBuildFilterDescriptor;
}

export interface ICanBuildFilterDescriptor {
    /**
     * Build the filter descriptor.
     *
     * @returns The filter descriptor.
     */
    build(): FilterDescriptor;
}

/**
 * Builder for {@link FilterDescriptor | `FilterDescriptor`}.
 *
 * @category DSL API
 */
export class FilterDescriptorBuilder
    implements IFilterDescriptorBuilder, ICanSetFilterPredicate, ICanBuildFilterDescriptor
{
    private alias: string = '';
    private apply?: (table: Table) => Table;

    /**
     * @inheritDoc IFilterDescriptorBuilder.on
     */
    on(alias: string): ICanSetFilterPredicate {
        this.alias = alias;
        return this;
    }

    /**
     * See {@link ICanSetFilterPredicate | `ICanSetFilterPredicate`}.
     */
    where(predicate: ValuePredicate | RowPredicate | FlowPredicate): ICanBuildFilterDescriptor {
        if (predicate instanceof ValuePredicate) {
            this.apply = (table: Table): Table =>
                applyImpl(table, new RowPredicate((row) => predicate.test(row.get(this.alias!))));
        } else if (predicate instanceof RowPredicate) {
            this.apply = (table: Table): Table => applyImpl(table, predicate);
        } else if (predicate instanceof FlowPredicate) {
            this.apply = (table: Table): Table =>
                applyImpl(table, new RowPredicate((row) => predicate.test(row.get(this.alias!))));
        } else {
            throw new Error('Invalid predicate type');
        }
        return this;
    }

    /**
     * @inheritDoc ICanBuildFilterDescriptor.build
     */
    build(): FilterDescriptor {
        return new FilterDescriptor(this.alias!, this.apply!);
    }
}
