import { Client } from '@temporalio/client'
import { Config } from '../config'
import { createClient } from './temporal'

export interface Clients {
  temporal: Client
}

export const createClients = async (cfg: Config): Promise<Clients> => {
  const temporalClient = await createClient(cfg.temporal)
  return {
    temporal: temporalClient,
  }
}
