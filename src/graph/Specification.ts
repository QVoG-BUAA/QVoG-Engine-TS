import { AstJson } from "~/graph/Defines";
import { InvalidValue, Value } from "~/graph/Value";
import { InvalidType, Type } from "~/graph/Type";

export interface LanguageValueRule<TValue extends Value> {
    /**
     * Types of the AST node that this handler can build.
     * This is the `_type` field of the JSON AST object.
     */
    types: string | string[];

    build(json: AstJson, factory: ValueFactory): TValue;
}

export interface LanguageTypeRule<TType extends Type> {
    types: string | string[];
    build(json: AstJson, factory: ValueFactory): TType;
}

export interface LanguageSpecification {
    valueRules: LanguageValueRule<Value>[];
    typeRules: LanguageTypeRule<Type>[];
}

export class ValueFactory {
    private specification: LanguageSpecification;
    private defaultValueRule: LanguageValueRule<Value> = {
        types: "",
        build(json: AstJson, factory: ValueFactory): Value {
            return new InvalidValue(json["_type"]);
        }
    };
    private defaultTypeRule: LanguageTypeRule<Type> = {
        types: "",
        build(json: AstJson, factory: ValueFactory): Type {
            return new InvalidType();
        }
    };
    constructor(specification: LanguageSpecification) {
        this.specification = specification;
    }

    buildValue<TValue extends Value, TDefault extends Value>(json: AstJson, defaultValue: TDefault): TValue | TDefault {
        const identifier = json["_type"];

        const rule = this.specification.valueRules.find(h => h.types.includes(identifier)) || this.defaultValueRule;
        const value = rule.build(json, this);
        if (!value) {
            return defaultValue;
        }

        return value as TValue;
    }

    buildType<TType extends Type, TDefault extends Type>(json: AstJson, defaultType: TDefault): TType | TDefault {
        const rule = this.specification.typeRules.find(h => h.types.includes(json._type)) || this.defaultTypeRule;
        const type = rule.build(json, this);
        if (!type) {
            return defaultType;
        }

        return type as TType;
    }
}
