// import {
//   EncodingType,
//   METADATA_ENCODING_KEY,
//   Payload,
//   PayloadConverterError,
//   PayloadConverterWithEncoding,
// } from '@temporalio/common'
// import { decode, encode } from '@temporalio/common/lib/encoding.js'
// import { toJson, toBinary, toJsonString } from '@bufbuild/protobuf'
//
// /**
//  */
// export class BufPayloadConverter implements PayloadConverterWithEncoding {
//   // Use 'json/plain' so that Payloads are displayed in the UI
//   public encodingType = 'json/plain' as EncodingType
//
//   public toPayload(value: unknown): Payload | undefined {
//     if (value === undefined) return undefined
//     let out
//     try {
//       out = toJsonString(value)
//     }
//     catch (e) {
//       throw new UnsupportedEjsonTypeError(
//         `Can't run EJSON.stringify on this value: ${value}. Either convert it (or its properties) to EJSON-serializable values (see https://docs.meteor.com/api/ejson.html ), or create a custom data converter. EJSON.stringify error message: ${
//           errorMessage(
//             e,
//           )
//         }`,
//         e as Error,
//       )
//     }
//
//     return {
//       metadata: {
//         [METADATA_ENCODING_KEY]: encode('json/plain'),
//         // Include an additional metadata field to indicate that this is an EJSON payload
//         format: encode('extended'),
//       },
//       data: encode(ejson),
//     }
//   }
//
//   public fromPayload<T>(content: Payload): T {
//     return content.data ? EJSON.parse(decode(content.data)) : content.data
//   }
// }
//
// export class UnsupportedEjsonTypeError extends PayloadConverterError {
//   public readonly name: string = 'UnsupportedJsonTypeError'
//
//   constructor(
//     message: string | undefined,
//     public readonly cause?: Error,
//   ) {
//     super(message ?? undefined)
//   }
// }
