import { AstJson } from '~/graph/Defines';

/**
 * Base class for all types.
 *
 * @category Graph
 */
export abstract class Type {
    private _identifier: string;
    private _name: string;
    private _supported: boolean;

    /**
     * Note that some types may not have a name, i.e. array, tuple, etc.
     * Some hard-coded name may be assigned to them.
     *
     * @param identifier The syntax component identifier, i.e. NumberType.
     * @param name The lexeme name of the type, i.e. int, number, string.
     * @param supported Whether this type is supported by the current implementation.
     */
    constructor(identifier: string, name: string = '', supported: boolean = true) {
        this._identifier = identifier;
        this._name = name;
        this._supported = supported;
    }

    /**
     * The syntax component identifier, i.e. NumberType.
     *
     * @returns The identifier.
     */
    public get identifier(): string {
        return this._identifier;
    }

    /**
     * The lexeme name of the type, i.e. int, number, string.
     *
     * @returns The name.
     */
    public get name(): string {
        return this._name;
    }

    /**
     * Whether this type is supported by the current implementation.
     * Usually, only {@link InvalidType | `InvalidType`} should be marked as unsupported.
     *
     * @returns Whether the type is supported.
     */
    public get supported(): boolean {
        return this._supported;
    }
}

/**
 * Represents an invalid type that cannot be parsed from AST.
 *
 * @category Graph
 */
export class InvalidType extends Type {
    constructor(identifier: string = 'invalid', name: string = 'invalid') {
        super(identifier, name, false);
    }

    /**
     * A factory method to create an instance of InvalidType.
     *
     * @param spec Identifier or the AST json.
     * @returns An instance of InvalidType.
     */
    static get(spec: string | AstJson): InvalidType {
        if (typeof spec === 'string') {
            return new InvalidType(spec);
        } else {
            return new InvalidType(spec._identifier);
        }
    }
}
