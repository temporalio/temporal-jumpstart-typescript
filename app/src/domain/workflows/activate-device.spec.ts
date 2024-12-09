import { TestWorkflowEnvironment } from '@temporalio/testing';
import { Worker } from '@temporalio/worker'
import { ActivateDeviceRequest, Errors } from 'src/domain/messages/workflows/v0';
import { activateDevice, workflowsPath } from './activate-device'
import { ActivateDeviceState } from 'src/domain/messages/queries/activate-device-state';
import crypto from 'crypto'
import {ApplicationFailure} from '@temporalio/workflow'


const assert = require('assert')
const sinon = require('sinon')


//TODO: lexical bindings


describe('activate-device', async function () {

    let testEnv: TestWorkflowEnvironment
    // NOTE we have a single environment for the entire suite
    // so be careful to use unique workflowIDs for your tests.

    before(async function () {
        testEnv = await TestWorkflowEnvironment.createLocal()
    })
    
    after(async function () {
        await testEnv?.teardown()
    })

    beforeEach(async function (){
        
    })

    describe('Module:Workflows.given bad arguments', function () {

        it('should fail correctly', async function () {
          let {nativeConnection, client} = testEnv
          let taskQueue = 'test'
          let worker = await Worker.create({
            connection: nativeConnection,
            taskQueue,
            workflowsPath,
          })
          const args: ActivateDeviceRequest = {
            id: crypto.randomBytes(16).toString('hex'),
            value: '  ', // missing a valid VALUE
            iridium: {
              plan: "test-plan"
            },
            twilio: {
              country: "asdf",
              nearNumber: "asdf",
              friendlyName: "asdf",
              countryCode: "asdf",
            },
            imei: "     ",
          }
  
          await assert.rejects(async function (){
            await worker.runUntil(async function (){
              await client.workflow.execute(activateDevice, {
                taskQueue,
                workflowId: args.id,
                args: [args],
                retry: {
                    initialInterval: '50ms',
                    maximumInterval: '50ms',
                    maximumAttempts: 1,
                }
              })
            })
          }, function (e: any): e is string {
            return e.cause instanceof ApplicationFailure && (e.cause as ApplicationFailure).type == Errors.ERR_INVALID_ARGS
          }, 'failed to receive correct error')
        })
      })

    it.only('Args should be sanitized when we activate a device', async function (){
      const args: ActivateDeviceRequest = {
        id: crypto.randomBytes(16).toString('hex'),
        value: '  ', // missing a valid VALUE
        iridium: {
          plan: "test-plan"
        },
        twilio: {
          country: "asdf",
          nearNumber: "asdf",
          friendlyName: "asdf",
          countryCode: "asdf",
        },
        imei: "asdf",
      }
      let {nativeConnection, client} = testEnv
      let taskQueue = 'test'
      let sanitizeArgs = sinon.mock().withArgs(args).once().resolves({})
      let worker = await Worker.create({
        connection: nativeConnection,
        taskQueue,
        workflowsPath,
        activities: {
          sanitizeArgs
        }
      })

      await worker.runUntil(async function (){
        await client.workflow.execute(activateDevice, {
          taskQueue,
          workflowId: args.id,
          args: [args],
          retry: {
              initialInterval: '50ms',
              maximumInterval: '50ms',
              maximumAttempts: 1,
          }
        })
      })
      sanitizeArgs.verify()
    })
})