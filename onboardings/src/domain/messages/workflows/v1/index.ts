
export type OnboardEntityRequest = {
  id: string
  value: string
  completionTimeoutSeconds: number
  deputyOwnerEmail?: string
  skipApproval: boolean
}

export enum Errors  {
  ERR_INVALID_ARGS = 'ERR_INVALID_ARGS',
  ERR_SERVICE_UNRECOVERABLE= 'ERR_SERVICE_UNRECOVERABLE'
}