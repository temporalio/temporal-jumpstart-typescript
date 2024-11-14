import express, { Express } from 'express'
// import {createClient} from '../clients/temporal/index.js'
import { cfg } from '../config/index.js'
import fs from 'fs'
import https from 'https'
import cors from 'cors'
import { createRouter as createV0Router } from './v0.js'
import {Clients, createClients} from '../clients/index.js'

const clients: Clients = await createClients(cfg)

const app: Express = express()
app.use(cors())
app.use(express.json())

// const onboardings: Router = express.Router()
//
// onboardings.get('/', (req: Request, res: Response) => {
//   res.send('Express + TypeScript Server')
// })

let options = {}
if (cfg.api.mtls && cfg.api.mtls.certChainFile && cfg.api.mtls.keyFile) {
// Start the server at port
  options = {
    key: fs.readFileSync(cfg.api.mtls?.keyFile),
    cert: fs.readFileSync(cfg.api.mtls?.certChainFile),
  }
}

const v0 = createV0Router({ config: cfg, clients })
app.use('/v0', v0)
const httpsServer = https.createServer(options, app)
httpsServer.listen(cfg.api.url.port, () => {
  console.log(`API server listening at ${cfg.api.url.toString()}`)
})
