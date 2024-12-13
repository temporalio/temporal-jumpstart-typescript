export enum ApprovalStatus {
  PENDING='PENDING',
  APPROVED = 'APPROVED',
  REJECTED='REJECTED'
}
export type Approval = {
    status: ApprovalStatus,
    comment: string
}