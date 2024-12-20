import { bundleWorkflowCode } from '@temporalio/worker'
import { writeFile } from 'fs/promises'
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin'
import { cfg } from '../config'
import path from 'path'
import {mkdirpSync} from 'mkdirp'
// https://stackoverflow.com/questions/54977743/do-require-resolve-for-es-modules

async function bundle() {
  const { code } = await bundleWorkflowCode({

    workflowsPath: require.resolve('../domain/workflows'),
    // this shows how to provide your own custom payload converter for production
    payloadConverterPath: require.resolve('../clients/temporal/data-converter/payload-converter.ts'),
    webpackConfigHook: (config) => {
      config.module = config.module || {}
      config.cache = false

      config.module.rules =[
        ...(config.module.rules || []),
        { test: /\.json$/, type: 'json' }
      ]

      if (config.resolve) {
        config.resolve.plugins = [
          ...(config.resolve.plugins ?? []),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          // new TsconfigPathsPlugin({ configFile: 'tsconfig.json' }),
          new TsconfigPathsPlugin({ baseUrl: path.dirname((config.entry as string[])[0]) }) as any,
        ]
      }

      return config
    },
  })

  const codePath = path.resolve(cfg.temporal.worker.bundlePath)
  mkdirpSync(path.dirname(cfg.temporal.worker.bundlePath))
  await writeFile(codePath, code)
}

bundle().catch((err) => {
  console.error(err)
  process.exit(1)
})
