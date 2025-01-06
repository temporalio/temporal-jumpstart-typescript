/*
   helper scoped funcs to define test args and doubles
   */
import {Client, WorkflowClient} from '@temporalio/client'
import {Config} from '../config'
import crypto from 'crypto'
import {
  LocalTestWorkflowEnvironmentOptions,
  TestWorkflowEnvironment,
  TimeSkippingTestWorkflowEnvironmentOptions
} from '@temporalio/testing'

const sinon = require('sinon')
export const createTemporalClient = (wf?: WorkflowClient):Client => {

  if(!wf) {
    const wf = sinon.createStubInstance(WorkflowClient)
    wf.start = sinon.stub().returns(sinon.stub())
  }

  let tc= sinon.createStubInstance(Client)
  tc.workflow = wf
  return tc
}
export const createLocalTestWorkflowEnvironment = async (opts:  LocalTestWorkflowEnvironmentOptions): Promise<TestWorkflowEnvironment> => {
  return TestWorkflowEnvironment.createLocal(opts)
}
export const createTimeSkippingTestWorkflowEnvironment = async(opts: TimeSkippingTestWorkflowEnvironmentOptions): Promise<TestWorkflowEnvironment> => {
  return TestWorkflowEnvironment.createTimeSkipping(opts)
}
export const createCfg = (taskQueue?: string):Config => {
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
