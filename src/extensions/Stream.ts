import { ArrayIterableIterator } from "~/extensions/Iterator";

export class Stream<T> {
    private stream: IterableIterator<T>;

    constructor(stream: IterableIterator<T>) {
        this.stream = stream;
    }

    forEach(callback: (value: T) => void): void {
        for (const value of this.stream) {
            callback(value);
        }
    }

    filter(predicate: (value: T) => boolean): Stream<T> {
        const filtered = [];
        for (const value of this.stream) {
            if (predicate(value)) {
                filtered.push(value);
            }
        }
        return new Stream(new ArrayIterableIterator(filtered));
    }

    map<U>(callback: (value: T) => U): Stream<U> {
        const mapped = [];
        for (const value of this.stream) {
            mapped.push(callback(value));
        }
        return new Stream(new ArrayIterableIterator(mapped));
    }

    any(predicate: (value: T) => boolean): boolean {
        for (const value of this.stream) {
            if (predicate(value)) {
                return true;
            }
        }
        return false;
    }

    none(predicate: (value: T) => boolean): boolean {
        for (const value of this.stream) {
            if (predicate(value)) {
                return false;
            }
        }
        return true;
    }
}
