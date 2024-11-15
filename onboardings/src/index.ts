import { createWorker, createWorkerOptions } from './workers/worker.js'
import { cfg } from './config'

import * as acts from './workflows/activities.js'

createWorkerOptions(cfg).then(opts => {
  opts.activities = acts
  return createWorker(opts).then(worker => {
    return worker.run().catch((err) => {
      console.error(err)
      process.exit(1)
    })
  })

})