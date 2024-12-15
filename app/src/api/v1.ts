import express, {type Router, Response, request} from 'express'
import { Clients } from '../clients'
import { Config } from '../config'
import {TypedRequestBody} from './typed-request-body'
import {WorkflowIdReusePolicy} from '@temporalio/workflow'
import {WorkflowExecutionAlreadyStartedError, WorkflowNotFoundError} from '@temporalio/client'
import { PutPing } from './messages'
import { ping } from '../domain/workflows'

import {pong} from '../domain/workflows/ping'


interface V1Dependencies {
  clients: Clients
  config: Config
}
export const createRouter = (deps: V1Dependencies) => {
  const router: Router = express.Router()
  router.get('/pings/:id', async (req, res) => {
    const workflowId = req.params.id
    try {
      const handle = deps.clients.temporal.workflow.getHandle(workflowId)
      let result: string = await handle.query(pong)
      res.status(200).send(result)
    } catch(err: unknown) {
      if(err instanceof WorkflowNotFoundError) {
        res.send(404)
        return
      }
      res.send(500)
    }
  })
  router.put('/pings/:id', async (req:TypedRequestBody<PutPing>, res: Response) => {
    try {
      let result = await deps.clients.temporal.workflow.execute(ping, {
        taskQueue: deps.config.temporal.worker.taskQueue,
        args: [req.body.ping],
        workflowId: `${req.params.id}`,
        retry: undefined,
        workflowIdReusePolicy: WorkflowIdReusePolicy.ALLOW_DUPLICATE_FAILED_ONLY,
      })
      res.location(`./${req.params.id}`)
      res.status(202).send(result)

    } catch(err: unknown) {
      if(err instanceof WorkflowExecutionAlreadyStartedError) {
        res.status(409).send(`PingWorkflow '${req.params.id}' has already been started.`)
        return
      }
      res.send(500)
    }
  })
  return router
}
