import { Value } from '~/graph/Value';
import { FlowPath, Row } from '~/dsl/Defines';
import { CodeNode, FileNode, GraphNode } from '~/graph/Node';

/**
 * A predicate that tests a {@link Value | `Value`}.
 * 
 * This function type declaration makes functional programming easier.
 * 
 * @category Predicates
 */
export type ValuePredicateFn = (value: Value) => boolean;

/**
 * Class wrapper for {@link ValuePredicateFn | `ValuePredicateFn`} to provide
 * runtime type identification.
 * 
 * @category Predicates
 */
export class ValuePredicate {
    test: ValuePredicateFn;

    constructor(test: ValuePredicateFn) {
        this.test = test;
    }

    /**
     * Builder method from a predicate function.
     */
    static of(predicate: ValuePredicateFn): ValuePredicate {
        return new ValuePredicate(predicate);
    }

    /**
     * Get a predicate that always returns `true`.
     * 
     * @returns A predicate that always returns `true`.
     */
    static any(): ValuePredicate {
        return new ValuePredicate(() => true);
    }

    /**
     * Get a predicate that always returns `false`.
     * 
     * @returns A predicate that always returns `false`.
     */
    static none(): ValuePredicate {
        return new ValuePredicate(() => false);
    }
}

/**
 * A predicate that tests a {@link GraphNode | `GraphNode`}.
 * 
 * @category Predicates
 */
export type NodePredicateFn = (node: GraphNode) => boolean;

/**
 * Class wrapper for {@link NodePredicateFn | `NodePredicateFn`} to provide
 * runtime type identification.
 * 
 * @category Predicates
 */
export class NodePredicate {
    test: NodePredicateFn;

    constructor(test: NodePredicateFn) {
        this.test = test;
    }

    /**
     * @inheritDoc ValuePredicate.of
     */
    static of(predicate: NodePredicateFn): NodePredicate {
        return new NodePredicate(predicate);
    }

    /**
     * @inheritDoc ValuePredicate.any
     */
    static any(): NodePredicate {
        return new NodePredicate(() => true);
    }

    /**
     * @inheritDoc ValuePredicate.none
     */
    static none(): NodePredicate {
        return new NodePredicate(() => false);
    }
}

/**
 * A predicate that tests a {@link FileNode | `FileNode`}.
 * 
 * @category Predicates
 */
export type FileNodePredicateFn = (node: FileNode) => boolean;

/**
 * Class wrapper for {@link FileNodePredicateFn | `FileNodePredicateFn`} to
 * provide runtime type identification.
 * 
 * @category Predicates
 */
export class FileNodePredicate {
    test: FileNodePredicateFn;

    constructor(test: FileNodePredicateFn) {
        this.test = test;
    }

    /**
     * @inheritDoc ValuePredicate.of
     */
    static of(predicate: FileNodePredicateFn): FileNodePredicate {
        return new FileNodePredicate(predicate);
    }

    /**
     * @inheritDoc ValuePredicate.any
     */
    static any(): FileNodePredicate {
        return new FileNodePredicate(() => true);
    }

    /**
     * @inheritDoc ValuePredicate.none
     */
    static none(): FileNodePredicate {
        return new FileNodePredicate(() => false);
    }
}

/**
 * A predicate that tests a {@link CodeNode | `CodeNode`}.
 * 
 * @category Predicates
 */
export type CodeNodePredicateFn = (node: CodeNode) => boolean;

/**
 * Class wrapper for {@link CodeNodePredicateFn | `CodeNodePredicateFn`} to
 * provide runtime type identification.
 * 
 * @category Predicates
 */
export class CodeNodePredicate {
    test: CodeNodePredicateFn;

    constructor(test: CodeNodePredicateFn) {
        this.test = test;
    }

    /**
     * @inheritDoc ValuePredicate.of
     */
    static of(predicate: CodeNodePredicateFn): CodeNodePredicate {
        return new CodeNodePredicate(predicate);
    }

    /**
     * @inheritDoc ValuePredicate.any
     */
    static any(): CodeNodePredicate {
        return new CodeNodePredicate(() => true);
    }

    /**
     * @inheritDoc ValuePredicate.none
     */
    static none(): CodeNodePredicate {
        return new CodeNodePredicate(() => false);
    }
}

/**
 * A predicate that tests a {@link Row | `Row`}.
 * 
 * @category Predicates
 */
export type RowPredicateFn = (row: Row) => boolean;

/**
 * Class wrapper for {@link RowPredicateFn | `RowPredicateFn`} to provide
 * runtime type identification.
 * 
 * @category Predicates
 */
export class RowPredicate {
    test: RowPredicateFn;

    constructor(test: RowPredicateFn) {
        this.test = test;
    }

    /**
     * @inheritDoc ValuePredicate.of
     */
    static of(predicate: RowPredicateFn): RowPredicate {
        return new RowPredicate(predicate);
    }

    /**
     * @inheritDoc ValuePredicate.any
     */
    static any(): RowPredicate {
        return new RowPredicate(() => true);
    }

    /**
     * @inheritDoc ValuePredicate.none
     */
    static none(): RowPredicate {
        return new RowPredicate(() => false);
    }
}

/**
 * A predicate that tests a {@link FlowPath | `FlowPath`}.
 * 
 * @category Predicates
 */
export type FlowPredicateFn = (path: FlowPath) => boolean;

/**
 * Class wrapper for {@link FlowPredicateFn | `FlowPredicateFn`} to provide
 * runtime type identification.
 * 
 * @category Predicates
 */
export class FlowPredicate {
    test: FlowPredicateFn;

    constructor(test: FlowPredicateFn) {
        this.test = test;
    }

    /**
     * @inheritDoc ValuePredicate.of
     */
    static of(predicate: FlowPredicateFn): FlowPredicate {
        return new FlowPredicate(predicate);
    }

    /**
     * @inheritDoc ValuePredicate.any
     */
    static any(): FlowPredicate {
        return new FlowPredicate(() => true);
    }

    /**
     * @inheritDoc ValuePredicate.none
     */
    static none(): FlowPredicate {
        return new FlowPredicate(() => false);
    }
}
