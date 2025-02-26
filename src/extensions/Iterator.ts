/**
 * Iterator for an array.
 * 
 * @category Extension
 */
export class ArrayIterator<T> implements Iterator<T> {
    private array: T[];
    private index: number;

    constructor(array: T[]) {
        this.array = array;
        this.index = 0;
    }

    next(): IteratorResult<T> {
        if (this.index < this.array.length) {
            return {
                done: false,
                value: this.array[this.index++]
            };
        } else {
            return {
                done: true,
                value: null
            };
        }
    }
}

/**
 * Iterable iterator for an array.
 * 
 * @category Extension
 */
export class ArrayIterableIterator<T> implements IterableIterator<T> {
    private array: T[];
    private index: number;

    constructor(array: T[]) {
        this.array = array;
        this.index = 0;
    }

    next(): IteratorResult<T> {
        if (this.index < this.array.length) {
            return {
                done: false,
                value: this.array[this.index++]
            };
        } else {
            return {
                done: true,
                value: null
            };
        }
    }

    [Symbol.iterator](): IterableIterator<T> {
        return this;
    }
}
