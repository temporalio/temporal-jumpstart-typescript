import {FileDescriptorSetSchema} from '@bufbuild/protobuf/wkt'
import { readFileSync } from 'node:fs';
import {create, fromJsonString, isMessage, Registry, toJsonString} from '@bufbuild/protobuf'
import {PingRequestSchema} from '@generated/onboardings/domain/v0/workflows_pb'
import { PingRequest} from '@generated/onboardings/domain/v0/workflows_pb'
import {
  BufBinaryPayloadConverter,
  BufJsonPayloadConverter,
  DefaultPayloadConverterWithBufs
} from './buf-payload-converter'
import {Payload} from '@temporalio/common/lib'
import {beforeEach} from 'mocha'
import {readFile} from 'fs-extra'
import {
  SampleEnum,
  SampleRequest,
  SampleRequestSchema
} from '@fixtures/generated/clients/temporal/buf-data-converter_pb'
import path from 'path'
const { assert } = require('chai')

const { createFileRegistry, fromBinary } = require('@bufbuild/protobuf')
const { FileDescriptSetSchema } = require('@bufbuild/protobuf/wkt')

describe('buf payload converter specs', () => {
  let registry : Registry
  before(async () => {
    const fileDescriptorSet = fromBinary(
      FileDescriptorSetSchema,
      await readFile(path.resolve(__dirname,'../../../fixtures/generated/clients/temporal/set.binpb')))
    registry = createFileRegistry(fileDescriptorSet);
  })

  it('should support binary payloads', () => {
    let sut = new BufBinaryPayloadConverter(registry)
    let message = create(SampleRequestSchema, {
      name: 'sample',
      frequency: SampleEnum.ONCE,
    })

    let payload = sut.toPayload(message)
    assert.isDefined(payload)
    // console.log('payload', payload)
    if(!payload) {
      assert.fail('payload must be defined')
    }
    let received: SampleRequest = sut.fromPayload(payload as Payload)

    assert.equal(message.name, received.name)
    assert.equal(message.frequency, received.frequency)
  })
  it('should support json payloads', () => {
    let sut = new BufJsonPayloadConverter(registry)
    let message = create(SampleRequestSchema, {
      name: 'sample',
      frequency: SampleEnum.ONCE,
    })

    let payload = sut.toPayload(message)
    assert.isDefined(payload)
    // console.log('payload', payload)
    if(!payload) {
      assert.fail('payload must be defined')
    }
    let received: SampleRequest = sut.fromPayload(payload as Payload)

    assert.equal(message.name, received.name)
    assert.equal(message.frequency, received.frequency)

  })
});