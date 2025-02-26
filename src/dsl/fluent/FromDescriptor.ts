import { Table } from "~/dsl/table/Table";
import { DbContext } from "~/db/DbContext";
import { Configuration } from "~/Configuration";
import { PredicateColumn } from "~/dsl/table/Column";
import { ValuePredicate, ValuePredicateFn } from "~/dsl/Predicates";

/**
 * Defines the behavior of a from action which is used to fetch data from a table.
 * 
 * The fetched table will be named with the alias provided. The alias should be unique
 * among all tables in the query. The fetched table will contain one column with the 
 * same name as the table.
 * 
 * From action may fetch data in two ways:
 * 
 * - Fetch values: Stores the fetched values in memory, so they can be traversed later.
 * - Fetch predicate: Only stores the predicate. This way, you can still check if the 
 *      table contains a value or not, and significantly reduce memory usage and improve
 *      performance.
 * 
 * @category DSL API
 */
export class FromDescriptor {
    alias: string;
    apply: (dbContext: DbContext) => Table;

    constructor(alias: string, apply: (dbContext: DbContext) => Table) {
        this.alias = alias;
        this.apply = apply;
    }
}

/**
 * The complete from action clause, which is a callback to build a
 * {@link FromDescriptor | `FromDescriptor`} on demand.
 * 
 * @category DSL API
 */
export type FromClause = (clause: IFromDescriptorBuilder) => ICanBuildFromDescriptor;

export interface IFromDescriptorBuilder {
    /**
     * Fetch values and store them in memory.
     * 
     * @param predicate The predicate the values should satisfy.
     */
    withData(predicate: ValuePredicate | ValuePredicateFn): ICanSetAlias;

    /**
     * Only store the predicate in table.
     * 
     * @param predicate The predicate the values should satisfy.
     */
    withPredicate(predicate: ValuePredicate | ValuePredicateFn): ICanSetAlias;
}

export interface ICanSetAlias {
    /**
     * Set the alias for the table.
     * 
     * @param alias A unique name for the table.
     */
    as(alias: string): ICanBuildFromDescriptor;
}

export interface ICanBuildFromDescriptor {
    /**
     * Build the from descriptor.
     * @returns The built from descriptor.
     */
    build(): FromDescriptor;
}

/**
 * Builder for {@link FromDescriptor | `FromDescriptor`}.
 * 
 * @category DSL API
 */
export class FromDescriptorBuilder implements IFromDescriptorBuilder, ICanSetAlias, ICanBuildFromDescriptor {
    private choice: number = 0;
    private alias: string = "";
    private predicate?: ValuePredicate;

    /**
     * @inheritDoc IFromDescriptorBuilder.withData
     */
    withData(predicate: ValuePredicate | ValuePredicateFn): ICanSetAlias {
        this.choice = 0;
        this.predicate = (predicate instanceof ValuePredicate) ? predicate : ValuePredicate.of(predicate);
        return this;
    }

    /**
     * @inheritDoc IFromDescriptorBuilder.withPredicate
     */
    withPredicate(predicate: ValuePredicate | ValuePredicateFn): ICanSetAlias {
        this.choice = 1;
        this.predicate = (predicate instanceof ValuePredicate) ? predicate : ValuePredicate.of(predicate);
        return this;
    }

    /**
     * @inheritDoc ICanSetAlias.as
     */
    as(alias: string): ICanBuildFromDescriptor {
        this.alias = alias;
        return this;
    }

    /**
     * @inheritDoc ICanBuildFromDescriptor.build
     */
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
