# Temporal Jumpstart:Onboardings

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
npm run build:proto && \
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

### Custom Payload Converter

To use the `buf` PayloadConverter implementation:
```sh
npm run build:proto
```

This uses the default `buf.yaml` and `buf.gen.yaml` config and template to plop generated code into `src/generated`.
