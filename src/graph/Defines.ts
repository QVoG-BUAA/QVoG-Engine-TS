export interface AstJson {
    _type: string;
}

export interface CodeProperty {
    lineno: number;
    code: string;
    file: string;
    json: AstJson;
    functionDefName?: string;
}

export interface FileProperty {
    path: string;
}
