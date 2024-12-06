import {OnboardEntityRequest} from '../messages/workflows/v0'
import {
  ApplicationFailure,
  condition,
  defineQuery,
  defineSignal,
  proxyActivities,
  setHandler
} from '@temporalio/workflow';
import {EntityOnboardingState} from '../messages/queries/v0'
import * as proto from '@temporalio/proto/protos/root'
import {ApproveEntityRequest} from '../messages/commands/v0'
import {ApprovalStatus} from '../messages/values/v0'
import type { createIntegrationsHandlers }  from '../integrations'

const { registerCrmEntity } = proxyActivities<ReturnType<typeof createIntegrationsHandlers>>({
  startToCloseTimeout: '5 seconds'
})
export const queryGetState = defineQuery<EntityOnboardingState>('getState');
export const signalApprove = defineSignal<[ApproveEntityRequest]>('approve')

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
    id: params.id,
    status:  proto.temporal.api.enums.v1.WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_RUNNING.toString(),
    sentRequest: params,
    approval: { status: ApprovalStatus.PENDING, comment: ''}
  }
  await assertValidParams(params)
  setHandler(queryGetState, () => state)
  setHandler(signalApprove, (cmd: ApproveEntityRequest) => {
    state.approval = { status: ApprovalStatus.APPROVED, comment: cmd.comment }
  })
  let conditionMet = await condition(() => state.approval.status != ApprovalStatus.PENDING, '10 seconds' )
  if(!conditionMet) {
    throw ApplicationFailure.create({ type: 'denied'})
  }
  if(state.approval.status != ApprovalStatus.APPROVED) {
    return
  }
  await registerCrmEntity({ id: params.id, value: params.value})

}