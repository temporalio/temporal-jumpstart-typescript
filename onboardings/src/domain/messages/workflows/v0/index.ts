export type PingRequest = {
  value: string
}
export type PingResponse = {
  value: string
}

export type OnboardEntityRequest = {
  id: string
  value: string
  completionTimeoutSeconds: number
  deputyOwnerEmail?: string
  skipApproval: boolean
}