// import type * as activities from './activities.js'
// import {
//   CurrentWorkflowState,
//   MarkFinalizableRequest,
//   QueryQueryWorkflowArgs,
//   StartWorkflowRequest,
// } from '../../gql/index.js'
// import { condition, defineQuery, defineSignal, proxyActivities, setHandler, workflowInfo } from '@temporalio/workflow'
//
// const {
//   validate,
//   mutateApplication,
//   begin,
//   finalize,
//   compensate,
// } = proxyActivities<typeof activities>({
//   startToCloseTimeout: '10 seconds',
// })
//
// const signalMarkFinalizable = 'markFinalizable'
// const queryCurrentWorkflowState = 'currentState'
// const currentWorkflowStateQueryDef
//     = defineQuery<CurrentWorkflowState, [QueryQueryWorkflowArgs]>(queryCurrentWorkflowState)
//
// const markFinalizableSignalDef = defineSignal<[MarkFinalizableRequest]>(signalMarkFinalizable)
//
// export async function startWorkflow(params: StartWorkflowRequest): Promise<CurrentWorkflowState> {
//   const currentState: CurrentWorkflowState = {
//     value: params.value,
//     validation: undefined,
//     applicationMutation1: undefined,
//     applicationMutation2: undefined,
//     compensation: undefined,
//     beginning: undefined,
//     finalization: undefined,
//     finalizable: undefined,
//     workflowId: workflowInfo().workflowId,
//   }
//
//   setHandler(currentWorkflowStateQueryDef, (params: QueryQueryWorkflowArgs) => currentState)
//   setHandler(markFinalizableSignalDef, (signalValue: MarkFinalizableRequest) => {
//     currentState.finalizable = signalValue.value
//   })
//   try {
//     currentState.validation = await validate(params)
//     currentState.applicationMutation1 = await mutateApplication(params)
//     currentState.applicationMutation2 = await mutateApplication(params)
//   }
//   catch (err) {
//     currentState.compensation = await compensate(params)
//     throw err
//   }
//
//   if (params.reply) {
//     const reply = proxyActivities({
//       taskQueue: params.reply.taskQueue,
//       startToCloseTimeout: '10 seconds',
//     })
//
//     currentState.reply = await reply[params.reply.activityName](params.reply)
//   }
//   currentState.beginning = await begin(params)
//   await condition(() => !!currentState.finalizable, 1000 * 180)
//   currentState.finalization = await finalize(params)
//   return currentState
// }

