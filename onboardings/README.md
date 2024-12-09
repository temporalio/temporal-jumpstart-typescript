# Temporal Jumpstart:Onboardings

## Product Requirements

Checkout the Product Requirements Document [here](Curriculum_Onboarding_UseCase_PRD.pdf)

## Setup

* configure `.env`
* `npm install`

## Running The Application

In separate terminals:

1. Temporal Server: `temporal server start-dev`
2. Starter API: `npm run api`
3. Worker: `npm run domain`

### Production Builds

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
