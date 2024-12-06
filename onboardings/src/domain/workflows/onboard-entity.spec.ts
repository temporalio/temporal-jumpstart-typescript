import { TestWorkflowEnvironment } from '@temporalio/testing';
import { before, describe, it } from 'mocha';
import { Worker } from '@temporalio/worker';
import {ERR_INVALID_ARGS, onboardEntity, signalApprove, queryGetState} from './onboard-entity'
import {OnboardEntityRequest} from '../messages/workflows/v0'
import crypto from 'crypto'
import {ApplicationFailure} from '@temporalio/workflow'
import {ApproveEntityRequest} from '../messages/commands/v0'
const  assert  = require('assert')
describe('OnboardEntity', function() {
  let testEnv: TestWorkflowEnvironment
  // NOTE we have a single environment for the entire suite
  // so be careful to use unique workflowIDs for your tests.
  before(async function() {
    testEnv = await TestWorkflowEnvironment.createLocal({
      server: {
        executable: {
          // avoid some of the download issues we might encounter
          path: '/opt/homebrew/bin/temporal',
          type: 'existing-path',
        }
      }
    })
  })
  describe('givenValidArgsWithOwnerApprovalNoDeputyOwner', function() {
    describe('whenApproved', function() {
      it('shouldBeApproved', function() {
        let { nativeConnection, client } = testEnv
        let taskQueue = 'test'
        let worker = await Worker.create({
          connection: nativeConnection,
          taskQueue,
          workflowsPath: require.resolve('./onboard-entity'),
        })
        const args: OnboardEntityRequest = {
          id: crypto.randomBytes(16).toString('hex'),
          value: crypto.randomBytes(16).toString('hex'),
        }
        worker.run().then(() => {
          let wfRun = await client.workflow.start(onboardEntity, {
            taskQueue,
            workflowId: 'foo',
            args: [args],
          })
          let cmd: ApproveEntityRequest = { comment: 'nocomment'}
          await wfRun.signal(signalApprove, cmd )
          // TODO pick up here
        })
        await worker.runUntil(async () => {
          await client.workflow.execute(onboardEntity, {
            taskQueue,
            workflowId: 'foo',
            args: [args],
          })
        })
        await assert.rejects(async() => {

        }, function(e:any): e is string {
          return e.cause instanceof ApplicationFailure && (e.cause as ApplicationFailure).type == ERR_INVALID_ARGS
        }, 'failed to receive correct error')
      })
      })
    })
  })
  describe('given bad arguments', function() {

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
  })
  after(async function () {
    testEnv?.teardown()
  })
})
