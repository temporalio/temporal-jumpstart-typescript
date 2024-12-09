export type PingRequest = {
  value: string
}
export type PingResponse = {
  value: string
}

export type ActivateDeviceRequest = {
  id: string
  imei: string
  value: string
  iridium: {
    plan: string
  }
  twilio: {
    countryCode: string //ATTN: deprecated, replaced with country
    country: string
    nearNumber: string
    friendlyName: string
  }
}
export enum Errors {
  ERR_INVALID_ARGS = 'ERR_INVALID_ARGS'
}
