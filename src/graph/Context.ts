import { AstJson } from "~/graph/Defines";
import { Configuration } from "~/Configuration";
import { ValueFactory } from "~/graph/Specification";
import { InvalidValue, Value } from "~/graph/Value";
import { CodeNode, FileNode, GraphNode } from "~/graph/Node";
import { Vertex, VertexProperty } from "~/db/gremlin/Defines";

type NodeRegistration = [GraphNode, Value];
type NodeRegistry = Map<number, NodeRegistration>;

export class Context {
    private log = Configuration.getLogger("Context");

    private factory: ValueFactory;
    private registry: NodeRegistry = new Map<number, NodeRegistration>();

    constructor(factory: ValueFactory) {
        this.factory = factory;
    }

    getValue(key: Vertex | GraphNode | number): Value {
        return this.getRegistration(key)[1];
    }

    getNode(key: Vertex | Value | number): GraphNode {
        return this.getRegistration(key)[0];
    }

    private getRegistration(key: Vertex | GraphNode | Value | number): NodeRegistration {
        let registration = this.tryGetRegistration(key);
        if (!registration) {
            if (typeof key === "number") {
                throw new Error(`Node with id ${key} is not available`);
            } else if (key instanceof GraphNode) {
                throw new Error(`Node with id ${key.getId()} is not available`);
            } else if (key instanceof Value) {
                throw new Error(`Node with id ${key.getId()} is not available`);
            }
            registration = this.register(key);
        }
        return registration;
    }

    private tryGetRegistration(key: Vertex | GraphNode | Value | number): NodeRegistration | undefined {
        if (typeof key === "number") {
            return this.registry.get(key);
        } else if (key instanceof GraphNode) {
            return this.registry.get(key.getId());
        } else if (key instanceof Value) {
            return this.registry.get(key.getId());
        }
        return this.registry.get(key.id);
    }

    private register(vertex: Vertex): NodeRegistration {
        const properties = new Map<string, any>();
        if (vertex.properties) {
            Object.entries(vertex.properties).forEach(([key, value]) => {
                properties.set(key, (value[0] as VertexProperty).value);
            });
        }

        let registration: NodeRegistration;
        if (vertex.label === "code") {
            registration = this.registerCodeNode(vertex, properties);
        } else if (vertex.label === "file") {
            registration = this.registerFileNode(vertex, properties);
        } else {
            throw new Error(`Unsupported vertex label "${vertex.label}"`);
        }
        this.registry.set(registration[0].getId(), registration);

        return registration;
    }

    private registerCodeNode(vertex: Vertex, properties: Map<string, any>): NodeRegistration {
        const jsonProperty = properties.get("json");
        if (!jsonProperty) {
            throw new Error("json property is missing");
        }
        const json: AstJson = JSON.parse(jsonProperty);

        const props = {
            lineno: parseInt(properties.get("lineno") || "0"),
            code: properties.get("code") || "",
            file: properties.get("file") || "",
            json: json,
            functionDefName: properties.get("functionDefName")
        };

        const node = new CodeNode(vertex, props);
        const value = this.factory.buildValue(json, new InvalidValue(json._type));
        value.setId(node.getId());

        return [node, value];
    }

    private registerFileNode(vertex: Vertex, properties: Map<string, any>): NodeRegistration {
        const props = {
            path: properties.get("file")
        };

        const node = new FileNode(vertex, props);
        const value = new InvalidValue("file");
        value.setId(node.getId());

        return [node, value];
    }
}