# temporal-jumpstart-typescript
Temporal Jumpstart for TypeScript SDK

### Requirements

* NodeJS
* NPM
* [npx](https://docs.npmjs.com/cli/v10/commands/npx)

### Messaging 

This project uses [protobufs](https://protobuf.dev/) for all message contracts.

TypeScript support is achieved via:
* [protobuf-es](https://github.com/bufbuild/protobuf-es/tree/main)
  * See [details](https://buf.build/blog/protobuf-conformance)
* [buf](https://buf.build/) (installed as a project package)

#### Generation & Versioning

Generating TypeScript schemas and types is done by:
```sh
# explicitly exclude node_modules from interference with dependencies that use protobufs
npx buf generate --exclude-path node_modules
```