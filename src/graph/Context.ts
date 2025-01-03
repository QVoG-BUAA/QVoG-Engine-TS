import { CodeNode } from "~/graph/Node";
import { Vertex } from "~/db/gremlin/Defines";
import { ValueFactory } from "~/graph/Specification";
import { UnknownValue, Value } from "~/graph/values/Value";

type CodeNodeRegistration = [CodeNode, Value];
type CodeNodeRegistry = Map<number, CodeNodeRegistration>;

export class Context {
    private factory: ValueFactory;
    private registry: CodeNodeRegistry = new Map<number, CodeNodeRegistration>();

    constructor(factory: ValueFactory) {
        this.factory = factory;
    }

    getValue(key: Vertex | number): Value {
        return this.getRegistration(key)[1];
    }

    getCodeNode(key: Vertex | number): CodeNode {
        return this.getRegistration(key)[0];
    }

    private getRegistration(key: Vertex | number): CodeNodeRegistration {
        let registration = this.tryGetRegistration(key);
        if (!registration) {
            if (typeof key === 'number') {
                throw new Error(`Node with id ${key} is not available`);
            }
            registration = this.register(key);
        }
        return registration
    }

    private tryGetRegistration(key: Vertex | number): CodeNodeRegistration | undefined {
        if (typeof key === 'number') {
            return this.registry.get(key);
        }
        return this.registry.get(key.id);
    }

    private register(vertex: Vertex): CodeNodeRegistration {
        let map = new Map<string, string>();
        vertex.properties?.forEach(p => {
            map.set(p.label, p.value);
        });

        const jsonProperty = map.get('json');
        if (!jsonProperty) {
            throw new Error('json property is missing');
        }
        const json = JSON.parse(jsonProperty);

        const properties = {
            id: vertex.id,
            code: map.get('code') || '',
            lineNumber: parseInt(map.get('lineNumber') || '0'),
            filename: map.get('filename') || '',
            functionDefName: map.get('functionDefName') || '',
            json: map.get('json') || ''
        };

        let node = new CodeNode(vertex, properties);
        let value = this.factory.build(json, new UnknownValue());

        const registration: CodeNodeRegistration = [node, value];
        this.registry.set(node.id(), registration);

        return registration;
    }
}