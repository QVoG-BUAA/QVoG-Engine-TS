import { AstJson } from '~/graph/Defines';
import { InvalidType, Type } from '~/graph/Type';
import { InvalidValue, Value } from '~/graph/Value';

/**
 * Rule to build a value from the JSON AST.
 * 
 * @category Configuration
 */
export interface LanguageValueRule<TValue extends Value> {
    /**
     * Types of the AST node that this handler can build.
     * 
     * This filed is used to match the `_identifier` field of the JSON AST object.
     * Use an array to match multiple types if they can be handled by the same rule.
     * To provide a default rule, use "*", and place it at the end of the list.
     */
    types: string | string[];

    /**
     * Build the value from the JSON AST.
     * 
     * Since values can be nested, the factory is injected to build nested values.
     * 
     * @param json AST JSON object.
     * @param factory Parent factory.
     */
    build(json: AstJson, factory: ValueFactory): TValue;
}

/**
 * Rule to build a type from the JSON AST.
 * 
 * @category Configuration
 */
export interface LanguageTypeRule<TType extends Type> {
    /**
    * Types of the AST node that this handler can build.
    *
    * This filed is used to match the `_identifier` field of the JSON AST object.
    * Use an array to match multiple types if they can be handled by the same rule.
    * To provide a default rule, use "*", and place it at the end of the list.
    */
    types: string | string[];

    /**
     * Build the type from the JSON AST.
     * 
     * @param json Type JSON object.
     * @param factory Parent factory.
     */
    build(json: AstJson, factory: ValueFactory): TType;
}

/**
 * Each language can have its own specification to build values
 * and types from the JSON AST based on the language's AST structure.
 * 
 * @category Configuration
 */
export interface LanguageSpecification {
    /**
     * Rules to build values from the JSON AST.
     */
    valueRules: LanguageValueRule<Value>[];

    /**
     * Rules to build types from the JSON AST.
     */
    typeRules: LanguageTypeRule<Type>[];
}

/**
 * Factory to build values and types from the JSON AST based on the
 * given language specification, see {@link LanguageSpecification | `LanguageSpecification`}.
 * 
 * @category Graph
 */
export class ValueFactory {
    private specification: LanguageSpecification;

    private defaultValueRule: LanguageValueRule<Value> = {
        types: '',
        build(json: AstJson, factory: ValueFactory): Value {
            return InvalidValue.get(json);
        }
    };

    private defaultTypeRule: LanguageTypeRule<Type> = {
        types: '',
        build(json: AstJson, factory: ValueFactory): Type {
            return InvalidType.get(json);
        }
    };

    constructor(specification: LanguageSpecification) {
        this.specification = specification;
    }

    /**
     * Build a {@link Value | `Value`} instance from the JSON AST.
     * 
     * It searches for all the rules that can build the given AST node and uses
     * the first one that matches. If no rule is found, which means the AST node
     * is not supported, it will return an instance of {@link InvalidValue | `InvalidValue`}.
     * 
     * @typeParam TValue The type of the value to build.
     * @param json The JSON representation of the AST.
     * @returns The value instance built from the AST, or an instance of InvalidValue.
     */
    buildValue<TValue extends Value>(json: AstJson): TValue {
        const identifier = json._identifier;

        const rule = this.specification.valueRules.find(r => this.matchRule(r.types, identifier)) || this.defaultValueRule;
        const value = rule.build(json, this);
        if (!value) {
            return new InvalidValue(identifier) as TValue;
        }

        return value as TValue;
    }

    /**
     * Build a {@link Type | `Type`} from the JSON AST.
     * 
     * It searches for all the type rules that can build the given AST node and
     * uses the first one that matches. If no rule is found, which means the AST
     * node is not supported, it will return an instance of {@link InvalidType | `InvalidType`}.
     * 
     * @param json The JSON representation of the AST for the type.
     * @returns The type instance built from the AST, or an instance of InvalidType.
     */
    buildType<TType extends Type>(json: AstJson): TType {
        const identifier = json._identifier;

        const rule = this.specification.typeRules.find(r => this.matchRule(r.types, identifier)) || this.defaultTypeRule;
        const type = rule.build(json, this);
        if (!type) {
            return new InvalidType(identifier) as TType;
        }

        return type as TType;
    }

    private matchRule(types: string | string[], identifier: string): boolean {
        if (Array.isArray(types)) {
            return types.includes(identifier) || types.includes('*');
        }

        if (types === '*') {
            return true;
        }

        return types === identifier;
    }
}
