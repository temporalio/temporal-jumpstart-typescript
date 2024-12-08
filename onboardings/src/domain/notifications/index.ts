import {EmailClient} from '../../clients/email'
import {RequestDeputyOwnerRequest} from '../messages/commands/v1'
import {log} from '@temporalio/workflow'

export const createNotificationsHandlers = (emailClient: EmailClient) => ({
  sendEmail: async(cmd: RequestDeputyOwnerRequest): Promise<void> => {
    log.log('email sent', cmd.id, cmd.deputyOwnerEmail)
  }
})
