import {createRouter} from './v1'
import crypto from 'crypto'
import {Client, WorkflowClient} from '@temporalio/client'
import express, {Express, Response} from 'express'
import {Config} from '../config'
import {createCfg, createTemporalClient} from '../test/utils'
import {PutPing} from './messages'
const { expect } =require('chai')
const sinon = require('sinon')
const request = require('supertest')
describe('PingsAPI#v1', async () => {
  const createSUT = (temporalClient?: Client,
                     cfg?:Config) => {
    let app:Express
    app = express();
    const testUrl = new URL('https://localhost:3001')
    if(!cfg) {
      cfg = createCfg()
    }

    if(!temporalClient) {
      temporalClient = createTemporalClient()
    }

    const router = createRouter({
      config: cfg,
      clients: {
        temporal: temporalClient,
      }})
    app.use(express.json())
    app.use('/', router)
    return {
      app,
      cfg,
      temporalClient,
    }
  }
  describe('executing a ping', async () => {

    it('should accept the ping request and pong back', async () => {

      const body: PutPing = {
        ping: crypto.randomBytes(16).toString('hex'),
      }
      const id:string = crypto.randomBytes(16).toString('hex')
      const wf = sinon.createStubInstance(WorkflowClient)
      wf.start = sinon.stub().returns(sinon.stub())
      const sut = createSUT(createTemporalClient(wf))

      const res:Response = await request(sut.app)
        .put(`/pings/${id}`)
        .set('Content-Type', 'application/json')
        .send(body)
      await expect(res.get('location')).eq(`./${id}`)
      await expect(res.status).eq(202)
    })

  })

})
