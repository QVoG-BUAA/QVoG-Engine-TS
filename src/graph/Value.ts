import { GraphNode } from "~/graph/Node";
import { Stream } from "~/extensions/Stream";
import { Configuration } from "~/Configuration";
import { InvalidType, Type } from "~/graph/Type";
import { AstJson } from "./Defines";

/**
 * Base class for all values.
 * 
 * @category Graph
 */
export abstract class Value {
    private id?: number;
    private identifier: string;
    private type: Type = new InvalidType();
    private supported: boolean;

    constructor(identifier: string, supported: boolean = true) {
        this.identifier = identifier;
        this.supported = supported;
    }

    /**
     * Value only represents the AST of the node in the database, use this 
     * method to get the complete node.
     * 
     * @returns The complete node in the graph database this value is associated with.
     */
    getNode(): GraphNode {
        return Configuration.getContext().getNode(this);
    }

    setId(id: number): void {
        this.id = id;
    }

    /**
    * Get the id of the vertex in the graph database this value represents.
    */
    getId(): number {
        if (!this.id) {
            throw new Error("Value id not available");
        }
        return this.id;
    }

    /**
     * The syntax component identifier, i.e. ArkAssignStmt.
     * 
     * @returns The identifier.
     */
    getIdentifier(): string {
        return this.identifier;
    }

    setType(type: Type): void {
        this.type = type;
    }

    /**
     * By default, the value has an invalid type, see `InvalidType`.
     * 
     * @returns The type of this value.
     */
    getType(): Type {
        return this.type;
    }

    /**
     * Values that cannot be parsed from AST will be marked as unsupported.
     * Usually, only `InvalidValue` should be marked as unsupported.
     * 
     * @returns Whether this value is supported by the current implementation.
     */
    isSupported(): boolean {
        return this.supported;
    }

    /**
     * This method is used to get the stream representation of this value.
     * It depends on the implementation of the `elements` method.
     * 
     * See `Stream` for stream operations.
     * 
     * @returns A stream of values.
     */
    stream(): Stream<Value> {
        return new Stream(this.elements());
    }

    /**
     * Implement this method to return all children of this value.
     */
    protected *elements(): IterableIterator<Value> {
        yield this;
    }
}

/**
 * Represents a value that could not be parsed from the AST.
 * 
 * @category Graph
 */
export class InvalidValue extends Value {
    constructor(identifier: string) {
        super(identifier, false);
    }

    /**
     * A factory method to create an instance of InvalidValue.
     * 
     * @param spec Identifier or the AST json.
     * @returns An instance of InvalidValue.
     */
    static get(spec: string | AstJson): InvalidValue {
        if (typeof spec === "string") {
            return new InvalidValue(spec);
        } else {
            return new InvalidValue(spec._identifier);
        }
    }
}
