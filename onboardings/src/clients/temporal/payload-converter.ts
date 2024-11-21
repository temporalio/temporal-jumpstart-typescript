import { DefaultPayloadConverterWithBufs } from './buf-payload-converter'
import { createFileRegistry, fromJson, JsonValue } from '@bufbuild/protobuf'
import { FileDescriptorSetSchema } from '@bufbuild/protobuf/wkt'
// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-unsafe-assignment
import json from '../../generated/set.json'
console.log('set', json)

const fileDescriptorSet = fromJson(
  FileDescriptorSetSchema,
  json as JsonValue)
// readFileSync(registryPath))
const registry = createFileRegistry(fileDescriptorSet)

export const payloadConverter = new DefaultPayloadConverterWithBufs({ registry })
