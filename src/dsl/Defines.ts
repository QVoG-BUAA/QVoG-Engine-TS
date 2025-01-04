import { Value } from "~/graph/values/Value";
import { Table } from "~/dsl/table/Table";

export class ValuePredicate {
    test: (value: Value) => boolean;
    constructor(test: (value: Value) => boolean) {
        this.test = test;
    }
}

export type Row = Map<string, any>;
export type RowWithoutHeader = Array<any>;

export class RowPredicate {
    test: (row: Row) => boolean;
    constructor(test: (row: Row) => boolean) {
        this.test = test;
    }
}

export class FilterPredicate {
    alias: string;
    apply: (table: Table) => Table;

    constructor(alias: string, apply: (table: Table) => Table) {
        this.alias = alias;
        this.apply = apply;
    }
}

export interface FlowPredicate {
    alias: string;

    sourceAlias?: string;
    barrierAlias?: string;
    sinkAlias?: string;

    apply: (source: Table, barrier: Table, sink: Table) => Table;
}
