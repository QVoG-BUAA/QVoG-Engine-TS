/**
 * This is a wrapper to build Query in a non-fluent way.
 */

import { CurrentQueryContext } from '~/dsl/fluent/QueryContext';
import { FromClause, FromDescriptor } from '~/dsl/fluent/FromDescriptor';
import { FilterClause, FilterDescriptor } from '~/dsl/fluent/FilterDescriptor';
import { InitialQuery, Query, Queryable, QueryDescriptor } from '~/dsl/fluent/QueryDescriptor';
import { FlowClause, FlowDescriptor, IFlowDescriptorBuilder } from '~/dsl/fluent/FlowDescriptor';

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
 * @see {@link QueryDescriptor.from}.
 *
 * @category DSL API
 */
export function from(param: FromDescriptor | FromClause): void {
    (CurrentQueryContext.descriptor as QueryDescriptor).from(param);
}

/**
 * @see {@link QueryDescriptor.where}.
 */
export function where(param: FilterDescriptor | FilterClause): void {
    (CurrentQueryContext.descriptor as QueryDescriptor).where(param);
}

/**
 * @see {@link QueryDescriptor.exists}.
 */
export function exists(param: FlowDescriptor | FlowClause, flow?: () => IFlowDescriptorBuilder): void {
    (CurrentQueryContext.descriptor as QueryDescriptor).exists(param, flow);
}

/**
 * @see {@link QueryDescriptor.select}.
 */
export function select(...columns: string[]): void {
    (CurrentQueryContext.descriptor as QueryDescriptor).select(...columns);
}
