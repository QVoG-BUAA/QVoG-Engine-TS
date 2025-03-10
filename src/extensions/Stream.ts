import { ArrayIterableIterator } from '~/extensions/Iterator';

/**
 * Enable stream-like API in TypeScript.
 * 
 * @typeParam T Type of the stream elements.
 * 
 * @category Extension
 */
export class Stream<T> {
    private stream: IterableIterator<T>;

    constructor(stream: IterableIterator<T>) {
        this.stream = stream;
    }

    /**
     * Perform an action on each element of the stream.
     * 
     * @param callback Action to perform on each element.
     */
    forEach(callback: (value: T) => void): void {
        for (const value of this.stream) {
            callback(value);
        }
    }

    /**
     * Filter elements of the stream.
     * 
     * @param predicate Predicate to filter elements.
     * @returns The filtered stream.
     */
    filter(predicate: (value: T) => boolean): Stream<T> {
        const filtered = [];
        for (const value of this.stream) {
            if (predicate(value)) {
                filtered.push(value);
            }
        }
        return new Stream(new ArrayIterableIterator(filtered));
    }

    /**
     * Map elements of the stream to another type.
     * 
     * @param callback Mapper function.
     * @returns Mapped stream.
     */
    map<U>(callback: (value: T) => U): Stream<U> {
        const mapped = [];
        for (const value of this.stream) {
            mapped.push(callback(value));
        }
        return new Stream(new ArrayIterableIterator(mapped));
    }

    /**
     * Check if at least one element satisfies the predicate.
     * 
     * @param predicate Predicate.
     * @returns `true` if at least one element satisfies the predicate, `false` otherwise.
     */
    any(predicate: (value: T) => boolean): boolean {
        for (const value of this.stream) {
            if (predicate(value)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if none of the elements satisfy the predicate.
     * 
     * @param predicate Predicate.
     * @returns `true` if none of the elements satisfy the predicate, `false` otherwise.
     */
    none(predicate: (value: T) => boolean): boolean {
        for (const value of this.stream) {
            if (predicate(value)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Return this stream as an iterable iterator.
     * 
     * This is used to enable the stream to be used in `for...of` loops.
     * 
     * @returns The stream as an iterable iterator.
     */
    [Symbol.iterator](): IterableIterator<T> {
        return this.stream;
    }
}
