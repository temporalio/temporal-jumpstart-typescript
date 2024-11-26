import { DefaultPayloadConverter } from '@temporalio/common'
import {CustomPayloadConverter} from './custom-payload-converter'
import {PayloadConverter} from '@temporalio/workflow'

// This just demonstrates that a custom PayloadConverter implementation
// MUST export a `payloadConverter` implementation to be valid.
export const payloadConverter: PayloadConverter = new  CustomPayloadConverter(new DefaultPayloadConverter())