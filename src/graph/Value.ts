import { CodeNode } from '~/graph/Node';
import { Stream } from '~/extensions/Stream';
import { Configuration } from '~/Configuration';
import { InvalidType, Type } from '~/graph/Type';
import { AstJson } from './Defines';

/**
 * Base class for all values.
 *
 * @category Graph
 */
export abstract class Value {
    private _id?: number;
    private _identifier: string;
    private _type: Type = new InvalidType();
    private _supported: boolean;

    constructor(identifier: string, supported: boolean = true) {
        this._identifier = identifier;
        this._supported = supported;
    }

    /**
     * Get the node in the graph database this value is associated with.
     *
     * Value only represents the AST of the node in the database, use this
     * method to get the complete node, see {@link CodeNode | `CodeNode`} for
     * more information.
     *
     * FIXME: All values should be associated with `CodeNode`, so no type check is
     * performed here.
     *
     * @returns The complete node in the graph database this value is associated with.
     */
    public get node(): CodeNode {
        return Configuration.getContext().getNode(this) as CodeNode;
    }

    /**
     * Get the original line of code in the source file.
     *
     * All values in one node share the same code.
     *
     * @returns The original
     */
    public get code(): string {
        return this.node.property.code;
    }

    /**
     * @internal
     */
    public set id(id: number) {
        this._id = id;
    }

    /**
     * Get the id of the vertex in the graph database this value represents.
     */
    public get id(): number {
        if (!this._id) {
            throw new Error('Value id not available');
        }
        return this._id;
    }

    /**
     * The syntax component identifier, i.e. ArkAssignStmt.
     *
     * @returns The identifier.
     */
    public get identifier(): string {
        return this._identifier;
    }

    public set type(type: Type) {
        this._type = type;
    }

    /**
     * By default, the value has an invalid type, see `InvalidType`.
     *
     * @returns The type of this value.
     */
    public get type(): Type {
        return this._type;
    }

    /**
     * Values that cannot be parsed from AST will be marked as unsupported.
     * Usually, only `InvalidValue` should be marked as unsupported.
     *
     * @returns Whether this value is supported by the current implementation.
     */
    public get supported(): boolean {
        return this._supported;
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
        if (typeof spec === 'string') {
            return new InvalidValue(spec);
        } else {
            return new InvalidValue(spec._identifier);
        }
    }
}
