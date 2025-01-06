import {before, describe} from 'mocha'
import {TestWorkflowEnvironment, TimeSkippingWorkflowClient} from '@temporalio/testing'
import {Worker, WorkerOptions} from '@temporalio/worker'
import {myworkflow} from './myworkflow'
import {StartMyWorkflowRequest} from '../../messages/_scaffold/workflows'
import {randomString} from './test-helper'
import * as assert from 'node:assert'

const SUT_WORKFLOWS_PATH = require.resolve('./myworkflow')

describe('MyWorkflow', function() {
  let testEnv: TestWorkflowEnvironment
  // NOTE we have a single environment for the entire suite
  // so be careful to use unique workflowIDs for your tests.
  before(async function () {
    testEnv = await TestWorkflowEnvironment.createLocal({})
    // alternatively use the "timeskipping" server
    // testEnv = await TestWorkflowEnvironment.createTimeSkipping({})
  })
  after(async function () {
    testEnv?.teardown()
  })

  describe('smokeTest', function() {
    it('should simply execute and exit', async function () {
      let opts: WorkerOptions = {
        connection: testEnv.nativeConnection,
        taskQueue: 'test',
        workflowsPath: SUT_WORKFLOWS_PATH,
        activities: {},
      }
      const args: StartMyWorkflowRequest = {
        id: randomString(),
        value: randomString(),
      }

      let worker = await Worker.create(opts)

      await assert.doesNotReject(async () => {
        await (worker.runUntil(async () => {
          await testEnv.client.workflow.execute(myworkflow, {
            args: [args],
            taskQueue: opts.taskQueue,
            workflowId: args.id,
            retry: {
              maximumAttempts: 1,
            }
          })
        }))
      })
    })
  })
})