/**
 * All AST node should satisfy this interface.
 *
 * Extend this interface for each type of AST node.
 *
 * @category Graph
 */
export interface AstJson {
    /**
     * This is used to as a unique type identifier to deserialize the AST node.
     */
    _identifier: string;
}

/**
 * Properties of a code node.
 *
 * @category Graph
 */
export interface CodeProperty {
    /**
     * Line number of the code.
     */
    lineno: number;

    /**
     * Line of code.
     */
    code: string;

    /**
     * The file it belongs to.
     */
    file: string;

    /**
     * JSON representation of the AST.
     */
    json: AstJson;

    /**
     * Function definition name, if any.
     */
    functionDefName?: string;
}

/**
 * Properties of a file node.
 *
 * @category Graph
 */
export interface FileProperty {
    /**
     * Path of the file.
     */
    path: string;
}
