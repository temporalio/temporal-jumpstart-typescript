import {RegisterCrmEntityRequest} from '../messages/commands/v0'
import {Errors} from '../messages/workflows/v1'
import {ApplicationFailure} from '@temporalio/workflow'
import {CrmClient} from '../../clients/crm'
import {ETIMEDOUT} from 'node:constants'
import {System} from 'typescript'
type SystemError = Error & {
  code: number
}
const isTimeout = (x: any): x is SystemError => {
  return x.code == ETIMEDOUT
}
export const createIntegrationsHandlers = (crmClient: CrmClient) => ({
  registerCrmEntity: async(cmd: RegisterCrmEntityRequest): Promise<void> => {
    let entity: string = ''
    try {
      entity = await crmClient.getCrmEntityById(cmd.id)
    } catch (err) {
      if (isTimeout(err)) {
        throw ApplicationFailure.create({type:  Errors.ERR_SERVICE_UNRECOVERABLE})
      }
    }
  }

})
