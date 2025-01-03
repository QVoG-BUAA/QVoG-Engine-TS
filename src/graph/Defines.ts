export interface AstJson {
    _type: string;
}

export interface CodeProperty {
    id: number;
    code: string;
    lineNumber: number;
    filename: string;
    functionDefName: string;
    json: string;
}