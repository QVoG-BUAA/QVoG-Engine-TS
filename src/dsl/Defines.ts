import { Value } from "~/graph/values/Value";
import { Table } from "~/dsl/table/Table";

export class ValuePredicate {
    test: (value: Value) => boolean;

    constructor(test: (value: Value) => boolean) {
        this.test = test;
    }

    static of(predicate: (value: Value) => boolean): ValuePredicate {
        return new ValuePredicate(predicate);
    }

    static any(): ValuePredicate {
        return new ValuePredicate(() => true);
    }

    static none(): ValuePredicate {
        return new ValuePredicate(() => false);
    }
}

export type Row = Map<string, any>;
export type RowWithoutHeader = Array<any>;

export class RowPredicate {
    test: (row: Row) => boolean;

    constructor(test: (row: Row) => boolean) {
        this.test = test;
    }

    static of(predicate: (row: Row) => boolean): RowPredicate {
        return new RowPredicate(predicate);
    }

    static any(): RowPredicate {
        return new RowPredicate(() => true);
    }

    static none(): RowPredicate {
        return new RowPredicate(() => false);
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
