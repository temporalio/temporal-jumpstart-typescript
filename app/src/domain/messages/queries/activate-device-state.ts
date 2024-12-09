import { ActivateDeviceRequest } from '../workflows/v0'

export type ActivateDeviceState = {
    args: ActivateDeviceRequest
    imei: string
    isDemo: boolean 
    twilio?: {
        args: Object 
        purchasedNumber: string 
        status: string 
    }
    iridium?: {
        args: Object 
        status: string 
        accountNumber: string 
        subscriberActivationParams: Object 
        workflowId: string
    }
}