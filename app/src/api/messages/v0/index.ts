import {ActivateDeviceRequest} from '../../../domain/messages/workflows/v0'
import * as proto from '@temporalio/proto/protos/root'
export type PingRequest = {
  value: string
}
export type PingResponse = {
  value: string
}

export type OnboardingsPut = {
  id: string
  imei: string
  iridium: {
    plan: string
  }
  twilio: {
    countryCode: string //ATTN: deprecated, replaced with country
    country: string
    nearNumber: string
    friendlyName: string
  }
  value: string
}

export type OnboardingsEntityGet = {
  id: string
  status?: proto.temporal.api.enums.v1.WorkflowExecutionStatus | null
  sentRequest?: ActivateDeviceRequest
}