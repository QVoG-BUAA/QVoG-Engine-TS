import { process } from 'gremlin';

export { process };

/**
 * Vertex specification.
 * 
 * @category Database
 */
export interface Vertex {
    /**
     * Unique identifier.
     * 
     * All node and value parsed from the vertex share the same id.
     */
    id: number;
    label: string;
    properties?: object;
}

/**
 * Edge specification.
 * 
 * @category Database
 */
export interface Edge {
    id: number;
    label: string;
    inV: Vertex;
    outV: Vertex;
    properties?: object;
}

/**
 * Vertex property specification.
 * 
 * @category Database
 */
export interface VertexProperty {
    id: number;
    label: string;
    key: string;
    value: any;
}

/**
 * Edge property specification.
 * 
 * @category Database
 */
export interface EdgeProperty {
    key: string;
    value: any;
}
