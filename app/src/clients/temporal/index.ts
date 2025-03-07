import { cfg, TemporalConfig } from '../../config'
import { Connection, Client } from '@temporalio/client'
import { NativeConnection } from '@temporalio/worker'
import {getCustomPayloadCodec} from './data-converter/custom-payload-codec'

interface ConnectionOptions {
  address: string
  tls?: {
    clientCertPair: { crt: Buffer, key: Buffer }
    serverNameOverride?: string
    serverRootCACertificate?: Buffer
  }
}

const getConnectionOptions = (tcfg: TemporalConfig): ConnectionOptions => {
  const connOpts: ConnectionOptions = {
    address: tcfg.connection.target,
  }

  if (tcfg.connection?.mtls && tcfg.connection?.mtls?.key && tcfg.connection?.mtls?.certChain) {
    connOpts.tls = {
      clientCertPair: {
        crt: tcfg.connection.mtls.certChain,
        key: tcfg.connection.mtls.key,
      },
      serverNameOverride: tcfg.connection.mtls.serverName,
      serverRootCACertificate: tcfg.connection.mtls.serverRootCACertificate,
    }
  }

  console.log('Temporal Connection: ', connOpts)
  return connOpts
}
export const createConnection = async (tcfg?: TemporalConfig): Promise<Connection> => {
  let mustTcfg: TemporalConfig = cfg.temporal
  if (tcfg) {
    mustTcfg = cfg.temporal
  }
  const connOpts: ConnectionOptions = getConnectionOptions(mustTcfg)
  return Connection.connect(connOpts)
}
export const createNativeConnection = async (tcfg?: TemporalConfig): Promise<NativeConnection> => {
  let mustTcfg: TemporalConfig = cfg.temporal
  if (tcfg) {
    mustTcfg = cfg.temporal
  }
  const connOpts: ConnectionOptions = getConnectionOptions(mustTcfg)
  return NativeConnection.connect(connOpts)
}
export const createClient = async (tcfg?: TemporalConfig): Promise<Client> => {
  let mustTcfg: TemporalConfig = cfg.temporal
  if (tcfg) {
    mustTcfg = tcfg
  }

  return new Client({
    connection: await createConnection(mustTcfg),
    namespace: mustTcfg.connection.namespace,
    dataConverter: {
      // the path is specified here since it is loaded into the Workflow Context and is subject to the "sandbox"
      payloadConverterPath: require.resolve('./data-converter/payload-converter'),
      payloadCodecs: [await getCustomPayloadCodec()]
    },
  })
}
