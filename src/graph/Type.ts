import { AstJson } from './Defines';

/**
 * Base class for all types.
 * 
 * @category Graph
 */
export abstract class Type {
    private identifier: string;
    private name: string;
    private supported: boolean;

    constructor(identifier: string, name: string, supported: boolean = true) {
        this.identifier = identifier;
        this.name = name;
        this.supported = supported;
    }

    /**
     * The syntax component identifier, i.e. NumberType.
     * 
     * @returns The identifier.
     */
    getIdentifier(): string {
        return this.identifier;
    }

    /**
     * The lexeme name of the type, i.e. int, number, string.
     * 
     * @returns The name.
     */
    getName(): string {
        return this.name;
    }

    /**
     * Whether this type is supported by the current implementation.
     * Usually, only {@link InvalidType | `InvalidType`} should be marked as unsupported.
     * 
     * @returns Whether the type is supported.
     */
    isSupported(): boolean {
        return this.supported;
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
