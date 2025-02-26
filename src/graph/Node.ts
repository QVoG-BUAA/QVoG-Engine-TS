import { Vertex } from "~/db/gremlin/Defines";
import { CodeProperty, FileProperty } from "~/graph/Defines";

/**
 * Base class for all graph nodes.
 * 
 * A graph node represents a vertex in the graph database, only providing more
 * convenient access to the properties.
 * 
 * There are two types of nodes:
 * - {@link CodeNode | `CodeNode`} representing one line of code.
 * - {@link FileNode | `FileNode`} representing a file.
 * 
 * @category Graph
 */
export abstract class GraphNode {
    protected vertex: Vertex;

    constructor(vertex: Vertex) {
        this.vertex = vertex;
    }

    /**
     * Get the vertex id in the database.
     * 
     * @returns The id.
     */
    getId(): number {
        return this.vertex.id;
    }

    /**
     * Get the underlying gremlin vertex.
     * 
     * @returns The vertex.
     */
    getVertex(): Vertex {
        return this.vertex;
    }
}

/**
 * Represents a code node in the graph.
 * 
 * The parsed {@link Value | `Value`} from the AST is stored in {@link Context | `Context`}
 * and can be retrieved using {@link Context.getValue | `Context.getValue`}.
 * 
 * @category Graph
 */
export class CodeNode extends GraphNode {
    private property: CodeProperty;

    constructor(vertex: Vertex, property: CodeProperty) {
        super(vertex);
        this.property = property;
    }

    /**
     * Get the code property of the node.
     * 
     * @returns Code property.
     */
    getProperty(): CodeProperty {
        return this.property;
    }
}

/**
 * Represents a file node in the graph.
 * 
 * @category Graph
 */
export class FileNode extends GraphNode {
    private property: FileProperty;

    constructor(vertex: Vertex, property: FileProperty) {
        super(vertex);
        this.property = property;
    }

    /**
     * Get the file property of the node.
     * 
     * @returns File property.
     */
    getProperty(): FileProperty {
        return this.property;
    }
}
