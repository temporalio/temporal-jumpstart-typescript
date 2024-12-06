import {OnboardEntityRequest} from '../messages/workflows/v0'
import {ApplicationFailure, defineQuery, WorkflowError, workflowInfo} from '@temporalio/workflow';
import {EntityOnboardingState} from '../messages/queries/v0'
import * as proto from '@temporalio/proto/protos/root'
export const queryGetState = defineQuery<EntityOnboardingState>('getState');
export type OnboardEntity = (params: OnboardEntityRequest) => Promise<void>
export const ERR_INVALID_ARGS = 'InvalidArgs'

async function assertValidParams(params: OnboardEntityRequest) {
  // poor man's validator
  /*
       * Temporal is not prescriptive about the strategy you choose for indicating failures in your Workflows.
       *
       * We throw an ApplicationFailureException here which would ultimately result in a `WorkflowFailedException`.
       * This is a common way to fail a Workflow which will never succeed due to bad arguments or some other invariant.
       *
       * It is common to use ApplicationFailure for business failures, but these should be considered distinct from an intermittent failure such as
       * a bug in the code or some dependency which is temporarily unavailable. Temporal can often recover from these kinds of intermittent failures
       * with a redeployment, downstream service correction, etc. These intermittent failures would typically result in an Exception NOT descended from
       * TemporalFailure and would therefore NOT fail the Workflow Execution.
       *
       * If you have explicit business metrics setup to monitor failed Workflows, you could alternatively return a "Status" result with the business failure
       * and allow the Workflow Execution to "Complete" without failure.
       *
       * Note that `WorkflowFailedException` will count towards the `workflow_failed` SDK Metric (https://docs.temporal.io/references/sdk-metrics#workflow_failed).
       */
  if(!params.id.trim() || !params.value.trim()) {
    throw ApplicationFailure.create({ type: ERR_INVALID_ARGS, message: '`id` and `value` are required properties.'})
  }
}
export const onboardEntity:OnboardEntity = async (params: OnboardEntityRequest ):Promise<void> => {
  let state:EntityOnboardingState = {
    id: '',
    status:  proto.temporal.api.enums.v1.WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_RUNNING.toString(),
    sentRequest: params,
  }

  await assertValidParams(params)

}