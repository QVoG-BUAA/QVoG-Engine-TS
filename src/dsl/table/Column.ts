import { Value } from "~/graph/values/Value";
import { ValuePredicate } from "~/dsl/Defines";
import { ArrayIterator } from "~/extensions/Iterator";

type Index = Map<number, number>;

export function valueIndex(value: Value): number {
    return value.getId();
}

export abstract class Column {
    protected name: string;
    protected size: number;

    constructor(name: string) {
        this.name = name;
        this.size = 0;
    }

    getName(): string {
        return this.name;
    }

    getSize(): number {
        return this.size;
    }

    isEmpty(): boolean {
        return this.size === 0;
    }

    abstract clear(): void;

    hasIndex(): boolean {
        return false;
    }

    abstract addValue(value: any): void;

    addValues(values: any[]): void {
        for (const value of values) {
            this.addValue(value);
        }
    }

    abstract getValue(index: number): any;

    getValueWithKey(index: number): any | undefined {
        throw new Error("Method not implemented");
    }

    abstract containsValue(value: any): boolean;

    containsKey(key: number): boolean {
        throw new Error("Method not implemented");
    }

    abstract duplicate(schemaOnly: boolean): Column;

    abstract iterator(): Iterator<any>;
}

export class DataColumn extends Column {
    private values: Value[] = [];
    private index?: Index;

    constructor(name: string, enableIndex: boolean = false) {
        super(name);
        if (enableIndex) {
            this.index = new Map();
        }
    }

    clear(): void {
        this.values = [];
        this.size = 0;
        if (this.index) {
            this.index.clear();
        }
    }

    hasIndex(): boolean {
        return this.index !== undefined;
    }

    addValue(value: Value): void {
        if (this.index && value != null) {
            this.index.set(valueIndex(value), this.size);
        }
        this.values.push(value);
        this.size++;
    }

    getValue(index: number): Value {
        return this.values[index];
    }

    getValueWithKey(index: number): Value | undefined {
        if (!this.index) {
            throw new Error("Index not available");
        }
        const i = this.index.get(index);
        if (i !== undefined) {
            return this.values[i];
        }
        return undefined;
    }

    containsValue(value: any): boolean {
        return this.values.includes(value);
    }

    containsKey(key: number): boolean {
        if (!this.index) {
            throw new Error("Index not available");
        }
        return this.index.has(key);
    }

    duplicate(schemaOnly: boolean): DataColumn {
        let column = new DataColumn(this.name);
        if (!schemaOnly) {
            column.addValues(this.values);
        }
        return column;
    }

    iterator(): Iterator<Value> {
        return new ArrayIterator<Value>(this.values);
    }
}

export class PredicateColumn extends Column {
    private predicate: ValuePredicate;

    constructor(name: string, predicate: ValuePredicate) {
        super(name);
        this.predicate = predicate;
    }

    clear(): void {
        // Do nothing
    }

    addValue(value: any): void {
        throw new Error("Method not supported");
    }

    getValue(index: number) {
        throw new Error("Method not supported");
    }

    containsValue(value: any): boolean {
        return this.predicate(value);
    }

    duplicate(schemaOnly: boolean): PredicateColumn {
        return new PredicateColumn(this.name, this.predicate);
    }

    iterator(): Iterator<any> {
        throw new Error("Method not supported");
    }
}

export class TextColumn extends Column {
    private values: string[] = [];

    clear(): void {
        this.values = [];
        this.size = 0;
    }

    addValue(value: string): void {
        this.values.push(value);
        this.size++;
    }

    getValue(index: number) {
        return this.values[index];
    }

    containsValue(value: string): boolean {
        return this.values.includes(value);
    }

    duplicate(schemaOnly: boolean): TextColumn {
        let column = new TextColumn(this.name);
        if (!schemaOnly) {
            column.addValues(this.values);
        }
        return column;
    }

    iterator(): Iterator<string> {
        return new ArrayIterator<string>(this.values);
    }
}
