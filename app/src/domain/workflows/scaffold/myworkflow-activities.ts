import {MyWorkflowActivities} from './myworkflow'
import {QueryMyApiRequest, QueryMyApiResponse} from '../../messages/scaffold/queries'
import {MutateMyApplicationRequest} from '../../messages/scaffold/commands'
import { MyApiClient } from '../../../clients/myapi'
import {DateRange} from '../../messages/scaffold/values'

interface MyActivitiesFactoryOptions {
  myApiClient: MyApiClient
}

export const DEFAULT_DATE_RANGE: DateRange = { min: new Date(Date.UTC(2019, 9, 14)), max: new Date(Date.UTC(2119, 9, 14))}
export function createMyActivities(opts:MyActivitiesFactoryOptions):MyWorkflowActivities {
  return ({
    queryMyApi: async function (q: QueryMyApiRequest): Promise<QueryMyApiResponse> {
      let response = await opts.myApiClient.getData(q.id)
      return { id: q.id, value: response, validFrom: DEFAULT_DATE_RANGE,}
    },
    mutateMyApplication: async function(cmd: MutateMyApplicationRequest):Promise<void> {
      // not implemented
    }
  })
}