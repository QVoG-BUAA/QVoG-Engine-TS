import { GraphNode } from "~/graph/Node";
import { Configuration } from "~/Configuration";
import { Stream } from "~/extensions/Stream";
import { InvalidType, Type } from "~/graph/Type";

export abstract class Value {
    private id?: number;

    /**
     * Every value should have a type, and we use `InvalidType` as the default.
     */
    private type: Type = new InvalidType();

    private identifier: string;
    private supported: boolean;

    constructor(identifier: string, supported: boolean = true) {
        this.identifier = identifier;
        this.supported = supported;
    }

    /**
     * This is an intrusive method that invokes a global call.
     */
    getNode(): GraphNode {
        return Configuration.getContext().getNode(this);
    }

    setId(id: number): void {
        this.id = id;
    }

    getId(): number {
        if (!this.id) {
            throw new Error("Value id not available");
        }
        return this.id;
    }

    setType(type: Type): void {
        this.type = type;
    }

    getType(): Type {
        return this.type;
    }

    getIdentifier(): string {
        return this.identifier;
    }

    isSupported(): boolean {
        return this.supported;
    }

    /**
     * This method is used to get the stream representation of this value.
     * It depends on the implementation of the `elements` method.
     */
    stream(): Stream<Value> {
        return new Stream(this.elements());
    }

    /**
     * Implement this method to return all children of this value.
     * @note Do not call this method directly, use the `stream` method instead.
     */
    *elements(): IterableIterator<Value> {
        yield this;
    }
}

export class InvalidValue extends Value {
    constructor(identifier: string) {
        super(identifier, false);
    }
}
