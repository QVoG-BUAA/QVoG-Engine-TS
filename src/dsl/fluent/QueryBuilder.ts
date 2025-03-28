/**
 * This is a wrapper to build Query in a non-fluent way.
 */

import { FromClause, FromDescriptor } from '~/dsl/fluent/FromDescriptor';
import { FilterClause, FilterDescriptor } from '~/dsl/fluent/FilterDescriptor';
import { InitialQuery, Query, Queryable, QueryDescriptor } from '~/dsl/fluent/QueryDescriptor';
import { FlowClause, FlowDescriptor, IFlowDescriptorBuilder } from '~/dsl/fluent/FlowDescriptor';

/**
 * Represents the current query context.
 */
let descriptor: QueryDescriptor | undefined;

function requireDescriptor(d: QueryDescriptor) {
    if (descriptor === undefined) {
        descriptor = d;
    } else if (descriptor !== d) {
        throw new Error('Query context is in use');
    }
}

function releaseDescriptor() {
    if (descriptor === undefined) {
        throw new Error('Query context is not in use');
    } else {
        descriptor = undefined;
    }
}

function getCurrentDescriptor(): QueryDescriptor {
    if (descriptor === undefined) {
        throw new Error('Query context is not set');
    } else {
        return descriptor;
    }
}

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
        requireDescriptor(q as QueryDescriptor);
        action();
        releaseDescriptor();
        return q;
    };
    return [name, clause];
}

/**
 * @see {@link QueryDescriptor.from}.
 * 
 * @category DSL API
 */
export function from(param: FromDescriptor | FromClause) {
    (getCurrentDescriptor() as QueryDescriptor).from(param);
}

/**
 * @see {@link QueryDescriptor.where}.
 */
export function where(
    param: FilterDescriptor | FilterClause | FlowDescriptor | FlowClause,
    flow?: () => IFlowDescriptorBuilder
) {
    (getCurrentDescriptor() as QueryDescriptor).where(param, flow);
}

/**
 * @see {@link QueryDescriptor.select}.
 */
export function select(...columns: string[]) {
    (getCurrentDescriptor() as QueryDescriptor).select(...columns);
}
