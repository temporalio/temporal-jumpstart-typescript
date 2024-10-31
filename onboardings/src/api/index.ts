import express, {Express, Request, Response, Router} from 'express'
// import {createClient} from '../clients/temporal/index.js'
import {cfg} from '../config/index.js'
import fs from 'fs'
import https from 'https'
import cors from 'cors'
import swaggerUI from 'swagger-ui-express'
import swaggerDocument from './swagger.json'

const app: Express = express()
app.use(cors())


const onboardings: Router = express.Router()

app.get('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

onboardings.get('/', (req: Request, res: Response) => {
    res.send("Express + TypeScript Server");
})

let options = {}
if (cfg.API.mtls && cfg.API.mtls.certChainFile && cfg.API.mtls.keyFile) {
// Start the server at port
    options = {
        key: fs.readFileSync(cfg.API.mtls?.keyFile),
        cert: fs.readFileSync(cfg.API.mtls?.certChainFile),
    };
}

app.use('/', onboardings)
const httpsServer = https.createServer(options, app)
httpsServer.listen(cfg.API.url.port, () => {
    console.log(`Running a GraphQL API server at ${cfg.API.url}`)
})