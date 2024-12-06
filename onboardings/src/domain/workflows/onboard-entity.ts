import {OnboardEntityRequest} from '../messages/workflows/v0'
import {ApplicationFailure, defineQuery, WorkflowError, workflowInfo} from '@temporalio/workflow';
import {EntityOnboardingState} from '../messages/queries/v0'
import * as proto from '@temporalio/proto/protos/root'
export const queryGetState = defineQuery<EntityOnboardingState>('getState');
export type OnboardEntity = (params: OnboardEntityRequest) => Promise<void>
export const ERR_INVALID_ARGS = 'InvalidArgs'
export const onboardEntity:OnboardEntity = async (params: OnboardEntityRequest ):Promise<void> => {
  let state:EntityOnboardingState = {
    id: '',
    status:  proto.temporal.api.enums.v1.WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_RUNNING.toString(),
    sentRequest: params,
  }
  throw ApplicationFailure.create({ type: ERR_INVALID_ARGS})
}