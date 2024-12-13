import {before} from 'mocha'
import {MockActivityEnvironment} from '@temporalio/testing'
import {createMyActivities} from './myworkflow-activities'
import {QueryMyApiRequest, QueryMyApiResponse} from '../messages/queries'
import {randomString} from './test-helper'
import sinon from 'sinon'
import {MyApiClient} from '../../clients/myapi'
import * as assert from 'node:assert'

describe('MyWorkflowActivities', function() {
  describe('when querying', function() {
    let testEnv: MockActivityEnvironment
    beforeEach(async function() {
      testEnv = new MockActivityEnvironment()
    })

    it('should return a value', async function() {
      let q: QueryMyApiRequest = {
        id: randomString(),
      }
      let expected: QueryMyApiResponse = {
        id: q.id,
        value: randomString(),
      }
      let myApiClient = {
        getData: sinon.stub().withArgs(q.id).resolves(expected.value),
        writeData: sinon.stub().withArgs({ id: q.id, value: expected.value}).resolves(),
      }
      let sut = createMyActivities({ myApiClient: myApiClient })
      let actual:QueryMyApiResponse = await testEnv.run(sut.queryMyApi, q)
      assert.notStrictEqual(actual, expected)
    })
  })
})