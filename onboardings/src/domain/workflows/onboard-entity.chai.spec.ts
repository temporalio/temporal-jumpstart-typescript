import { TestWorkflowEnvironment } from '@temporalio/testing';
import { before, describe, it } from 'mocha';
import { Worker } from '@temporalio/worker';
import {ERR_INVALID_ARGS, onboardEntity} from './onboard-entity'
import {OnboardEntityRequest} from '../messages/workflows/v0'
import crypto from 'crypto'
import {WorkflowFailedError} from '@temporalio/client'
require('../../test/setup.mjs')
const { expect } = require('chai')
describe('OnboardEntity.chai', function() {
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
        // activities,
      })
      const args: OnboardEntityRequest = {
        id: crypto.randomBytes(16).toString('hex'),
        value: crypto.randomBytes(16).toString('hex'),
      }
      await expect((async () => {
        await worker.runUntil(async () => {
          await client.workflow.execute(onboardEntity, {
            taskQueue,
            workflowId: 'foo',
            args: [args],
          })
      })})()).to.eventually.be.rejectedWith(WorkflowFailedError).and.have.property('cause').that.has.property('type', ERR_INVALID_ARGS)

    })
    after(async function () {
      testEnv?.teardown()
    })
  })

})
