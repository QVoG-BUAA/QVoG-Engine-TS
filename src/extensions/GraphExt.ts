import { CodeNode } from "~/graph/Node";

export class GraphExt {
    static format(node: CodeNode): string {
        const property = node.getProperty();
        let description = `(${property.filename}:${property.lineNumber}) `;
        if (property.code.length > 50) {
            description += property.code.substring(0, 50) + '...';
        } else {
            description += property.code;
        }
        return description;
    }
};
