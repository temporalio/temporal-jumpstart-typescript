import { Worker, type WorkerOptions } from '@temporalio/worker'
import webpack  from 'webpack'
import { createNativeConnection } from '../clients/temporal/index.js'
import { Config } from '../config'
import path from 'path'
import { payloadConverter} from '../clients/temporal/payload-converter'

export const createWorkerOptions = async (cfg: Config, activities?: object): Promise<WorkerOptions> => {
  const { temporal: tcfg } = cfg
  console.log('converters', payloadConverter.converters)
  let connection
  try {
    connection = await createNativeConnection(tcfg)
  }
  catch (err) {
    console.error(err)
    throw err
  }
  const workerOpts: WorkerOptions = {
    activities,
    // buildId: '',
    // bundlerOptions: {},
    connection,
    // dataConverter: undefined,
    // debugMode: false,
    // defaultHeartbeatThrottleInterval: undefined,
    // enableNonLocalActivities: false,
    // enableSDKTracing: false,
    // identity: '',
    // interceptors: undefined,
    maxActivitiesPerSecond: tcfg.worker.rateLimits?.maxWorkerActivitiesPerSecond,
    maxTaskQueueActivitiesPerSecond: tcfg.worker.rateLimits?.maxTaskQueueActivitiesPerSecond,
    maxCachedWorkflows: tcfg.worker.capacity?.maxCachedWorkflows,
    maxConcurrentActivityTaskExecutions: tcfg.worker.capacity?.maxConcurrentActivityExecutors,
    maxConcurrentActivityTaskPolls: tcfg.worker.capacity?.maxConcurrentActivityTaskPollers,
    maxConcurrentLocalActivityExecutions: tcfg.worker.capacity?.maxConcurrentLocalActivityExecutors,
    maxConcurrentWorkflowTaskExecutions: tcfg.worker.capacity?.maxConcurrentWorkflowTaskExecutions,
    // maxHeartbeatThrottleInterval: undefined,
    maxConcurrentWorkflowTaskPolls: tcfg.worker.capacity?.maxConcurrentWorkflowTaskPollers,
    namespace: tcfg.connection.namespace,
    // nonStickyToStickyPollRatio: 0,
    // reuseV8Context: false,
    // showStackTraceSources: false,
    // shutdownForceTime: undefined,
    // shutdownGraceTime: undefined,
    // sinks: undefined,
    // stickyQueueScheduleToStartTimeout: undefined,
    taskQueue: tcfg.worker.taskQueue,
    // workflowBundle: undefined,
    // workflowThreadPoolSize: 0,
    // workflowsPath: '',
  }
  workerOpts.debugMode = true

  if (!cfg.isProduction) {
    workerOpts.workflowsPath = path.join(__dirname, '../workflows/index.ts')
  }
  else {
    workerOpts.workflowBundle = {
      codePath: cfg.temporal.worker.bundlePath,

    }
  }
  workerOpts.bundlerOptions = workerOpts.bundlerOptions || {}
  workerOpts.bundlerOptions.ignoreModules = [
    ...(workerOpts.bundlerOptions.ignoreModules ?? []),
    'inspector'
  ]
  workerOpts.bundlerOptions.webpackConfigHook = (config): webpack.Configuration => {
    console.log('adding adapter')
    config.cache = false
    config.plugins = [
      ...(config.plugins ?? []),
      new webpack.ProvidePlugin({
        'TextEncoder': 'clients/temporal/encoding-adapter',
      })]
    return config
  }
  // workerOpts.dataConverter = { payloadConverterPath: require.resolve(path.resolve(__dirname,'../clients/temporal/payload-converter.ts'))}
  workerOpts.dataConverter = { payloadConverterPath: require.resolve('../src/clients/temporal/payload-converter.ts')}

  return workerOpts
}
export const createWorker = async (opts: WorkerOptions): Promise<Worker> => {
  console.log('opts', opts)
  console.log('debug',opts.debugMode)
  return await Worker.create(opts)
}
