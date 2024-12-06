import {OnboardEntityRequest} from '../../workflows/v0'

export type EntityOnboardingState = {
  id: string
  status: string
  sentRequest: OnboardEntityRequest
}