# Temporal Jumpstart:Onboardings

### Production Builds

1. _ENSURE JS EXTENSION EXISTS IN WORKFLOW IMPORTS_, then `npx tsc --build` outputs the application
2. _ENSURE NO EXTENSION NOT EXISTS IN WORKFLOW IMPORTS_, then `tsx src/scripts/build-workflow-bundle.ts` bundles workflow code for production
3. _RUN PRODUCTION BUILD_: `NODE_ENV=production node build/src/index.js` runs the application with the workflows bundle

### Developer Builds

1. _ENSURE JS EXTENSION EXISTS IN WORKFLOW IMPORTS_, then `npx tsx src/index.ts` starts the Worker in dev mode