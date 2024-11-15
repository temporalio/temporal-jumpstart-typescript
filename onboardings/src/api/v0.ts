import express, { type Router, Request, Response, NextFunction } from 'express'
import {type PingRequest, PingRequestSchema, PingResponse} from '../generated/onboardings/api/v0/api_pb.js'
import { fromJson, JsonObject, JsonValue } from '@bufbuild/protobuf'
import { Clients } from '../clients/index.js'
import { Config } from '../config'

interface V0Dependencies {
  clients: Clients
  config: Config
}
export interface TypedRequestBody<T> extends Express.Request {
  body: T
}
export const createRouter = (deps: V0Dependencies) => {
  const router: Router = express.Router()
  router.get('/:id', (req: TypedRequestBody<JsonValue>, res: Response) => {
    const ping: PingRequest = fromJson(PingRequestSchema, req.body)
    console.log('ing', ping)
    res.send('foo')
    // next()
  })
  router.put('/:id', async (req: TypedRequestBody<JsonValue>, res: Response) => {
    const ping: PingRequest = fromJson(PingRequestSchema, req.body)
    let result: PingResponse = await deps.clients.temporal.workflow.execute('ping', {
      taskQueue: 'apps',
      args: [{name: ping.name}],
      workflowId: 'bleh',
    })
    console.log('res', result)
    res.send(result)
    // next()
  })
  return router
}
