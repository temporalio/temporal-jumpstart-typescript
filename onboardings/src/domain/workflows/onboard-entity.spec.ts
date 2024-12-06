import { TestWorkflowEnvironment } from '@temporalio/testing';
import { before, describe, it } from 'mocha';
import { Worker } from '@temporalio/worker';
import {ERR_INVALID_ARGS, onboardEntity, signalApprove, queryGetState} from './onboard-entity'
import {OnboardEntityRequest} from '../messages/workflows/v0'
import crypto from 'crypto'
import {ApplicationFailure} from '@temporalio/workflow'
import {ApproveEntityRequest, RegisterCrmEntityRequest} from '../messages/commands/v0'
import {EntityOnboardingState} from '../messages/queries/v0'
import {ApprovalStatus} from '../messages/values/v0'
import {createIntegrationsHandlers} from '../integrations'
const  assert  = require('assert')
const sinon = require('sinon')
describe('OnboardEntity', function() {
  let testEnv: TestWorkflowEnvironment
  // NOTE we have a single environment for the entire suite
  // so be careful to use unique workflowIDs for your tests.
  before(async function() {

    let localPath =  '/opt/homebrew/bin/temporal'
    let timeSkippingPath = '/Users/mnichols/dev/sdk-java/temporal-test-server/build/graal/temporal-test-server'
    testEnv = await TestWorkflowEnvironment.createTimeSkipping({
      // server: {
      //   executable: {
      //     // avoid some of the download issues we might encounter
      //     path: timeSkippingPath,
      //     type: 'existing-path',
      //   }
      // }
    })
  })
  describe('givenValidArgsWithOwnerApprovalNoDeputyOwner', function() {
    describe('whenApproved', function() {
      // state verification
      it('shouldBeApproved', async function() {
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
          completionTimeoutSeconds: 2,
          deputyOwnerEmail: '',
          skipApproval: false
        }
        let actual: EntityOnboardingState
        await worker.runUntil(async () => {
          let wfRun = await client.workflow.start(onboardEntity, {
            taskQueue,
            workflowId: args.id,
            args: [args],
          })
          let cmd: ApproveEntityRequest = { comment: 'nocomment'}
          await wfRun.signal(signalApprove, cmd )
          // note we are using the Temporal sleep to play into the TimeSkipping
          actual = await wfRun.query<EntityOnboardingState>(queryGetState)
          assert.equal(actual.id, args.id)
          assert.equal(actual.approval.status, ApprovalStatus.APPROVED)
        })

      })
      // behavior verification
      it.only('should register the entity', async function() {
        let { nativeConnection, client } = testEnv
        let taskQueue = 'test'


        const args: OnboardEntityRequest = {
          id: crypto.randomBytes(16).toString('hex'),
          value: crypto.randomBytes(16).toString('hex'),
          completionTimeoutSeconds: 2,
          deputyOwnerEmail: '',
          skipApproval: false
        }
        let registerCrmEntity = sinon.mock()
        registerCrmEntity.withArgs({ id: args.id, value: args.value }).once().resolves()
        let registration: RegisterCrmEntityRequest | undefined = undefined
        const mockedActivities: ReturnType<typeof createIntegrationsHandlers>= {
          // registerCrmEntity: async function(cmd: RegisterCrmEntityRequest):Promise<void> {
          //   registration = cmd
          // }
          registerCrmEntity,
        }

        let worker = await Worker.create({
          connection: nativeConnection,
          taskQueue,
          workflowsPath: require.resolve('./onboard-entity'),
          activities: mockedActivities,
        })
        let actual: EntityOnboardingState
        await worker.runUntil(async () => {
          let wfRun = await client.workflow.start(onboardEntity, {
            taskQueue,
            workflowId: args.id,
            args: [args],
          })
          let cmd: ApproveEntityRequest = { comment: 'nocomment'}
          await wfRun.signal(signalApprove, cmd )
          // note we are using the Temporal sleep to play into the TimeSkipping
          actual = await wfRun.query<EntityOnboardingState>(queryGetState)
          assert.equal(actual.id, args.id)
          assert.equal(actual.approval.status, ApprovalStatus.APPROVED)
          await testEnv.sleep('5 seconds')
          // TODO pick up here
        })
        // assert.equal(registration, { id: args.id, value: args.value})
        registerCrmEntity.verify()

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
        completionTimeoutSeconds: 0,
        deputyOwnerEmail: '',
        skipApproval: false
      }

      await assert.rejects(async() => {
        await worker.runUntil(async () => {
          await client.workflow.execute(onboardEntity, {
            taskQueue,
            workflowId: args.id,
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
