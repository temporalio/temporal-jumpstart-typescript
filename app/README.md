# Temporal Jumpstart:App

## Setup

* configure `.env`
* `npm install`

### HTTPS Everywhere

The excellent [mkcert](https://github.com/FiloSottile/mkcert) project can simplify creation and management of
certificates.

1. Install [mkcert](https://github.com/FiloSottile/mkcert).
2. `mkcert -install` (this just installs the CA to your system)
3. `mkcert -client localhost` (this makes all our `localhost` servers ok for HTTPS)
    1. Note that it creates `localhost-client.pem` and `localhost-client-key.pem` files in our root dir.
    2. Update your `.env` file paths for both `API_CONNECTION_MTLS_KEY_FILE` and `API_CONNECTION_MTLS_CERT_CHAIN_FILE` variables.
    3. We will use these from our different servers to serve over https where needed


## Running The Application

In separate terminals:

1. Temporal Server: `temporal server start-dev`
2. Starter API: `npm run api`
3. Worker: `npm run domain`

## Verifying The Things
A [PingWorkflow](src/domain/workflows/ping.ts) is included that supports a `PUT` and `GET` to
verify Executing and Querying a Workflow.

With all the [three servers](running-the-application) running you should be able to issue the following
requests to confirm your setup.

### Start PingWorkflow
```shell
export PUBLIC_API_URL="https://localhost:3000/api"

curl -X PUT "$PUBLIC_API_URL/v1/pings/myping" \
-H "Content-Type: application/json" \
-d '{"ping": "hello"}'
```
_should respond with_
`pong: 'hello`

### Read PingWorkflow
```shell
export PUBLIC_API_URL="https://localhost:3000/api"

curl -X GET "$PUBLIC_API_URL/v1/pings/myping"
```
_should respond with_
`pong: 'hello`


### Production Builds

1. _ENSURE JS EXTENSION EXISTS IN WORKFLOW IMPORTS_, then `npx tsc --build` outputs the application
2. _ENSURE NO EXTENSION NOT EXISTS IN WORKFLOW IMPORTS_, then `tsx src/scripts/build-workflow-bundle.ts` bundles workflow code for production
3. _RUN PRODUCTION BUILD_: `NODE_ENV=production node build/src/index.js` runs the application with the workflows bundle

#### Run Production

```shell
# inside onboardings app
cd app
# clear the things
rm -rf build
# build all the things
npm run build && \
  npm run build:workflow && \
  cp .env* build
# go into our build dir
cd build
# run the production app!
NODE_ENV=production node index.js
```


### Developer Builds

1. _ENSURE JS EXTENSION EXISTS IN WORKFLOW IMPORTS_, then `npx tsx src/index.ts` starts the Worker in dev mode
