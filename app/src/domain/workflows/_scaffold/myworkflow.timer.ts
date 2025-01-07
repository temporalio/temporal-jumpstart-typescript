import {StartMyWorkflowRequest} from '../../messages/_scaffold/workflows'
import {QueryMyApiRequest, QueryMyApiResponse} from '../../messages/_scaffold/queries'
import {MutateMyApplicationRequest} from '../../messages/_scaffold/commands'
import {proxyActivities, sleep} from '@temporalio/workflow'
const { mutateMyApplication } = proxyActivities<MyWorkflowActivities>({
  startToCloseTimeout: '30 seconds',
})
export interface MyWorkflowActivities {
  queryMyApi: (q: QueryMyApiRequest) => Promise<QueryMyApiResponse>
  mutateMyApplication: (cmd: MutateMyApplicationRequest) => Promise<void>
}

export async function myworkflow(args: StartMyWorkflowRequest): Promise<void> {
  console.log('DID I DO THIS')
  // await mutateMyApplication({id: '', value: ''})
  await sleep(-1)
}