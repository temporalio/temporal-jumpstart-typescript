import {createRouter, WORKFLOW_TYPE} from './v0'
import crypto from 'crypto'
import {OnboardingsPut} from './messages/v0'
import {Client, WorkflowClient} from '@temporalio/client'
import express, {Express, Response} from 'express'
import {ActivateDeviceRequest} from '../domain/messages/workflows/v0'
import {Config} from '../config'
import {WorkflowIdReusePolicy} from '@temporalio/workflow'
import {createCfg, createTemporalClient} from '../test/utils'
const { expect } =require('chai')
const sinon = require('sinon')
const request = require('supertest')
describe('OnboardingsAPI#v0', async () => {
  const createSUT = (temporalClient?: Client,
                            cfg?:Config) => {
    let app:Express
    app = express();
    const testUrl = new URL('https://localhost:3001')
    if(!cfg) {
      cfg = createCfg()
    }

    if(!temporalClient) {
      temporalClient = createTemporalClient()
    }

    const router = createRouter({
      config: cfg,
      clients: {
        temporal: temporalClient,
      }})
    app.use(express.json())
    app.use('/', router)
    return {
      app,
      cfg,
      temporalClient,
    }
  }
  describe('starting an entity onboarding', async () => {
    it('should accept the entity request and provide resource location#state', async () => {
      const args: OnboardingsPut = {
        id: crypto.randomBytes(16).toString('hex'),
        value: crypto.randomBytes(16).toString('hex'),
      }
      const wf = sinon.createStubInstance(WorkflowClient)
      wf.start = sinon.stub().returns(sinon.stub())
      const sut = createSUT(createTemporalClient(wf))

      const res:Response = await request(sut.app)
        .put(`/onboardings/${args.id}`)
        .set('Content-Type', 'application/json')
        .send(args)
      expect(res.get('location')).eq(`./${args.id}`)
      expect(res.status).eq(202)

    })
    it('should start a workflow that has not been defined#behavior', async () => {
      const args: OnboardingsPut = {
        id: crypto.randomBytes(16).toString('hex'),
        value: crypto.randomBytes(16).toString('hex'),
      }


      const taskQueue = crypto.randomBytes(8).toString('hex')
      const cfg = createCfg(taskQueue)
      const wf = new WorkflowClient()
      const mockWf = sinon.mock(wf)
      let cmd:ActivateDeviceRequest = {...args}
      mockWf.expects('start')
        .withExactArgs(WORKFLOW_TYPE, {
          // A subtle source of bugs are incorrect task queue assignments in starters
          // the Worker will never pick up the task!
          taskQueue,
          args: [cmd],
          workflowId: args.id,
          retry: undefined,
          workflowIdReusePolicy: WorkflowIdReusePolicy.ALLOW_DUPLICATE_FAILED_ONLY,
        })
        .once()

      const sut = createSUT(createTemporalClient(wf), cfg)

      await request(sut.app)
        .put(`/onboardings/${args.id}`)
        .set('Content-Type', 'application/json')
        .send(args)

      mockWf.verify()
    })
  })

})
