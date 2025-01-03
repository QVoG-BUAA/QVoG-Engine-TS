import { Value } from "~/graph/values/Value";
import { Table } from "~/dsl/table/Table";

export interface ValuePredicate {
    (value: Value): boolean;
}

export function isValuePredicate(predicate: any): predicate is ValuePredicate {
    return typeof predicate === 'function';
}

export type Row = Map<string, any>;
export type RowWithoutHeader = Array<any>;

export interface RowPredicate {
    (row: Row): boolean;
}

export function isRowPredicate(predicate: any): predicate is RowPredicate {
    return typeof predicate === 'function';
}

export interface FilterPredicate {
    alias: string;

    apply: (table: Table) => Table;
}

export interface FlowPredicate {
    alias: string;

    sourceAlias?: string;
    barrierAlias?: string;
    sinkAlias?: string;

    apply: (source: Table, barrier: Table, sink: Table) => Table;
}
