import express, { type Router, Response } from 'express'
import { Clients } from '../clients'
import { Config } from '../config'
import {TypedRequestBody} from './typed-request-body'
import {OnboardingsPut, PingRequest, PingResponse} from './messages/v0'
import {OnboardEntityRequest} from '../domain/messages/v0'
import {WorkflowIdReusePolicy} from '@temporalio/workflow'

interface V0Dependencies {
  clients: Clients
  config: Config
}
export const WORKFLOW_TYPE = 'WorkflowDefinitionDoesntExistYet'

export const createRouter = (deps: V0Dependencies) => {
  const router: Router = express.Router()
  // router.get('/:id', (req: TypedRequestBody<PingRequest>, res: Response) => {
  //
  //   console.log('ing', req.body)
  //   res.send(JSON.stringify(req.body))
  //   // next()
  // })
  // router.put('/:id', async (req: TypedRequestBody<PingRequest>, res: Response) => {
  //   const ping: PingRequest = req.body
  //   let result: PingResponse = await deps.clients.temporal.workflow.execute('ping', {
  //     taskQueue: 'apps',
  //     args: [ping],
  //     workflowId: 'bleh' + ping.value,
  //   })
  //   console.log('res', ping)
  //   res.send(JSON.stringify(result))
  //   // next()
  // })
  router.put('/onboardings', async (req: TypedRequestBody<OnboardingsPut>, res: Response) => {
    let cmd:OnboardEntityRequest = {...req.body}
    let wfExec = await deps.clients.temporal.workflow.start(WORKFLOW_TYPE, {
      taskQueue: deps.config.temporal.worker.taskQueue,
      args: [cmd],
      workflowId: `${cmd.id}`,
      retry: undefined,
      workflowIdReusePolicy: WorkflowIdReusePolicy.ALLOW_DUPLICATE_FAILED_ONLY,
    })
    res.location(`./${cmd.id}`)
    res.sendStatus(202)
  })
  return router
}
