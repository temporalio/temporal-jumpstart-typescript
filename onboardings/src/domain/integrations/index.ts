import {RegisterCrmEntityRequest} from '../messages/commands/v0'
import {Errors} from '../messages/workflows/v1'
import {ApplicationFailure} from '@temporalio/workflow'

export const createIntegrationsHandlers = () => ({
  registerCrmEntity: async(cmd: RegisterCrmEntityRequest): Promise<void> => {
    throw ApplicationFailure.create({ type: Errors.ERR_SERVICE_UNRECOVERABLE})
  }
})
