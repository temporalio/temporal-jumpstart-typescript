import {StartMyWorkflowRequest} from '../messages/workflows'
import {QueryMyApiRequest, QueryMyApiResponse} from '../messages/queries'
import {MutateMyApplicationRequest} from '../messages/commands'

export interface MyWorkflowActivities {
  queryMyApi: (q: QueryMyApiRequest) => Promise<QueryMyApiResponse>
  mutateMyApplication: (cmd: MutateMyApplicationRequest) => Promise<void>
}

export async function myworkflow(args: StartMyWorkflowRequest): Promise<void> {

}