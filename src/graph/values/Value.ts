export abstract class Value {
    private id?: number;

    private identifier: string;
    private supported: boolean;

    constructor(identifier: string, supported: boolean = true) {
        this.identifier = identifier;
        this.supported = supported;
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
