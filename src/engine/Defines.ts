import { Query } from "~/dsl/fluent/QueryDescriptor";

export interface QueryResult {
    name: string;
    result: string;
    milliseconds: number;
}

export type Queryable = [string, Query];
