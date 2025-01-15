import { Edge } from "~/db/gremlin/Defines";
import { Value } from "~/graph/Value";
import { Configuration } from "~/Configuration";
import { CodeNode, FileNode } from "~/graph/Node";
import { ArrayIterator } from "~/extensions/Iterator";

export type Row = Map<string, any>;
export type RowWithoutHeader = Array<any>;

export type FlowStep = [Value, Edge];
export type OptionalFlowStep = [Value, Edge?];

export class FlowStream {
    private stream: OptionalFlowStep[];

    constructor(stream?: OptionalFlowStep[]) {
        this.stream = stream ? [...stream] : [];
    }

    getSize(): number {
        return this.stream.length;
    }

    add(step: OptionalFlowStep) {
        this.stream.push(step);
    }

    toString(): string {
        const context = Configuration.getContext();
        let result = "";
        let first = true;
        for (const [value, _] of this) {
            const node = context.getNode(value);
            let text: string;
            if (node instanceof CodeNode) {
                text = node.getProperty().lineno.toString();
            } else if (node instanceof FileNode) {
                text = node.getProperty().path;
            } else {
                throw new Error("Unexpected node type");
            }
            if (first) {
                result += text;
                first = false;
            } else {
                result += " -> " + text;
            }
        }
        return result;
    }

    [Symbol.iterator](): Iterator<OptionalFlowStep> {
        return this.iterator();
    }

    iterator(): Iterator<OptionalFlowStep> {
        return new ArrayIterator(this.stream);
    }
}

export class FlowPath {
    private path: Value[];

    constructor(path?: Value[]) {
        this.path = path ? [...path] : [];
    }

    getSize(): number {
        return this.path.length;
    }

    add(step: Value) {
        this.path.push(step);
    }

    getPath(): Value[] {
        return this.path;
    }

    clone(): FlowPath {
        return new FlowPath(this.path);
    }

    toString(): string {
        const context = Configuration.getContext();
        let result = "";
        let first = true;
        for (const value of this) {
            const node = context.getNode(value);
            let text: string;
            if (node instanceof CodeNode) {
                text = node.getProperty().lineno.toString();
            } else if (node instanceof FileNode) {
                text = node.getProperty().path;
            } else {
                throw new Error("Unexpected node type");
            }
            if (first) {
                result += text;
                first = false;
            } else {
                result += " -> " + text;
            }
        }
        return result;
    }

    [Symbol.iterator](): Iterator<Value> {
        return this.iterator();
    }

    iterator(): Iterator<Value> {
        return new ArrayIterator(this.path);
    }
}
