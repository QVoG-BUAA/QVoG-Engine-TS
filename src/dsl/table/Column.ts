import { Value } from '~/graph/Value';
import { ValuePredicate } from '~/dsl/Predicates';
import { ArrayIterator } from '~/extensions/Iterator';

type Index = Map<number, number>;

export function valueIndex(value: Value): number {
    return value.id;
}

/**
 * Represents a column in a table.
 *
 * @category DSL Data
 */
export abstract class Column {
    protected name: string;
    protected size: number;

    constructor(name: string) {
        this.name = name;
        this.size = 0;
    }

    /**
     * Get the name of the column.
     *
     * @returns The name.
     */
    getName(): string {
        return this.name;
    }

    /**
     * Get the size of the column.
     *
     * > [!WARNING]
     * > If the column is a {@link PredicateColumn | `PredicateColumn`}, then the
     * > size is always -1.
     *
     * @returns The size of the column.
     */
    getSize(): number {
        return this.size;
    }

    /**
     * Predicate column has size of -1, so it is safe to use
     * this method to check if the column is empty.
     *
     * @returns `true` if the column is empty, `false` otherwise.
     */
    isEmpty(): boolean {
        return this.size === 0;
    }

    /**
     * Clear the column.
     */
    abstract clear(): void;

    /**
     * Check if the column has an index.
     *
     * @returns `true` if the column has an index, `false` otherwise.
     */
    hasIndex(): boolean {
        return false;
    }

    /**
     * Add a value to the column.
     *
     * @param value Value to add.
     */
    abstract addValue(value: any): void;

    /**
     * Add multiple values to the column.
     *
     * @param values Values to add.
     */
    addValues(values: any[]): void {
        for (const value of values) {
            this.addValue(value);
        }
    }

    /**
     * Get the value at the specified row index.
     *
     * @param index Index of the value to get.
     */
    abstract getValue(index: number): any;

    /**
     * Get the value with index key if it supports index.
     *
     * @param key The index key.
     * @throws Error if the column does not support index.
     */
    getValueWithKey(key: number): any | undefined {
        throw new Error('Method not implemented');
    }

    /**
     * Check if the column contains the specified value.
     *
     * @param value The value to check.
     */
    abstract containsValue(value: any): boolean;

    /**
     * Check if the column contains the specified key if it supports index.
     *
     * @param key The index key.
     * @throws Error if the column does not support index.
     */
    containsKey(key: number): boolean {
        throw new Error('Method not implemented');
    }

    /**
     * Duplicate the column.
     *
     * This is useful when you want to create a copy of the column.
     * If `schemaOnly` is true, only the schema of the column is duplicated, that
     * is to say, index function is copied but not the data.
     *
     * @param schemaOnly Whether to duplicate only the schema.
     */
    abstract duplicate(schemaOnly: boolean): Column;

    [Symbol.iterator](): Iterator<any> {
        return this.iterator();
    }

    /**
     * Get an iterator to iterate over the values in the column.
     */
    abstract iterator(): Iterator<any>;
}

/**
 * Column that contains {@link Value | `Value`} objects.
 *
 * @category DSL Data
 */
export class DataColumn extends Column {
    private values: Value[] = [];
    private index?: Index;

    constructor(name: string, enableIndex: boolean = false) {
        super(name);
        if (enableIndex) {
            this.index = new Map();
        }
    }

    /**
     * @inheritdoc
     */
    clear(): void {
        this.values = [];
        this.size = 0;
        if (this.index) {
            this.index.clear();
        }
    }

    /**
     * @inheritdoc
     */
    hasIndex(): boolean {
        return this.index !== undefined;
    }

    /**
     * @inheritdoc
     */
    addValue(value: Value): void {
        if (this.index && value != null) {
            this.index.set(valueIndex(value), this.size);
        }
        this.values.push(value);
        this.size++;
    }

    /**
     * @inheritdoc
     */
    getValue(index: number): Value {
        return this.values[index];
    }

    /**
     * @inheritdoc
     */
    getValueWithKey(index: number): Value | undefined {
        if (!this.index) {
            throw new Error('Index not available');
        }
        const i = this.index.get(index);
        if (i !== undefined) {
            return this.values[i];
        }
        return undefined;
    }

    /**
     * @inheritdoc
     */
    containsValue(value: any): boolean {
        if (this.index && value != null) {
            return this.containsKey(valueIndex(value));
        }
        return this.values.includes(value);
    }

    /**
     * @inheritdoc
     */
    containsKey(key: number): boolean {
        if (!this.index) {
            throw new Error('Index not available');
        }
        return this.index.has(key);
    }

    /**
     * @inheritdoc
     */
    duplicate(schemaOnly: boolean): DataColumn {
        const column = new DataColumn(this.name);
        if (!schemaOnly) {
            column.addValues(this.values);
        }
        return column;
    }

    /**
     * @inheritdoc
     */
    iterator(): Iterator<Value> {
        return new ArrayIterator<Value>(this.values);
    }
}

/**
 * Column that only contains the predicate for its values.
 *
 * This can be useful when there are too many values satisfying the predicate, but
 * you only need to know if they are present in the column or not.
 *
 * @category DSL Data
 */
export class PredicateColumn extends Column {
    private predicate: ValuePredicate;

    constructor(name: string, predicate: ValuePredicate) {
        super(name);
        this.predicate = predicate;
        this.size = -1; // differentiate from data column
    }

    /**
     * Clear predicate column does nothing.
     */
    clear(): void {
        // Do nothing
    }

    /**
     * You cannot add value to a predicate column.
     *
     * @throws Error Method not supported.
     */
    addValue(value: any): void {
        throw new Error('Method not supported');
    }

    /**
     * You cannot get value from a predicate column.
     *
     * @throws Error Method not supported.
     */
    getValue(index: number): any {
        throw new Error('Method not supported');
    }

    /**
     * @inheritdoc
     */
    containsValue(value: any): boolean {
        return this.predicate.test(value);
    }

    /**
     * @inheritdoc
     */
    duplicate(schemaOnly: boolean): PredicateColumn {
        return new PredicateColumn(this.name, this.predicate);
    }

    /**
     * You cannot iterate over a predicate column.
     *
     * @throws Error Method not supported.
     */
    iterator(): Iterator<any> {
        throw new Error('Method not supported');
    }
}

/**
 * A column that can contain any type of value.
 *
 * @category DSL Data
 */
export class AnyColumn extends Column {
    private values: any[] = [];

    /**
     * @inheritdoc
     */
    clear(): void {
        this.values = [];
        this.size = 0;
    }

    /**
     * @inheritdoc
     */
    addValue(value: any): void {
        this.values.push(value);
        this.size++;
    }

    /**
     * @inheritdoc
     */
    getValue(index: number): any {
        return this.values[index];
    }

    /**
     * @inheritdoc
     */
    containsValue(value: string): boolean {
        return this.values.includes(value);
    }

    /**
     * @inheritdoc
     */
    duplicate(schemaOnly: boolean): AnyColumn {
        const column = new AnyColumn(this.name);
        if (!schemaOnly) {
            column.addValues(this.values);
        }
        return column;
    }

    /**
     * @inheritdoc
     */
    iterator(): Iterator<any> {
        return new ArrayIterator<any>(this.values);
    }
}
