import express, { type Router, Request, Response, NextFunction } from 'express'
import { Clients } from '../clients'
import { Config } from '../config'
import {TypedRequestBody} from './typed-request-body'
import {PingRequest, PingResponse} from './messages/v0'

interface V0Dependencies {
  clients: Clients
  config: Config
}

export const createRouter = (deps: V0Dependencies) => {
  const router: Router = express.Router()
  router.get('/:id', (req: TypedRequestBody<PingRequest>, res: Response) => {

    console.log('ing', req.body)
    res.send(JSON.stringify(req.body))
    // next()
  })
  router.put('/:id', async (req: TypedRequestBody<PingRequest>, res: Response) => {
    const ping: PingRequest = req.body
    let result: PingResponse = await deps.clients.temporal.workflow.execute('ping', {
      taskQueue: 'apps',
      args: [ping],
      workflowId: 'bleh' + ping.value,
    })
    console.log('res', ping)
    res.send(JSON.stringify(result))
    // next()
  })
  return router
}
