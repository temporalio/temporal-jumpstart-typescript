import { createWorker, createWorkerOptions } from './workers/worker.js'
import { cfg } from './config'

import * as acts from './workflows/activities.js'

const opts = await createWorkerOptions(cfg)
opts.activities = acts
const worker = await createWorker(opts)

await worker.run().catch((err) => {
  console.error(err)
  process.exit(1)
})
