import { Client } from '@temporalio/client'
import { cfg, Config } from '../config/index.js'
import { createClient } from './temporal/index.js'

export interface Clients {
  Temporal: Client
}

export const createClients = async (cfg: Config): Promise<Clients> => {
  const temporalClient = await createClient(cfg.Temporal)
  return {
    Temporal: temporalClient,
  }
}
