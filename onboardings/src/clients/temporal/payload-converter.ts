import {DefaultPayloadConverterWithBufs} from './buf-payload-converter'
import {createFileRegistry, fromBinary} from '@bufbuild/protobuf'
import {FileDescriptorSetSchema} from '@bufbuild/protobuf/wkt'
import {readFileSync} from 'node:fs'

const registryPath = require.resolve('../../generated/onboardings/set.binpb')
const fileDescriptorSet = fromBinary(
  FileDescriptorSetSchema,
  readFileSync(registryPath))

const registry = createFileRegistry(fileDescriptorSet);
export const payloadConverter = new DefaultPayloadConverterWithBufs({registry})
