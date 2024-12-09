import { log } from '@temporalio/workflow'
import {PingRequest, PingResponse} from '../messages/workflows/v0'

export async function ping(params: PingRequest): Promise<PingResponse> {
  log.info('ping workflow received', params)
  const res: PingResponse = {
    value: `${params.value} is here`,
  }
  return Promise.resolve(res)
}
