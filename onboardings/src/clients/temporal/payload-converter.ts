import {DefaultPayloadConverterWithBufs}  from './buf-payload-converter'
import {createFileRegistry, fromJson} from  '@bufbuild/protobuf'
import {FileDescriptorSetSchema} from '@bufbuild/protobuf/wkt'
const json = require('../../generated/set.json')

const fileDescriptorSet = fromJson(
  FileDescriptorSetSchema,
  json)
  // readFileSync(registryPath))
const registry = createFileRegistry(fileDescriptorSet);

export const payloadConverter = new DefaultPayloadConverterWithBufs({registry})

