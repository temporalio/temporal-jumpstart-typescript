//
import { Payload, PayloadConverter} from '@temporalio/workflow'

export class CustomPayloadConverter implements PayloadConverter {
  private inner: PayloadConverter
  constructor(inner: PayloadConverter) {
    this.inner = inner
  }
  toPayload<T>(value: T): Payload {
        return this.inner.toPayload(value)
    }
  fromPayload<T>(payload: Payload): T {
        return this.inner.fromPayload(payload)
    }

}