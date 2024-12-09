export interface EmailClient {
  sendEmail(email: string): Promise<void>
}