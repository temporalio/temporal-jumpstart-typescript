import express, { Express } from 'express'
// import {createClient} from '../clients/temporal/index.js'
import { cfg } from '../config'
import fs from 'fs'
import http from 'http'
import cors from 'cors'
import {createClients} from '../clients'
const { createRouter: createV0Router } = require('./v0')
// const { createRouter: createV1Router } = require( './v1')
createClients(cfg).then(clients => {
  const app: Express = express()
  app.use(cors())
  app.use(express.json())

  let options = {}
  if (cfg.api.mtls && cfg.api.mtls.certChainFile && cfg.api.mtls.keyFile) {
// Start the server at port
    options = {
      key: fs.readFileSync(cfg.api.mtls?.keyFile),
      cert: fs.readFileSync(cfg.api.mtls?.certChainFile),
    }
  }

  const v0 = createV0Router({ config: cfg, clients })
  // const v1 = createV1Router({ config :cfg, clients })
  app.use('/api/v0', v0)
  // app.use('/api/v1', v1)
  const httpsServer = http.createServer(options, app)
  return httpsServer.listen(cfg.api.url.port, () => {
    console.log(`API server listening at ${cfg.api.url.toString()}`)
  })
})


