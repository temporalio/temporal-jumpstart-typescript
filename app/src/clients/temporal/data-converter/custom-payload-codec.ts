import { PayloadCodec } from '@temporalio/common'
import {Payload} from '@temporalio/workflow'

// CustomPayloadCodec
// NOTE This executes in the primary Node thread in your Temporal Application, not in the Workflow Context.
// This distinction means implementations:
// 1. CAN Use third-party key management systems
// 2. CAN Perform asynchronous encryption/decryption routines
// 3. WILL NOT be subject to any deadlock detection
export const getCustomPayloadCodec = async (): Promise<PayloadCodec> => {
  return {
    decode(payloads: Payload[]): Promise<Payload[]> {
      return Promise.resolve(payloads)
    }, encode(payloads: Payload[]): Promise<Payload[]> {
      return Promise.resolve(payloads)
    }
  }

}