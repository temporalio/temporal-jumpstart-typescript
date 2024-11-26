import {DefaultLogger, Runtime, Worker, type WorkerOptions} from '@temporalio/worker'
import webpack  from 'webpack'
import { createNativeConnection } from '../clients/temporal'
import { Config } from '../config'
import path from 'path'

export const createWorkerOptions = async (cfg: Config, activities?: object): Promise<WorkerOptions> => {

  const { temporal: tcfg } = cfg
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

  if (cfg.isProduction) {
    workerOpts.workflowBundle = {
      codePath: cfg.temporal.worker.bundlePath,
    }
  }
  else {
    workerOpts.workflowsPath = path.join(__dirname, '../workflows/index.ts')

    workerOpts.dataConverter = { payloadConverterPath: require.resolve('../clients/temporal/payload-converter')}

    workerOpts.debugMode = true
    workerOpts.bundlerOptions = workerOpts.bundlerOptions || {}
  }

  return workerOpts
}
export const createWorker = async (opts: WorkerOptions): Promise<Worker> => {

  const w = await Worker.create(opts)
  return w
}
