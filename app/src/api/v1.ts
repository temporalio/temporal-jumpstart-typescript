import express, {type Router, Response, request} from 'express'
import { Clients } from '../clients'
import { Config } from '../config'
import {TypedRequestBody} from './typed-request-body'
import {OnboardingsPut} from './messages/v0'
import {OnboardEntityRequest} from '../domain/messages/workflows/v1'
import {WorkflowIdReusePolicy} from '@temporalio/workflow'
import {WorkflowNotFoundError} from '@temporalio/client'
import {EntityOnboardingState} from '../domain/messages/queries/v0'
import {queryGetState} from '../domain/workflows/onboard-entity'

interface V1Dependencies {
  clients: Clients
  config: Config
}
async function onboardEntity(params: OnboardEntityRequest) {}
export const createRouter = (deps: V1Dependencies) => {
  const router: Router = express.Router()
  router.get('/onboardings/:id', async (req, res) => {
    const workflowId = req.params.id

    try {
      const handle = deps.clients.temporal.workflow.getHandle(workflowId)
      let result: EntityOnboardingState = await handle.query(queryGetState)
      res.json(result)
    } catch(err: unknown) {
      if(err instanceof WorkflowNotFoundError) {
        res.send(404)
        return
      }
      res.send(500)
    }

  })
  router.put('/onboardings/:id', async (req:TypedRequestBody<OnboardingsPut>, res: Response) => {

    let cmd:OnboardEntityRequest = {...req.body,
      deputyOwnerEmail: '',
      completionTimeoutSeconds: 60,
      skipApproval: false,
    }

    let wfExec = await deps.clients.temporal.workflow.start(onboardEntity, {
      taskQueue: deps.config.temporal.worker.taskQueue,
      args: [cmd],
      workflowId: `${cmd.id}`,
      retry: undefined,
      workflowIdReusePolicy: WorkflowIdReusePolicy.ALLOW_DUPLICATE_FAILED_ONLY,
    })
    res.location(`./${req.params.id}`)
    res.sendStatus(202)
  })
  return router
}
