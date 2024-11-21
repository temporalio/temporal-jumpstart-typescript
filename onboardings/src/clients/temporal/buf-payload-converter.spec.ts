import {FileDescriptorSetSchema} from '@bufbuild/protobuf/wkt'
import {create, fromJson, fromJsonString, Registry, toBinary, toJson, toJsonString} from '@bufbuild/protobuf'
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
import {encode} from '@temporalio/common/lib/encoding'
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

  it('should raw binary', () =>{
    let sut = new BufBinaryPayloadConverter(registry)
    let message = create(SampleRequestSchema, {
      name: 'sample',
      frequency: SampleEnum.ONCE,
    })
    let tn = encode(SampleRequestSchema.typeName)
    let en = encode(sut.encodingType)
    let raw = toBinary(SampleRequestSchema, message)

    let dd = new Uint8Array(raw.buffer, raw.byteOffset, raw.length)
    let payload = {
      "metadata": {
        "encoding": en,
        "$typeName": tn,
      },
      "data": dd
    }
    let received: SampleRequest = sut.fromPayload(payload)
    console.log('received', received)
    assert.equal(received.name, message.name)
    assert.equal(received.frequency, message.frequency)
  })
  // it('should support binary payloads', () => {
  //   let sut = new BufBinaryPayloadConverter(registry)
  //   let message = create(SampleRequestSchema, {
  //     name: 'sample',
  //     frequency: SampleEnum.ONCE,
  //   })
  //   let tn = encode('test.clients.temporal.SampleRequest')
  //   let en = encode(sut.encodingType)
  //   let dd = encode(toJsonString(SampleRequestSchema, message))
  //
  //   let payload = sut.toPayload(message)
  //   assert.isDefined(payload)
  //   let d3 = {0: 10, 1: 6, 2: 115, 3: 97, 4: 109, 5: 112, 6: 108, 7: 101, 8: 16, 9: 1}
  //
  //   let data:Record<string, number> = {
  //     "0": 123,
  //     "1": 34,
  //     "2": 110,
  //     "3": 97,
  //     "4": 109,
  //     "5": 101,
  //     "6": 34,
  //     "7": 58,
  //     "8": 34,
  //     "9": 115,
  //     "10": 97,
  //     "11": 109,
  //     "12": 112,
  //     "13": 108,
  //     "14": 101,
  //     "15": 34,
  //     "16": 44,
  //     "17": 34,
  //     "18": 102,
  //     "19": 114,
  //     "20": 101,
  //     "21": 113,
  //     "22": 117,
  //     "23": 101,
  //     "24": 110,
  //     "25": 99,
  //     "26": 121,
  //     "27": 34,
  //     "28": 58,
  //     "29": 34,
  //     "30": 79,
  //     "31": 78,
  //     "32": 67,
  //     "33": 69,
  //     "34": 34,
  //     "35": 125
  //   }
  //   let encoding:Record<string, number> = {
  //       "0": 106,
  //       "1": 115,
  //       "2": 111,
  //       "3": 110,
  //       "4": 47,
  //       "5": 98,
  //       "6": 117,
  //       "7": 102
  //   }
  //   let typeName:Record<string, number> = {
  //     "0": 116,
  //     "1": 101,
  //     "2": 115,
  //     "3": 116,
  //     "4": 46,
  //     "5": 99,
  //     "6": 108,
  //     "7": 105,
  //     "8": 101,
  //     "9": 110,
  //     "10": 116,
  //     "11": 115,
  //     "12": 46,
  //     "13": 116,
  //     "14": 101,
  //     "15": 109,
  //     "16": 112,
  //     "17": 111,
  //     "18": 114,
  //     "19": 97,
  //     "20": 108,
  //     "21": 46,
  //     "22": 83,
  //     "23": 97,
  //     "24": 109,
  //     "25": 112,
  //     "26": 108,
  //     "27": 101,
  //     "28": 82,
  //     "29": 101,
  //     "30": 113,
  //     "31": 117,
  //     "32": 101,
  //     "33": 115,
  //     "34": 116
  //   }
  //   let da = []
  //   for(let idx in d3) {
  //     da[parseInt(idx)] = d3[idx]
  //   }
  //   let ea = []
  //   for(let idx in encoding) {
  //     ea[parseInt(idx)] = encoding[idx]
  //   }
  //   let ta = []
  //   for(let idx in typeName) {
  //     ta[parseInt(idx)] = typeName[idx]
  //   }
  //   let p2: Payload = {
  //     "metadata": {
  //       "encoding": new Uint8Array(ea),
  //       "$typeName": new Uint8Array(ta)
  //     },
  //     "data": new Uint8Array(da),
  //   }
  //
  //   // console.log('payload', payload)
  //   // if(!payload) {
  //   //   assert.fail('payload must be defined')
  //   // }
  //   let received: SampleRequest = sut.fromPayload(p2)
  //   console.log('received', received)
  //   assert.equal(received.name, message.name)
  //   assert.equal(received.frequency, message.frequency)
  // })
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