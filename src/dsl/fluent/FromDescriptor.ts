import { DbContext } from "~/db/DbContext";
import { Table } from "~/dsl/table/Table";
import { ValuePredicate } from "../Defines";
import { environment } from "~/engine/Environment";
import { PredicateColumn } from "../table/Column";
import { Configuration } from "~/Configuration";

export interface FromDescriptor {
    alias: string;
    apply: (dbContext: DbContext) => Table;
}

export interface IFromDescriptorBuilder {
    withData(predicate: ValuePredicate): ICanSetAlias;
    withPredicate(predicate: ValuePredicate): ICanSetAlias;
}

export interface ICanSetAlias {
    as(alias: string): ICanBuildFromDescriptor;
}

export interface ICanBuildFromDescriptor {
    build(): FromDescriptor;
}

export class FromDescriptorBuilder implements IFromDescriptorBuilder, ICanSetAlias, ICanBuildFromDescriptor {
    private choice: number = 0;
    private alias?: string;
    private predicate?: ValuePredicate;

    withData(predicate: ValuePredicate): ICanSetAlias {
        this.choice = 0;
        this.predicate = predicate;
        return this;
    }

    withPredicate(predicate: ValuePredicate): ICanSetAlias {
        this.choice = 1;
        this.predicate = predicate;
        return this;
    }

    as(alias: string): ICanBuildFromDescriptor {
        this.alias = alias;
        return this;
    }

    build(): FromDescriptor {
        switch (this.choice) {
            case 0:
                return new DataFromDescriptor(this.alias!, this.predicate!);
            case 1:
                return new PredicateFromDescriptor(this.alias!, this.predicate!);
            default:
                throw new Error("Invalid choice");
        }
    }
}

export class DataFromDescriptor implements FromDescriptor {
    alias: string;
    apply: (dbContext: DbContext) => Table;

    constructor(alias: string, predicate: ValuePredicate) {
        this.alias = alias;
        this.apply = (dbContext: DbContext) => {
            return Configuration.getGraphFilter()
                .withConnection(dbContext.getGremlinConnection())
                .withPredicate(predicate)
                .filter(this.alias);
        };
    }
}

export class PredicateFromDescriptor implements FromDescriptor {
    alias: string;
    apply: (dbContext: DbContext) => Table;

    constructor(alias: string, predicate: ValuePredicate) {
        this.alias = alias;
        this.apply = (dbContext: DbContext) => {
            let table = new Table(this.alias);
            table.addColumn(new PredicateColumn(this.alias, predicate));
            return table;
        };
    }
}
