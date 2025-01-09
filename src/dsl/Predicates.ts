import { FlowPath, Row } from "~/dsl/Defines";
import { Value } from "~/graph/values/Value";
import { CodeNode, FileNode, GraphNode } from "~/graph/Node";

/*
 * We need runtime type identification for predicates, so we
 * have to use class instead of type.
 */

export type ValuePredicateFn = (value: Value) => boolean;

export class ValuePredicate {
    test: ValuePredicateFn;

    constructor(test: ValuePredicateFn) {
        this.test = test;
    }

    static of(predicate: ValuePredicateFn): ValuePredicate {
        return new ValuePredicate(predicate);
    }

    static any(): ValuePredicate {
        return new ValuePredicate(() => true);
    }

    static none(): ValuePredicate {
        return new ValuePredicate(() => false);
    }
}

export type NodePredicateFn = (node: GraphNode) => boolean;

export class NodePredicate {
    test: NodePredicateFn;

    constructor(test: NodePredicateFn) {
        this.test = test;
    }

    static of(predicate: NodePredicateFn): NodePredicate {
        return new NodePredicate(predicate);
    }

    static any(): NodePredicate {
        return new NodePredicate(() => true);
    }

    static none(): NodePredicate {
        return new NodePredicate(() => false);
    }
}

export type FileNodePredicateFn = (node: FileNode) => boolean;

export class FileNodePredicate {
    test: FileNodePredicateFn;

    constructor(test: FileNodePredicateFn) {
        this.test = test;
    }

    static of(predicate: FileNodePredicateFn): FileNodePredicate {
        return new FileNodePredicate(predicate);
    }

    static any(): FileNodePredicate {
        return new FileNodePredicate(() => true);
    }

    static none(): FileNodePredicate {
        return new FileNodePredicate(() => false);
    }
}

export type CodeNodePredicateFn = (node: CodeNode) => boolean;

export class CodeNodePredicate {
    test: CodeNodePredicateFn;

    constructor(test: CodeNodePredicateFn) {
        this.test = test;
    }

    static of(predicate: CodeNodePredicateFn): CodeNodePredicate {
        return new CodeNodePredicate(predicate);
    }

    static any(): CodeNodePredicate {
        return new CodeNodePredicate(() => true);
    }

    static none(): CodeNodePredicate {
        return new CodeNodePredicate(() => false);
    }
}

export type RowPredicateFn = (row: Row) => boolean;

export class RowPredicate {
    test: RowPredicateFn;

    constructor(test: RowPredicateFn) {
        this.test = test;
    }

    static of(predicate: RowPredicateFn): RowPredicate {
        return new RowPredicate(predicate);
    }

    static any(): RowPredicate {
        return new RowPredicate(() => true);
    }

    static none(): RowPredicate {
        return new RowPredicate(() => false);
    }
}

export type FlowPredicateFn = (path: FlowPath) => boolean;

export class FlowPredicate {
    test: FlowPredicateFn;

    constructor(test: FlowPredicateFn) {
        this.test = test;
    }

    static of(predicate: FlowPredicateFn): FlowPredicate {
        return new FlowPredicate(predicate);
    }

    static any(): FlowPredicate {
        return new FlowPredicate(() => true);
    }

    static none(): FlowPredicate {
        return new FlowPredicate(() => false);
    }
}
