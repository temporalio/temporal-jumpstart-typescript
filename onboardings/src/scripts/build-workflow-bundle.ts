import { bundleWorkflowCode } from '@temporalio/worker'
import { writeFile } from 'fs/promises'
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin'
import { cfg } from '../config'
import path from 'path'
// https://stackoverflow.com/questions/54977743/do-require-resolve-for-es-modules

async function bundle() {
  const { code } = await bundleWorkflowCode({
    workflowsPath: import.meta.resolve('../workflows').replace('file://', ''),
    webpackConfigHook: (config) => {
      if (config.resolve) {
        // config.resolve.fullySpecified = false
        config.resolve.plugins = [
          ...(config.resolve.plugins ?? []),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          new TsconfigPathsPlugin({ configFile: 'tsconfig.json' }),
        ]
      }

      return config
    },
  })

  const codePath = import.meta.resolve(cfg.temporal.worker.bundlePath)
  await writeFile(codePath.replace('file://', ''), code)
  console.log(`Bundle written to ${codePath}`)
}

bundle().catch((err) => {
  console.error(err)
  process.exit(1)
})
