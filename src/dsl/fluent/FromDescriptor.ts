import { Table } from "~/dsl/table/Table";
import { DbContext } from "~/db/DbContext";
import { ValuePredicate } from "~/dsl/Defines";
import { Configuration } from "~/Configuration";
import { PredicateColumn } from "~/dsl/table/Column";

export class FromDescriptor {
    alias: string;
    apply: (dbContext: DbContext) => Table;

    constructor(alias: string, apply: (dbContext: DbContext) => Table) {
        this.alias = alias;
        this.apply = apply;
    }
}

export type FromClause = (clause: FromDescriptorBuilder) => ICanBuildFromDescriptor;

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
                return DataFromDescriptorBuilder.build(this.alias!, this.predicate!);
            case 1:
                return PredicateFromDescriptorBuilder.build(this.alias!, this.predicate!);
            default:
                throw new Error("Invalid choice");
        }
    }
}

class DataFromDescriptorBuilder {
    static build(alias: string, predicate: ValuePredicate): FromDescriptor {
        const apply = (dbContext: DbContext) => {
            return Configuration.getGraphFilter()
                .withConnection(dbContext.getGremlinConnection())
                .withPredicate(predicate)
                .filter(alias);
        };
        return new FromDescriptor(alias, apply);
    }
}

class PredicateFromDescriptorBuilder {
    static build(alias: string, predicate: ValuePredicate) {
        const apply = (dbContext: DbContext) => {
            const table = new Table(alias);
            table.addColumn(new PredicateColumn(alias, predicate));
            return table;
        };
        return new FromDescriptor(alias, apply);
    }
}
