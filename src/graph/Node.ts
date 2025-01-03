import { Vertex } from "~/db/gremlin/Defines";
import { CodeProperty } from "~/graph/Defines";

export abstract class Node {
    protected vertex: Vertex;

    constructor(vertex: Vertex) {
        this.vertex = vertex;
    }

    id(): number {
        return this.vertex.id;
    }

    getVertex(): Vertex {
        return this.vertex;
    }
}

export class CodeNode extends Node {
    private property: CodeProperty

    constructor(vertex: Vertex, property: CodeProperty) {
        super(vertex);
        this.property = property;
    }

    getProperty(): CodeProperty {
        return this.property;
    }
}

/*
 * TODO: Other node types
 * - FileNode
 * - FolderNode
 */
