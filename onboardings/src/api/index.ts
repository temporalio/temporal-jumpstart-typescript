import express, { Express } from 'express'
// import {createClient} from '../clients/temporal/index.js'
import { cfg } from '../config'
import fs from 'fs'
import https from 'https'
import cors from 'cors'
import {createClients} from '../clients'
import {Server} from 'node:net'
import http from 'node:http'
const { createRouter: createV0Router } = require('./v0')
const { createRouter: createV1Router } = require( './v1')
createClients(cfg).then(clients => {
  const app: Express = express()
  app.use(cors())
  app.use(express.json())

  let options = {}
  console.log('cfg', cfg)
  if (cfg.api.mtls && cfg.api.mtls.certChainFile && cfg.api.mtls.keyFile) {
    console.log('reading certs', cfg.api.mtls)
// Start the server at port
    options = {
      key: fs.readFileSync(cfg.api.mtls?.keyFile),
      cert: fs.readFileSync(cfg.api.mtls?.certChainFile),
    }
  }

  const v0 = createV0Router({ config: cfg, clients })
  const v1 = createV1Router({ config :cfg, clients })
  app.use('/api/v0', v0)
  app.use('/api/v1', v1)

  let server: Server = http.createServer(options, app)
  if (cfg.api.mtls) {
    server = https.createServer(options, app)
  }
  return server.listen(cfg.api.url.port, () => {
    console.log(`API server listening at ${cfg.api.url.toString()}`)
  })

})


