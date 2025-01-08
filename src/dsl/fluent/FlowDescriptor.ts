import { Table } from "~/dsl/table/Table";

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
