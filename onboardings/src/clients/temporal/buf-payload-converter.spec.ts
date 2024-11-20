import {FileDescriptorSetSchema} from '@bufbuild/protobuf/wkt'
import {create, fromJson, fromJsonString, Registry} from '@bufbuild/protobuf'
import {
  BufBinaryPayloadConverter,
  BufJsonPayloadConverter
} from './buf-payload-converter'
import {Payload} from '@temporalio/common/lib'
import {
  SampleEnum,
  SampleRequest,
  SampleRequestSchema
} from '@fixtures/generated/clients/temporal/buf-data-converter_pb'
const { assert } = require('chai')

const { createFileRegistry, fromBinary } = require('@bufbuild/protobuf')
describe('buf payload converter specs', () => {
  let registry : Registry
  before(async () => {
    const json = require('../../../fixtures/generated/clients/temporal/set.json')
    const fileDescriptorSet = fromJson(
      FileDescriptorSetSchema,
      json)
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