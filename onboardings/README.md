# Temporal Jumpstart:Onboardings

## Product Requirements

Checkout the Product Requirements Document [here](Curriculum_Onboarding_UseCase_PRD.pdf)

* Configure `.env`
   * This project uses [dotenv-extended](https://www.npmjs.com/package/dotenv-extended) to load environment variables.
   * See [.env.schema](app/.env.schema) and [.env.defaults](app/.env.defaults) for variables required to run this project.
* Install dependencies with `npm install`

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
3. Worker: 
   1. LOCAL environment: `npm run domain:local`
   2. NON-LOCAL environments or for local validation of builds: 
      1. See [Non-Local Environments](#non-local-environments)

### Non-Local Environments

There are a few preparatory tasks required to run a Temporal TypeScript SDK Application in a production, staging, etc environment.

* Implement appropriate [DataConverter](../docs/foundations/DataConverter.md) interfaces
  * Expose these implementations to the respective Temporal SDK Clients (Worker and Starter).
* Bundle Workflow code for reference in the `Worker` options. 
  * See the [script](src/scripts/build-workflow-bundle.ts) included in this project for an example. 

* Validate the output Workflow bundles for 

1. _ENSURE JS EXTENSION EXISTS IN WORKFLOW IMPORTS_, then `npx tsc --build` outputs the application
2. _ENSURE NO EXTENSION NOT EXISTS IN WORKFLOW IMPORTS_, then `tsx src/scripts/build-workflow-bundle.ts` bundles workflow code for production
3. _RUN PRODUCTION BUILD_: `NODE_ENV=production node build/src/index.js` runs the application with the workflows bundle

#### Run Production

```shell
# inside onboardings app
cd onboardings
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
