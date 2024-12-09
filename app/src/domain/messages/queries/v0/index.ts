import {OnboardEntityRequest} from '../../workflows/v0'
import {Approval} from '../../values/v0'

export type EntityOnboardingState = {
  id: string
  status: string
  sentRequest: OnboardEntityRequest
  approval: Approval
}