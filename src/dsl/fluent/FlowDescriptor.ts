import { Table } from "~/dsl/table/Table";
import { Value } from "~/graph/Value";
import { ValuePredicate } from "~/dsl/Predicates";
import { AnyColumn, Column, DataColumn, PredicateColumn } from "~/dsl/table/Column";

export type FlowAction = (source: Table, sink: Table, barrier?: Table) => Table;
export type FlowProperty = { sourceAlias: string, sinkAlias: string, barrierAlias?: string };

export class FlowDescriptor {
    alias: string;
    properties: FlowProperty;
    apply: FlowAction;

    constructor(alias: string, properties: FlowProperty, apply: FlowAction) {
        this.alias = alias;
        this.properties = properties;
        this.apply = apply;
    }
}

export type FlowClause = (clause: IFlowDescriptorBuilder) => ICanBuildFlowDescriptor;

export interface IFlowDescriptorBuilder extends ICanSetFlowSource {
    /**
     * This allows custom features to be configured for the flow descriptor.
     * @param features Anything you want.
     */
    configure(features: any): IFlowDescriptorBuilder;
}

export interface ICanSetFlowSource {
    source(alias: string): ICanSetFlowBarrier;
}

export interface ICanSetFlowSink {
    sink(alias: string): ICanSetFlowAlias;
}

export interface ICanSetFlowBarrier extends ICanSetFlowSink {
    barrier(alias: string): ICanSetFlowSink;
}

export interface ICanSetFlowAlias {
    as(alias: string): ICanBuildFlowDescriptor;
}

export interface ICanBuildFlowDescriptor {
    build(): FlowDescriptor;
}

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
