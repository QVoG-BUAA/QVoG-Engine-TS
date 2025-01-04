import { AstJson } from "~/graph/Defines";
import { Value, UnknownValue } from "~/graph/values/Value";

export interface ILanguageRule<TValue extends Value> {
    /**
     * Types of the AST node that this handler can build.
     * This is the `_type` field of the JSON AST object.
     */
    types: string | string[];

    build(json: AstJson, factory: ValueFactory): TValue;
}

export interface LanguageSpecification {
    rules: ILanguageRule<Value>[];
}

export class ValueFactory {
    private specification: LanguageSpecification;
    private defaultRule: ILanguageRule<Value> = {
        types: "",
        build(json: AstJson, factory: ValueFactory): Value {
            return new UnknownValue(json["_type"]);
        }
    };

    constructor(specification: LanguageSpecification) {
        this.specification = specification;
    }

    build<TValue extends Value, TDefault extends Value>(json: AstJson, defaultValue: TDefault): TValue | TDefault {
        const identifier = json["_type"];

        const rule = this.specification.rules.find(h => h.types.includes(identifier)) || this.defaultRule;
        const value = rule.build(json, this);
        if (!value) {
            return defaultValue;
        }

        return value as TValue;
    }
}
