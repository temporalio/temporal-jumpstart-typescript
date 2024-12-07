import {TestWorkflowEnvironment} from '@temporalio/testing';
import {before, describe, it} from 'mocha';
import {Worker} from '@temporalio/worker';
import * as onboardEntityLatest from './onboard-entity'
import * as onboardEntityV1Beta from './onboard-entity-v1-beta'
import {OnboardEntityRequest} from '../messages/workflows/v0'
import crypto from 'crypto'
import {ApplicationFailure} from '@temporalio/workflow'
import {ApproveEntityRequest} from '../messages/commands/v0'
import {EntityOnboardingState} from '../messages/queries/v0'
import {ApprovalStatus} from '../messages/values/v0'
import {createIntegrationsHandlers} from '../integrations'

const assert = require('assert')
const sinon = require('sinon')

const LOCAL_CLI_PATH = '/opt/homebrew/bin/temporal'
const TIMESKIPPING_SERVER_PATH = '/Users/mnichols/dev/sdk-java/temporal-test-server/build/graal/temporal-test-server'

describe('OnboardEntity', function () {
  describe('V1-beta', function () {
    let {ERR_INVALID_ARGS, onboardEntity, workflowsPath} = onboardEntityV1Beta

    let testEnv: TestWorkflowEnvironment
    // NOTE we have a single environment for the entire suite
    // so be careful to use unique workflowIDs for your tests.
    before(async function () {


      testEnv = await TestWorkflowEnvironment.createLocal({
        server: {
          executable: {
            // avoid some of the download issues we might encounter
            path: LOCAL_CLI_PATH,
            type: 'existing-path',
          }
        }
      })
    })
    after(async function () {
      testEnv?.teardown()
    })


    // we dont need to time skip here so we will just use the Local test environment
    describe('Module:Workflows.given bad arguments', function () {

      it('should fail correctly', async function () {
        let {nativeConnection, client} = testEnv
        let taskQueue = 'test'
        let worker = await Worker.create({
          connection: nativeConnection,
          taskQueue,
          workflowsPath,
        })
        const args: OnboardEntityRequest = {
          id: crypto.randomBytes(16).toString('hex'),
          value: '  ', // missing a valid VALUE
          completionTimeoutSeconds: 0,
          deputyOwnerEmail: '',
          skipApproval: false
        }

        await assert.rejects(async () => {
          await worker.runUntil(async () => {
            await client.workflow.execute(onboardEntity, {
              taskQueue,
              workflowId: args.id,
              args: [args],
            })
          })
        }, function (e: any): e is string {
          return e.cause instanceof ApplicationFailure && (e.cause as ApplicationFailure).type == ERR_INVALID_ARGS
        }, 'failed to receive correct error')
      })
    })
    describe('Module:Activities.given valid args', function () {

      it('should register the crm entity', async function () {
        let {nativeConnection, client} = testEnv
        let taskQueue = 'v1'
        const args: OnboardEntityRequest = {
          id: crypto.randomBytes(16).toString('hex'),
          value: crypto.randomBytes(16).toString('hex'),
          completionTimeoutSeconds: 0,
          deputyOwnerEmail: '',
          skipApproval: true
        }

        let registerCrmEntity = sinon.mock().withArgs({id: args.id, value: args.value}).once().resolves()
        let mockActivities: ReturnType<typeof createIntegrationsHandlers> = {
          registerCrmEntity
        }
        let worker = await Worker.create({
          connection: nativeConnection,
          taskQueue,
          workflowsPath,
          activities: mockActivities
        })

        await worker.runUntil(async () => {
          await client.workflow.execute(onboardEntity, {
            taskQueue,
            workflowId: args.id,
            args: [args],
          })
        })
        registerCrmEntity.verify()
      })
    })
  })
})
describe('V1', function () {
  let {
    onboardEntity,
    signalApprove,
    queryGetState,
    workflowsPath,
  } = onboardEntityLatest

  describe('givenValidArgsWithOwnerApprovalNoDeputyOwner', function () {

    let testEnv: TestWorkflowEnvironment
    // NOTE we have a single environment for the entire suite
    // so be careful to use unique workflowIDs for your tests.
    before(async function () {
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
    after(async function () {
      testEnv?.teardown()
    })
    describe('whenApproved', function () {
      // state verification
      it('shouldBeApproved', async function () {
        let {nativeConnection, client} = testEnv
        let taskQueue = 'test'
        let stubbedActivities: ReturnType<typeof createIntegrationsHandlers> = {
          // just resolve our activity, verify its call in the next test
          registerCrmEntity: sinon.stub().resolves()
        }
        let worker = await Worker.create({
          connection: nativeConnection,
          taskQueue,
          workflowsPath,
          activities: stubbedActivities,
        })
        const args: OnboardEntityRequest = {
          id: crypto.randomBytes(16).toString('hex'),
          value: crypto.randomBytes(16).toString('hex'),
          completionTimeoutSeconds: 2,
          deputyOwnerEmail: '',
          skipApproval: false
        }
        let actual: EntityOnboardingState = {
          approval: {comment: '', status: ApprovalStatus.PENDING},
          id: '',
          sentRequest: {
            completionTimeoutSeconds: 0,
            deputyOwnerEmail: '',
            id: '',
            skipApproval: false,
            value: ''
          }, status: ''
        }

        await worker.runUntil(async () => {
          // here we change to use `start` so we can perform other acts on the Workflow
          let wfRun = await client.workflow.start(onboardEntity, {
            taskQueue,
            workflowId: args.id,
            args: [args],
          })
          let cmd: ApproveEntityRequest = {comment: 'nocomment'}
          // simulate a delay before sending our approval
          await testEnv.sleep('1 second')
          await wfRun.signal(signalApprove, cmd)
          // note we are using the Temporal sleep to play into the TimeSkipping
          actual = await wfRun.query<EntityOnboardingState>(queryGetState)
        })
        assert.ok(actual)
        assert.equal(actual.id, args.id)
        assert.equal(actual.approval.status, ApprovalStatus.APPROVED)
      })
      // behavior verification
      it('should register the entity', async function () {
        let {nativeConnection, client} = testEnv
        let taskQueue = 'test'


        const args: OnboardEntityRequest = {
          id: crypto.randomBytes(16).toString('hex'),
          value: crypto.randomBytes(16).toString('hex'),
          completionTimeoutSeconds: 2,
          deputyOwnerEmail: '',
          skipApproval: false
        }

        /*
          Two ways to mock behavior:
          1. sinon mock with fluent expectations + `verify`
          2. plain ole callback mock with `assert` on inputs and counts
         */
        let registerCrmEntity = sinon.mock()
        registerCrmEntity.withArgs({id: args.id, value: args.value}).once().resolves()

        // If I want to assert the contract of funcs I want to use as activities I could do this:
        const mockedActivities: ReturnType<typeof createIntegrationsHandlers> = {
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
          let cmd: ApproveEntityRequest = {comment: 'nocomment'}
          // simulate a delay before sending our approval
          await testEnv.sleep('1 second')
          await wfRun.signal(signalApprove, cmd)
          // note we are using the Temporal sleep to play into the TimeSkipping
          actual = await wfRun.query<EntityOnboardingState>(queryGetState)
          assert.equal(actual.id, args.id)
          assert.equal(actual.approval.status, ApprovalStatus.APPROVED)
        })
        registerCrmEntity.verify()
      })
    })
  })
})
