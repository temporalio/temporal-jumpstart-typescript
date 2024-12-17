import { Payload, PayloadConverter} from '@temporalio/workflow'

// CustomPayloadConverter
// NOTE that all PayloadConverters operation within the _Workflow Context_, so the implementation:
// 1. MUST Use Deterministic modules
// 2. MUST NOT access external services
// 3. MUST Be synchronous and fast to avoid deadlock detection
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