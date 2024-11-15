import { cfg, type TemporalConfig } from '../../config'
import { Client, Connection } from '@temporalio/client'
import { NativeConnection } from '@temporalio/worker'
import { DefaultPayloadConverterWithProtobufs } from '@temporalio/common/lib/protobufs.js';

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

  console.log('connection options', connOpts)
  return connOpts
}
export const createConnection = async (tcfg?: TemporalConfig): Promise<Connection> => {
  if (!tcfg) {
    tcfg = cfg.temporal
  }
  const connOpts: ConnectionOptions = getConnectionOptions(tcfg)
  return Connection.connect(connOpts)
}
export const createNativeConnection = async (tcfg?: TemporalConfig): Promise<NativeConnection> => {
  if (!tcfg) {
    tcfg = cfg.temporal
  }
  const connOpts: ConnectionOptions = getConnectionOptions(tcfg)
  return NativeConnection.connect(connOpts)
}
export const createClient = async (tcfg?: TemporalConfig): Promise<Client> => {
  if (!tcfg) {
    tcfg = cfg.temporal
  }
  return new Client({
    connection: await createConnection(tcfg),
    namespace: tcfg.connection.namespace,
    dataConverter: { payloadConverterPath: import.meta.resolve('./payload-converter.js').replace('file://', '') },
  })
}
