import { Value } from "~/graph/Value";
import { Table } from "~/dsl/table/Table";
import { ValuePredicate } from "~/dsl/Predicates";
import { AnyColumn, Column, DataColumn, PredicateColumn } from "~/dsl/table/Column";

/**
 * @category DSL API
 */
export type FlowAction = (source: Table, sink: Table, barrier?: Table) => Table;

/**
 * @category DSL API
 */
export type FlowProperty = { sourceAlias: string, sinkAlias: string, barrierAlias?: string };

/**
 * Defines the behavior of a flow action.
 * 
 * Flow actions are used to find path problems, it checks the reachability from source
 * to sink without encountering the barrier.
 * 
 * After the flow action is applied, the source, sink and barrier tables will be removed,
 * and a new result table with the alias of the flow will be created. The result table
 * contains the paths found with the following columns:
 * 
 * - `sourceAlias` ({@link Value | `Value`}): source value of the path
 * - `sinkAlias` ({@link Value | `Value`}): sink value of the path
 * - `barrierAlias` ({@link Value | `Value`}): barrier value of the path
 * - `alias` ({@link FlowPath | `FlowPath`}): the path found
 * 
 * > [!NOTE]
 * > Currently, the barrier column in the result is not used, but still exists.
 * > So, it always contains null.
 * 
 * > [!WARNING]
 * > Since the flow action will traverse values in the source table, so the source 
 * > table must be fetched by a from clause with {@link DataColumn | `DataColumn`}.
 * 
 * @category DSL API
 */
export class FlowDescriptor {
    /**
     * Alias of the result table.
     */
    alias: string;

    /**
     * Properties of the flow action.
     */
    properties: FlowProperty;

    /**
     * The flow action to apply.
     */
    apply: FlowAction;

    constructor(alias: string, properties: FlowProperty, apply: FlowAction) {
        this.alias = alias;
        this.properties = properties;
        this.apply = apply;
    }
}

/**
 * The complete filter action clause, which is a callback to build a
 * {@link FlowDescriptor | `FlowDescriptor`} on demand.
 * 
 * @category DSL API
 */
export type FlowClause = (clause: IFlowDescriptorBuilder) => ICanBuildFlowDescriptor;

export interface IFlowDescriptorBuilder extends ICanSetFlowSource {
    /**
     * Different flow implementation may require different configuration, which can
     * be done by defining their own feature specifications.
     * 
     * @param features Custom features.
     */
    configure(features: any): IFlowDescriptorBuilder;
}

export interface ICanSetFlowSource {
    /**
     * Set the source table of the flow.
     * 
     * @param alias Alias of the source table.
     */
    source(alias: string): ICanSetFlowBarrier;
}

export interface ICanSetFlowSink {
    /**
    * Set the sink table of the flow.
    * 
    * @param alias Alias of the sink table.
    */
    sink(alias: string): ICanSetFlowAlias;
}

export interface ICanSetFlowBarrier extends ICanSetFlowSink {
    /**
    * Set the barrier table of the flow.
    * 
    * @param alias Alias of the barrier table.
    */
    barrier(alias: string): ICanSetFlowSink;
}

export interface ICanSetFlowAlias {
    /**
     * Set the alias of the result table.
     * @param alias Alias of the result table.
     */
    as(alias: string): ICanBuildFlowDescriptor;
}

export interface ICanBuildFlowDescriptor {
    /**
     * Build the flow descriptor.
     */
    build(): FlowDescriptor;
}

/**
 * Base class for {@link FlowDescriptor | `FlowDescriptor`} builders.
 * 
 * @category DSL API
 */
export abstract class FlowDescriptorBuilder implements IFlowDescriptorBuilder, ICanSetFlowSource, ICanSetFlowSink, ICanSetFlowBarrier, ICanSetFlowAlias, ICanBuildFlowDescriptor {
    protected alias: string = "";
    protected property: FlowProperty = { sourceAlias: "", sinkAlias: "" };

    abstract configure(features: any): IFlowDescriptorBuilder;

    abstract build(): FlowDescriptor;

    source(alias: string): ICanSetFlowBarrier {
        this.property.sourceAlias = alias;
        return this;
    }

    sink(alias: string): ICanSetFlowAlias {
        this.property.sinkAlias = alias;
        return this;
    }

    barrier(alias: string): ICanSetFlowSink {
        this.property.barrierAlias = alias;
        return this;
    }

    as(alias: string): ICanBuildFlowDescriptor {
        this.alias = alias;
        return this;
    }
}

/**
 * Basic flow builder with default build method.
 * 
 * Custom flow builders should extend this class.
 * 
 * @category DSL API
 */
export abstract class BaseFlow extends FlowDescriptorBuilder {
    protected abstract exists(current: Value, source: Column, sink: Column, barrier: Column, result: Table): void;

    build(): FlowDescriptor {
        return new FlowDescriptor(this.alias, this.property,
            (source: Table, sink: Table, barrier?: Table) => this.apply(source, sink, barrier)
        );
    }

    private apply(source: Table, sink: Table, barrier?: Table): Table {
        const sourceColumn = source.asColumn();
        const sinkColumn = sink.asColumn();
        const barrierColumn = barrier ? barrier.asColumn() : new PredicateColumn("", ValuePredicate.none());

        const result = new Table(this.alias);
        result.addColumn(new DataColumn(this.property.sourceAlias, true));
        result.addColumn(new DataColumn(this.property.sinkAlias, true));
        if (this.property.barrierAlias) {
            // In fact, this column is not used.
            result.addColumn(new DataColumn(this.property.barrierAlias, true));
        }
        result.addColumn(new AnyColumn(this.alias));

        for (const value of sourceColumn) {
            this.exists(value, sourceColumn, sinkColumn, barrierColumn, result);
        }

        return result;
    }
}
