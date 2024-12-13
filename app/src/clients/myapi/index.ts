export interface MyApiClient {
  getData(id: string): Promise<string>
  writeData(id: string, value: string): Promise<void>
}