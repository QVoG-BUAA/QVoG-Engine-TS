/**
 * @packageDocumentation
 *
 * @categoryDescription DSL API
 * The underlying implementations of the DSL. They are designed to be
 * {@link https://en.wikipedia.org/wiki/Fluent_interface | fluent interfaces} that
 * allow for the construction and execution of complex queries in a way similar to
 * DSL.
 *
 * Intermediate interfaces to construct fluent API are trivial thus omitted from
 * this category.
 *
 * @categoryDescription DSL Data
 * The underlying data structures the DSL API manipulates.
 *
 * @categoryDescription Predicates
 * Predicates are used together with DSL API to filter data.
 *
 * @categoryDescription Database
 * Low-level database adapter.
 *
 * @categoryDescription Graph
 * Abstract representation of the graph database, which is mainly used for query.
 *
 * @categoryDescription Engine
 * The execution engine of QVoG that runs queries and outputs results.
 *
 * @categoryDescription Extensions
 * Utility classes and functions that extend the functionality of the DSL API.
 *
 * @categoryDescription Configuration
 * Configuration classes and functions.
 */

export * from './db';
export * from './dsl';
export * from './engine';
export * from './extensions';
export * from './graph';

export * from './Configuration';
