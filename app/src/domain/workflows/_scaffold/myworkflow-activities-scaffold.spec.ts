import {MockActivityEnvironment} from '@temporalio/testing'
import {createMyActivities, DEFAULT_DATE_RANGE} from './myworkflow-activities'
import {QueryMyApiRequest, QueryMyApiResponse} from '../../messages/_scaffold/queries'
import {randomString} from './test-helper'
import sinon from 'sinon'
import * as assert from 'node:assert'
import {cancellationSignal, cancelled, Context, heartbeat, sleep} from '@temporalio/activity'
import {ApplicationFailure} from '@temporalio/activity'
import {CancelledFailure} from '@temporalio/workflow'

interface ActivityExecutionDetails {
  heartbeatsReported: number
}
async function myLongRunningActivity(): Promise<ActivityExecutionDetails> {
  let details: ActivityExecutionDetails = {
    heartbeatsReported: 0
  }
  let heartbeatTimeoutMs = Context.current().info.heartbeatTimeoutMs
  if(!heartbeatTimeoutMs) {
    throw ApplicationFailure.nonRetryable("Heartbeat is required", "ERR_MISSING_HEARTBEAT_TIMEOUT")
  }
  let heartbeatInterval = heartbeatTimeoutMs / 2

  async function mainOperation(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        await sleep(Context.current().info.startToCloseTimeoutMs - 100)
        resolve('operation complete')
      } catch(err) {
        // this try..catch is unnecessary but for demonstration purposes
        // to see how to test if an Workflow was Canceled
        if(err instanceof CancelledFailure) {
          // do something
        }
        reject(err)
      }
    })


  }
  async function doHeartbeat():Promise<void> {
    new Promise(async (resolve, reject) => {
      // noinspection InfiniteLoopJS
      while(true) {
        await sleep(heartbeatInterval)
        heartbeat()
        details.heartbeatsReported = details.heartbeatsReported + 1
      }
    })
  }
  // race cancellation from heartbeat versus the underlying operation we care about
  // the first failure to arrive will "settle" the entire lot
  return doHeartbeat().then(
    () => mainOperation()).then(
      () => Promise.resolve(details))
}

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
        validFrom: DEFAULT_DATE_RANGE,
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
  describe('when background heartbeating', function() {
    let testEnv: MockActivityEnvironment
    beforeEach(async function() {
      testEnv = new MockActivityEnvironment({
        startToCloseTimeoutMs: 2000,
        heartbeatTimeoutMs: 200,
      })
    })
    it('should sent details back', async function() {
      let actual: ActivityExecutionDetails = { heartbeatsReported: 0}

      actual = await testEnv.run(myLongRunningActivity)
      assert.equal(actual.heartbeatsReported, 18)
    })
  })
})