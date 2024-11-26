import {BufBinaryPayloadConverter, DefaultPayloadConverterWithBufs} from './buf-payload-converter'
import { createFileRegistry, fromJson, JsonValue } from '@bufbuild/protobuf'
import { FileDescriptorSetSchema } from '@bufbuild/protobuf/wkt'
import json from '../../generated/set.json'

const fileDescriptorSet = fromJson(
  FileDescriptorSetSchema,
  json as JsonValue)
// readFileSync(registryPath))
const registry = createFileRegistry(fileDescriptorSet)
export const payloadConverter = new DefaultPayloadConverterWithBufs({ registry})

/*
1. globalThis access within a PayloadConverter implementation at runtime. Ideally I'd avoid Webpack rewrite tricks.
1a. Explain how globalThis.constructor.constructor reaches into Worker thread.
1b. If underlying libraries are using globalThis, what is recommended way to pass in dependencies to them ?
2. PayloadConverter relationship with each execution isolate;  Is a new converter created per Workflow Execution?
3. Best way to debug/stepthru PayloadConverter or Workflow code with a debugger. How can I log out to terminal from my custom payload converter?
  3a. Runtime.install seems to be the trick here? `    Runtime.install({ logger: new DefaultLogger('WARN') });`
4. Is https://nodejs.org/api/worker_threads.html relevant for me to understand well? YES: see worker/workflow/threaded-vm.ts
5. Are there any hooks that can share global data across worker_threads (like a lifecycle of workflow execution)?  Kind of like 'ignoreModules'?
6. LoadedDataConverter is the same as DataConverter except that it was instantiated from the 'payloadConverterPath' ?

1. bump to 1.11.5
2. try in VSCode
METRICS
1. Should i reach for a sink or a interceptor for DataDog metrics integration? Or both? https://gist.github.com/mnichols/5ede1598e565370ab7e0dc3e29ef8998
 */