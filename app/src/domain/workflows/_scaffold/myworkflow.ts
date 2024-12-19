import {StartMyWorkflowRequest} from '../../messages/_scaffold/workflows'
import {QueryMyApiRequest, QueryMyApiResponse} from '../../messages/_scaffold/queries'
import {MutateMyApplicationRequest} from '../../messages/_scaffold/commands'

export interface MyWorkflowActivities {
  queryMyApi: (q: QueryMyApiRequest) => Promise<QueryMyApiResponse>
  mutateMyApplication: (cmd: MutateMyApplicationRequest) => Promise<void>
}

export async function myworkflow(args: StartMyWorkflowRequest): Promise<void> {

}