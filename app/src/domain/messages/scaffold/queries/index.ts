import {DateRange} from '../values'

export type QueryMyApiRequest = {
  id: string
}
export type QueryMyApiResponse = {
  id: string
  value: string
  validFrom: DateRange
}