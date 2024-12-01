import {createRouter, WORKFLOW_TYPE} from './v0'
import crypto from 'crypto'
import {OnboardingsPut} from './messages/v0'
import {Client, WorkflowClient} from '@temporalio/client'
import express, {Express, Response} from 'express'
import {OnboardEntityRequest} from '../domain/messages/v0'
import {Config} from '../config'
import {WorkflowIdReusePolicy} from '@temporalio/workflow'
const { expect } =require('chai')
const sinon = require('sinon')
const request = require('supertest')
describe('OnboardingsAPI', async () => {
  /*
   helper scoped funcs to define test args and doubles
   */
  const createTemporalClient = (wf?: WorkflowClient):Client => {

    if(!wf) {
      const wf = sinon.createStubInstance(WorkflowClient)
      wf.start = sinon.stub().returns(sinon.stub())
    }

    const tc= sinon.createStubInstance(Client)
    tc.workflow = wf
    return tc
  }
  const createCfg = (taskQueue?: string):Config => {
    if(!taskQueue) {
      taskQueue = crypto.randomBytes(8).toString('hex')
    }
    const testUrl = new URL('https://localhost:3001')
    return {
      api: {
        port: testUrl.port,
        url: testUrl
      },
      isProduction: false,
      temporal: {
        worker: {
          bundlePath: '',
          taskQueue,
        },
        connection: {
          namespace: 'test',
          target: testUrl.hostname,
          mtls: undefined
        }
      }
    }

  }
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
      router,
      temporalClient,
    }
  }
  describe('starting an onboarding works', async () => {
    it('should accept the entity onboarding request and provide resource location#state', async () => {
      const args: OnboardingsPut = {
        id: crypto.randomBytes(16).toString('hex'),
        value: crypto.randomBytes(16).toString('hex'),
      }
      const wf = sinon.createStubInstance(WorkflowClient)
      wf.start = sinon.stub().returns(sinon.stub())
      const sut = createSUT(createTemporalClient(wf))

      const res:Response = await request(sut.app)
        .put('/onboardings')
        .set('Content-Type', 'application/json')
        .send(args)
      expect(res.get('location')).eq(`./${args.id}`)
      expect(res.status).eq(202)

    })
    it('should start entity onboarding#behavior', async () => {
      const args: OnboardingsPut = {
        id: crypto.randomBytes(16).toString('hex'),
        value: crypto.randomBytes(16).toString('hex'),
      }


      const taskQueue = crypto.randomBytes(8).toString('hex')
      const cfg = createCfg(taskQueue)
      const wf = new WorkflowClient()
      const mockWf = sinon.mock(wf)
      let cmd:OnboardEntityRequest = {...args}
      mockWf.expects('start')
        .withExactArgs(WORKFLOW_TYPE, {
          // a subtle source of bugs are misteaken task queue assignments in starters
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
        .put('/onboardings')
        .set('Content-Type', 'application/json')
        .send(args)

      mockWf.verify()
    })
  })
})
