import { createWorker, createWorkerOptions } from './workers/worker.js'
import { cfg } from './config'

import * as acts from './workflows/activities.js'
import {configureTextEncoding} from '@bufbuild/protobuf/wire'
import TextEncodingAdapter from './clients/temporal/encoding-adapter'
import {DefaultLogger, Runtime} from '@temporalio/worker'

createWorkerOptions(cfg).then(opts => {
  opts.activities = acts

  return createWorker(opts).then(worker => {
    // this overrides the globalThis, but only right now...is there a way to copy context over into each execution isolate?
    configureTextEncoding(new TextEncodingAdapter())

    return worker.run().catch((err) => {
      console.error(err)
      process.exit(1)
    })
  })

})