# QVoG Engine

> [!WARNING]
> THIS PROJECT IS A WORK IN PROGRESS

QVoG Engine and built-in query library.

> [!NOTE]
> Use Node.js 22 or higher, it seems to have some issues with older versions.

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

If you want to use the latest version of the library, you can build and link it locally. The package will be automatically updated when you build the project.

```bash
npm link
```

Later, in the project that uses the library, run the following command:

```bash
npm link qvog-engine
```

## Development

For better code style, we have ESLint set up. To run the linter, run the following command to check and fix the code:

```bash
npm run lint
```
