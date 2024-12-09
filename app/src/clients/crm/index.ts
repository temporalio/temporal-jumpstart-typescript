export interface CrmClient {
  getCrmEntityById(id: string): Promise<string>,
  registerCrmEntity(id: string, value: string): Promise<void>
}