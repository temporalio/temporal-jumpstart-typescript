import {RegisterCrmEntityRequest} from '../messages/commands/v0'
import {Errors} from '../messages/workflows/v1'
import {ApplicationFailure} from '@temporalio/workflow'
import {CrmClient} from '../../clients/crm'
import {ETIMEDOUT} from 'node:constants'
import {System} from 'typescript'
type SystemError = Error & {
  code: number
}
type HttpError = Error & {
  status: number
}
const isTimeout = (x: any): x is SystemError => {
  return x.code == ETIMEDOUT
}
const isNotFound= (x:any): x is HttpError => {
  return x.status == 404
}
const assertNoTimeout = (x: any): x is SystemError => {
  if(isTimeout(x)) {
    throw ApplicationFailure.create({
      type: Errors.ERR_SERVICE_UNRECOVERABLE,
      nonRetryable: true,
    })
  }
  return false
}
export const createIntegrationsHandlers = (crmClient: CrmClient) => ({
  registerCrmEntity: async(cmd: RegisterCrmEntityRequest): Promise<void> => {
    let entity: string = ''
    try {
      entity = await crmClient.getCrmEntityById(cmd.id)
    } catch (err) {
      if(isNotFound(err)) {
        // ignore NotFound errors
      } else if(!assertNoTimeout(err)){}
    }
    try {
      await crmClient.registerCrmEntity(cmd.id, cmd.value)
    } catch(err) {
      if(!assertNoTimeout(err)) {
        throw err
      }
    }
  }

})
