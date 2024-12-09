import {Errors, ActivateDeviceRequest} from '../messages/workflows/v1'
import {
  ApplicationFailure,
  condition, continueAsNew,
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
import {createNotificationsHandlers} from '../notifications'

const { registerCrmEntity } = proxyActivities<ReturnType<typeof createIntegrationsHandlers>>({
  startToCloseTimeout: '5 seconds'
})
const { sendEmail } = proxyActivities<ReturnType<typeof createNotificationsHandlers>>({
  startToCloseTimeout: '5 seconds',
  retry: {
    maximumAttempts: 2, // limit retries to avoid spamming the user
  }
})
export const queryGetState = defineQuery<EntityOnboardingState>('getState');
export const signalApprove = defineSignal<[ApproveEntityRequest]>('approve')

export type OnboardEntity = (params: ActivateDeviceRequest) => Promise<void>

async function assertValidArgs(args: ActivateDeviceRequest) {
  if(!args.id.trim() || !args.value.trim()) {
    throw ApplicationFailure.create({ type: Errors.ERR_INVALID_ARGS, message: '`id` and `value` are required properties.'})
  }
}

export const workflowsPath = require.resolve(__filename)
export const onboardEntity:OnboardEntity = async (args: ActivateDeviceRequest ):Promise<void> => {
  log.info('started entity onboarding', args)
  // initialize state as soon as possible, definitely before signal/update handlers
  let state:EntityOnboardingState = {
    id: args.id,
    status:  proto.temporal.api.enums.v1.WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_RUNNING.toString(),
    sentRequest: args,
    approval: { status: ApprovalStatus.PENDING, comment: ''}
  }
  let notifyDeputyOwner = !!args.deputyOwnerEmail && !args.skipApproval
  await assertValidArgs(args)

  setHandler(queryGetState, () => state)
  if(!args.skipApproval) {
    setHandler(signalApprove, (cmd: ApproveEntityRequest) => {
      state.approval = {status: ApprovalStatus.APPROVED, comment: cmd.comment}
    })
    // TODO provide a min value to guard against zero
    let waitSeconds = Math.abs(Math.round(args.completionTimeoutSeconds))
    waitSeconds = notifyDeputyOwner ? (waitSeconds / 2) : waitSeconds
    let conditionMet = await condition(() => state.approval.status != ApprovalStatus.PENDING, `${waitSeconds} seconds`)
    if (!conditionMet) {
      if(!args.deputyOwnerEmail) {
        throw ApplicationFailure.create({type: Errors.ERR_ONBOARD_ENTITY_TIMED_OUT})
      }
      log.info('notifying deputy')
      await sendEmail({id: args.id, deputyOwnerEmail: args.deputyOwnerEmail})
      const canArgs: ActivateDeviceRequest = {
        id: args.id,
        value: args.value,
        deputyOwnerEmail: undefined,
        skipApproval: false,
        completionTimeoutSeconds: args.completionTimeoutSeconds - waitSeconds,
      }
      await continueAsNew(canArgs)
    }
    if (state.approval.status != ApprovalStatus.APPROVED) {
      log.info('entity was rejected')
      return
    }
  }
  await registerCrmEntity({ id: args.id, value: args.value})

}