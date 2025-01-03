export enum Origin {
    Resolved = "resolved",
    Inferred = "inferred",
    Unknown = "unknown",
}

export abstract class Type {
    private name: string;
    private origin: Origin;

    constructor(name: string, origin: Origin = Origin.Unknown) {
        this.name = name;
        this.origin = origin;
    }

    getName(): string {
        return this.name;
    }

    getOrigin(): Origin {
        return this.origin;
    }

    setOrigin(origin: Origin): void {
        this.origin = origin;
    }
}

export class UnknownType extends Type {
    constructor() {
        super("unknown", Origin.Unknown);
    }
}
