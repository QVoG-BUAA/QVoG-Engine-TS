import { Vertex } from "~/db/gremlin/Defines";
import { CodeProperty, FileProperty } from "~/graph/Defines";

export abstract class GraphNode {
    protected vertex: Vertex;

    constructor(vertex: Vertex) {
        this.vertex = vertex;
    }

    getId(): number {
        return this.vertex.id;
    }

    getVertex(): Vertex {
        return this.vertex;
    }
}

export class CodeNode extends GraphNode {
    private property: CodeProperty;

    constructor(vertex: Vertex, property: CodeProperty) {
        super(vertex);
        this.property = property;
    }

    getProperty(): CodeProperty {
        return this.property;
    }
}

export class FileNode extends GraphNode {
    private property: FileProperty;

    constructor(vertex: Vertex, property: FileProperty) {
        super(vertex);
        this.property = property;
    }

    getProperty(): FileProperty {
        return this.property;
    }
}
