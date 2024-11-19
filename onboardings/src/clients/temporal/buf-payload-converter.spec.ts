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
const { assert } = require('chai')

const { createFileRegistry, fromBinary } = require('@bufbuild/protobuf')
const { FileDescriptSetSchema } = require('@bufbuild/protobuf/wkt')
// const { addition } = require('./calculator')

describe('buf payload converter specs', () => {
  let registry : Registry
  before(async () => {
    const fileDescriptorSet = fromBinary(
      FileDescriptorSetSchema,
      await readFile('./fixtures/generated/clients/temporal/set.binpb'),
    );
    registry = createFileRegistry(fileDescriptorSet);
  })
  it('should work', () => {
    const fileDescriptorSet = fromBinary(
      FileDescriptorSetSchema,
      readFileSync('./descriptors.binpb'),
    );
    const registry = createFileRegistry(fileDescriptorSet);
    for (const file of registry.files) {
      //console.log('file', file.name);
    }
    for (const type of registry) {
    //  console.log('type', type)
      // type.kind; // 'message' | 'enum' | 'extension' | 'service'
    }
    let ping = create(PingRequestSchema, {
      name: 'monkey'
    })

    let raw = JSON.stringify(ping)
    console.log('bare json', raw)
    console.log('isMessage', isMessage(ping))
    let desc = registry.getMessage(ping.$typeName)
    let json = toJsonString(desc, ping)
    console.log('json', json)

    let ping2 = fromJsonString(registry.getMessage('temporal.onboardings.workflows.v0.PingRequest'), json )
    console.log('ping2', ping2)
    // const result = addition(2, 3);
    // assert.equal(5, 5);
  });
  it('should support binary payloads', () => {
    const fileDescriptorSet = fromBinary(
      FileDescriptorSetSchema,
      readFileSync('./descriptors.binpb'),
    );
    const registry = createFileRegistry(fileDescriptorSet);
    let sut = new BufBinaryPayloadConverter(registry)
    let ping = create(PingRequestSchema, {
      name: 'monkey'
    })

    let payload = sut.toPayload(ping)
    assert.isDefined(payload)
    // console.log('payload', payload)
    if(!payload) {
      assert.fail('payload must be defined')
    }

    let message: PingRequest = sut.fromPayload(payload as Payload)
    assert.equal(message.name, ping.name)
    console.log('message', message)
  })
  it('should support json payloads', () => {
    const fileDescriptorSet = fromBinary(
      FileDescriptorSetSchema,
      readFileSync('./descriptors.binpb'),
    );
    const registry = createFileRegistry(fileDescriptorSet);
    let sut = new BufJsonPayloadConverter(registry)
    let ping = create(PingRequestSchema, {
      name: 'monkey'
    })

    let payload = sut.toPayload(ping)
    assert.isDefined(payload)
    // console.log('payload', payload)
    if(!payload) {
      assert.fail('payload must be defined')
    }

    let message: PingRequest = sut.fromPayload(payload as Payload)
    assert.equal(message.name, ping.name)
    console.log('message', message)
  })
});