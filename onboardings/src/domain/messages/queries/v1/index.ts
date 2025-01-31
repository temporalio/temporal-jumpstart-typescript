import {OnboardEntityRequest} from '../../workflows/v1'
import {Approval} from '../../values/v0'

export type EntityOnboardingState = {
  id: string
  status: string
  sentRequest: OnboardEntityRequest
  approval: Approval
}