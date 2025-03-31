import { Value } from '~/graph/Value';
import { Edge } from '~/db/gremlin/Defines';
import { Configuration } from '~/Configuration';
import { CodeNode, FileNode } from '~/graph/Node';
import { ArrayIterator } from '~/extensions/Iterator';

/**
 * @category DSL Data
 */
export type Row = Map<string, any>;

/**
 * @category DSL Data
 */
export type RowWithoutHeader = Array<any>;

/**
 * @category DSL Data
 */
export type FlowStep = [Value, Edge];

/**
 * @category DSL Data
 */
export type OptionalFlowStep = [Value, Edge?];

/**
 * The flow used in flow action as intermediate data structure.
 *
 * @category DSL Data
 */
export class FlowStream {
    private stream: OptionalFlowStep[];

    constructor(stream?: OptionalFlowStep[]) {
        this.stream = stream ? [...stream] : [];
    }

    /**
     * Get the size of the flow, i.e. the number of steps.
     *
     * @returns The size of the flow.
     */
    getSize(): number {
        return this.stream.length;
    }

    /**
     * Add a step to the flow.
     *
     * @param step Step to add.
     */
    add(step: OptionalFlowStep): void {
        this.stream.push(step);
    }

    toString(): string {
        const context = Configuration.getContext();
        let result = '';
        let first = true;
        for (const [value, _] of this) {
            const node = context.getNode(value);
            let text: string;
            if (node instanceof CodeNode) {
                text = node.property.lineno.toString();
            } else if (node instanceof FileNode) {
                text = node.property.path;
            } else {
                throw new Error('Unexpected node type');
            }
            if (first) {
                result += text;
                first = false;
            } else {
                result += ' -> ' + text;
            }
        }
        return result;
    }

    [Symbol.iterator](): Iterator<OptionalFlowStep> {
        return this.iterator();
    }

    /**
     * Get the iterator to iterate over the steps in the flow.
     *
     * @returns The iterator.
     */
    iterator(): Iterator<OptionalFlowStep> {
        return new ArrayIterator(this.stream);
    }
}

/**
 * A flow of {@link Value | `Value`}.
 *
 * This is returned by the flow action as final representation of a flow
 * from the source to the sink.
 *
 * @category DSL Data
 */
export class FlowPath {
    private _path: Value[];

    constructor(path?: Value[]) {
        this._path = path ? [...path] : [];
    }

    /**
     * Get the size of the path, i.e. the number of steps.
     *
     * @returns The size.
     */
    public get size(): number {
        return this._path.length;
    }

    /**
     * Add a step to the path.
     * @param step Step to add.
     */
    add(step: Value): void {
        this._path.push(step);
    }

    /**
     * The path as an array of {@link Value | `Value`}.
     *
     * @returns The path.
     */
    public get path(): Value[] {
        return this._path;
    }

    /**
     * Duplicate the path.
     *
     * @returns A copy of the path.
     */
    clone(): FlowPath {
        return new FlowPath(this._path);
    }

    /**
     * Convert the path to a string.
     *
     * The string representation is as follows:
     *
     * ```
     * <lineno> -> <lineno> -> ...
     * ```
     *
     * @returns A string description of the path.
     */
    toString(): string {
        const context = Configuration.getContext();
        let result = '';
        let first = true;
        for (const value of this) {
            const node = context.getNode(value);
            let text: string;
            if (node instanceof CodeNode) {
                text = node.property.lineno.toString();
            } else if (node instanceof FileNode) {
                text = node.property.path;
            } else {
                throw new Error('Unexpected node type');
            }
            if (first) {
                result += text;
                first = false;
            } else {
                result += ' -> ' + text;
            }
        }
        return result;
    }

    [Symbol.iterator](): Iterator<Value> {
        return this.iterator();
    }

    /**
     * Get the iterator to iterate over the steps in the path.
     *
     * @returns The iterator.
     */
    iterator(): Iterator<Value> {
        return new ArrayIterator(this._path);
    }
}
