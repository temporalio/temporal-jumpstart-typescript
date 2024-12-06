import { TestWorkflowEnvironment } from '@temporalio/testing';
import { before, describe, it } from 'mocha';
import { Worker } from '@temporalio/worker';
import {ERR_INVALID_ARGS, onboardEntity} from './onboard-entity'
import {OnboardEntityRequest} from '../messages/workflows/v0'
import crypto from 'crypto'
import {ApplicationFailure} from '@temporalio/workflow'
const  assert  = require('assert')
describe('OnboardEntity', function() {

  describe('given bad arguments', function() {
    let testEnv: TestWorkflowEnvironment
    before(async function() {
      testEnv = await TestWorkflowEnvironment.createLocal({
        server: {
          executable: {
            path: '/opt/homebrew/bin/temporal',
            type: 'existing-path',
          }
        }
      })
    })
    it('should fail correctly', async function (){
      let { nativeConnection, client } = testEnv
      let taskQueue = 'test'
      let worker = await Worker.create({
        connection: nativeConnection,
        taskQueue,
        workflowsPath: require.resolve('./onboard-entity'),
      })
      const args: OnboardEntityRequest = {
        id: crypto.randomBytes(16).toString('hex'),
        value: '  ',
      }

      await assert.rejects(async() => {
        await worker.runUntil(async () => {
          await client.workflow.execute(onboardEntity, {
            taskQueue,
            workflowId: 'foo',
            args: [args],
          })
        })
      }, function(e:any): e is string {
        return e.cause instanceof ApplicationFailure && (e.cause as ApplicationFailure).type == ERR_INVALID_ARGS
      }, 'failed to receive correct error')
    })
    after(async function () {
      testEnv?.teardown()
    })
  })

})
