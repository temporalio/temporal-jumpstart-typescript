import {DefaultPayloadConverterWithBufs}  from './buf-payload-converter'
import {createFileRegistry, fromJson} from  '@bufbuild/protobuf'
import {FileDescriptorSetSchema} from '@bufbuild/protobuf/wkt'

import {readFileSync} from 'fs'
import path from 'path'

// const registryPath = path.resolve(__dirname, '../../generated/onboardings/set.binpb')
// console.log('registryPath', registryPath)
const json = require('../../generated/onboardings/set.json')
const fileDescriptorSet = fromJson(
  FileDescriptorSetSchema,
  json)
  // readFileSync(registryPath))
const registry = createFileRegistry(fileDescriptorSet);

export const payloadConverter = new DefaultPayloadConverterWithBufs({registry})

