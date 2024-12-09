import { ApplicationFailure, proxyLocalActivities } from "@temporalio/workflow";
import { ActivateDeviceRequest, Errors } from "../messages/workflows/v0";
import { ActivateDeviceState } from "../messages/queries/activate-device-state";
// import { sanitizeArgs } from "../validation/sanitize-args";

const { sanitizeArgsImport } = require('../validation/sanitize-args')

export const workflowsPath = require.resolve(__filename)
export async function activateDevice(args: ActivateDeviceRequest): Promise<void> {
    const { sanitizeArgs } = proxyLocalActivities<typeof sanitizeArgsImport>({
        startToCloseTimeout: '2 seconds'
    })

    if (!validateArgs(args))
        throw ApplicationFailure.create({type: Errors.ERR_INVALID_ARGS, message: 'Invalid arguments'})
    let state:ActivateDeviceState = await sanitizeArgs(args)
}

function validateArgs(args: ActivateDeviceRequest): boolean {
    if(args.imei.trim().length == 0) {
        return false
    }
    return true
}