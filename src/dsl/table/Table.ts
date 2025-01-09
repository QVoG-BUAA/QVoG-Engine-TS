import { Column } from "~/dsl/table/Column";
import { Row, RowWithoutHeader } from "~/dsl/Defines";

export class Table {
    private name: string;
    private size: number;
    private columns: Array<Column> = [];

    constructor(name: string) {
        this.name = name;
        this.size = 0;
    }

    getName(): string {
        return this.name;
    }

    /**
     * @warning If the table contains predicate column, then this size
     * is invalid.
     */
    getSize(): number {
        return this.size;
    }

    clear(): void {
        this.size = 0;
    }

    addColumn(column: Column, defaultValue: any = null): void {
        if (this.columns.length === 0) {
            this.columns.push(column);
            this.size = column.getSize();
            return;
        }

        if (this.hasColumn(column.getName())) {
            throw new Error(`Column with name "${column.getName()}" already exists`);
        }

        const newSize = Math.max(this.size, column.getSize());
        if (column.getSize() < newSize) {
            column.addValues(Array(newSize - column.getSize()).fill(defaultValue));
        }
        if (this.size < newSize) {
            this.columns.forEach(column => {
                column.addValues(Array(newSize - column.getSize()).fill(defaultValue));
            });
        }
        this.size = newSize;

        this.columns.push(column);
    }

    removeColumn(name: string): void {
        this.columns = this.columns.filter(column => column.getName() !== name);
    }

    getColumn(name: string): Column {
        const column = this.columns.find(column => column.getName() === name);
        if (!column) {
            throw new Error(`Column with name "${name}" does not exist`);
        }
        return column;
    }

    hasColumn(name: string): boolean {
        return this.columns.some(column => column.getName() === name);
    }

    addRow(row: Row): void {
        for (const column of this.columns) {
            column.addValue(row.get(column.getName()) || null);
        }
        this.size++;
    }

    getRow(index: number): Row {
        const row = new Map();
        for (const column of this.columns) {
            row.set(column.getName(), column.getValue(index));
        }
        return row;
    }

    getHeaders(): string[] {
        return this.columns.map(column => column.getName());
    }

    getRowWithoutHeader(index: number): RowWithoutHeader {
        const row = [];
        for (const column of this.columns) {
            row.push(column.getValue(index));
        }
        return row;
    }

    [Symbol.iterator](): Iterator<Row> {
        return this.iterator();
    }

    iterator(): Iterator<Row> {
        let index = 0;
        return {
            next: () => {
                if (index < this.size) {
                    return { value: this.getRow(index++), done: false };
                }
                return { value: null, done: true };
            }
        };
    }

    iteratorWithoutHeader(): Iterator<RowWithoutHeader> {
        let index = 0;
        return {
            next: () => {
                if (index < this.size) {
                    return { value: this.getRowWithoutHeader(index++), done: false };
                }
                return { value: null, done: true };
            }
        };
    }

    duplicate(schemaOnly: boolean = true): Table {
        const table = new Table(this.name);
        for (const column of this.columns) {
            table.addColumn(column.duplicate(schemaOnly));
        }
        return table;
    }

    asColumn(): Column {
        if (this.columns.length !== 1) {
            throw new Error("Table must contain exactly one column");
        }
        return this.columns[0];
    }
}

export class TableSet {
    private tables: Map<string, Table> = new Map();

    getSize(): number {
        return this.tables.size;
    }

    addTable(table: Table): void {
        if (this.tables.has(table.getName())) {
            throw new Error(`Table with name "${table.getName()}" already exists`);
        }
        this.tables.set(table.getName(), table);
    }

    removeTable(name: string): Table {
        const table = this.tables.get(name);
        if (!table) {
            throw new Error(`Table with name "${name}" does not exist`);
        }
        this.tables.delete(name);
        return table;
    }

    getTable(name: string): Table {
        const table = this.tables.get(name);
        if (!table) {
            throw new Error(`Table with name "${name}" does not exist`);
        }
        return table;
    }

    hasTable(name: string): boolean {
        return this.tables.has(name);
    }

    asTable(): Table {
        if (this.tables.size !== 1) {
            throw new Error("Table set must contain exactly one table");
        }
        return this.tables.values().next().value!;
    }
}