export interface Vertex {
    id: number;
    label: string;
    properties?: object;
}

export interface Edge {
    id: number;
    label: string;
    inV: Vertex;
    outV: Vertex;
    properties?: object;
}

export interface VertexProperty {
    id: number;
    label: string;
    key: string;
    value: any;
}

export interface EdgeProperty {
    key: string;
    value: any;
}
