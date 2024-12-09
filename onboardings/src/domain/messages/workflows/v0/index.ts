export type PingRequest = {
  value: string
}
export type PingResponse = {
  value: string
}

export type ActivateDeviceRequest = {
  id: string
  value: string
}
export enum Errors {
  ERR_INVALID_ARGS = 'ERR_INVALID_ARGS'
}
