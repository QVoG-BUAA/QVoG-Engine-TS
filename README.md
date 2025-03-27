# QVoG Engine

QVoG Query Engine is the execution engine of the top-level graph query language for vulnerability.

> [!WARNING]
> Node.js 22 or higher required.

## Build

To initialize the project, run the following command:

```bash
npm install
```

To build the project, run the following command:

```bash
npm run build
```

To build the documentation, run the following command:

```bash
npm run docs
```

The documentation will be generated in the `docs` folder.

## Usage

### NPM Package

It has been published to NPM registry: [qvog-engine](https://www.npmjs.com/package/qvog-engine).

To install the package, run the following command:

```bash
npm install qvog-engine
```

### Local Package

If you want to build and use the latest version of the library, you can link it locally.

```bash
npm link
```

Later, in the project that uses the library, run the following command:

```bash
npm link qvog-engine
```

### Configuration

To run queries, you need a `config.json` file in the root directory of the project. An example configuration is as follows:

```json
{
    "database": {
        "gremlin": {
            "host": "localhost",
            "port": 8182,
            "batchSize": 1000
        }
    },
    "formatter": "default",
    "style": "markdown"
}
```

`batchSize` is the maximum number of vertices to be fetched in a single query. By default it is set to 1000. Configure this to tune the performance of the engine. For the complete options, see `EngineOptions` interface.

## Development

For better code style, we have ESLint and prettier set up. To run the linter and prettier, run the following command to check and fix the code:

```bash
npm run lint
npm run format
```
