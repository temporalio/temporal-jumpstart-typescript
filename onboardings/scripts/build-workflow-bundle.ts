import { bundleWorkflowCode } from '@temporalio/worker'
import { writeFile } from 'fs/promises'
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin'
// https://stackoverflow.com/questions/54977743/do-require-resolve-for-es-modules

async function bundle() {
  const { code } = await bundleWorkflowCode({
    // workflowsPath: wf,
    workflowsPath: import.meta.resolve('../src/workflows').replace('file://', ''),
    webpackConfigHook: (config) => {
      if (config.resolve) {
        config.resolve.plugins = [
          ...(config.resolve.plugins ?? []),
          // new TsconfigPathsPlugin({baseUrl: path.dirname((config.entry as string[])[0]),  }) as any,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          new TsconfigPathsPlugin({ configFile: 'tsconfig.json' }),
        ]
      }
      return config
    },
  })
  const codePath = import.meta.resolve('../build/workflow-bundle.js')
  await writeFile(codePath.replace('file://', ''), code)
  console.log(`Bundle written to ${codePath}`)
}

bundle().catch((err) => {
  console.error(err)
  process.exit(1)
})
