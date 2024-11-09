import express, { type Router, Request, Response, NextFunction } from 'express'
import {type PingRequest, PingRequestSchema} from '../../../generated/onboardings/api/v0/message_pb.js'
import {create, fromJson, JsonObject, JsonValue} from '@bufbuild/protobuf'
export const router: Router = express.Router()
export interface TypedRequestBody<T> extends Express.Request {
  body: T
}
router.get('/:id', (req: TypedRequestBody<JsonValue>, res: Response, next: NextFunction) => {
  const ping: PingRequest = fromJson(PingRequestSchema, req.body)
  console.log('ing', ping)

  next()
})
router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  next()
})
