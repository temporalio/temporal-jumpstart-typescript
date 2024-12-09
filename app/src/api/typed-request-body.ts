export interface TypedRequestBody<TBody> extends Express.Request {
  body: TBody
  params: any
}
