import {OnboardEntityRequest, Errors} from '../messages/workflows/v0'
import {
  ApplicationFailure,
  defineQuery,
  defineSignal,
  proxyActivities,
  setHandler,
  log,
} from '@temporalio/workflow';
import {EntityOnboardingState} from '../messages/queries/v0'
import * as proto from '@temporalio/proto/protos/root'
import {ApproveEntityRequest} from '../messages/commands/v0'
import {ApprovalStatus} from '../messages/values/v0'
import type { createIntegrationsHandlers }  from '../integrations'

const { registerCrmEntity } = proxyActivities<ReturnType<typeof createIntegrationsHandlers>>({
  startToCloseTimeout: '2 seconds'
})
export const workflowsPath = require.resolve(__filename)
export const queryGetState = defineQuery<EntityOnboardingState>('getState');
export const signalApprove = defineSignal<[ApproveEntityRequest]>('approve')

export type OnboardEntity = (params: OnboardEntityRequest) => Promise<void>

async function assertValidArgs(args: OnboardEntityRequest) {
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
  if(!args.id.trim() || !args.value.trim()) {
    throw ApplicationFailure.create({ type: Errors.ERR_INVALID_ARGS, message: '`id` and `value` are required properties.'})
  }
}
export const onboardEntity:OnboardEntity = async (args: OnboardEntityRequest ):Promise<void> => {
  let state:EntityOnboardingState = {
    id: args.id,
    status:  proto.temporal.api.enums.v1.WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_RUNNING.toString(),
    sentRequest: args,
    approval: { status: ApprovalStatus.PENDING, comment: ''}
  }
  log.info('HERE', args)
  await assertValidArgs(args)
  log.info('POSTHERE', args)

  await registerCrmEntity({ id: args.id, value: args.value})
}