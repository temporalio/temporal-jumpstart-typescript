import { decode, encode } from '@temporalio/common/lib/encoding'
import { PayloadConverterError, ValueError } from '@temporalio/common/lib/errors'
import { Payload } from '@temporalio/common/lib'
import {
  BinaryPayloadConverter,
  CompositePayloadConverter,
  JsonPayloadConverter,
  PayloadConverterWithEncoding,
  UndefinedPayloadConverter,

} from '@temporalio/common/lib/converter/payload-converter';

import {
  DescMessage,
  fromBinary, fromJsonString,
  isMessage, Message,
  Registry, toBinary, toJsonString,
} from '@bufbuild/protobuf'

const sym = Symbol.for("@bufbuild/protobuf/text-encoding")
// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
const GLOBAL_BUFFER = globalThis.constructor.constructor('return globalThis.Buffer')()

const encodingTypes = {
  METADATA_ENCODING_BUF_JSON : 'json/buf',
  METADATA_ENCODING_BUF: 'binary/buf',
}
const METADATA_ENCODING_KEY = 'encoding'
const METADATA_MESSAGE_TYPE_KEY = '$typeName'

abstract class BufPayloadConverter implements PayloadConverterWithEncoding {
  protected readonly registry: Registry
  public abstract encodingType: string

  public abstract toPayload<T>(value: T): Payload | undefined
  public abstract fromPayload<T>(payload: Payload): T

  // Don't use type Root here because root.d.ts doesn't export Root, so users would have to type assert
  constructor(registry: Registry) {
    this.registry = registry

  }

  protected validatePayload(content: Payload): { messageType: DescMessage; data: Uint8Array } {
    if (content.data === undefined || content.data === null) {

      throw new ValueError('Got payload with no data');
    }
    if (!content.metadata || !(METADATA_MESSAGE_TYPE_KEY in content.metadata)) {
      throw new ValueError(`Got protobuf payload without metadata.${METADATA_MESSAGE_TYPE_KEY}`);
    }
    if (!this.registry) {
      throw new PayloadConverterError('Unable to deserialize protobuf message without `registry` being provided');
    }

    const messageTypeName = decode(content.metadata[METADATA_MESSAGE_TYPE_KEY])
    const messageType = this.registry.getMessage(messageTypeName)
    if (!messageType) {
      throw new PayloadConverterError(`Got a \`${messageTypeName}\` protobuf message but cannot find corresponding message class in \`registry\``)
    }
    return { messageType, data: content.data };
  }

  protected constructPayload({ messageTypeName, message }: { messageTypeName: string; message: Uint8Array }): Payload {
    return {
      metadata: {
        [METADATA_ENCODING_KEY]: encode(this.encodingType),
        [METADATA_MESSAGE_TYPE_KEY]: encode(messageTypeName),
      },
      data: message,
    };
  }
}

/**
 * Converts between protobufjs Message instances and serialized Protobuf Payload
 */
export class BufBinaryPayloadConverter extends BufPayloadConverter {
  public encodingType = encodingTypes.METADATA_ENCODING_BUF;

  /**
   * @param registry
   */
  constructor(registry: Registry) {
    super(registry)
  }

  public toPayload(value: unknown): Payload | undefined {
    console.log('buf-bin|toPayload', value)
    let out = tryToMessage(this.registry, value)
    if(!out) {
      return undefined
    }
    let bytes = toBinary(out.schema, out.message)
    return this.constructPayload({
      messageTypeName: out.schema.typeName,
      message: bytes,
    });
  }

  public fromPayload<T>(content: Payload): T {
    console.log('buf-bin|fromPayload', content)

    const { messageType, data } = this.validatePayload(content);
    // Wrap with Uint8Array from this context to ensure `instanceof` works
    const localData = data ? new Uint8Array(data.buffer, data.byteOffset, data.length) : data;
    return fromBinary(messageType, localData) as unknown as T;
  }
}

/**
 * Converts between protobufjs Message instances and serialized JSON Payload
 */
export class BufJsonPayloadConverter extends BufPayloadConverter {
  public encodingType = encodingTypes.METADATA_ENCODING_BUF_JSON;

  /**
   * @param registry
   */
  constructor(registry: Registry) {
    super(registry);
  }

  public toPayload(value: unknown): Payload | undefined {
    console.log('buf-json|toPayload', value)
    let out = tryToMessage(this.registry, value)
    if (!out) {
      return undefined;
    }

    const hasBufferChanged = setBufferInGlobal()
    try {
      const jsonValue = toJsonString(out.schema, out.message)

      return this.constructPayload({
        messageTypeName: out.schema.typeName,
        message: encode(jsonValue),
      });
    } finally {
      resetBufferInGlobal(hasBufferChanged);
    }
  }

  public fromPayload<T>(content: Payload): T {
    console.log('buf-json:fromPayload', content)

    const hasBufferChanged = setBufferInGlobal();
    try {
      const { messageType, data } = this.validatePayload(content);
      const res = fromJsonString(messageType, decode(data)) as unknown as T
      if (Buffer.isBuffer(res)) {
        return new Uint8Array(res) as any;
      }
      replaceBuffers(res);
      return res;
    } finally {
      resetBufferInGlobal(hasBufferChanged);
    }
  }
}

function replaceBuffers<X>(obj: X) {
  const replaceBuffersImpl = <Y>(value: any, key: string | number, target: Y) => {
    if (Buffer.isBuffer(value)) {
      // Need to copy. `Buffer` manages a pool slab, internally reused when Buffer objects are GC.
      type T = keyof typeof target;
      target[key as T] = new Uint8Array(value) as any;
    } else {
      replaceBuffers(value);
    }
  };

  if (obj != null && typeof obj === 'object') {
    // Performance optimization for large arrays
    if (Array.isArray(obj)) {
      obj.forEach(replaceBuffersImpl);
    } else {
      for (const [key, value] of Object.entries(obj)) {
        replaceBuffersImpl(value, key, obj);
      }
    }
  }
}

function setBufferInGlobal(): boolean {
  if (typeof globalThis.Buffer === 'undefined') {
    globalThis.Buffer = GLOBAL_BUFFER;
    return true;
  }
  return false;
}

function resetBufferInGlobal(hasChanged: boolean): void {
  if (hasChanged) {
    delete (globalThis as any).Buffer;
  }
}

function tryToMessage(registry: Registry, value: unknown): { message: Message, schema: DescMessage } | undefined {
  if(!isMessage(value)) {
    return undefined
  }
  let schema = registry.getMessage(value.$typeName)
  if(!schema) {
    return undefined
  }
  return { message: value, schema }
}


export interface DefaultPayloadConverterWithBufOptions {
  /**
   * The `registry` provided to {@link BufJsonPayloadConverter} and {@link BufBinaryPayloadConverter}
   */
  registry: Registry;
}

export class DefaultPayloadConverterWithBufs extends CompositePayloadConverter {
  // Match the order used in other SDKs.
  //
  // Go SDK:
  // https://github.com/temporalio/sdk-go/blob/5e5645f0c550dcf717c095ae32c76a7087d2e985/converter/default_data_converter.go#L28
  constructor({ registry }: DefaultPayloadConverterWithBufOptions) {
    if(!registry) {
      throw new Error('registry is required')
    }
    super(
      new UndefinedPayloadConverter(),
      new BinaryPayloadConverter(),
      new BufJsonPayloadConverter(registry),
      new BufBinaryPayloadConverter(registry),
      new JsonPayloadConverter()
    );
  }
}
