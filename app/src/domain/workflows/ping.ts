import {defineQuery, setHandler} from '@temporalio/workflow'
export const pong = defineQuery<string>('pong');

export async function ping(args: string): Promise<string> {
  let result = `pong: '${args}'`
  setHandler(pong, () => result)
  return result
}