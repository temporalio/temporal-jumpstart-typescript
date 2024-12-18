import { createWorker, createWorkerOptions } from './workers'
import { cfg } from './config'

import * as acts from './domain/workflows/activities.js'

createWorkerOptions(cfg).then(async opts => {
  opts.activities = acts

  let worker = await createWorker(opts)
  try {
    return await worker.run()
  } catch (err) {
    console.error(err)
    process.exit(1)
  }

})