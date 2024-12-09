import { ActivateDeviceState } from "../messages/queries/activate-device-state";
import { ActivateDeviceRequest } from "../messages/workflows/v0";




export async function sanitizeArgs(args: ActivateDeviceRequest): Promise<ActivateDeviceState> {
    return {
        args: args,
        imei: args.imei.trim(),
        isDemo: false
    }
}


