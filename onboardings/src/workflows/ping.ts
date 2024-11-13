import { PingRequest, PingResponse, PingResponseSchema } from '../../../generated/onboardings/api/v0/message_pb.js'
import { log } from '@temporalio/workflow'
import { create } from '@bufbuild/protobuf'

export async function ping(params: PingRequest): Promise<PingResponse> {
  log.info('received', params)
  const res = create(PingResponseSchema, {
    name: `${params.name} is here`,
  })
  return Promise.resolve(res)
}
