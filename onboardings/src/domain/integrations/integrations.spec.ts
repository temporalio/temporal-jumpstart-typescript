import {MockActivityEnvironment} from '@temporalio/testing'
import { createIntegrationsHandlers } from './index'
import * as assert from 'node:assert'
import {RegisterCrmEntityRequest} from '../messages/commands/v0'
import crypto from 'crypto'
import { ApplicationFailure } from '@temporalio/activity'
import {Errors} from '../messages/workflows/v1'

describe('Integrations', function() {
  describe('Module:Activities.when crm api cannot reply', function() {
    let testEnv: MockActivityEnvironment
    before(async () => {
      testEnv = new MockActivityEnvironment()
    })
    after(async () => {
    })
    it.only('should throw service unrecoverable', async () => {
      let sut = createIntegrationsHandlers()
      let args: RegisterCrmEntityRequest = {
        id: crypto.randomBytes(16).toString('hex'),
        value: crypto.randomBytes(16).toString('hex')
      }
      await assert.rejects(async () => {
        await testEnv.run(sut.registerCrmEntity, args)
      }, function(e :any) :e is ApplicationFailure {
        return (e as ApplicationFailure).type == Errors.ERR_SERVICE_UNRECOVERABLE
      }, 'service error was not thrown')
    })
  } )
})