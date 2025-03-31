/**
 * This is a wrapper to build Query in a non-fluent way.
 */

import { Value } from '~/graph';
import { ValuePredicateFn } from '~/dsl/Predicates';
import { CurrentQueryContext } from '~/extensions/dsl/QueryContext';
import { IFlowDescriptorBuilder } from '~/dsl/fluent/FlowDescriptor';
import { FilterClause, FilterDescriptor } from '~/dsl/fluent/FilterDescriptor';
import { FromDescriptor, FromDescriptorBuilder } from '~/dsl/fluent/FromDescriptor';
import { InitialQuery, Query, Queryable, QueryDescriptor } from '~/dsl/fluent/QueryDescriptor';

/**
 * Construct a query in a non-fluent way.
 *
 * [!WARNING]
 * This is deprecated, as it breaks the type check and calling order that
 * the fluent API enforces.
 *
 * @param name Name of the query.
 * @param action Callback function to build the query.
 * @returns The query object {@link Queryable}.
 *
 * @category DSL API
 */
export function query(name: string, action: () => void): Queryable {
    const clause: Query = (q: InitialQuery) => {
        CurrentQueryContext.requireDescriptor(q as QueryDescriptor);
        action();
        CurrentQueryContext.releaseDescriptor();
        return q;
    };
    return [name, clause];
}

/**
 * The proper way to construct a query in a fluent way.
 *
 * This provides order guarantee and type check.
 *
 * @param name Name of the query.
 * @param query Fluent query.
 * @returns The query object {@link Queryable}.
 *
 * @category DSL API
 */
export function pattern(name: string, query: Query): Queryable {
    return [name, query];
}

function fromData(predicate: ValuePredicateFn, alias?: string): FromDescriptor {
    const f = new FromDescriptorBuilder();
    return f
        .withData((v: Value) => v.stream().any(predicate))
        .as(alias || randomString(8))
        .build();
}

function fromPredicate(predicate: ValuePredicateFn, alias?: string): FromDescriptor {
    const f = new FromDescriptorBuilder();
    return f
        .withPredicate((v: Value) => v.stream().any(predicate))
        .as(alias || randomString(8))
        .build();
}

/**
 * Define a collection of nodes.
 *
 * @see {@link QueryDescriptor.from}.
 *
 * @category DSL API
 */
export function nodes(predicate: ValuePredicateFn, alias?: string): string {
    const descriptor = CurrentQueryContext.descriptor as QueryDescriptor;
    descriptor.from(fromData(predicate, alias));
    return descriptor.getLastFromDescriptor()!.alias;
}

/**
 * Define a predicate for nodes.
 *
 * @see {@link QueryDescriptor.from}.
 *
 * @category DSL API
 */
export function predicate(predicate: ValuePredicateFn, alias?: string): string {
    const descriptor = CurrentQueryContext.descriptor as QueryDescriptor;
    descriptor.from(fromPredicate(predicate, alias));
    return descriptor.getLastFromDescriptor()!.alias;
}

/**
 * Construct a where clause in a non-fluent way.
 *
 * @see {@link QueryDescriptor.where}.
 */
export function where(param: FilterDescriptor | FilterClause): void {
    (CurrentQueryContext.descriptor as QueryDescriptor).where(param);
}

function randomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

/**
 * Construct exists clause in a non-fluent way.
 *
 * @see {@link QueryDescriptor.exists}.
 *
 * @param flow The flow class.
 * @param source Source table.
 * @param sink Sink table.
 * @param barrier Barrier table.
 * @param alias Alias for the flow.
 * @returns The alias of the flow.
 *
 * @category DSL API
 */
export function exists<T extends IFlowDescriptorBuilder>(
    flow: new () => T,
    source: string,
    sink: string,
    barrier?: string,
    alias?: string
): string {
    const descriptor = CurrentQueryContext.descriptor as QueryDescriptor;
    if (barrier) {
        descriptor.exists(
            (f) =>
                f
                    .source(source)
                    .barrier(barrier)
                    .sink(sink)
                    .as(alias || randomString(8)),
            () => new flow()
        );
    } else {
        descriptor.exists(
            (f) =>
                f
                    .source(source)
                    .sink(sink)
                    .as(alias || randomString(8)),
            () => new flow()
        );
    }
    return descriptor.getLastExistsDescriptor()!.alias;
}

/**
 * Construct a select clause in a non-fluent way.
 *
 * An alias for select.
 *
 * @see {@link QueryDescriptor.select}.
 *
 * @category DSL API
 */
export function report(...columns: string[]): void {
    (CurrentQueryContext.descriptor as QueryDescriptor).select(...columns);
}
