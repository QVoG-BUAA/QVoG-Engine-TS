import { Value } from '~/graph';
import { Configuration } from '~/Configuration';
import { CodeNode, FileNode, GraphNode } from '~/graph/Node';

/**
 * Utility functions for graph operations.
 *
 * @category Extension
 */
export class GraphExt {
    /**
     * Format a graph node into a human-readable string.
     *
     * @param obj Can be vertex ID, GraphNode or Value.
     * @returns Formatted string.
     */
    static format(obj: number | GraphNode | Value): string {
        const context = Configuration.getContext();
        let node: GraphNode;

        if (typeof obj === 'number') {
            node = context.getNode(obj);
        } else if (obj instanceof GraphNode) {
            node = obj;
        } else if (obj instanceof Value) {
            node = context.getNode(obj.id);
        } else {
            throw new Error(`Unsupported object type: ${typeof obj}`);
        }

        if (node instanceof FileNode) {
            return this.formatFileNode(node);
        } else if (node instanceof CodeNode) {
            return this.formatCodeNode(node);
        } else {
            throw new Error(`Unsupported node type: ${node.constructor.name}`);
        }
    }

    private static formatFileNode(node: FileNode): string {
        return `File: ${node.property.path}`;
    }

    private static formatCodeNode(node: CodeNode): string {
        const property = node.property;
        let description = `(${property.file}:${property.lineno}) `;
        if (property.code.length > 50) {
            description += property.code.substring(0, 50) + '...';
        } else {
            description += property.code;
        }
        return description;
    }
}
