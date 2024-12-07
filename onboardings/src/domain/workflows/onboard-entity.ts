import {Errors, OnboardEntityRequest} from '../messages/workflows/v1'
import {
  ApplicationFailure,
  condition,
  defineQuery,
  defineSignal,
  log,
  proxyActivities,
  setHandler
} from '@temporalio/workflow';
import {EntityOnboardingState} from '../messages/queries/v1'
import * as proto from '@temporalio/proto/protos/root'
import {ApproveEntityRequest} from '../messages/commands/v0'
import {ApprovalStatus} from '../messages/values/v0'
import type {createIntegrationsHandlers} from '../integrations'

const { registerCrmEntity } = proxyActivities<ReturnType<typeof createIntegrationsHandlers>>({
  startToCloseTimeout: '5 seconds'
})
export const queryGetState = defineQuery<EntityOnboardingState>('getState');
export const signalApprove = defineSignal<[ApproveEntityRequest]>('approve')

export type OnboardEntity = (params: OnboardEntityRequest) => Promise<void>

async function assertValidArgs(args: OnboardEntityRequest) {
  if(!args.id.trim() || !args.value.trim()) {
    throw ApplicationFailure.create({ type: Errors.ERR_INVALID_ARGS, message: '`id` and `value` are required properties.'})
  }
}

export const workflowsPath = require.resolve(__filename)
export const onboardEntity:OnboardEntity = async (args: OnboardEntityRequest ):Promise<void> => {
  log.info('started entity onboarding', args)
  let state:EntityOnboardingState = {
    id: args.id,
    status:  proto.temporal.api.enums.v1.WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_RUNNING.toString(),
    sentRequest: args,
    approval: { status: ApprovalStatus.PENDING, comment: ''}
  }
  await assertValidArgs(args)
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
  await registerCrmEntity({ id: args.id, value: args.value})

}