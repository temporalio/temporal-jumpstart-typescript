# Temporal Jumpstart:App

## Setup

* Configure `.env`
  * This project uses [dotenv-extended](https://www.npmjs.com/package/dotenv-extended) to load environment variables.
  * See [.env.schema](app/.env.schema) and [.env.defaults](app/.env.defaults) for variables required to run this project.
* Install dependencies with `npm install`


## Running The Application

In separate terminals:

1. Temporal Server: `temporal server start-dev`
2. Starter API: `npm run api`
3. Worker:
    1. LOCAL environment: `npm run domain:local`
    2. NON-LOCAL environments or for local validation of builds: `npm run domain`
        1. See [Non-Local Environments](#non-local-environments)

### Non-Local Environments

There are a few preparatory tasks required to run a Temporal TypeScript SDK Application in a production, staging, etc environment.

* Implement appropriate [DataConverter](../docs/foundations/DataConverter.md) interfaces
    * Expose these implementations to the respective Temporal SDK Clients (Worker and Starter).
* Bundle Workflow code for reference in the `Worker` options.
    * See the [script](src/scripts/build-workflow-bundle.ts) included in this project for an example.

### HTTPS Everywhere

You might need to run your API with SSL. The excellent [mkcert](https://github.com/FiloSottile/mkcert) project can simplify creation and management of
certificates to get started with secure connections everywhere. 

1. Install [mkcert](https://github.com/FiloSottile/mkcert).
2. `mkcert -install` (this just installs the CA to your system)
3. `mkcert -client localhost` (this makes all our `localhost` servers ok for HTTPS)
    1. Note that it creates `localhost-client.pem` and `localhost-client-key.pem` files in our root dir.
    2. Update your `.env` file paths for both `API_CONNECTION_MTLS_KEY_FILE` and `API_CONNECTION_MTLS_CERT_CHAIN_FILE` variables.
    3. We will use these from our different servers to serve over https where needed

## Verifying The Things

### Tests
Run tests with `npm test`. 
This runs a series of smoke tests across the API, Workflows, and Activities.

### Pings and Pongs
Now try out the provided  [PingWorkflow](src/domain/workflows/ping.ts) to verify the stack.

The REST API ("starter") supports a `PUT` and `GET` to verify Executing and Querying a Workflow.

With all the [three servers](running-the-application) running you should be able to issue the following
requests to confirm your setup. Try to run the `LOCAL` and `NON-LOCAL` domain workflow worker setups to verify your environment.

### Start PingWorkflow
```shell
export PUBLIC_API_URL="http{s}://localhost:3000/api"

curl -X PUT "$PUBLIC_API_URL/v1/pings/myping" \
-H "Content-Type: application/json" \
-d '{"ping": "hello"}'
```
_should respond with_
`pong: 'hello`

### Read PingWorkflow
```shell
export PUBLIC_API_URL="http{s}://localhost:3000/api"

curl -X GET "$PUBLIC_API_URL/v1/pings/myping"
```
_should respond with_
`pong: 'hello`