import { QueryDescriptor } from '~/dsl/fluent/QueryDescriptor';
import { FromDescriptorBuilder } from '~/dsl/fluent/FromDescriptor';

/**
 * Current query context.
 *
 * @internal
 */
export class QueryContext {
    ///////////////////////////////////////////////////////////////////////////
    // Current query descriptor
    ///////////////////////////////////////////////////////////////////////////

    private _descriptor: QueryDescriptor | undefined;

    requireDescriptor(d: QueryDescriptor) {
        if (this._descriptor === undefined) {
            this._descriptor = d;
        } else {
            throw new Error('Query context is in use');
        }
    }

    releaseDescriptor() {
        if (this._descriptor === undefined) {
            throw new Error('Query context is not in use');
        } else {
            this._descriptor = undefined;
        }
    }

    public get descriptor(): QueryDescriptor {
        if (this._descriptor === undefined) {
            throw new Error('Query context is not set');
        } else {
            return this._descriptor;
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // Current from descriptor
    ///////////////////////////////////////////////////////////////////////////

    private _fromDescriptor: FromDescriptorBuilder | undefined;

    requireFromDescriptor(d: FromDescriptorBuilder) {
        if (this._fromDescriptor === undefined) {
            this._fromDescriptor = d;
        } else {
            throw new Error('From context is in use');
        }
    }

    releaseFromDescriptor() {
        if (this._fromDescriptor === undefined) {
            throw new Error('From context is not in use');
        } else {
            this._fromDescriptor = undefined;
        }
    }

    public get fromDescriptor(): FromDescriptorBuilder {
        if (this._fromDescriptor === undefined) {
            throw new Error('From context is not set');
        } else {
            return this._fromDescriptor;
        }
    }
}

export const CurrentQueryContext = new QueryContext();
