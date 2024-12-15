import {MyWorkflowActivities} from './myworkflow'
import {QueryMyApiRequest, QueryMyApiResponse} from '../../messages/queries'
import {MutateMyApplicationRequest} from '../../messages/commands'
import { MyApiClient } from '../../../clients/myapi'

interface MyActivitiesFactoryOptions {
  myApiClient: MyApiClient
}

export function createMyActivities(opts:MyActivitiesFactoryOptions):MyWorkflowActivities {
  return ({
    queryMyApi: async function (q: QueryMyApiRequest): Promise<QueryMyApiResponse> {
      let response = await opts.myApiClient.getData(q.id)
      return { id: q.id, value: response }
    },
    mutateMyApplication: async function(cmd: MutateMyApplicationRequest):Promise<void> {
      // not implemented
    }
  })
}