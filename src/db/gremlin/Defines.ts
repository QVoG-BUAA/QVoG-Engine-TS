export interface Vertex {
    id: number;
    label: string;
    properties?: VertexProperty[];
}

export interface Edge {
    id: number;
    label: string;
    inV: Vertex;
    outV: Vertex;
    properties?: EdgeProperty[];
}

export interface VertexProperty {
    id: number;
    label: string;
    value: any;
    properties?: EdgeProperty[];
}

export interface EdgeProperty {
    key: string;
    value: any;
}
