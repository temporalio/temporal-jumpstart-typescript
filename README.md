# temporal-jumpstart-typescript
Temporal Jumpstart for TypeScript SDK

### Requirements

* NodeJS
* NPM
* [npx](https://docs.npmjs.com/cli/v10/commands/npx)

### Structure

* `/app` is a playground scaffold for getting us started
* `/onboardings` is the implementation that serves the [Onboard Entity Curriculum](/onboardings/README.md).

### Messaging 

This project uses Plain Old TypeScript Objects (POTO) for messaging.
There is some sample code in here using  [protobufs](https://protobuf.dev/) for message contracts but
due to workflow bundle size constraints, we opt not to use that at this time. 
It is left for demonstration of CustomPayloadConverter implementation

#### protobuf support
TypeScript support is achieved via:
* [protobuf-es](https://github.com/bufbuild/protobuf-es/tree/main)
  * See [details](https://buf.build/blog/protobuf-conformance)
* [buf](https://buf.build/) (installed as a project package)

_Generation & Versioning_

Generating TypeScript schemas and types is done by:
```sh
# explicitly exclude node_modules from interference with dependencies that use protobufs
npx buf generate --exclude-path node_modules
```