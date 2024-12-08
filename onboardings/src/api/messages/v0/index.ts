import {OnboardEntityRequest} from '../../../domain/messages/workflows/v0'
import * as proto from '@temporalio/proto/protos/root'
export type PingRequest = {
  value: string
}
export type PingResponse = {
  value: string
}

export type OnboardingsPut = {
  id: string
  value: string
}

export type OnboardingsEntityGet = {
  id: string
  status?: proto.temporal.api.enums.v1.WorkflowExecutionStatus | null
  sentRequest?: OnboardEntityRequest
}