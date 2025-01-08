import { GraphNode } from "~/graph/Node";
import { Configuration } from "~/Configuration";

export abstract class Value {
    private id?: number;

    private identifier: string;
    private supported: boolean;

    constructor(identifier: string, supported: boolean = true) {
        this.identifier = identifier;
        this.supported = supported;
    }

    /**
     * This is an intrusive method that invokes a global call.
     */
    getNode(): GraphNode {
        return Configuration.getContext().getNode(this);
    }

    setId(id: number): void {
        this.id = id;
    }

    getId(): number {
        if (!this.id) {
            throw new Error("Value id not available");
        }
        return this.id;
    }

    getIdentifier(): string {
        return this.identifier;
    }

    isSupported(): boolean {
        return this.supported;
    }
}

export class UnknownValue extends Value {
    constructor(identifier: string) {
        super(identifier, false);
    }
}
