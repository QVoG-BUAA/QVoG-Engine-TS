import { Column } from "~/dsl/table/Column";
import { Row, RowWithoutHeader } from "~/dsl/Defines";

/**
 * A table is a collection of columns.
 * 
 * @category DSL Data
 */
export class Table {
    private name: string;
    private size: number;
    private columns: Array<Column> = [];

    constructor(name: string) {
        this.name = name;
        this.size = 0;
    }

    /**
     * Get the name of the table.
     * 
     * @returns The name of the table.
     */
    getName(): string {
        return this.name;
    }

    /**
     * > [!WARNING]
     * > If the table contains predicate column, then this size is invalid.
     * 
     * @returns The size of the table, i.e. the number of rows.
     */
    getSize(): number {
        return this.size;
    }

    /**
     * Clear the table.
     */
    clear(): void {
        this.size = 0;
    }

    /**
     * Add a column to the table.
     * 
     * If the size of the column is not equal to the size of the table, then the
     * default value is used to fill the column or the table, so that the table
     * ends up with the maximum size of all columns.
     * 
     * @param column Column to add.
     * @param defaultValue Default value to fill the column.
     */
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

    /**
     * Remove a column from the table.
     * 
     * @param name The name of the column to remove.
     */
    removeColumn(name: string): void {
        this.columns = this.columns.filter(column => column.getName() !== name);
    }

    /**
     * Get a column from the table.
     * 
     * @param name The name of the column to get.
     * @returns The column with the given name.
     */
    getColumn(name: string): Column {
        const column = this.columns.find(column => column.getName() === name);
        if (!column) {
            throw new Error(`Column with name "${name}" does not exist`);
        }
        return column;
    }

    /**
     * Check if the table has a column with the given name.
     * 
     * @param name The name of the column to check.
     * @returns `true` if the table has a column with the given name, `false` otherwise.
     */
    hasColumn(name: string): boolean {
        return this.columns.some(column => column.getName() === name);
    }

    /**
     * Add a row to the table.
     * 
     * If the column is missing in the row, then the `null` value is used.
     * If the row has more columns than the table, then the extra columns are ignored.
     * 
     * @param row Row to add.
     */
    addRow(row: Row): void {
        for (const column of this.columns) {
            column.addValue(row.get(column.getName()) || null);
        }
        this.size++;
    }

    /**
     * Get a row from the table.
     * 
     * @param index Row index.
     * @returns The row at the given index.
     */
    getRow(index: number): Row {
        const row = new Map();
        for (const column of this.columns) {
            row.set(column.getName(), column.getValue(index));
        }
        return row;
    }

    /**
     * Get the headers of the table.
     * 
     * @returns The headers.
     */
    getHeaders(): string[] {
        return this.columns.map(column => column.getName());
    }

    /**
     * Get a row from the table without the header.
     * 
     * Use this only if you know the order of the columns.
     * 
     * @param index Row index.
     * @returns Row without the header at the given index.
     */
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

    /**
     * Get an iterator to iterate over the rows in the table.
     * 
     * @returns The iterator.
     */
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

    /**
     * Get an iterator to iterate over the rows in the table without the header.
     * 
     * @returns The iterator.
     */
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

    /**
     * Duplicate the table.
     * 
     * It calls the {@link Column.duplicate | `Column.duplicate`} method on each column
     * to duplicate the entire table.
     * 
     * @param schemaOnly If true, only the schema is duplicated.
     * @returns The duplicated table.
     */
    duplicate(schemaOnly: boolean = true): Table {
        const table = new Table(this.name);
        for (const column of this.columns) {
            table.addColumn(column.duplicate(schemaOnly));
        }
        return table;
    }

    /**
     * If the table contains exactly one column, then it returns that column.
     * 
     * @returns The table as a column.
     */
    asColumn(): Column {
        if (this.columns.length !== 1) {
            throw new Error("Table must contain exactly one column");
        }
        return this.columns[0];
    }
}

/**
 * A set of tables.
 * 
 * Every call to {@link QueryDescriptor.from | `from`} will create a new table, so
 * you will end up with a set of tables. It is managed automatically by 
 * {@link QueryDescriptor}, so you don't need to worry about it.
 * 
 * @category DSL Data
 */
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