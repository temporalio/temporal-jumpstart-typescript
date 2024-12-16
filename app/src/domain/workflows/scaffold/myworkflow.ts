import {StartMyWorkflowRequest} from '../../messages/scaffold/workflows'
import {QueryMyApiRequest, QueryMyApiResponse} from '../../messages/scaffold/queries'
import {MutateMyApplicationRequest} from '../../messages/scaffold/commands'

export interface MyWorkflowActivities {
  queryMyApi: (q: QueryMyApiRequest) => Promise<QueryMyApiResponse>
  mutateMyApplication: (cmd: MutateMyApplicationRequest) => Promise<void>
}

export async function myworkflow(args: StartMyWorkflowRequest): Promise<void> {

}