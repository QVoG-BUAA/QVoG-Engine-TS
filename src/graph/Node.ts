import { Vertex } from '~/db/gremlin/Defines';
import { CodeProperty, FileProperty } from '~/graph/Defines';

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
    protected _vertex: Vertex;

    constructor(vertex: Vertex) {
        this._vertex = vertex;
    }

    /**
     * Get the vertex id in the database.
     *
     * @returns The id.
     */
    public get id(): number {
        return this._vertex.id;
    }

    /**
     * Get the underlying gremlin vertex.
     *
     * @returns The vertex.
     */
    public get vertex(): Vertex {
        return this._vertex;
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
    private _property: CodeProperty;

    constructor(vertex: Vertex, property: CodeProperty) {
        super(vertex);
        this._property = property;
    }

    /**
     * Get the code property of the node.
     *
     * @returns Code property.
     */
    public get property(): CodeProperty {
        return this._property;
    }
}

/**
 * Represents a file node in the graph.
 *
 * @category Graph
 */
export class FileNode extends GraphNode {
    private _property: FileProperty;

    constructor(vertex: Vertex, property: FileProperty) {
        super(vertex);
        this._property = property;
    }

    /**
     * Get the file property of the node.
     *
     * @returns File property.
     */
    public get property(): FileProperty {
        return this._property;
    }
}
